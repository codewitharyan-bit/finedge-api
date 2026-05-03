const userService = require('../services/userService');
const asyncHandler = require('../utils/asyncHandler');
const apiError = require('../utils/apiError');
const apiResponse = require('../utils/apiResponse');


const registerUser = asyncHandler(async (req, res) => {
      const user = await userService.registerUser(req.body);
      res.status(201)
      .json(new apiResponse(201, user, "User registered successfully"));
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await userService.loginUser(email, password);
     
    const options = {
        httpOnly: true,
        secure:true
    }

    return  res.status(200)
    .cookie('refreshToken', refreshToken, options)
    .cookie('accessToken', accessToken, options)
    .json(new apiResponse(200, user, "User logged in successfully"));
})

const logoutUser = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    await userService.logoutUser(userId);
    return res.status(200)
    .clearCookie('refreshToken')
    .clearCookie('accessToken')
    .json(new apiResponse(200, null, "User logged out successfully"));
})

const refreshToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new apiError(401, 'No refresh token provided');
    }
    const { accessToken, refreshToken: newRefreshToken } = await userService.refreshToken(refreshToken);

    const options = {
        httpOnly: true,
        secure:true
    }
    return res.status(200)
    .cookie('refreshToken', newRefreshToken, options)
    .cookie('accessToken', accessToken, options)
    .json(new apiResponse(200, null, "Tokens refreshed successfully"));
})

const changePassword = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;
    await userService.changePassword(userId, currentPassword, newPassword);
    return res.status(200)
    .json(new apiResponse(200, null, "Password changed successfully"));
})

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    refreshToken,
    changePassword
}