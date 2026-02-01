const Image = require('../models/Image');
const { uploadToCloudinary } = require('../helpers/cloudinary-helper');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');
const uploadImage = async(req, res) => {
    try {
        //check if file is missing in request req object
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'File is required.'
            });
        } else {
            //uplaod to cloudinary
            const { url, publicId } = await uploadToCloudinary(req.file.path);

            //store the image url and public id , user id to database

            const newlyUploadedImage = new Image({
                url,
                publicId,
                uploadedBy: req.userInfo.userId
            });
            //deletet the file from local sotrage
            //fs.unlinkSync(req.file.path);
            await newlyUploadedImage.save();

            res.status(201).json({
                success: true,
                message: 'Image uploaded successfully',
                image: newlyUploadedImage
            });
        }
    } catch(e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: 'Something went wrong! Please try again.'
        });
    }
};

const fetchImageController = async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const totalImages = await Image.countDocuments();
        const totalPages = Math.ceil(totalImages / limit);

        const sortObj = {};
        sortObj[sortBy] = sortOrder;

        const images = await Image.find().sort(sortObj).skip(skip).limit(limit);
        if (images) {
            res.status(200).json({
                success: true,
                data: images,
                currentPages: page,
                totalImages: totalImages,
                totalPages: totalPages,
                data: images
            });
        }
    } catch(e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch images.'
        });
    }
};

const deleteImageController = async(req, res) => {
    try {
        const getCurrentIdOfImageToBeDeleted = req.params.id;
        const userId = req.userInfo.userId;
        
        const image = await Image.findById(getCurrentIdOfImageToBeDeleted);
        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        //check if this image is uplaoded by the current user
        if (image.uploadedBy.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You are not allowed to delete the image.'
            });
        }

        //deltete this image from cloudinary soreage
        await cloudinary.uploader.destroy(image.publicId);

        //delete the image from mongodb
        await Image.findByIdAndDelete(getCurrentIdOfImageToBeDeleted);
        res.status(200).json({
            success: true,
            message: 'Image successfuly deleted',
        });
    } catch(e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: 'Failed to delte image.'
        });
    }
};
module.exports = {
    uploadImage,
    fetchImageController,
    deleteImageController,
};