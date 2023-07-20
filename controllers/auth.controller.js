// login post controller
const loginController = async (req, res, next) => {
  res.status(200).json("Login Route");
};

// signup controller function
const signupController = async (req, res, next) => {
  res.status(200).json("signup Route");
};

module.exports = { loginController, signupController };
