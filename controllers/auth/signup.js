const asyncHandler = require("express-async-handler")
const jwt = require("jsonwebtoken");
const { ApplicationError } = require("../../middlewares/errorHandler");
const userModel = require("../../models/user.model");


// signup controller function
// /api/v1/auth/signup
const signupController = asyncHandler(async (req, res, next) => {

    const { email, password, username, confirmPassword, roles,isActive } = req.body;


    // check for all required fields
    if (!username || !email || !password || !confirmPassword) {
        return next(new ApplicationError("All fields are required", 400))

    }
    //  check user in db by email id
    const checkExistUserByMail = await userModel.findOne({ email }).lean()
    // console.log(checkExistUserByMail)
    if (checkExistUserByMail) {
        return next(new ApplicationError("Email id is already registered", 400))
        // return res.status(400).json({
        //   success: false,
        //   message: "Email id is already registered"
        // })
    }
    // signup user

    const user = await userModel.create({ username, email, password, confirmPassword, roles,isActive });
    if (user) {
        return res.json({
                    success: true,
                    message: "User Account created",
                    data: { name: user.username, roles: user.roles }})
        // console.log(process.env.AUTH_ACCESS_TOKEN_EXPIRY, process.env.AUTH_REFRESH_TOKEN_EXPIRY)
        // generate token if user available, need to change role later
        // const accesstoken = jwt.sign({ username: user.username, email: user.email, roles: user.roles, _id: user._id }, process.env.AUTH_ACCESS_TOKEN_SECRET, {
        //     expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRY
        // })

        // const refreshToken = jwt.sign({ _id: user._id}, process.env.AUTH_REFRESH_TOKEN_SECRET, {
        //     expiresIn: process.env.AUTH_REFRESH_TOKEN_EXPIRY
        // })
        // // create cookie with refresh token & Access Cookies
        // return res.cookie('jwtRe', refreshToken, {
        //     httpOnly: true, //accessible only via browser
        //     sameSite: "none",// cross-site cookie
        //     secure: true,//https only,need to change to true later
        //     expiresIn: process.env.AUTH_REFRESH_COOKIE_EXPIRY // 48 hours,

        // })
        //     .cookie('jwtAccess', accesstoken, {
        //         httpOnly: true, //accessible only via browser
        //         sameSite: "none",// cross-site cookie
        //         secure: true,//https only,need to change to true later
        //         expiresIn: process.env.AUTH_ACCESS_COOKIES_EXPIRY // 15 minutes

        //     }).json({
        //         success: true,
        //         message: "User Account created",
        //         data: { name: user.username, roles: user.roles }
        //     })
    }

    return next(new ApplicationError("Given data is not correct", 400))
    // return res.status(400).json({ success: false, message: "Given data is not correct" });

});

module.exports = { signupController }