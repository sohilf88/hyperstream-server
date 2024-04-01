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
      required: true,
    },
    taluka: {
      type: String,
      lowercase: true,
      required: true,
    },
    city: {
      type: String,
      lowercase: true,
      required: true,

    },
    area: {
      type: String,
      lowercase: true,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user"

    },

  },
  {
    timestamps: true,
  }
);
// below create collection in database with name "cameras"
const cameraSchemaModel = mongoose.model("camera", cameraSchema);
module.exports = cameraSchemaModel;
