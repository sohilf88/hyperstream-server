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
      lowercase: true,

    },

    district: {
      type: String,
      lowercase: true,
    },
    taluka: {
      type: String,
      lowercase: true,
    },
    city: {
      type: String,
      lowercase: true,
      
    },
    area: {
      type: String,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);
// below create collection in database with name "cameras"
const cameraSchemaModel = mongoose.model("camera", cameraSchema);
module.exports = cameraSchemaModel;
