const router = require("express").Router();

const {
 
} = require("../controllers/user.controller");
const { updateUserProfile } = require("../controllers/user/profile/userProfileData");
const { userProfile } = require("../controllers/user/profile/userProfile");
const { verifyJWT } = require("../middlewares/verifyJwt");

// user profile

router.get("/profile",verifyJWT, userProfile)

router.patch("/profile",verifyJWT, updateUserProfile)



module.exports = router

