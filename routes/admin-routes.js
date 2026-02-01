const express = require('express');
const authMiddleware = require('../middleware/auth-middleware');
const adminValidationMiddleware = require('../middleware/admin-validation-middleware');
const router = express.Router();


router.get('/welcome', [authMiddleware, adminValidationMiddleware], (req, res) => {
    res.json({
        message: 'Welcome to the welcome page'
    });
});

module.exports = router;