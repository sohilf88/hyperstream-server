
// const asyncHandler = require("express-async-handler")
// const jwt = require("jsonwebtoken");
// const { ApplicationError } = require("../../middlewares/errorHandler");
// const userModel = require("../../models/user.model");


// const refresh = async (req, res, next) => {
//     // /api/v1/auth/refresh 
//     const cookies = req.cookies
//     // console.log(cookies)
//     if (!cookies?.jwtRe) {
//         // return next(new ApplicationError("Unauthorized,No Refresh cookies", 400))

//         return res.clearCookie("jwtRe", {
//             httpOnly: true,
//             domain: process.env.ENV === "prod" ? ".hyperstream.in" : "localhost",
//             sameSite: process.env.ENV === "prod" ? "None" : "Lax",
//             secure: process.env.ENV === "prod" ? true : false,
//         }).clearCookie("jwtAccess", {
//             httpOnly: true,
//             domain: process.env.ENV === "prod" ? ".hyperstream.in" : "localhost",
//             sameSite: process.env.ENV === "prod" ? "None" : "Lax",
//             secure: process.env.ENV === "prod" ? true : false,
//         }).sendStatus(200)

//     }
    
//     const refreshToken = cookies.jwtRe
//     // console.log(refreshToken)
//     jwt.verify(
//         refreshToken,
//         process.env.AUTH_REFRESH_TOKEN_SECRET,
//         asyncHandler(async (error, decoded) => {
//             // console.log(decoded._id)
//             if (error) {
//                 //   console.log(error)
//                 if (error.message === "jwt expired") {
//                     // if refresh token expired, we will set time value=0
//                     return res.cookie("jwtRe", {
//                         httpOnly: true,
//                         domain: process.env.ENV === "prod" ? ".hyperstream.in" : "localhost",
//                         sameSite: process.env.ENV === "prod" ? "None" : "Lax",
//                         secure: process.env.ENV === "prod" ? true : false,
//                         maxAge: 0,
                        
//                          // domain need to add during prod
//                         // domain:"hypsertream.in",
//                     }).status(209)

//                 }
//                 // return res.status(403).json({ success: false, message: error.message })
//                 return next(new ApplicationError(error.message, 403))
//             }
//             const searchUserInDb = await userModel.findById({ _id: decoded._id })
//             if (!searchUserInDb) {
//                 return next(new ApplicationError("User does not Exist", 404))
//             }

//             // create access token, need to change role later
//             const accesstoken = jwt.sign({ username: searchUserInDb.username, email: searchUserInDb.email, roles: searchUserInDb.roles, _id: searchUserInDb._id }, process.env.AUTH_ACCESS_TOKEN_SECRET, {
//                 expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRY
//             })
//             // console.log(accesstoken)

//             return res.cookie('jwtAccess', accesstoken, {
//                 maxAge: 15 * 60 * 1000, // 15 minutes
//                 httpOnly: true,
//                 domain: process.env.ENV === "prod" ? ".hyperstream.in" : "localhost",
//                 sameSite: process.env.ENV === "prod" ? "None" : "Lax",
//                 secure: process.env.ENV === "prod" ? true : false,
//                 // domain:"hyperstream.in"
                
//             }).status(201).json({ success: true, message: "Access Token Updated" })

//         })
//     )

// }

// module.exports = { refresh }
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { ApplicationError } = require("../../middlewares/errorHandler");
const userModel = require("../../models/user.model");
const {
    ACCESS_TOKEN_EXP,
    REFRESH_TOKEN_EXP,
    ACCESS_COOKIE_EXP,
    REFRESH_COOKIE_EXP,
} = require("./envVariables");

const refresh = asyncHandler(async (req, res, next) => {
    const cookies = req.cookies;

    const isProd = process.env.ENV === "prod";

    const cookieOptions = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "None" : "Lax",
        domain: isProd ? ".hyperstream.in" : "localhost",
    };

    // ------------------------------
    // 1) No refresh token in cookies
    // ------------------------------
    if (!cookies?.jwtRe) {
        res.clearCookie("jwtRe", cookieOptions);
        res.clearCookie("jwtAccess", cookieOptions);

        return res.status(403).json({
            success: false,
            message: "No refresh token",
        });
    }

    const refreshToken = cookies.jwtRe;

    // ------------------------------
    // 2) Verify refresh token
    // ------------------------------
    jwt.verify(
        refreshToken,
        process.env.AUTH_REFRESH_TOKEN_SECRET,
        async (error, decoded) => {
            if (error) {
                if (error.name === "TokenExpiredError") {
                    res.clearCookie("jwtRe", cookieOptions);

                    return res.status(401).json({
                        success: false,
                        message: "Refresh token expired",
                    });
                }

                return next(new ApplicationError("Invalid refresh token", 403));
            }

            // ------------------------------
            // 3) Check user exists
            // ------------------------------
            const user = await userModel.findById(decoded._id);

            if (!user) {
                return next(new ApplicationError("User not found", 404));
            }

            // ------------------------------
            // 4) Create new access token
            // ------------------------------
            const accessToken = jwt.sign(
                {
                    username: user.username,
                    email: user.email,
                    roles: user.roles,
                    _id: user._id,
                },
                process.env.AUTH_ACCESS_TOKEN_SECRET,
                { expiresIn: ACCESS_TOKEN_EXP } // in seconds
            );

            // ------------------------------
            // 5) Send new access token cookie
            // ------------------------------
            res.cookie("jwtAccess", accessToken, {
                ...cookieOptions,
                maxAge: ACCESS_COOKIE_EXP * 1000, // convert seconds → ms
            });

            return res.status(200).json({
                success: true,
                message: "Access token refreshed",
            });
        }
    );
});

module.exports = { refresh };
