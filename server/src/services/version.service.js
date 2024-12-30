const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

class VersionService {
    constructor() {
        this.versionModel = mongoose.model('Version', {
            templateId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Template'
            },
            version: {
                type: Number,
                required: true,
                min: 1
            },
            data: {
                style: Object,
                content: Object
            },
            comment: String,
            author: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'User'
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            changes: {
                added: Object,
                modified: Object,
                deleted: [String]
            },
            parent: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Version'
            },
            branch: {
                name: String,
                isMain: {
                    type: Boolean,
                    default: true
                }
            }
        });
    }

    // 创建新版本
    async createVersion(templateId, data, author, comment = '') {
        const lastVersion = await this.getLatestVersion(templateId);
        const newVersion = lastVersion ? lastVersion.version + 1 : 1;

        // 计算差异
        const changes = lastVersion ?
            this.calculateChanges(lastVersion.data, data) :
            { added: data, modified: {}, deleted: [] };

        const version = new this.versionModel({
            templateId,
            version: newVersion,
            data,
            changes,
            author,
            comment,
            parent: lastVersion ? lastVersion._id : null
        });

        await version.save();
        return version;
    }

    // 计算两个版本之间的差异
    calculateChanges(oldData, newData) {
        const added = {};
        const modified = {};
        const deleted = [];

        // 处理新增和修改
        for (const [key, value] of Object.entries(newData)) {
            if (!(key in oldData)) {
                added[key] = value;
            } else if (JSON.stringify(oldData[key]) !== JSON.stringify(value)) {
                modified[key] = {
                    from: oldData[key],
                    to: value
                };
            }
        }

        // 处理删除
        for (const key of Object.keys(oldData)) {
            if (!(key in newData)) {
                deleted.push(key);
            }
        }

        return { added, modified, deleted };
    }

    // 重建特定版本的完整数据
    async rebuildVersion(version) {
        if (!version.parent) {
            return version.data;
        }

        const parentData = await this.rebuildVersion(
            await this.versionModel.findById(version.parent)
        );

        // 应用变更
        const rebuiltData = { ...parentData };

        // 添加新字段
        Object.assign(rebuiltData, version.changes.added);

        // 应用修改
        for (const [key, change] of Object.entries(version.changes.modified)) {
            rebuiltData[key] = change.to;
        }

        // 删除字段
        for (const key of version.changes.deleted) {
            delete rebuiltData[key];
        }

        return rebuiltData;
    }

    // 创建新分支
    async createBranch(templateId, branchName, fromVersion) {
        const sourceVersion = await this.getVersion(templateId, fromVersion);

        const branch = await this.createVersion(
            templateId,
            sourceVersion.data,
            sourceVersion.author,
            `Created branch: ${branchName}`
        );

        branch.branch = {
            name: branchName,
            isMain: false
        };

        await branch.save();
        return branch;
    }

    // 合并分支
    async mergeBranch(templateId, sourceBranch, targetBranch = 'main') {
        const sourceVersion = await this.versionModel.findOne({
            templateId,
            'branch.name': sourceBranch
        }).sort({ version: -1 });

        const targetVersion = await this.versionModel.findOne({
            templateId,
            'branch.name': targetBranch
        }).sort({ version: -1 });

        // 创建合并版本
        const mergedData = this.mergeData(
            targetVersion.data,
            sourceVersion.data
        );

        return this.createVersion(
            templateId,
            mergedData,
            sourceVersion.author,
            `Merged branch ${sourceBranch} into ${targetBranch}`
        );
    }

    // 合并数据
    mergeData(targetData, sourceData) {
        const merged = { ...targetData };

        for (const [key, value] of Object.entries(sourceData)) {
            if (typeof value === 'object' && value !== null) {
                merged[key] = this.mergeData(merged[key] || {}, value);
            } else {
                merged[key] = value;
            }
        }

        return merged;
    }

    // 获取最新版本
    async getLatestVersion(templateId) {
        return this.versionModel
            .findOne({ templateId })
            .sort({ version: -1 });
    }

    // 获取指定版本
    async getVersion(templateId, version) {
        const versionDoc = await this.versionModel.findOne({
            templateId,
            version
        });

        if (!versionDoc) {
            throw new AppError('TEMPLATE.VERSION_NOT_FOUND');
        }

        return versionDoc;
    }

    // 获取版本历史
    async getVersionHistory(templateId, page = 1, limit = 10) {
        const versions = await this.versionModel
            .find({ templateId })
            .sort({ version: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('author', 'username');

        const total = await this.versionModel.countDocuments({ templateId });

        return {
            versions,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    // 回滚到指定版本
    async rollbackToVersion(templateId, version, userId) {
        const versionDoc = await this.getVersion(templateId, version);

        // 创建新版本，记录回滚操作
        return this.createVersion(
            templateId,
            versionDoc.data,
            userId,
            `Rollback to version ${version}`
        );
    }

    // 比较两个版本的差异
    async compareVersions(templateId, version1, version2) {
        const [v1, v2] = await Promise.all([
            this.getVersion(templateId, version1),
            this.getVersion(templateId, version2)
        ]);

        return {
            style: this.compareObjects(v1.data.style, v2.data.style),
            content: this.compareObjects(v1.data.content, v2.data.content)
        };
    }

    // 辅助方法：比较两个对象的差异
    compareObjects(obj1, obj2) {
        const changes = {};
        const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

        for (const key of allKeys) {
            if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
                changes[key] = {
                    old: obj1[key],
                    new: obj2[key]
                };
            }
        }

        return changes;
    }
}

module.exports = new VersionService();
