
const asyncHandler = require("express-async-handler");
const cameraSchemaModel = require("../../models/camera.model");
const { mongoose } = require("mongoose");


const disableCamera = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    //   check id for valid mongoose object type
    // console.log(id)
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "invalid camera id" });
        }
        // console.log(req.body)
        const { isActive } = req.body
        // console.log(typeof(isActive)==="boolean")
        if (typeof(isActive)==="boolean") {
            const camera = await cameraSchemaModel.findByIdAndUpdate(id, { isActive: isActive }, { new: true, runValidators: true });
            if (!camera.isActive) {
                return res.status(200).json({ success: true, message: `Camera ${camera.name} has been disabled` })
            } else {
                return res.status(200).json({ success: true, message: "Camera Back now" })

            }
        }

    } catch (error) {
        console.log(error.message)
        res.status(400).json(error.message);
    }
})

module.exports = disableCamera