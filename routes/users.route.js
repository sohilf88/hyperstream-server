const router = require("express").Router();
const {

  getAllUsersController,
  getSingleUserController,
  deleteUserController,
  updateUserController,
  createUser,
  getUserProfileController,
  updateLoginUserController
} = require("../controllers/user.controller");
const { updateUserProfile } = require("../controllers/user/profile/userProfileData");
const { userProfile } = require("../controllers/user/profile/userProfile");
const { verifyJWT } = require("../middlewares/verifyJwt");


router.use(verifyJWT)

// get all users
router.get("/", getAllUsersController);

// user profile

router.get("/profile", userProfile)

router.patch("/profile", updateUserProfile)

// update Login user
router.patch("/loginUser", updateLoginUserController);

// get single user
router.get("/:id", getSingleUserController);




// update specific user
router.patch("/:id", updateUserController);

// delete single user
router.delete("/:id", deleteUserController);

module.exports = router;
