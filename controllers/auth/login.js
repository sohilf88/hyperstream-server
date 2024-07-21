const asyncHandler = require("express-async-handler")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
const { ApplicationError } = require("../../middlewares/errorHandler");

const userModel = require("../../models/user.model");

// Login Controller
// /api/v1/auth/login
const loginController = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    // console.log(req.body)
    // check all fields
    if (!email || !password) {
        return next(new ApplicationError("All fields are required", 400))

    }
    // check user in db with email and add password to compare
    const checkUserAccountInDB = await userModel.findOne({ email }).select("+password");
    if (!checkUserAccountInDB || !checkUserAccountInDB.active) {
        return next(new ApplicationError("Account was not found", 400))

    }
    //  compare provided password by user with stored db password in hash
    const checkPassword = await bcrypt.compare(password, checkUserAccountInDB.password)
    // console.log(checkPassword)

    // const isMatch = await checkUserAccountInDB.comparePassword(password, checkUserAccountInDB.password)
    if (!checkPassword) {
        return next(new ApplicationError("Email or password is wrong", 401))

    }
    const accesstoken = jwt.sign({ username: checkUserAccountInDB.username, email: checkUserAccountInDB.email, roles: checkUserAccountInDB.roles, _id: checkUserAccountInDB._id }, process.env.AUTH_ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRY
    })

    const refreshToken = jwt.sign({ _id: checkUserAccountInDB._id }, process.env.AUTH_REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.AUTH_REFRESH_TOKEN_EXPIRY
    })
    // create cookie with refresh token
    return res.cookie('jwtRe', refreshToken, {
        httpOnly: true, //accessible only via browser
        sameSite: "none",// cross-site cookie
        secure: true,//https only,need to change to true later
        expiresIn: process.env.AUTH_REFRESH_COOKIE_EXPIRY // 48 hours,


    })
        .cookie('jwtAccess', accesstoken, {
            httpOnly: true, //accessible only via browser
            sameSite: "none",// cross-site cookie
            secure: true,//https only,need to change to true later
            expiresIn: process.env.AUTH_ACCESS_COOKIES_EXPIRY // 15 minutes

        },).json({
            success: true,
            message: "Login Success",
            data: { name: checkUserAccountInDB.username, roles: checkUserAccountInDB.roles }
        })



})


module.exports = { loginController }