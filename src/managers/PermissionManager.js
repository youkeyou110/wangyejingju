import { EventEmitter } from 'events';
import logManager from './LogManager';
import cryptoManager from './CryptoManager';

class PermissionManager extends EventEmitter {
    constructor() {
        super();
        this.roles = new Map();
        this.permissions = new Map();
        this.userRoles = new Map();
        this.config = {
            superAdminRole: 'superadmin',
            defaultRole: 'user',
            auditLog: true,
            maxAuditAge: 30 * 24 * 60 * 60 * 1000 // 30天
        };
        this.setupDefaultRoles();
    }

    // 设置默认角色
    setupDefaultRoles() {
        // 超级管理员
        this.addRole('superadmin', {
            name: '超级管理员',
            description: '系统最高权限角色',
            permissions: ['*'] // 所有权限
        });

        // 管理员
        this.addRole('admin', {
            name: '管理员',
            description: '系统管理角色',
            permissions: [
                'user:manage',
                'role:view',
                'template:manage',
                'style:manage',
                'backup:manage'
            ]
        });

        // 普通用户
        this.addRole('user', {
            name: '普通用户',
            description: '普通用户角色',
            permissions: [
                'template:use',
                'style:use',
                'export:basic'
            ]
        });

        // 访客
        this.addRole('guest', {
            name: '访客',
            description: '访客角色',
            permissions: [
                'template:view',
                'style:view'
            ]
        });
    }

    // 添加角色
    addRole(roleId, roleData) {
        try {
            if (this.roles.has(roleId)) {
                throw new Error(`Role ${roleId} already exists`);
            }

            this.roles.set(roleId, {
                id: roleId,
                ...roleData,
                created: Date.now()
            });

            this.emit('roleAdded', { roleId });
            return true;
        } catch (error) {
            logManager.error('Failed to add role:', error);
            throw error;
        }
    }

    // 更新角色
    updateRole(roleId, roleData) {
        try {
            if (!this.roles.has(roleId)) {
                throw new Error(`Role ${roleId} not found`);
            }

            const currentRole = this.roles.get(roleId);
            this.roles.set(roleId, {
                ...currentRole,
                ...roleData,
                updated: Date.now()
            });

            this.emit('roleUpdated', { roleId });
            return true;
        } catch (error) {
            logManager.error('Failed to update role:', error);
            throw error;
        }
    }

    // 删除角色
    deleteRole(roleId) {
        try {
            if (roleId === this.config.superAdminRole) {
                throw new Error('Cannot delete super admin role');
            }

            if (!this.roles.has(roleId)) {
                throw new Error(`Role ${roleId} not found`);
            }

            this.roles.delete(roleId);
            this.emit('roleDeleted', { roleId });
            return true;
        } catch (error) {
            logManager.error('Failed to delete role:', error);
            throw error;
        }
    }

    // 分配用户角色
    async assignUserRole(userId, roleId) {
        try {
            if (!this.roles.has(roleId)) {
                throw new Error(`Role ${roleId} not found`);
            }

            await this.userRoles.set(userId, roleId);
            this.emit('userRoleAssigned', { userId, roleId });

            // 记录审计日志
            await this.logAudit('assignRole', {
                userId,
                roleId,
                timestamp: Date.now()
            });

            return true;
        } catch (error) {
            logManager.error('Failed to assign user role:', error);
            throw error;
        }
    }

    // 检查权限
    async checkPermission(userId, permission) {
        try {
            const roleId = await this.userRoles.get(userId);
            if (!roleId) {
                return false;
            }

            const role = this.roles.get(roleId);
            if (!role) {
                return false;
            }

            // 超级管理员拥有所有权限
            if (roleId === this.config.superAdminRole) {
                return true;
            }

            // 检查具体权限
            return role.permissions.includes(permission) ||
                   role.permissions.includes('*');
        } catch (error) {
            logManager.error('Failed to check permission:', error);
            return false;
        }
    }

    // 获取用户权限
    async getUserPermissions(userId) {
        try {
            const roleId = await this.userRoles.get(userId);
            if (!roleId) {
                return [];
            }

            const role = this.roles.get(roleId);
            if (!role) {
                return [];
            }

            return role.permissions;
        } catch (error) {
            logManager.error('Failed to get user permissions:', error);
            return [];
        }
    }

    // 记录审计日志
    async logAudit(action, data) {
        try {
            if (!this.config.auditLog) return;

            const auditEntry = {
                action,
                ...data,
                timestamp: Date.now()
            };

            // 加密审计日志
            const encryptedEntry = await cryptoManager.encrypt(auditEntry);

            // 存储审计日志
            const logs = await this.getAuditLogs();
            logs.push(encryptedEntry);

            // 清理旧日志
            const now = Date.now();
            const validLogs = logs.filter(log =>
                now - log.timestamp < this.config.maxAuditAge
            );

            await chrome.storage.local.set({ auditLogs: validLogs });
            this.emit('auditLogged', { action });
        } catch (error) {
            logManager.error('Failed to log audit:', error);
            throw error;
        }
    }

    // 获取审计日志
    async getAuditLogs() {
        try {
            const result = await chrome.storage.local.get('auditLogs');
            return result.auditLogs || [];
        } catch (error) {
            logManager.error('Failed to get audit logs:', error);
            return [];
        }
    }

    // 更新配置
    updateConfig(newConfig) {
        this.config = {
            ...this.config,
            ...newConfig
        };
    }
}

export default new PermissionManager();
