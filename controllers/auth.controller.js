const usermodel = require("../models/user.model");
const asyncHandler = require("express-async-handler")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")

// signup controller function
const signupController = asyncHandler(async (req, res, next) => {

  const { email, password, username, confirmPassword } = req.body;

  try {
    // check for all required fields
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      })
    }
    //  check user in db by email id
    const checkExistUserByMail = await usermodel.findOne({ email }).lean()
    if (checkExistUserByMail) {
      return res.status(400).json({
        success: false,
        message: "Email id is already registered"
      })
    }
    // signup user
    const user = await usermodel.create({ username, email, password, confirmPassword });
    if (user) {
      // generate token if user available
      const token = jwt.sign({ _id: user._id, email: user.email }, process.env.JSONWEBTOKEN_KEY, {
        expiresIn: "3d"
      })
      res.status(200).json({
        success: true,
        message: `user ${username}has been created`,
        access_key: token
      });
    }

  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});



// Login Controller
const loginController = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  // check all fields
  if (!email || !password) {
    return res.status(400).json({
      success: false, message: "All fields are required"
    })
  }
  // check user in db with email and add password to compare
  const checkUserAccountInDB = await usermodel.findOne({ email }).select("+password");
  if (!checkUserAccountInDB) {
    return res.status(400).json({
      success: false, message: "Account not found"
    })
  }
  //  compare provided password by user with stored db password in hash
  const isMatch = await checkUserAccountInDB.comparePassword(password, checkUserAccountInDB.password)
  if (!isMatch) {
    return res.status(401).json({
      success: false, message: "Email or password is wrong"
    })
  }

  res.status(201).json({
    success: true, message: "Login Suceess"
  })



})

module.exports = { loginController, signupController };
