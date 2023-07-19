const cameraSchemaModel = require("../models/camera.model");
const mongoose = require("mongoose");

// get all cameras
async function getAllCameraController(req, res, next) {
  try {
    const allCameras = await cameraSchemaModel.find().limit(20);
    res.status(200).json(allCameras);
  } catch (error) {
    res.status(400).json(error.message);
  }
}

// create user function
async function createCameraController(req, res, next) {
  try {
    const camera = await cameraSchemaModel.create(req.body);
    res.status(200).json(camera);
  } catch (error) {
    res.status(400).json(error.message);
  }
}

// get single camera detail

async function getSingleCameraController(req, res, next) {
  const { id } = req.params;
  try {
    // check the id if it is valid mongodb object id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "invalid user id" });
    }
    const camera = await cameraSchemaModel.findById(id);
    // check the id in database
    if (!camera) {
      return res.status(404).json({ error: "No Such camera found" });
    }
    res.status(200).json(camera);
  } catch (error) {
    res.status(400).json(error.message);
  }
}

// update user

async function updateCameraController(req, res, next) {
  const { id } = req.params;
  //   check id for valid mongoose object type

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "invalid user id" });
    }
    const camera = await cameraSchemaModel.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true }
    );
    //   check response if id is valid but not present in db, return error
    if (!camera) {
      return res.status(404).json({ error: "No Such Camera found" });
    }
    // if id found return below response

    res.status(200).json(camera);
  } catch (error) {
    res.status(400).json(error.message);
  }
}

// delete user

async function deleteCameraController(req, res, next) {
  const { id } = req.params;
  //   check id for valid mongoose object type

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "invalid Camera id" });
    }
    const camera = await cameraSchemaModel.findOneAndDelete({ _id: id });
    //   check response if id is valid but not present in db, return error
    if (!camera) {
      return res.status(404).json({ error: "No Such Camera found" });
    }
    // if id found return below response

    res.status(200).json(camera);
  } catch (error) {
    res.status(400).json(error.message);
  }
}

// todo!  => need to work on below finction,this function is deleting entire collection

// async function deleteAllCameraController(req, res, next) {
//   try {
//     const deleteCamera = await cameraSchemaModel.deleteMany({});
//     if (!camera) {
//       return res.status(404).json({ error: "No Such Camera found" });
//     }
//     res.status(200).json(camera);
//   } catch (error) {
//     console.error(error.message);
//     return res.status(400).json(error.message);
//   }
// }

module.exports = {
  createCameraController,
  getAllCameraController,
  updateCameraController,
  deleteCameraController,
  //   deleteAllCameraController,
};
