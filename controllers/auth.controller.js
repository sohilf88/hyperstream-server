const usermodel = require("../models/user.model");
const asyncHandler = require("express-async-handler")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")

// signup controller function
// /api/v1/auth/signup
const signupController = asyncHandler(async (req, res, next) => {

  const { email, password, username, confirmPassword } = req.body;


  // check for all required fields
  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    })
  }
  //  check user in db by email id
  const checkExistUserByMail = await usermodel.findOne({ email }).lean()
  console.log(checkExistUserByMail)
  if (checkExistUserByMail) {
    return res.status(400).json({
      success: false,
      message: "Email id is already registered"
    })
  }
  // signup user

  const user = await usermodel.create({ username, email, password, confirmPassword });
  if (user) {
    // generate token if user available, need to change role later
    const accesstoken = jwt.sign({ username: user.username, email: user.email, roles: "user" }, process.env.AUTH_ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRY
    })

    const refreshToken = jwt.sign({ _id: user._id, username: user.username }, process.env.AUTH_REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.AUTH_REFRESH_TOKEN_EXPIRY
    })
    // create cookie with refresh token
    res.cookie('jwtRe', refreshToken, {
      httpOnly: true, //accessible only via browser
      sameSite: "None",// cross-site cookie
      secure: true,//https only
      maxAge: 2 * 24 * 60 * 60 * 1000 // 2 day expire time
    })

    res.status(200).json({
      success: true,
      message: `user ${username} has been created`,
      access_key: accesstoken
    });
  }


  res.status(400).json({ success: false, message: "Given data is not correct" });

});



// Login Controller
// /api/v1/auth/login
const loginController = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  console.log(req.body)
  // check all fields
  if (!email || !password) {
    return res.status(400).json({
      success: false, message: "All fields are required"
    })
  }
  // check user in db with email and add password to compare
  const checkUserAccountInDB = await usermodel.findOne({ email }).select("+password");
  if (!checkUserAccountInDB || !checkUserAccountInDB.active) {
    return res.status(400).json({
      success: false, message: "Account was not found"
    })
  }
  //  compare provided password by user with stored db password in hash
  const checkPassword = await bcrypt.compare(password, checkUserAccountInDB.password)
  console.log(checkPassword)

  // const isMatch = await checkUserAccountInDB.comparePassword(password, checkUserAccountInDB.password)
  if (!checkPassword) {
    return res.status(401).json({
      success: false, message: "Email or password is wrong"
    })
  }
  const accesstoken = jwt.sign({ username: checkUserAccountInDB.username, email: checkUserAccountInDB.email, roles: "user" }, process.env.AUTH_ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRY
  })

  const refreshToken = jwt.sign({ _id: checkUserAccountInDB._id, username: checkUserAccountInDB.username }, process.env.AUTH_REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.AUTH_REFRESH_TOKEN_EXPIRY
  })
  // create cookie with refresh token
  res.cookie('jwtRe', refreshToken, {
    httpOnly: true, //accessible only via browser
    sameSite: "None",// cross-site cookie
    secure: true,//https only
    maxAge: 2 * 24 * 60 * 60 * 1000 // 2 day expire time
  })
  res.status(200).json({
    success: true,
    message: "Login Suceess",
    accessToken: accesstoken
  })



})
// /api/v1/auth/logout
const logoutController = asyncHandler(async (req, res, next) => {
  const cookies = req.cookies
  if (!cookies?.jwtRe) {
    return res.sendStatus(204) //no Content

  }
  res.clearCookie("jwtRe", {
    httpOnly: true, //accessible only via browser
    sameSite: "None",// cross-site cookie
    secure: true,//https only
  })
  res.json({ success: true, message: "cookies cleared" })



})

const refresh = async (req, res) => {
  // /api/v1/auth/refresh 
  const cookies = req.cookies
  console.log(cookies)
  if (!cookies?.jwtRe) {
    return res.status(401).json({
      sucess: false,
      message: "Unauthorized"
    })

  }
  const refreshToken = cookies.jwtRe
  jwt.verify(
    refreshToken,
    process.env.AUTH_REFRESH_TOKEN_SECRET,
    asyncHandler(async (error, decoded) => {
      // console.log(decoded)
      if (error) return res.status(403).json({ success: false, message: "Forbidden" })
      const searchUserInDb = await usermodel.findById({ _id: decoded._id })
      if (!searchUserInDb) return res.status(401).json({ success: false, message: "User not exist" })

      // create access token, need to change role later
      const accesstoken = jwt.sign({ username: searchUserInDb.username, email: searchUserInDb.email, roles: "user" }, process.env.AUTH_ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRY
      })

      res.json({
        success: true,

        accessToken: accesstoken
      })

    })
  )

}

module.exports = { refresh, loginController, signupController, logoutController };
