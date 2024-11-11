
const asyncHandler = require("express-async-handler")
const jwt = require("jsonwebtoken");
const { ApplicationError } = require("../../middlewares/errorHandler");
const userModel = require("../../models/user.model");


const refresh = async (req, res, next) => {
    // /api/v1/auth/refresh 
    const cookies = req.cookies
    // console.log(cookies)
    if (!cookies?.jwtRe) {
        return next(new ApplicationError("Unauthorized,No Refresh cookies", 400))

        // return res.clearCookie("jwtRe", {
        //     httpOnly: true, //accessible only via browser
        //     sameSite: "none",// cross-site cookie
        //     secure: true,//https only
        // }).clearCookie("jwtAccess", {
        //     httpOnly: true, //accessible only via browser
        //     sameSite: "none",// cross-site cookie
        //     secure: true,//https onl
        // }).sendStatus(200)


    }
    const refreshToken = cookies.jwtRe
    // console.log(refreshToken)
    jwt.verify(
        refreshToken,
        process.env.AUTH_REFRESH_TOKEN_SECRET,
        asyncHandler(async (error, decoded) => {
            // console.log(decoded._id)
            if (error) {
                //   console.log(error)
                if (error.message === "jwt expired") {
                    return res.cookie("jwtRe", {
                        httpOnly: true, //accessible only via browser
                        sameSite: "none",// cross-site cookie
                        secure: true,//https only
                        maxAge: 0
                    }).status(209)

                }
                // return res.status(403).json({ success: false, message: error.message })
                return next(new ApplicationError(error.message, 403))
            }
            const searchUserInDb = await userModel.findById({ _id: decoded._id })
            if (!searchUserInDb) {
                return next(new ApplicationError("User does not Exist", 404))
            }

            // create access token, need to change role later
            const accesstoken = jwt.sign({ username: searchUserInDb.username, email: searchUserInDb.email, roles: searchUserInDb.roles, _id: searchUserInDb._id }, process.env.AUTH_ACCESS_TOKEN_SECRET, {
                expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRY
            })
            // console.log(accesstoken)

            return res.cookie('jwtAccess', accesstoken, {
                httpOnly: true, //accessible only via browser
                sameSite: "none",// cross-site cookie
                secure: true,//https only,need to change to true later
                maxAge: 15 * 60 * 1000, // 15 minutes
                domain:"hyperstream.in"
                
            }).status(201).json({ success: true, message: "Access Token Updated" })

        })
    )

}

module.exports = { refresh }