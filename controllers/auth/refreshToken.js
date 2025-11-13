
const asyncHandler = require("express-async-handler")
const jwt = require("jsonwebtoken");
const { ApplicationError } = require("../../middlewares/errorHandler");
const userModel = require("../../models/user.model");


const refresh = async (req, res, next) => {
    // /api/v1/auth/refresh 
    const cookies = req.cookies
    // console.log(cookies)
    if (!cookies?.jwtRe) {
        // return next(new ApplicationError("Unauthorized,No Refresh cookies", 400))

        return res.clearCookie("jwtRe", {
            httpOnly: true,
            domain: process.env.ENV === "prod" ? ".hyperstream.in" : "localhost",
            sameSite: process.env.ENV === "prod" ? "None" : "Lax",
            secure: process.env.ENV === "prod" ? true : false,
        }).clearCookie("jwtAccess", {
            httpOnly: true,
            domain: process.env.ENV === "prod" ? ".hyperstream.in" : "localhost",
            sameSite: process.env.ENV === "prod" ? "None" : "Lax",
            secure: process.env.ENV === "prod" ? true : false,
        }).sendStatus(200)

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
                    // if refresh token expired, we will set time value=0
                    return res.cookie("jwtRe", {
                        httpOnly: true,
                        domain: process.env.ENV === "prod" ? ".hyperstream.in" : "localhost",
                        sameSite: process.env.ENV === "prod" ? "None" : "Lax",
                        secure: process.env.ENV === "prod" ? true : false,
                        maxAge: 0,
                        
                         // domain need to add during prod
                        // domain:"hypsertream.in",
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
                maxAge: 15 * 60 * 1000, // 15 minutes
                httpOnly: true,
                domain: process.env.ENV === "prod" ? ".hyperstream.in" : "localhost",
                sameSite: process.env.ENV === "prod" ? "None" : "Lax",
                secure: process.env.ENV === "prod" ? true : false,
                // domain:"hyperstream.in"
                
            }).status(201).json({ success: true, message: "Access Token Updated" })

        })
    )

}

module.exports = { refresh }