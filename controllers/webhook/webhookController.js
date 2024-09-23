const { ApplicationError } = require("../middlewares/errorHandler");
const cameraSchemaModel = require("../models/camera.model");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler")

const webHookForEvents = asyncHandler(async (req, res, next) => {
    // some logic 

    res.status(201).json({ success: true, message: "data recieved" })

})


module.exports={webHookForEvents}