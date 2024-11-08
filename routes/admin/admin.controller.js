
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const cameraSchemaModel = require("../../models/camera.model");
const userModel = require("../../models/user.model");
const { ApplicationError } = require("../../middlewares/errorHandler");
const bcrypt = require("bcrypt")

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
        // console.log(req.body)
        const { roles, username, isActive } = req.body
        if (typeof (isActive) === "boolean") {
            const user = await userModel.findByIdAndUpdate(id, { isActive: isActive }, { new: true, runValidators: true });
            if (!user.isActive) {
                return res.status(200).json({ success: true, message: `User ${user.username} has been disabled` })
            } else {
                return res.status(200).json({ success: true, message: "User Restored" })

            }
        }
        // console.log(typeof(isActive)=="boolean")
        if (!username || !roles) {
            return next(new ApplicationError("Username or Role was missing", 400))
        }

        const user = await userModel.findByIdAndUpdate(id, { username: username, roles: roles }, { new: true, runValidators: true });
        // check the id in database
        if (!user) {
            return next(new ApplicationError("No such User Found", 404))
        }



        return res.status(200).json(user);
    } catch (error) {
        // console.log(error.message)
        res.status(400).json(error.message);
    }
}

// update user password

async function resetUserPasswordByAdmin(req, res, next) {
    const { id } = req.params;
    //   check id for valid mongoose object type
    // console.log(req.params)
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "invalid user id" });
        }
        // console.log(req.body)
        const { password, confirmPassword } = req.body
        if (!password || !confirmPassword) {
            return next(new ApplicationError("password or confirm Password was missing", 400))
        }
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const user = await userModel.findByIdAndUpdate(id, { password: hashPassword, confirmPassword: undefined }, { new: true, runValidators: true });
        // check the id in database
        // console.log(user)
        if (!user) {
            return next(new ApplicationError("No such User Found", 404))
        }



        return res.status(200).json({
            success: true,
            message: "Password has been updated"
        });
    } catch (error) {
        // console.log(error.message)
        // res.status(400).json(error.message);
        return next(new ApplicationError(error.message, 400))
    }
}

async function getAllUsersAdminController(req, res, next) {
    try {

        const totalUsers = await userModel.count()
       
        const query = userModel.find(req.query).select("-password -__v").sort({ createAt: -1 })

        
        const allUsers = await query;
        
        return res.status(200).send({
            success:true,
            message: allUsers,
            totalUsers: totalUsers
        });
        return res.status(200).send(
             allUsers)
            
        
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

// disable users

// async function getAllDisableUsersAdminController(req, res, next) {
//     try {


//         const query = userModel.find({ isActive: false }).select("-password -__v").sort({ createAt: -1 })

//         if (req.query.email) {
//             const query = await userModel.find({ isActive: false, email: req.query.email }).select("-password -__v").sort({ createAt: -1 })
//             return res.status(200).send(query);
//         }

//         const allUsers = await query;

//         return res.status(200).send(allUsers);
//     } catch (error) {
//         return res.status(400).json(error.message);
//     }
// }

// delete user

async function deleteUserByAdmin(req, res, next) {
    const { id } = req.params;
    //   check id for valid mongoose object type

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "invalid user id" });
        }
        const attachedCamera = await cameraSchemaModel.find({ userId: id }).lean()
        // console.log(attachedCamera?.length)
        if (attachedCamera?.length) {
            return res.status(400).json({ success: false, message: `There are ${attachedCamera?.length} cameras left, please delete it before user deletion. click on "Cameras" to check further` })

        }
        const user = await userModel.findOneAndDelete({ _id: id });
        //   check response if id is valid but not present in db, return error
        if (!user) {
            return res.status(404).json({ error: "No Such User found" });
        }
        // if id found return below response

        return res.status(200).json({ success: true, message: `Account Removed` });
    } catch (error) {
        res.status(400).json(error.message);
    }
}

module.exports = { getAllUsersAdminController, deleteUserByAdmin, resetUserPasswordByAdmin, getAllUsersCameraforAdmin, getSpecificUsersCamera, updateUserControllerByAdmin }