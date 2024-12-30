module.exports = {
    // 存储类型：local, s3, oss
    type: process.env.STORAGE_TYPE || 'local',

    // 本地存储配置
    local: {
        uploadDir: 'uploads',
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
    },

    // AWS S3配置
    s3: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
        bucket: process.env.AWS_BUCKET_NAME
    },

    // 阿里云OSS配置
    oss: {
        accessKeyId: process.env.OSS_ACCESS_KEY_ID,
        accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
        region: process.env.OSS_REGION,
        bucket: process.env.OSS_BUCKET_NAME,
        endpoint: process.env.OSS_ENDPOINT
    }
};
