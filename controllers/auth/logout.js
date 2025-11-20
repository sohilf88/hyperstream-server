const asyncHandler = require("express-async-handler")
const { ApplicationError } = require("../../middlewares/errorHandler")
const { DOMAIN } = require("./envVariables")

const logoutController = asyncHandler(async (req, res, next) => {
    const cookies = req.cookies
    if (!cookies?.jwtRe) {
        return next(new ApplicationError("No Refresh Cookies found", 400))

    }

    return res.clearCookie("jwtRe", {
        httpOnly: true,
        domain: process.env.ENV === "prod" ? DOMAIN : "localhost",
        sameSite: process.env.ENV === "prod" ? "None" : "Lax",
        secure: process.env.ENV === "prod" ? true : false,
    }).clearCookie("jwtAccess", {
        httpOnly: true,
        domain: process.env.ENV === "prod" ? DOMAIN : "localhost",
        sameSite: process.env.ENV === "prod" ? "None" : "Lax",
        secure: process.env.ENV === "prod" ? true : false,
    }).sendStatus(200)

})

module.exports = { logoutController }