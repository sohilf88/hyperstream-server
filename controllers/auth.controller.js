const usermodel = require("../models/user.model");
const asyncHandler = require("express-async-handler")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
// create json web token
// function createJsonWebToken(userid) {
//   return jwt.sign({ id: userid, username: userid.username }, process.env.JSONWEBTOKEN_KEY, {
//     expiresIn: "3d",
//   });
// }

// login post controller
// const loginController = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;
//     const user = await usermodel.login(email, password,);
//     // const token = createJsonWebToken(user._id);
//     return res.status(201).json({ user });
//   } catch (error) {
//     return res.status(400).json({ error: error.message });
//   }
// };

// signup controller function
const signupController = asyncHandler(async (req, res, next) => {

  const { email, password, username, confirmPassword } = req.body;

  try {
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      })
    }
    const checkExistUserByMail = await usermodel.findOne({ email }).lean()
    if (checkExistUserByMail) {
      return res.status(400).json({
        success: false,
        message: "Email id already used or Account is already present"
      })
    }

    const user = await usermodel.create({ username, email, password, confirmPassword });
    if (user) {
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

  if (!email || !password) {
    return res.status(400).json({
      success: false, message: "All fields are required"
    })
  }
  const checkUserAccountInDB = await usermodel.findOne({ email }).select("+password");
  if (!checkUserAccountInDB) {
    return res.status(400).json({
      success: false, message: "Account not found"
    })
  }
  console.log(checkUserAccountInDB.password)
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
