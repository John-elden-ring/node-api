
const adminValidationMiddleware = (req, res, next) => {
    const user = req.userInfo;
    if (user.role !== 'admin') {
        return res.status(400).json({
            success: false,
            message: 'You are not authorized access'
        });
    } else {
        return next();
    }
};

module.exports = adminValidationMiddleware;