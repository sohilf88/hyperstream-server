const { ApplicationError } = require("../middlewares/errorHandler");
const cameraSchemaModel = require("../models/camera.model");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler")

// get all cameras
const getAllCameraController = asyncHandler(async (req, res, next) => {
  // const { io } = req
  let queryObj = {
    userId: req.user._id,

  }
  // io.on("connection", (socket) => {
  //   socket.on("publish", (data) => {
  //     console.log(data)
  //   })
  //   socket.emit("web", "hello rther"
  //   )
  // })
  const { isActive } = req.query

  // check if isActive boolean, else ignore
  if (isActive === "false" || isActive === "true") {
    queryObj.isActive = isActive
  }
  // check if camera is enable or disabled
  //  console.log(queryObj)

  const allCameras = await cameraSchemaModel.find(queryObj).select("-__v").lean();
  // io.emit("cameras", allCameras)
  return res.status(200).json({
    success: true,
    total: allCameras.length,
    message: allCameras

  });


})
// get 6 cameras only

const getFilteredCameraController = asyncHandler(async (req, res, next) => {


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


  // let query = cameraSchemaModel.find(JSON.parse(queryString)) // orignal but changed as below
  let query = cameraSchemaModel.find({ userId: req.user._id })

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
  const count = await cameraSchemaModel.countDocuments({ userId: req.user._id })
  const filteredCameras = await query;
  res.status(200).json({
    success: true,
    totalCount: count,
    countPerPage: filteredCameras.length,
    message: filteredCameras,


  });

})
// create Camera function
const createCameraController = asyncHandler(async (req, res, next) => {
  const { name, district, taluka, city, area, url, isActive } = req.body
  const userId = req.user._id
  // console.log(userId)



  if (!name || !district || !taluka || !city || !area || !url) {
    return next(new ApplicationError("All fields are required", 400))
  }

  const camera = await cameraSchemaModel.create({ name, district, taluka, city, area, url, isActive, userId });

  return res.status(200).json({
    success: true,
    total: camera.length,
    message: camera
  });

})

// get single camera detail

const getSingleCameraController = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // check the id if it is valid mongodb object id
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApplicationError("invalid id", 404))
  }
  const camera = await cameraSchemaModel.findById(id);
  // check the id in database
  if (!camera) {
    return next(new ApplicationError("No such Camera Found", 404))
  }
  return res.status(200).json({
    success: true,

    message: camera
  });

})

// update user

const updateCameraController = asyncHandler(async (req, res, next) => {
  // console.log(req.body)
  const { name, district, taluka, city, area, url, isActive } = req.body
  if (!name || !district || !taluka || !city || !area || !url) {
    return next(new ApplicationError("All fields must required", 400))
  }
  const { id } = req.params;
  //   check id for valid mongoose object type


  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApplicationError("invalid id", 404))
  }
  const camera = await cameraSchemaModel.findOneAndUpdate(
    { _id: id },
    { name, district, taluka, city, area, url, isActive },
    // { ...req.body },
    { new: true }
  );
  //   check response if id is valid but not present in db, return error
  if (!camera) {
    return next(new ApplicationError("No Such Camera Found by ID", 404))
  }
  // if id found return below response

  res.status(200).json({ success: true, message: camera });

})

// delete user

const deleteCameraController = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  //   check id for valid mongoose object type


  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ApplicationError("invalid id", 404))
  }
  const camera = await cameraSchemaModel.findOne({ _id: id });
  //   check response if id is valid but not present in db, return error
  if (!camera) {
    return next(new ApplicationError("No Camera Found", 404))
  }
  // if id found return below response
  const deletecamera = await cameraSchemaModel.findOneAndDelete({ _id: id });

  res.status(200).json({
    success: true,
    message: `${deletecamera.name} with ${deletecamera._id} has been removed`
  });

})





module.exports = {
  createCameraController,
  getAllCameraController,
  updateCameraController,
  deleteCameraController,
  getSingleCameraController,

  getFilteredCameraController
};
