const jwt = require("jsonwebtoken")
const userModel = require("../models/user.model")

const verifyJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization
    if (!authHeader?.startsWith("Bearer ")) {  //check for header
        return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const token = authHeader.split(" ")[1] //    grab the jwt string

    // verify the token

    jwt.verify(
        token, process.env.AUTH_ACCESS_TOKEN_SECRET, async (error, decoded) => {
            if (error) return res.status(403).json({ sucess: false, message: "Forbidden" })
            req.username = decoded.username;
            req.email = decoded.email;
            req.roles = decoded.roles;
            const checkUser = await userModel.findOne({ email: req.email })
            if (!checkUser) return res.status(403).json({ sucess: false, message: "User not found" })
            next()
        }

    )

}

module.exports = verifyJWT