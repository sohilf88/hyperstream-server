const asyncHandler = require("express-async-handler")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
const validator = require("validator");
const sendEmail = require("../../../helper/emailSent");
const crypto = require("crypto");
const { ApplicationError } = require("../../../middlewares/errorHandler");
const { verifyJWT } = require("../../../middlewares/verifyJwt");
const userModel = require("../../../models/user.model");


const changeLoggedUserPassword = asyncHandler(async (req, res, next) => {

    const { currentPassword, newPassword, confirmNewPassword } = req.body
    if (!currentPassword || !newPassword || !confirmNewPassword) {
        return next(new ApplicationError("All fields are Required", 400))

    }
    if (newPassword !== confirmNewPassword) {
        return next(new ApplicationError("new and confirm Password does not match", 400))
    }
    // console.log(req.user)

    //  check for current password

    // compare current password with database stored password
    const user = await userModel.findOne({ email: req.user.email }).select("+password");

    const checkPassword = await bcrypt.compare(currentPassword, user.password)
    if (!checkPassword) {
        return next(new ApplicationError("current password was wrong", 401))

    }

    user.password = newPassword
    user.confirmPassword = confirmNewPassword
    // user.passwordResetToken = undefined
    // user.passwordResetExpire = undefined
    await user.save()
    // login user by sending jwt
    const accesstoken = jwt.sign({ username: user.username, email: user.email, roles: user.roles }, process.env.AUTH_ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRY
    })

    return res.cookie('jwtAccess', accesstoken, {
        httpOnly: true, //accessible only via browser
        sameSite: "none",// cross-site cookie
        secure: true,//https only,need to change to true later
        expiresIn: process.env.AUTH_ACCESS_COOKIES_EXPIRY // 15 minutes
    }).status(201).json({ success: true, message: "password changed succesfully" })

})

module.exports = { changeLoggedUserPassword }