require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/quote-card',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiration: '24h'
};
