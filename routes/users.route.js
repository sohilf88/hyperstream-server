const router = require("express").Router();
const {
  
  getAllUsersController,
  getSingleUserController,
  deleteUserController,
  updateUserController,
} = require("../controllers/user.controller");

// get all users
router.get("/", getAllUsersController);

// get single user
router.get("/:id", getSingleUserController);



// update specific user
router.patch("/:id", updateUserController);

// delete single user
router.delete("/:id", deleteUserController);

module.exports = router;
