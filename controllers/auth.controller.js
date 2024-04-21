const usermodel = require("../models/user.model");
const asyncHandler = require("express-async-handler")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
const validator = require("validator");
const sendEmail = require("../helper/emailSent");
const crypto = require("crypto")

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
    // create cookie with refresh token & Access Cookies
    return res.cookie('jwtRe', refreshToken, {
      httpOnly: true, //accessible only via browser
      sameSite: "none",// cross-site cookie
      secure: true,//https only,need to change to true later
      maxAge: 24 * 60 * 60 * 1000 // 24 hours,

    })
      .cookie('jwtAccess', accesstoken, {
        httpOnly: true, //accessible only via browser
        sameSite: "none",// cross-site cookie
        secure: true,//https only,need to change to true later
        maxAge: 15 * 60 * 1000 // 15 minutes

      }).json({
        success: true,
        message: "User Account created "
      })
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
  // console.log(checkPassword)

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
  return res.cookie('jwtRe', refreshToken, {
    httpOnly: true, //accessible only via browser
    sameSite: "none",// cross-site cookie
    secure: true,//https only,need to change to true later
    maxAge: 24 * 60 * 60 * 1000 // 24 hours,

  })
    .cookie('jwtAccess', accesstoken, {
      httpOnly: true, //accessible only via browser
      sameSite: "none",// cross-site cookie
      secure: true,//https only,need to change to true later
      maxAge: 15 * 60 * 1000 // 15 minutes

    }).json({
      success: true,
      message: "Login Success"
    })



})
// /api/v1/auth/logout
const logoutController = asyncHandler(async (req, res, next) => {
  const cookies = req.cookies
  if (!cookies?.jwtRe) {
    return res.sendStatus(204) //no Content

  }

  return res.clearCookie("jwtRe", {
    httpOnly: true, //accessible only via browser
    sameSite: "lax",// cross-site cookie
    secure: true,//https only
  }).clearCookie("jwtAccess", {
    httpOnly: true, //accessible only via browser
    sameSite: "none",// cross-site cookie
    secure: true,//https onl
  }).sendStatus(200)
  // res.json({ success: true, message: "cookies cleared" })
  // return res.redirect("/auth/login")



})

const refresh = async (req, res) => {
  // /api/v1/auth/refresh 
  const cookies = req.cookies
  // console.log(cookies)
  if (!cookies?.jwtRe) {
    return res.status(401).json({
      sucess: false,
      message: "Unauthorized Access"
    })

  }
  const refreshToken = cookies.jwtRe
  // console.log(refreshToken)
  jwt.verify(
    refreshToken,
    process.env.AUTH_REFRESH_TOKEN_SECRET,
    asyncHandler(async (error, decoded) => {
      // console.log(decoded._id)
      if (error) {
        return res.status(403).json({ success: false, message: "Forbidden" })
      }
      const searchUserInDb = await usermodel.findById({ _id: decoded._id })
      if (!searchUserInDb) {
        return res.status(401).json({ success: false, message: "User not exist" })
      }

      // create access token, need to change role later
      const accesstoken = jwt.sign({ username: searchUserInDb.username, email: searchUserInDb.email, roles: searchUserInDb.roles }, process.env.AUTH_ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRY
      })
      console.log(accesstoken)

      return res.cookie('jwtAccess', accesstoken, {
        httpOnly: true, //accessible only via browser
        sameSite: "none",// cross-site cookie
        secure: true,//https only,need to change to true later
        maxAge: 15 * 60 * 1000 // 15 min expire time
      }).json({ success: true, message: "Access Token Updated" })

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
  const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/reset-password/${resetToken}`
  const message = `Forgot your password ? click on below link to reset it\n ${resetUrl}`
  try {
    await sendEmail({
      email: userDetail.email,
      subject: "Password Reset token valid for 10 min",
      message: message
    })
    res.status(200).json({
      success: true,
      message: "password reset link sent to your email, please check your inbox"
    })

  } catch (error) {
    userDetail.passwordResetToken = undefined,
      userDetail.passwordResetExpire = undefined,
      await userDetail.save({ validateBeforeSave: false })
    return res.status(500).json({
      success: false,
      message: "error while sending reset link, please try later"
    })
  }


})

// reset password get method // need to remove
const resetPasswordGet = asyncHandler(async (req, res, next) => {
  // console.log("token is " + req.params.token)
  if (!req.params.token) {
    return res.status(400).json({ success: false, message: "invalid token" })
  }
  const hashTheToken = crypto.createHash("sha256").update(req.params.token).digest("hex")
  const user = await usermodel.findOne({
    passwordResetToken: hashTheToken,
    passwordResetExpire: { $gt: Date.now() }
  })
  if (!user) return res.status(400).json({ success: false, message: "invalid token or expired" })
  // req.token = hashTheToken
  // console.log(hashTheToken)
  // res.sendStatus(200).json(req.token)
  // next()
  req.user = user
  res.status(304).redirect("http://localhost:3000/reset-password")
})
// need to remove above if not worked
// get user based upon token



// api/v1/auth/reset-password controller
const resetPassword = asyncHandler(async (req, res, next) => {

  if (!req.params.token) {
    return res.status(400).json({ success: false, message: "invalid token" })
  }
  // get user based upon token

  const hashTheToken = crypto.createHash("sha256").update(req.params.token).digest("hex")
  // console.log(hashTheToken)
  const user = await usermodel.findOne({
    passwordResetToken: hashTheToken,
    passwordResetExpire: { $gt: Date.now() }
  })
  // token is not expire and user is present, set new password
  if (!user) return res.status(400).json({ success: false, message: "invalid token or expired" })
  // update changePasswordAt property
  user.password = req.body.password
  user.confirmPassword = req.body.confirmPassword
  user.passwordResetToken = undefined
  user.passwordResetExpire = undefined
  await user.save()
  // login user by sending jwt
  const accesstoken = jwt.sign({ username: user.username, email: user.email, roles: user.roles }, process.env.AUTH_ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRY
  })
  res.status(200).json({
    success: true,
    message: "password changed succesfully",
    access_token: accesstoken
  })

})


module.exports = { resetPasswordGet, refresh, loginController, signupController, logoutController, forgotPassword, resetPassword };
