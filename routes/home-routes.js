const express = require('express');
const authMiddleware = require('../middleware/auth-middleware');
const router = express.Router();

router.get('/welcome', authMiddleware, (req, res) => {
    const {username, userId, role} = req.userInfo;
    res.status(200).json({
        message: 'Welcome to homepage',
        user: {
            _id: userId,
            username: username,
            role: role
        }
    });
});

module.exports = router;