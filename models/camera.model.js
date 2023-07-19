const mongoose = require("mongoose");

const cameraSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
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
// below create collection in database with name "cameras"
const cameraSchemaModel = mongoose.model("camera", cameraSchema);
module.exports = cameraSchemaModel;
