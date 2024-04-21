const jwt = require("jsonwebtoken")
const userModel = require("../models/user.model")

const verifyJWT = async (req, res, next) => {
    // console.log(req.cookies.jwtAccess)
    if (!req.cookies.jwtAccess) {
        return res.status(403).json({ sucess: false, message: "No Access Cookies" })

    }
    const { jwtAccess } = req.cookies




    jwt.verify(
        jwtAccess, process.env.AUTH_ACCESS_TOKEN_SECRET, async (error, decoded) => {

            if (error) {
                console.log(error)
                 return res.status(401).json({ sucess: false, message: error.message })
            }
            // console.log(decoded)
            req.username = decoded.username;
            req.email = decoded.email;
            req.roles = decoded.roles;
            // verify if user present
            const checkUser = await userModel.findOne({ email: req.email })

            if (!checkUser) return res.status(403).json({ sucess: false, message: "User not found" })
            // verify if password changed after token issued
            if (checkUser.checkPasswordAfterTokenAssigned(decoded.iat)) {
                res.clearCookie("jwtRe", {
                    httpOnly: true, //accessible only via browser
                    sameSite: "lax",// cross-site cookie
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