const usermodel = require("../models/user.model");
const mongoose = require("mongoose");


// get all users function
async function getAllUsersController(req, res, next) {
  try {

    const allUsers = await usermodel.find(req.query).select("-password -__v").sort({ createAt: -1 });
    res.status(200).json(allUsers);
  } catch (error) {
    res.status(400).json(error.message);
  }
}


// get single user detail for login

async function getSingleUserController(req, res, next) {
  const { id } = req.params;
  try {
    // check the id if it is valid mongodb object id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "invalid user id" });
    }
    const user = await usermodel.findById(id);
    // check the id in database
    if (!user) {
      return res.status(404).json({ error: "No Such user found" });
    }
    res.status(200).json({ email: user.email, _id: user._id });
  } catch (error) {
    res.status(400).json(error.message);
  }
}

// update user

async function updateUserController(req, res, next) {
  const { id } = req.params;
  //   check id for valid mongoose object type

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "invalid user id" });
    }
    const user = await usermodel.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true }
    );
    //   check response if id is valid but not present in db, return error
    if (!user) {
      return res.status(404).json({ error: "No Such User found" });
    }
    // if id found return below response

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json(error.message);
  }
}

// delete user

async function deleteUserController(req, res, next) {
  const { id } = req.params;
  //   check id for valid mongoose object type

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "invalid user id" });
    }
    const user = await usermodel.findOneAndDelete({ _id: id });
    //   check response if id is valid but not present in db, return error
    if (!user) {
      return res.status(404).json({ error: "No Such User found" });
    }
    // if id found return below response

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json(error.message);
  }
}

module.exports = {

  getAllUsersController,
  getSingleUserController,
  deleteUserController,
  updateUserController,
  
};
