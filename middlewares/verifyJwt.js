const jwt = require("jsonwebtoken")
const userModel = require("../models/user.model")
const { ApplicationError } = require("./errorHandler")

const verifyJWT = async (req, res, next) => {
    // console.log(req.cookies)
    if (!req.cookies.jwtAccess) {
        return next(new ApplicationError("Forbidden, No Access Cookies in Request", 403))
        // return res.status(403).json({ sucess: false, message: "No Access Cookies" })

    }
    const { jwtAccess } = req.cookies
    // const { jwtRe } = req.cookies




    jwt.verify(
        jwtAccess, process.env.AUTH_ACCESS_TOKEN_SECRET, async (error, decoded) => {

            if (error) {
                console.log(error)
                return next(new ApplicationError(error.name, 401))
            }
            console.log(decoded)
            req.username = decoded.username;
            req.email = decoded.email;
            req.roles = decoded.roles;
            req.id = decoded._id
            // verify if user present
            const checkUser = await userModel.findOne({ email: req.email })

            if (!checkUser) return res.status(403).json({ sucess: false, message: "User not found" })
            // verify if password changed after token issued
            if (checkUser.checkPasswordAfterTokenAssigned(decoded.iat)) {
                res.clearCookie("jwtRe", {
                    httpOnly: true, //accessible only via browser
                    sameSite: "none",// cross-site cookie
                    secure: true,//https only
                })
                return res.status(403).json({ sucess: false, message: "User recently changed password, Login again" })
            }
            //    Grant access to protected route

            req.user = checkUser  //assigned for next middleware

            next()
        }

    )

}

const roleRestrict = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user.roles) return res.sendStatus(401).json("Not Authorized User")
        const roleArray = [...allowedRoles]
        // console.log("allowedRoles" + roleArray)
        // console.log("req" + req.user.roles)
        const roleAllowed = req.user.roles.map((role) => allowedRoles.includes(role)).find((value) => value === true)
        console.log(roleAllowed)
        if (!roleAllowed) return res.sendStatus(401).status("User not Allowed")

        next()
    }

}

module.exports = { verifyJWT, roleRestrict }