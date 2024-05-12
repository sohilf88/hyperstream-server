const loginLimiter = require("../middlewares/loginLimiter");
const router = require("express").Router();
const {loginController}=require("../controllers/auth/login")
const {
  signupController,
  
  logoutController,
  refresh,
  resetPassword,
  forgotPassword,
  resetPasswordGet,
  changeLoginUserPassword

} = require("../controllers/auth.controller");
const { verifyJWT } = require("../middlewares/verifyJwt");

router.use(loginLimiter)

// login Route
router.post("/login", loginController);
// signup route
router.post("/signup", signupController);
// logout
router.post("/logout", logoutController)

// change Logged in user password

router.patch("/change-password", verifyJWT, changeLoginUserPassword)


// refresh token

router.get("/refresh", refresh)
// forgot password
router.post("/forgot-password", forgotPassword)
// reset password
router.get("/reset-password/:token", resetPasswordGet)

router.patch("/reset-password/:token", resetPassword)



module.exports = router;
