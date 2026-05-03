const bcrypt = require('bcrypt');
const UserModel = require('../models/usersModels');
const apiError = require('../utils/ApiError');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const ApiResponse = require('../utils/apiResponse');
const { $where } = require('../models/transactionsModel');


const generateRefreshTokenAndAccessToken = async (user) => {
    try {
        if (!user) {
            throw new apiError(404, 'User not found');
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
       
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: true });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new apiError(500, 'Error generating tokens');
    }
}

const registerUser = async(user) =>{
    user.password = await bcrypt.hash(user.password, 10);
    const newUser = await UserModel.create(user);
    return newUser;
}

const loginUser = async (email, password) => {
    const user = await UserModel.findOne({ email });
    if (!user) {
        throw new apiError(404, 'User not found');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new apiError(401, 'Invalid credentials');
    }

    const { accessToken, refreshToken } = await generateRefreshTokenAndAccessToken(user);

    const loggenInUser = await UserModel.findById(user._id).select('-password -refreshToken');

    return { user: loggenInUser, accessToken, refreshToken };
}

const logoutUser = async (userId) => {
    const user = await UserModel.findByIdAndUpdate(
        userId,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );
    return user;
}


const refreshToken = async (incomingRefreshToken) => {
    if(!incomingRefreshToken){
        throw new apiError(401, 'Refresh token is required');
    }
    let decodedToken;
    try {
        decodedToken = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        throw new apiError(401, 'Invalid refresh token'); 
    }
    const user = await UserModel.findById(decodedToken?.id);
    if (!user) {
        throw new apiError(404, 'User not found');
    }

    if(user.refreshToken !== incomingRefreshToken){
        throw new apiError(401, 'Refresh token does not match');
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateRefreshTokenAndAccessToken(user);
    return { accessToken, refreshToken: newRefreshToken };
}

const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await UserModel.findById(userId);
    if (!user) {
        throw new apiError(404, 'User not found');
    }
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
        throw new apiError(401, 'Current password is incorrect');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save()

    return user;
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    refreshToken,
    changePassword
}