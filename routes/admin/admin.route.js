const router = require("express").Router();
const {  getSingleUserController } = require("../../controllers/user.controller");
const { roleRestrict, verifyJWT } = require("../../middlewares/verifyJwt");
const { getAllUsersCameraforAdmin, getSpecificUsersCamera, updateUserControllerByAdmin, resetUserPasswordByAdmin, getAllUsersAdminController, deleteUserByAdmin, getAllDisableUsersAdminController } = require("./admin.controller");



router.use(verifyJWT)
router.use(roleRestrict("root"))
// all camera related route

router.get("/all", getAllUsersCameraforAdmin);
router.get("/specific", getSpecificUsersCamera);


//  all users related routes
router.get("/", getAllUsersAdminController);
// router.get("/disable", getAllDisableUsersAdminController);

// get single user
router.get("/:id", getSingleUserController);

// update specific user
router.patch("/:id", updateUserControllerByAdmin);
router.patch("/update-password/:id", resetUserPasswordByAdmin);

//reset password for specific user by admin
// router.patch("/reset-password/:id", );

// delete single user
router.delete("/:id", deleteUserByAdmin);


module.exports = router;