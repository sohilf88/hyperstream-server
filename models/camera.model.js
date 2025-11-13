const { string } = require("joi");
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
      default: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    streamId:{
      type:String,
      required:true,
      unique: true,
      lowercase: true,
    },
    streamStart:{
      type:Date,
      
    },
    streamEnd:{
      type:Date,
      
    },
    isLive: {
      type: Boolean,
      default: false,
    },

  },
  { timestamps: true }
);

const Camera = mongoose.model("camera", cameraSchema);
module.exports = Camera;
