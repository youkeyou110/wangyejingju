const fs = require('fs').promises;
const path = require('path');
const AWS = require('aws-sdk');
const OSS = require('ali-oss');
const config = require('../config/storage.config');
const AppError = require('../utils/AppError');

class StorageService {
    constructor() {
        this.initializeStorage();
    }

    // 初始化存储服务
    initializeStorage() {
        switch (config.type) {
            case 's3':
                this.s3 = new AWS.S3({
                    accessKeyId: config.s3.accessKeyId,
                    secretAccessKey: config.s3.secretAccessKey,
                    region: config.s3.region
                });
                break;
            case 'oss':
                this.oss = new OSS({
                    accessKeyId: config.oss.accessKeyId,
                    accessKeySecret: config.oss.accessKeySecret,
                    region: config.oss.region,
                    bucket: config.oss.bucket,
                    endpoint: config.oss.endpoint
                });
                break;
            default:
                // 本地存储不需要初始化
                break;
        }
    }

    // 上传文件
    async uploadFile(file) {
        switch (config.type) {
            case 's3':
                return this.uploadToS3(file);
            case 'oss':
                return this.uploadToOSS(file);
            default:
                return this.uploadToLocal(file);
        }
    }

    // 上传到本地
    async uploadToLocal(file) {
        const filename = `${Date.now()}_${file.originalname}`;
        const filepath = path.join(config.local.uploadDir, filename);

        await fs.writeFile(filepath, file.buffer);
        return {
            url: `/uploads/${filename}`,
            filename
        };
    }

    // 上传到S3
    async uploadToS3(file) {
        const params = {
            Bucket: config.s3.bucket,
            Key: `${Date.now()}_${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read'
        };

        const result = await this.s3.upload(params).promise();
        return {
            url: result.Location,
            filename: result.Key
        };
    }

    // 上传到OSS
    async uploadToOSS(file) {
        const filename = `${Date.now()}_${file.originalname}`;
        const result = await this.oss.put(filename, file.buffer);
        return {
            url: result.url,
            filename
        };
    }

    // 删除文件
    async deleteFile(filename) {
        switch (config.type) {
            case 's3':
                return this.deleteFromS3(filename);
            case 'oss':
                return this.deleteFromOSS(filename);
            default:
                return this.deleteFromLocal(filename);
        }
    }

    // 从本地删除
    async deleteFromLocal(filename) {
        const filepath = path.join(config.local.uploadDir, filename);
        await fs.unlink(filepath);
    }

    // 从S3删除
    async deleteFromS3(filename) {
        const params = {
            Bucket: config.s3.bucket,
            Key: filename
        };
        await this.s3.deleteObject(params).promise();
    }

    // 从OSS删除
    async deleteFromOSS(filename) {
        await this.oss.delete(filename);
    }
}

module.exports = new StorageService();
