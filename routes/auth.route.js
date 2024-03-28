const loginLimiter = require("../middlewares/loginLimiter");
const router = require("express").Router();
const {
  signupController,
  loginController,
  logoutController,
  refresh

} = require("../controllers/auth.controller");



// login Route
router.post("/login", loginLimiter, loginController);
// signup route
router.post("/signup", signupController);
// logout
router.post("/logout", logoutController)

// refresh token

router.get("/refresh", refresh)
module.exports = router;
