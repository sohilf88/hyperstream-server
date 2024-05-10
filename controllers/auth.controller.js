const usermodel = require("../models/user.model");
const asyncHandler = require("express-async-handler")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
const validator = require("validator");
const sendEmail = require("../helper/emailSent");
const crypto = require("crypto");
const { ApplicationError } = require("../middlewares/errorHandler");


// signup controller function
// /api/v1/auth/signup
const signupController = asyncHandler(async (req, res, next) => {

  const { email, password, username, confirmPassword, roles } = req.body;


  // check for all required fields
  if (!username || !email || !password || !confirmPassword) {
    return next(new ApplicationError("All fields are required", 400))
    // return res.status(400).json({
    //   success: false,
    //   message: "All fields are required"
    // })
  }
  //  check user in db by email id
  const checkExistUserByMail = await usermodel.findOne({ email }).lean()
  // console.log(checkExistUserByMail)
  if (checkExistUserByMail) {
    return next(new ApplicationError("Email id is already registered", 400))
    // return res.status(400).json({
    //   success: false,
    //   message: "Email id is already registered"
    // })
  }
  // signup user

  const user = await usermodel.create({ username, email, password, confirmPassword, roles });
  if (user) {
    // console.log(process.env.AUTH_ACCESS_TOKEN_EXPIRY, process.env.AUTH_REFRESH_TOKEN_EXPIRY)
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
      expiresIn: process.env.AUTH_REFRESH_COOKIE_EXPIRY // 48 hours,

    })
      .cookie('jwtAccess', accesstoken, {
        httpOnly: true, //accessible only via browser
        sameSite: "none",// cross-site cookie
        secure: true,//https only,need to change to true later
        expiresIn: process.env.AUTH_ACCESS_COOKIES_EXPIRY // 15 minutes

      }).json({
        success: true,
        message: "User Account created",
        data: { name: user.username, roles: user.roles }
      })
  }

  return next(new ApplicationError("Given data is not correct", 400))
  // return res.status(400).json({ success: false, message: "Given data is not correct" });

});



// Login Controller
// /api/v1/auth/login
const loginController = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  console.log(req.body)
  // check all fields
  if (!email || !password) {
    return next(new ApplicationError("All fields are required", 400))
    // return res.status(400).json({
    //   success: false, message: "All fields are required"
    // })
  }
  // check user in db with email and add password to compare
  const checkUserAccountInDB = await usermodel.findOne({ email }).select("+password");
  if (!checkUserAccountInDB || !checkUserAccountInDB.active) {
    return next(new ApplicationError("Account was not found", 400))
    // return res.status(400).json({
    //   success: false, message: "Account was not found"
    // })
  }
  //  compare provided password by user with stored db password in hash
  const checkPassword = await bcrypt.compare(password, checkUserAccountInDB.password)
  // console.log(checkPassword)

  // const isMatch = await checkUserAccountInDB.comparePassword(password, checkUserAccountInDB.password)
  if (!checkPassword) {
    return next(new ApplicationError("Email or password is wrong", 401))
    // return res.status(401).json({
    //   success: false, message: "Email or password is wrong"
    // })
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
    expiresIn: process.env.AUTH_REFRESH_COOKIE_EXPIRY // 48 hours,


  })
    .cookie('jwtAccess', accesstoken, {
      httpOnly: true, //accessible only via browser
      sameSite: "none",// cross-site cookie
      secure: true,//https only,need to change to true later
      expiresIn: process.env.AUTH_ACCESS_COOKIES_EXPIRY // 15 minutes

    },).json({
      success: true,
      message: "Login Success",
      data: { name: checkUserAccountInDB.username, roles: checkUserAccountInDB.roles }
    })



})
// /api/v1/auth/logout
const logoutController = asyncHandler(async (req, res, next) => {
  const cookies = req.cookies
  if (!cookies?.jwtRe) {
    return next(new ApplicationError("No Refresh Cookies found", 400))

  }

  return res.clearCookie("jwtRe", {
    httpOnly: true, //accessible only via browser
    sameSite: "none",// cross-site cookie
    secure: true,//https only
  }).clearCookie("jwtAccess", {
    httpOnly: true, //accessible only via browser
    sameSite: "none",// cross-site cookie
    secure: true,//https onl
  }).sendStatus(200)

})

const refresh = async (req, res, next) => {
  // /api/v1/auth/refresh 
  const cookies = req.cookies
  // console.log(cookies)
  if (!cookies?.jwtRe) {
    return next(new ApplicationError("Unauthorized,No Refresh cookies", 401))


  }
  const refreshToken = cookies.jwtRe
  // console.log(refreshToken)
  jwt.verify(
    refreshToken,
    process.env.AUTH_REFRESH_TOKEN_SECRET,
    asyncHandler(async (error, decoded) => {
      // console.log(decoded._id)
      if (error) {
        // return res.status(403).json({ success: false, message: error.message })
        return next(new ApplicationError(error.message, 403))
      }
      const searchUserInDb = await usermodel.findById({ _id: decoded._id })
      if (!searchUserInDb) {
        return next(new ApplicationError("User does not Exist", 404))
      }

      // create access token, need to change role later
      const accesstoken = jwt.sign({ username: searchUserInDb.username, email: searchUserInDb.email, roles: searchUserInDb.roles }, process.env.AUTH_ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRY
      })
      // console.log(accesstoken)

      return res.cookie('jwtAccess', accesstoken, {
        httpOnly: true, //accessible only via browser
        sameSite: "none",// cross-site cookie
        secure: true,//https only,need to change to true later
        expiresIn: process.env.AUTH_ACCESS_COOKIES_EXPIRY // 15 min expire time
      }).status(201).json({ success: true, message: "Access Token Updated" })

    })
  )

}
// api/v1/auth/forgot-password controller
const forgotPassword = asyncHandler(async (req, res, next) => {
  // steps involved
  const { email } = req.body
  if (!validator.isEmail(email)) return next(new ApplicationError("please enter valid email", 400))
  // 1. get correct email address in post request
  const userDetail = await usermodel.findOne({ email })
  if (!userDetail) {
    return next(new ApplicationError("No user found", 404))
    // return res.status(404).json({ success: false, message: "Email address not found" })
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
    return next(new ApplicationError("error while sending reset link, please try later", 500))
   
  }


})

// reset password get method // need to remove
const resetPasswordGet = asyncHandler(async (req, res, next) => {
  // console.log("token is " + req.params.token)
  if (!req.params.token) {
    // return res.status(400).json({ success: false, message: "invalid token" })
    return next(new ApplicationError("invalid token", 400))
  }
  const hashTheToken = crypto.createHash("sha256").update(req.params.token).digest("hex")
  const user = await usermodel.findOne({
    passwordResetToken: hashTheToken,
    passwordResetExpire: { $gt: Date.now() }
  })
  if (!user) {
    return next(new ApplicationError("invalid token or expired", 400))
    // return res.status(400).json({ success: false, message: "invalid token or expired" })
  }

  // req.token = hashTheToken
  // console.log(hashTheToken)
  // res.sendStatus(200).json(req.token)
  // next()
  req.user = user
  res.status(304).redirect(process.env.REDIRECTED_URL_PASSWORD_RESET)
})
// need to remove above if not worked
// get user based upon token



// api/v1/auth/reset-password controller
const resetPassword = asyncHandler(async (req, res, next) => {

  if (!req.params.token) {
    return next(new ApplicationError("invalid token", 400))
    // return res.status(400).json({ success: false, message: "invalid token" })
  }
  // get user based upon token

  const hashTheToken = crypto.createHash("sha256").update(req.params.token).digest("hex")
  // console.log(hashTheToken)
  const user = await usermodel.findOne({
    passwordResetToken: hashTheToken,
    passwordResetExpire: { $gt: Date.now() }
  })
  // token is not expire and user is present, set new password
  if (!user) {
    return next(new ApplicationError("invalid token or expired", 400))
    // return res.status(400).json({ success: false, message: "invalid token or expired" })
  }
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

  return res.cookie('jwtAccess', accesstoken, {
    httpOnly: true, //accessible only via browser
    sameSite: "none",// cross-site cookie
    secure: true,//https only,need to change to true later
    expiresIn: process.env.AUTH_ACCESS_COOKIES_EXPIRY // 15 minutes
  }).status(201).json({ success: true, message: "password changed succesfully" })

})


module.exports = { resetPasswordGet, refresh, loginController, signupController, logoutController, forgotPassword, resetPassword };
