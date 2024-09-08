const loginLimiter = require("../middlewares/loginLimiter");
const router = require("express").Router();
const { loginController } = require("../controllers/auth/login")
const { verifyJWT, roleRestrict } = require("../middlewares/verifyJwt");
const { signupController } = require("../controllers/auth/signup");
const { logoutController } = require("../controllers/auth/logout");
const { refresh } = require("../controllers/auth/refreshToken");
const { forgotPassword } = require("../controllers/auth/forgot-password");
const { resetPassword } = require("../controllers/auth/reset-password");
const { changeLoggedUserPassword } = require("../controllers/user/profile/userProfilePassword");


// router.use(loginLimiter)

// login Route
router.post("/login", loginLimiter, loginController);
// signup route
router.post("/signup", verifyJWT, roleRestrict("root"), signupController);
// logout
router.post("/logout", logoutController)

// change Logged in user password

router.patch("/change-password", verifyJWT, changeLoggedUserPassword)


// refresh token

router.get("/refresh", refresh)
// forgot password
router.post("/forgot-password", forgotPassword)
// // reset password
// router.get("/reset-password/:token", resetPasswordGet)

router.post("/reset-password/", resetPassword)



module.exports = router;
