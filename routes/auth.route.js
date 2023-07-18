const router = require("express").Router();

// GET Routes

router.get("/login", async (req, res, next) => {
  res.json({
    result: "login",
  });
});
router.get("/logout", async (req, res, next) => {
  res.send("logout");
});
router.get("/forgot-password", async (req, res, next) => {
  res.send("forgot password");
});

// POST route

router.post("/login", async (req, res, next) => {
  res.send("login");
});
// router.post("/logout", async (req, res, next) => {
//   res.send("logout");
// });
router.post("/forgot-password", async (req, res, next) => {
  res.send("forgot password");
});

module.exports = router;
