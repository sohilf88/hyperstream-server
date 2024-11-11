const asyncHandler = require("express-async-handler")
const { ApplicationError } = require("../../middlewares/errorHandler")

const logoutController = asyncHandler(async (req, res, next) => {
    const cookies = req.cookies
    if (!cookies?.jwtRe) {
        return next(new ApplicationError("No Refresh Cookies found", 400))

    }

    return res.clearCookie("jwtRe", {
        httpOnly: true, //accessible only via browser
        sameSite: "none",// cross-site cookie
        secure: true,//https only
        domain: 'hypsertream.in',
    }).clearCookie("jwtAccess", {
        httpOnly: true, //accessible only via browser
        sameSite: "none",// cross-site cookie
        secure: true,//https onl
        domain: 'hypsertream.in',
    }).sendStatus(200)

})

module.exports = { logoutController }