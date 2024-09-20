const asyncHandler = require("express-async-handler");
const cameraSchemaModel = require("../../models/camera.model");
const { mongoose } = require("mongoose");
const { ApplicationError } = require("../../middlewares/errorHandler");


const deleteManyCamera = asyncHandler(async (req, res, next) => {
    const { deleteMultiples } = req.body
    // if (deleteMultiples) return new ApplicationError("no data sent from client", 400)
    // console.log(req.user)
    // const deleteSelected = {
    //     _id: {
    //         $in: deleteMultiples
    //     },

    // }

    // delete multplie camera id if user.id is matched only

    const deleteMultplesCamera = await cameraSchemaModel.deleteMany({
        _id: {
            $in: deleteMultiples
        },
        userId: req.user.id
    })
    if(deleteMultplesCamera.acknowledged){
        return res.status(200).json({success:true,message:deleteMultplesCamera.deletedCount})
    }else{
        return new ApplicationError("you are not authrized to delete",403)
    }
})


module.exports = { deleteManyCamera }