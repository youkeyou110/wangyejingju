const AppError = require('../utils/AppError');

module.exports = async (req, res, next) => {
    try {
        if (!req.user.isAdmin) {
            throw new AppError('AUTH.ADMIN_REQUIRED');
        }
        next();
    } catch (error) {
        next(error);
    }
};
