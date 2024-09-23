const { webHookForEvents } = require("../../controllers/webhook/webhookController");

const router = require("express").Router();

router.post("/", webHookForEvents)

module.exports = router;