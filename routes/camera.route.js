const router = require("express").Router();
const express = require("express")
const multer = require("multer")
const path = require("path")
const {
  createCameraController,
  getAllCameraController,
  updateCameraController,
  deleteCameraController,
  getSingleCameraController,
  getFilteredCameraController
  // deleteAllCameraController,
} = require("../controllers/camera.controller");
const { bulkCameraImports } = require("../controllers/camera/bulk-import");

const { verifyJWT, roleRestrict } = require("../middlewares/verifyJwt");



// middleware
router.use(verifyJWT)

router.use(express.static(path.resolve(__dirname, "public")))
// !routes to handle all users related requests
// router.use("/api/v1/users", userRouter);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // console.log(file)
    cb(null, "./public/uploads")
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)

  }
})

let upload = multer({ storage: storage })

// get all cameras

router.get("/", getAllCameraController);

router.get("/filtered", getFilteredCameraController);

// get single camera
router.get("/:id", getSingleCameraController)

// add new single camera
router.post("/", roleRestrict("root", "admin"), createCameraController);

// bulk-imports
router.post("/bulk-import", upload.single("file"),  bulkCameraImports);

// update single camera
router.patch("/:id", roleRestrict("root", "admin"), updateCameraController);
// delete single camera
router.delete("/:id", roleRestrict("root", "admin"), deleteCameraController);
// delete all cameras
// router.delete("/", deleteAllCameraController);

module.exports = router;
