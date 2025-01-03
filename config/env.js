const environments = {
    development: {
        API_URL: 'http://localhost:3000',
        LOG_LEVEL: 'debug',
        ENABLE_MOCK: true,
        STORAGE_PREFIX: 'dev_',
        FEATURES: {
            templateMarket: true,
            customStyles: true,
            batchExport: true,
            autoBackup: true
        }
    },

    staging: {
        API_URL: 'https://staging-api.example.com',
        LOG_LEVEL: 'info',
        ENABLE_MOCK: false,
        STORAGE_PREFIX: 'staging_',
        FEATURES: {
            templateMarket: true,
            customStyles: true,
            batchExport: true,
            autoBackup: true
        }
    },

    production: {
        API_URL: 'https://api.example.com',
        LOG_LEVEL: 'error',
        ENABLE_MOCK: false,
        STORAGE_PREFIX: 'prod_',
        FEATURES: {
            templateMarket: true,
            customStyles: true,
            batchExport: true,
            autoBackup: true
        }
    }
};

const getEnvironment = () => {
    const env = process.env.NODE_ENV || 'development';
    return environments[env];
};

module.exports = {
    ...getEnvironment(),
    environments,
    getEnvironment
};
