const asyncHandler = require("express-async-handler")
const validator = require("validator");
const sendEmail = require("../../helper/emailSent");
const { ApplicationError } = require("../../middlewares/errorHandler");
const userModel = require("../../models/user.model");


const forgotPassword = asyncHandler(async (req, res, next) => {
    // steps involved
    const { email } = req.body
    // console.log(email)
    if (!validator.isEmail(email)) return next(new ApplicationError("please enter valid email", 400))
    // 1. get correct email address in post request
    const userDetail = await userModel.findOne({ email })
    if (!userDetail) {
        return next(new ApplicationError("No user found", 404))
        // return res.status(404).json({ success: false, message: "Email address not found" })
    }
    // 2. generate random reset token
    const resetToken = userDetail.createPasswordResetToken()
    await userDetail.save({ validateBeforeSave: false })

    // 3. sent id to user's email
    const token = `${resetToken}`
    const message = `Copy below Code \n ${token}`
    try {
        await sendEmail({
            email: userDetail.email,
            subject: "Password Reset token valid for 10 min",
            message: message
        })
        res.status(200).json({
            success: true,
            message: "Password Reset Token has been sent.Kindly Check Email"
        })

    } catch (error) {
        // console.log(error)
        userDetail.passwordResetToken = undefined,
            userDetail.passwordResetExpire = undefined,
            await userDetail.save({ validateBeforeSave: false })
        return next(new ApplicationError("error while sending reset link, please try later", 500))

    }


})


module.exports = { forgotPassword }