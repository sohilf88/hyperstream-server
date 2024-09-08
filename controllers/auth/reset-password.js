
const userModel = require("../../models/user.model")
const asyncHandler = require("express-async-handler")
const jwt = require("jsonwebtoken");


const crypto = require("crypto");
const { ApplicationError } = require("../../middlewares/errorHandler");




// const resetPasswordGet = asyncHandler(async (req, res, next) => {
//     // console.log("token is " + req.params.token)
//     if (!req.params.token) {
//         // return res.status(400).json({ success: false, message: "invalid token" })
//         return next(new ApplicationError("invalid token", 400))
//     }
//     const hashTheToken = crypto.createHash("sha256").update(req.params.token).digest("hex")
//     const user = await usermodel.findOne({
//         passwordResetToken: hashTheToken,
//         passwordResetExpire: { $gt: Date.now() }
//     })
//     if (!user) {
//         return next(new ApplicationError("invalid token or expired", 400))
//         // return res.status(400).json({ success: false, message: "invalid token or expired" })
//     }

//     // req.token = hashTheToken
//     // console.log(hashTheToken)
//     // res.sendStatus(200).json(req.token)
//     // next()
//     req.user = user
//     res.status(304).redirect(process.env.REDIRECTED_URL_PASSWORD_RESET)
// })

const resetPassword = asyncHandler(async (req, res, next) => {
    console.log(req.body)
    const { token, password, confirmPassword } = req.body
    if (!token || !password || !confirmPassword) {
        return next(new ApplicationError("All Fields are required", 400))
        // return res.status(400).json({ success: false, message: "invalid token" })
    }
    // get user based upon token

    const hashTheToken = crypto.createHash("sha256").update(token).digest("hex")
    // console.log(hashTheToken)
    const user = await userModel.findOne({
        passwordResetToken: hashTheToken,
        passwordResetExpire: { $gt: Date.now() }
    })
    // token is not expire and user is present, set new password
    if (!user) {
        return next(new ApplicationError("invalid token or expired", 400))
        // return res.status(400).json({ success: false, message: "invalid token or expired" })
    }
    // update changePasswordAt property
    user.password = password
    user.confirmPassword = confirmPassword
    user.passwordResetToken = undefined
    user.passwordResetExpire = undefined
    await user.save()
    // login user by sending jwt
    const accesstoken = jwt.sign({ username: user.username, email: user.email, roles: user.roles }, process.env.AUTH_ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRY
    })

    return res.cookie('jwtAccess', accesstoken, {
        httpOnly: true, //accessible only via browser
        sameSite: "none",// cross-site cookie
        secure: true,//https only,need to change to true later
        maxAge: 15 * 60 * 1000 // 15 minutes
    }).status(201).json({ success: true, message: "Password has been updated" })

})

module.exports = { resetPassword }