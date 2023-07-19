const mongoose = require("mongoose");

const cameraSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    pincode: {
      type: Number,
      required: true,
    },
    city: {
      type: String,
    },
    area: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const cameraSchemaModel = mongoose.model("camera", cameraSchema);
module.exports = cameraSchemaModel;
