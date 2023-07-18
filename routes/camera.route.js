const router = require("express").Router();

// get all cameras

router.get("/", async (req, res, next) => {
  res.json({ result: "all camera" });
});

// get single camera
router.get("/:id", async (req, res, next) => {
  res.json({ result: "single camera" });
});

// add new single camera
router.post("/:id", async (req, res, next) => {
  res.json({ result: "create single camera" });
});

// update single camera
router.patch("/:id", async (req, res, next) => {
  res.json({ result: "update single camera" });
});
// delete single camera
router.delete("/:id", async (req, res, next) => {
  res.json({ result: "delete single camera" });
});
// delete all cameras
router.delete("/", async (req, res, next) => {
  res.json({ result: "delete all camera" });
});

module.exports = router;
