const asyncHandler = require("express-async-handler");
const cameraSchemaModel = require("../../models/camera.model");
const { ApplicationError } = require("../../middlewares/errorHandler");
const csv = require("csvtojson");
const fs = require("fs/promises");
const Joi = require("joi");
const path = require("path");

const bulkCameraImports = asyncHandler(async (req, res, next) => {
  try {
    // ✅ Validate file existence & type
    if (!req.file || path.extname(req.file.filename) !== ".csv") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing CSV file" });
    }

    const filePath = req.file.path;

    // ✅ Define validation schema
    const schema = Joi.object({
      name: Joi.string().required(),
      district: Joi.string().required(),
      taluka: Joi.string().required(),
      city: Joi.string().required(),
      area: Joi.string().required(),
      url: Joi.string().required(),
      isActive: Joi.allow(),
      streamId: Joi.allow(),
    });

    // ✅ Convert CSV → JSON
    const response = await csv().fromFile(filePath);

    // ✅ Validate each row
    const errors = [];
    for (const [index, obj] of response.entries()) {
      const { error } = schema.validate(obj);
      if (error) {
        errors.push(
          `Row ${index + 1}: ${error.details.map((e) => e.message).join(", ")}`
        );
      }
    }

    if (errors.length > 0) {
      await fs.unlink(filePath).catch(() => {});
      return res
        .status(400)
        .json({ success: false, message: "Invalid data in CSV", errors });
    }

    // ✅ Prepare for DB insert
    const bulkCameras = response.map((item) => ({
      name: item.name,
      district: item.district,
      taluka: item.taluka,
      city: item.city,
      area: item.area,
      url: item.url,
      userId: req.user._id,
      streamId: item.streamId,
    }));

    // ✅ Insert into MongoDB (skip duplicates)
    let bulkImports = [];
    try {
      bulkImports = await cameraSchemaModel.insertMany(bulkCameras, {
        ordered: false, // continue even if some duplicates exist
      });
    } catch (error) {
      if (error.name === "MongoBulkWriteError" && error.code === 11000) {
        console.warn("Duplicate streamIds detected. Skipping duplicates...");
      } else {
        throw error;
      }
    }

    // ✅ Delete uploaded CSV file
    await fs.unlink(filePath).catch(() => {});

    return res.status(200).json({
      success: true,
      message: `${bulkImports.length} cameras imported successfully (duplicates skipped if any)`,
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    return next(new ApplicationError(error.message, 500));
  }
});

module.exports = { bulkCameraImports };
