
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const cameraSchemaModel = require("../../models/camera.model");

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


module.exports = { getAllUsersCameraforAdmin, getSpecificUsersCamera }