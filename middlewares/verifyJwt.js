const jwt = require("jsonwebtoken")
const userModel = require("../models/user.model")
const { ApplicationError } = require("./errorHandler")

const verifyJWT = async (req, res, next) => {
    // console.log(req.cookies)
    if (!req.cookies.jwtAccess) {
        return next(new ApplicationError("Forbidden, No Access Cookies in Request", 401))
        // return res.status(403).json({ sucess: false, message: "No Access Cookies" })

    }
    const { jwtAccess } = req.cookies
    // const { jwtRe } = req.cookies




    jwt.verify(
        jwtAccess, process.env.AUTH_ACCESS_TOKEN_SECRET, async (error, decoded) => {

            if (error) {
                // console.log(error)
                return next(new ApplicationError(error.name, 401))
            }
            // console.log(decoded)
            req.username = decoded.username;
            req.email = decoded.email;
            req.roles = decoded.roles;
            req.id = decoded._id
            // verify if user present
            const checkUser = await userModel.findOne({ email: req.email })

            if (!checkUser || !checkUser.isActive) return new ApplicationError("User Not Found", 403)
            // verify if password changed after token issued
            if (checkUser.checkPasswordAfterTokenAssigned(decoded.iat)) {
                res.clearCookie("jwtRe", {
                    httpOnly: true, //accessible only via browser
                    sameSite: "none",// cross-site cookie
                    secure: true,//https only
                    domain:'hyperstream.in'
                })
                // return res.status(403).json({ sucess: false, message: "User recently changed password, Login again" })
                return (new ApplicationError("User recently changed password, Login again", 403))
            }
            //    Grant access to protected route

            req.user = checkUser  //assigned for next middleware

            next()
        }

    )

}

const roleRestrict = (...allowedRoles) => {
    return (req, res, next) => {
        // console.log(allowedRoles);
        // console.log(!allowedRoles.includes(req.user.roles))

        if (!req.user.roles) {
            return (new ApplicationError("UnAuthorized", 403))
        }

        if (!allowedRoles.includes(req.user.roles)) {
            // return (new ApplicationError("You do not have Permission to Access Resources", 403))
            // return (new ApplicationError(req.user.roles, 403))
            return res.status(403).json({ success: false, message: "UnAuthrorized activity Prohibited" })
        }

        return next()
    }

}

module.exports = { verifyJWT, roleRestrict }