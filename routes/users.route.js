const router = require("express").Router();
const {

  getAllUsersController,
  getSingleUserController,
  deleteUserController,
  updateUserController,
  createUser
} = require("../controllers/user.controller");
const verifyJWT = require("../middlewares/verifyJwt");

router.use(verifyJWT)

// get all users
router.get("/", getAllUsersController);

// get single user
router.get("/:id", getSingleUserController);



// update specific user
router.patch("/:id", updateUserController);

// delete single user
router.delete("/:id", deleteUserController);

module.exports = router;
