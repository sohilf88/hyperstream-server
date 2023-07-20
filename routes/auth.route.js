const router = require("express").Router();
const {
  signupController,
  loginController,
} = require("../controllers/auth.controller");

// login Route
router.post("/login", loginController);
// signup route
router.post("/signup", signupController);

module.exports = router;
