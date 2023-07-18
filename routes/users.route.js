const router = require("express").Router();

// get all users
router.get("/", async (req, res, next) => {
  res.json({ result: "all users" });
});

// get specific user
router.get("/:id", async (req, res, next) => {
  // const { id } = req.params;
  res.json({ result: "get specific user" });
});

// create specific user
router.post("/:id", async (req, res, next) => {
  const { id } = req.params;
  res.json({ result: " add specific user"  });
});
// update specific user
router.patch("/:id", async (req, res, next) => {
  const { id } = req.params;
  res.json({ result: " update specific user" });
});

// delete single user
router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  res.json({ result: "delete specific user" });
});

module.exports = router;
