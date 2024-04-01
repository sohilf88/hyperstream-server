const router = require("express").Router();
const {
  createCameraController,
  getAllCameraController,
  updateCameraController,
  deleteCameraController,
  getSingleCameraController,
  getFilteredCameraController
  // deleteAllCameraController,
} = require("../controllers/camera.controller");
const { verifyJWT, roleRestrict } = require("../middlewares/verifyJwt");
// middleware
router.use(verifyJWT)
// get all cameras

router.get("/",  getAllCameraController);

router.get("/filtered", getFilteredCameraController);

// get single camera
router.get("/:id", getSingleCameraController)

// add new single camera
router.post("/",roleRestrict("root", "admin") ,createCameraController);

// update single camera
router.patch("/:id", roleRestrict("root", "admin"), updateCameraController);
// delete single camera
router.delete("/:id",roleRestrict("root", "admin"), deleteCameraController);
// delete all cameras
// router.delete("/", deleteAllCameraController);

module.exports = router;
