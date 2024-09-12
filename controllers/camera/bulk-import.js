const asyncHandler = require("express-async-handler")
const cameraSchemaModel = require("../../models/camera.model");
const { ApplicationError } = require("../../middlewares/errorHandler");
const csv = require("csvtojson")
const fs = require("fs")
const Joi = require("joi");
const path = require('path')
const bulkCameraImports = asyncHandler(async (req, res, next) => {

    // console.log(req.file)
    // console.log(path.extname(req.file.filename)!==".csv")
    if (!req.file || path.extname(req.file.filename)!==".csv") {
       
        
           


        return res.status(400).json({ suceess: false, message: "file was not found or invalid csv format file" })
       
    }
       
    const filePath = req.file.path   
    let bulkCameras = []
    
    

    //do the stuff for validation
    const schema = Joi.object({
        name: Joi.string().required(),
        district: Joi.string().required(),
        taluka: Joi.string().required(),
        city: Joi.string().required(),
        area: Joi.string().required(),
        url: Joi.string().required(),
        isActive: Joi.allow(),
    });

    try {
        // converting into json
        csv().fromFile(filePath).then(async (response) => {
            // validating data from csv
            let errors = [];
            response.forEach(obj => {
                // console.log(obj)
                let value = schema.validate(obj);

                if (value.error) {
                    value.error.details.forEach(err => {
                        errors.push(err.message);
                    });
                }

            });
            // console.log(errors.length)
            if (errors.length > 0) {
                return res.status(400).json({ sucess: false, message: "invalid data in csv file" })
                // console.log('validation error from the CSV file');
                // return new ApplicationError("invalid File uploaded !!!", 400)

            } else {
                req.response = response
                // Validation done for CSV file
                for (let item = 0; item < response.length; item++) {

                    //    pushing data into array of camera object

                    bulkCameras.push({
                        name: response[item].name,
                        district: response[item].district,
                        taluka: response[item].taluka,
                        area: response[item].area,
                        city: response[item].city,
                        url: response[item].url,
                        userId: req.user._id
                    })
                }

            }



            const bulkImports = await cameraSchemaModel.insertMany(bulkCameras)
            // console.log(bulkImports)
            if (!bulkImports) {
                new ApplicationError("oops,Something went wrong", 400)

            }

            // delete the uploaded file after data uploaded into DB
            fs.unlink(filePath, (error) => {
                if (error) {
                    // console.log(error)
                    return
                }

            })
            // after successful uploaded into db
            return res.status(200).json({
                success: true,

                message: `${bulkImports.length} cameras imported`

            });
        }
        )


    } catch (error) {
        return new ApplicationError(error.message, 400)
    }



})


module.exports = { bulkCameraImports }