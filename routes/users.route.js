const router = require("express").Router();

const {
  updateLoginUserController
} = require("../controllers/user.controller");
const { updateUserProfile } = require("../controllers/user/profile/userProfileData");
const { userProfile } = require("../controllers/user/profile/userProfile");
const { verifyJWT } = require("../middlewares/verifyJwt");





// user profile

router.get("/profile",verifyJWT, userProfile)

router.patch("/profile",verifyJWT, updateUserProfile)

// update Login user
// router.patch("/loginUser", updateLoginUserController);

module.exports = router

