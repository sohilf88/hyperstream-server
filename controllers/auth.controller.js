const usermodel = require("../models/user.model");
const asyncHandler = require("express-async-handler")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
const validator = require("validator")

// signup controller function
// /api/v1/auth/signup
const signupController = asyncHandler(async (req, res, next) => {

  const { email, password, username, confirmPassword, roles } = req.body;


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

  const user = await usermodel.create({ username, email, password, confirmPassword, roles });
  if (user) {
    // generate token if user available, need to change role later
    const accesstoken = jwt.sign({ username: user.username, email: user.email, roles: user.roles, _id: user._id }, process.env.AUTH_ACCESS_TOKEN_SECRET, {
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
  const accesstoken = jwt.sign({ username: checkUserAccountInDB.username, email: checkUserAccountInDB.email, roles: checkUserAccountInDB.roles }, process.env.AUTH_ACCESS_TOKEN_SECRET, {
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
  return res.redirect("/login")



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
// api/v1/auth/forgot-password controller
const forgotPassword = asyncHandler(async (req, res, next) => {
  // steps involved
  const { email } = req.body
  if (!validator.isEmail(email)) return res.status(400).json({ success: false, message: "please enter valid email address" })
  // 1. get correct email address in post request
  const userDetail = await usermodel.findOne({ email })
  if (!userDetail) {
    return res.status(404).json({ success: false, message: "Email address not found" })
  }
  // 2. generate random reset token
  const resetToken = userDetail.createPasswordResetToken()
  await userDetail.save({ validateBeforeSave: false })

  // 3. sent id to user's email

})

// api/v1/auth/reset-password controller
const resetPassword = async (req, res, next) => {

}


module.exports = { refresh, loginController, signupController, logoutController, forgotPassword, resetPassword };
