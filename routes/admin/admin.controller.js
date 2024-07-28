
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const cameraSchemaModel = require("../../models/camera.model");
const userModel = require("../../models/user.model");
const { ApplicationError } = require("../../middlewares/errorHandler");

// get all cameras
const getAllUsersCameraforAdmin = asyncHandler(async (req, res, next) => {
    // console.log(req.query)


    const allCameras = await cameraSchemaModel.find().select("-__v").lean();

    return res.status(200).json({
        success: true,
        total: allCameras.length,
        message: allCameras

    });


})

const getSpecificUsersCamera = asyncHandler(async (req, res, next) => {



    const allCameras = await cameraSchemaModel.find({ userId: req.query.userId }).select("-__v").lean();

    return res.status(200).json({
        success: true,
        total: allCameras.length,
        message: allCameras

    });


})

// update user

async function updateUserControllerByAdmin(req, res, next) {
    const { id } = req.params;
    //   check id for valid mongoose object type
    // console.log(req.params)
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "invalid user id" });
        }
        const { roles, username } = req.body
        if (!username || !roles) {
            return next( new ApplicationError("username or role is missing", 400))
        }
        const user = await userModel.findOneAndUpdate(
            { _id: id },
            {
                username: username,
                roles: roles
            },
            { new: true }
        );
        //   console.log(user)
        //   check response if id is valid but not present in db, return error
        if (!user) {
            return res.status(404).json({ error: "No Such User found" });
        }
        // if id found return below response

        res.status(200).json(user);
    } catch (error) {
        console.log(error.message)
        res.status(400).json(error.message);
    }
}




module.exports = { getAllUsersCameraforAdmin, getSpecificUsersCamera, updateUserControllerByAdmin }