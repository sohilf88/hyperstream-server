
const asyncHandler = require("express-async-handler");
const cameraSchemaModel = require("../../models/camera.model");
const {  mongoose } = require("mongoose");


async function deleteCameraById(req, res, next) {
    const { id } = req.params; 
    const { isActive } = req.body
    //   check id for valid mongoose object type
    console.log(isActive,id)
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "invalid camera id" });
        }
        // console.log(req.body)
       
        if (isActive === "true" || isActive === "false") {
            const camera = await cameraSchemaModel.findByIdAndUpdate(id, { isActive: false }, { new: true, runValidators: true });
            if (!camera.isActive) {
                return res.status(200).json({ success: true, message: `camera has been disabled` })
            } else {
                return res.status(200).json({ success: true, message: "Camera Restored" })

            }
        }



        
    } catch (error) {
        console.log(error.message)
        res.status(400).json(error.message);
    }
}

module.exports={deleteCameraById}