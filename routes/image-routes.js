const express = require('express');
const authMiddleware = require('../middleware/auth-middleware');
const adminValidationMiddleware = require('../middleware/admin-validation-middleware');
const uploadMiddleware = require('../middleware/upload-middleware');
const { uploadImage, fetchImageController, deleteImageController } = require('../controllers/image-controller');

const router = express.Router();

//upload image
router.post('/upload', [authMiddleware, adminValidationMiddleware, uploadMiddleware.single('image')], uploadImage);

//get all the images
router.get('/get', authMiddleware, fetchImageController);

//delete image
router.delete('/delete-image/:id', [authMiddleware, adminValidationMiddleware], deleteImageController);
module.exports = router;