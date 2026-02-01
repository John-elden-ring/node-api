const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findById } = require('../models/Image');
require('dotenv').config();

// Register controller
const registerUser = async(req, res) => {
    try {
        //extract user information from req.body
        const {username, email, password, role} = req.body;
        //check if user is already in the database
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in your credentials properly.'
            });
        }

        const checkExistingUser = await User.findOne({ $or : [
            {username: username}, 
            {email: email}
        ]}); 
        if (checkExistingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with same username or email please try with diffrent credentials.'
            });
        } else {
            //hash user password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            //create new user and save into the database
            const newlyCreatedUser = new User({
                username: username,
                email: email,
                password: hashedPassword,
                role: role || 'user'
            });
            await newlyCreatedUser.save();
            
            if (newlyCreatedUser) {
                res.status(201).json({
                    success: true,
                    message: 'New user has been registered.'
                });
            } else {
                res.status(409).json({
                    success: false,
                    message: 'Unable to register user pleasy try again later.'
                });
            }
        }
    } catch(e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: 'Something went wrong'
        });
    }
};

//login controller

const loginUser = async(req, res) => {
    try {
        const {username, password} = req.body;
        //check if user is in the database
        const findUser = await User.findOne({username: username});
        if (!findUser) {
            return res.status(400).json({
                success: false,
                message: 'No such User exist, make sure to register.'
            });
        }  
        const passwordMatch = await bcrypt.compare(password, findUser.password); 
        if (passwordMatch) {
            //create a user token
            const accessToken = jwt.sign({
                userId: findUser._id,
                username: findUser.username,
                role: findUser.role
            }, process.env.JWT_SECRET_KEY, {
                expiresIn: '15m'
            });
            res.status(200).json({
                success: true,
                message: 'Successfully loged in.',
                accessToken: accessToken
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'Your password is incorrect, please try again.'
            });
        }                                   
    } catch(e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: 'Oh oh something went wrong'
        });
    }
};

const changePassword = async(req, res) => {
    try {
        const userId = req.userInfo.userId;
        //extract old and new password;
        const { oldPassword, newPassword } = req.body;

        //find the current logged in user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found.'
            });
        }

        //check if old password is correct
        const isPasswordmatch = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordmatch) {
            return res.status(400).json({
                success: false,
                message: 'Old password is not correct.'
            });
        }
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);
        user.password = newPasswordHash;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Password succesfully cnaged.'
        });
    } catch(e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: 'You need to be authenticated to change password.'
        });
    }
};

module.exports = { loginUser, registerUser, changePassword };