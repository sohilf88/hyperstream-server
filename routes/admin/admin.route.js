const router = require("express").Router();
const { getAllUsersController, getSingleUserController, deleteUserController } = require("../../controllers/user.controller");
const { roleRestrict, verifyJWT } = require("../../middlewares/verifyJwt");
const { getAllUsersCameraforAdmin, getSpecificUsersCamera, updateUserControllerByAdmin } = require("./admin.controller");



router.use(verifyJWT)
router.use(roleRestrict("root"))
// all camera related route

router.get("/all", getAllUsersCameraforAdmin);
router.get("/specific", getSpecificUsersCamera);


//  all users related routes
router.get("/", getAllUsersController);

// get single user
router.get("/:id", getSingleUserController);

// update specific user
router.patch("/:id", updateUserControllerByAdmin);

//reset password for specific user by admin
// router.patch("/reset-password/:id", );

// delete single user
router.delete("/:id", deleteUserController);


module.exports = router;