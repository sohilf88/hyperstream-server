const cameraSchemaModel = require("../models/camera.model");
const mongoose = require("mongoose");

// get all cameras
async function getAllCameraController(req, res, next) {

  try {

    // console.log(req.user._id)
    // const allCameras = await cameraSchemaModel.find().limit().select("-__V");
    const allCameras = await cameraSchemaModel.find({ userId: req.user._id }).select("-__v");
   console.log(allCameras)
    res.status(200).json({
      total: allCameras.length,
      message: allCameras

    });
  } catch (error) {
    res.status(400).json(error.message);
  }
}

// get 6 cameras only

async function getFilteredCameraController(req, res, next) {
  try {

    // Build Query having sorting, pagination, filter, skip , limit and other
    let queryObj = { ...req.query }

    const excludedFields = ["sort", "page", "limit", "fields"]
    // exclude above fields from query object by use of forEach
    excludedFields.forEach((item) => (
      delete queryObj[item]
    ))

    // advance filtering for lte|lt|gte|gt
    let queryString = JSON.stringify(queryObj)  // converted into string from object to perform replace
    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)


    let query = cameraSchemaModel.find(JSON.parse(queryString))

    // SORTING

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ")  //removed "," with " " space as mangoose don't need ,
      // console.log(sortBy)
      query = query.sort(sortBy)
    } else {
      query = query.sort("createdAt") // default query parameter if user does not provide anything in sort
    }
    // limiting the fields

    if (req.query.fields) {
      let fields = req.query.fields.split(",").join(" ")  //removed "," with " " space as mangoose don't need ,
      query = query.select(fields)
    } else {
      query = query.select("-__v")  // -fields is used to exclude from response
    }
    // pagination 
    //  skip is showing page number and limit show how many numbers of output per page
    // page=1&limit=10 => page is 1 and size is 10  1-10, 11-20,21-30 and so on

    const page = req.query.page * 1 || 1 // multiply by 1 to convert into number
    const limitResult = req.query.limit * 1 || 8  // default size is 8
    const skipPages = (page - 1) * limitResult
    if (req.query.page) {
      const pageCount = await cameraSchemaModel.countDocuments();
      if (skipPages >= pageCount) throw new Error("this page does not exist")
    }
    query = query.skip(skipPages).limit(limitResult)

    // send respond for Quried Data
    const count = await cameraSchemaModel.countDocuments()
    const filteredCameras = await query;
    res.status(200).json({
      totalCount: count,
      countPerPage: filteredCameras.length,
      result: filteredCameras,


    });
  } catch (error) {
    res.status(400).json(error.message);
  }
}
// create Camera function
async function createCameraController(req, res, next) {
  const { name, district, taluka, city, area, url, isActive } = req.body
  const userId = req.user._id
  try {


    if (!name || !district || !taluka || !city || !area || !url) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      })
    }

    const camera = await cameraSchemaModel.create({ name, district, taluka, city, area, url, isActive, userId });

    res.status(200).json({
      total: camera.length, success: true,
      message: camera
    });
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
    res.status(200).json({ result: camera });
  } catch (error) {
    res.status(400).json(error.message);
  }
}

// update user

async function updateCameraController(req, res, next) {
  console.log(req.body)
  const { name, district, taluka, city, area, url, isActive } = req.body
  if (!name || !district || !taluka || !city || !area || !url) {
    return res.status(400).json({
      success: false,
      message: "All fields must be filled, no blank"
    })
  }
  const { id } = req.params;
  //   check id for valid mongoose object type

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "invalid user id" });
    }
    const camera = await cameraSchemaModel.findOneAndUpdate(
      { _id: id },
      { name, district, taluka, city, area, url },
      // { ...req.body },
      { new: true }
    );
    //   check response if id is valid but not present in db, return error
    if (!camera) {
      return res.status(404).json({ error: "No Such Camera found" });
    }
    // if id found return below response

    res.status(200).json({ success: true, message: camera });
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
    const camera = await cameraSchemaModel.findOne({ _id: id });
    //   check response if id is valid but not present in db, return error
    if (!camera) {
      return res.status(404).json({ error: "No Such Camera found" });
    }
    // if id found return below response
    const deletecamera = await cameraSchemaModel.findOneAndDelete({ _id: id });

    res.status(200).json({
      success: true,
      message: `${deletecamera.name} with ${deletecamera._id} has been removed`
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
}



module.exports = {
  createCameraController,
  getAllCameraController,
  updateCameraController,
  deleteCameraController,
  getSingleCameraController,

  getFilteredCameraController
};
