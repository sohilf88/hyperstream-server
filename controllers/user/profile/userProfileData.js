const asyncHandler = require("express-async-handler");
const { ApplicationError } = require("../../../middlewares/errorHandler");
const mongoose = require("mongoose");
const userModel = require("../../../models/user.model");
const jwt = require("jsonwebtoken");


// !need to work on username fields

const updateUserProfile = asyncHandler(async (req, res, next) => {
    const { id } = req;

    const { username, email, password, confirmPassword } = req.body
    // console.log(username)
    let updateUsername = username.replace(/[\s~`!@#$%^&*(){}\[\];:"'<,.>?\/\\|_+=-]/g, '');
    if (updateUsername.length < 3 || updateUsername.length >= 20) {
        return res.status(400).json({ success: false, message: "Username must be string not more than 20 Charecter or blank" })
    }
    if (password || confirmPassword) {
        return next(new ApplicationError("This Route is not for password Change", 403))
    }
    // console.log(updateUsername)


    // check the id if it is valid mongodb object id
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ApplicationError("invalid id", 404))
    }

    const user = await userModel.findByIdAndUpdate(id, { username: updateUsername }, { new: true, runValidators: true });
    // check the id in database
    if (!user) {
        return next(new ApplicationError("No such User Found", 404))
    }


    const accesstoken = jwt.sign({ username: user.username, email: user.email, roles: user.roles, _id: user._id }, process.env.AUTH_ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRY
    })

    // create cookie with refresh token
    return res.cookie('jwtAccess', accesstoken, {
        httpOnly: true, //accessible only via browser
        sameSite: "none",// cross-site cookie
        secure: true,//https only,need to change to true later
        expiresIn: process.env.AUTH_ACCESS_COOKIES_EXPIRY // 15 minutes

    },).json({
        success: true,
        message: "Username updated...",
        data: { name: user.username, roles: user.roles, email: user.email }
    })
    // return res.status(200).json({
    //     success: true,

    //     message: {
    //         username: user.username,
    //         email: user.email,
    //         roles: user.roles
    //     }
    // });

})


module.exports = { updateUserProfile }