const loginLimiter = require("../middlewares/loginLimiter");
const router = require("express").Router();
const {
  signupController,
  loginController,
  logoutController,
  refresh,
  resetPassword,
  forgotPassword

} = require("../controllers/auth.controller");



// login Route
router.post("/login", loginLimiter, loginController);
// signup route
router.post("/signup", signupController);
// logout
router.post("/logout", logoutController)

// refresh token

router.get("/refresh", refresh)
// forgot password
router.post("/forgot-password", forgotPassword)
// reset password
router.post("/reset-password", resetPassword)

module.exports = router;
