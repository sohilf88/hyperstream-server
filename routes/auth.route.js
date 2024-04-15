const loginLimiter = require("../middlewares/loginLimiter");
const router = require("express").Router();
const {
  signupController,
  loginController,
  logoutController,
  refresh,
  resetPassword,
  forgotPassword,
  resetPasswordGet

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
router.get("/reset-password/:token", resetPasswordGet)
router.patch("/reset-password/:token", resetPassword)

module.exports = router;
