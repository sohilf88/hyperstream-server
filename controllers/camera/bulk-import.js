const asyncHandler = require("express-async-handler")
const cameraSchemaModel = require("../../models/camera.model");
const { ApplicationError } = require("../../middlewares/errorHandler");
const csv = require("csvtojson")
const fs = require("fs")
const bulkCameraImports = asyncHandler(async (req, res, next) => {
    console.log(req.files)

    if (!req.files) {
        return new ApplicationError("File was not Found", 400)
    }
    let bulkCameras = []

    const path = req.file.path
    try {
        // converting into json
        csv().fromFile(req.file.path).then(async (response) => {
            for (let item = 0; item < response.length; item++) {
                //  pushing into array of camera object
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
            const bulkImports = await cameraSchemaModel.insertMany(bulkCameras)
            // console.log(bulkImports)
            if (!bulkImports) {
                new ApplicationError("oops,Something went wrong", 400)

            }

            // delete the uploaded file after data uploaded into DB
            fs.unlink(path, (error) => {
                if (error) {
                    console.log(error)
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