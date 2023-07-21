const usermodel = require("../models/user.model");

const jwt = require("jsonwebtoken");

// create json web token
function createJsonWebToken(userid) {
  return jwt.sign({ id: userid }, process.env.JSONWEBTOKEN_KEY, {
    expiresIn: "3d",
  });
}

// login post controller
const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await usermodel.login(email, password);
    const token = createJsonWebToken(user._id);
    return res.status(200).json({ email, token });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// signup controller function
const signupController = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await usermodel.signup(email, password);
    const token = createJsonWebToken(user._id);
    // const user = await usermodel.create({ email, password });
    res.status(200).json({ email, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { loginController, signupController };
