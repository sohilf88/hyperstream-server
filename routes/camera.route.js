const router = require("express").Router();
const {
  createCameraController,
  getAllCameraController,
  updateCameraController,
  deleteCameraController,
  // deleteAllCameraController,
} = require("../controllers/camera.controller");
// get all cameras

router.get("/", getAllCameraController);

// get single camera
router.get("/:id", async (req, res, next) => {
  res.json({ result: "single camera" });
});

// add new single camera
router.post("/", createCameraController);

// update single camera
router.patch("/:id", updateCameraController);
// delete single camera
router.delete("/:id", deleteCameraController);
// delete all cameras
// router.delete("/", deleteAllCameraController);

module.exports = router;
