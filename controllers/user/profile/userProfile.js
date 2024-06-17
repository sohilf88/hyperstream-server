const asyncHandler = require("express-async-handler");
const { ApplicationError } = require("../../../middlewares/errorHandler");

const mongoose = require("mongoose");
const userModel = require("../../../models/user.model");


const userProfile = asyncHandler(async (req, res, next) => {
    //    console.log(req.user)
    const id = req.user.id;


    // check the id if it is valid mongodb object id
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ApplicationError("invalid id", 400))
    }
    const user = await userModel.findById(id);
    // check the id in database
    if (!user) {
        return next(new ApplicationError("No such User Found", 404))
    }
    return res.status(200).json({
        success: true,

        message: {
            username: user.username,
            email: user.email,
            roles: user.roles
        }
    });

})


module.exports = { userProfile }