// const { ApplicationError } = require("../middlewares/errorHandler");

const asyncHandler = require("express-async-handler");
const Camera = require("../../models/camera.model");


const webhookController = async (req, res, next) => {
    try {
    const event = req.body;
     console.log(event)
    if (event["detail-type"] === "IVS Stream State Change") {
      const { event_name, stream_id, channel_name } = event.detail;
      const channelArn = event.resources[0]; // ARN comes in the array
      
      // 🔍 Find the matching camera by ARN
      const camera = await Camera.findOne({ channelArn });

      if (camera) {
        // Update camera stream status
        camera.lastStreamId = stream_id;
        camera.streamStatus = event_name === "Stream Start" ? "live" : "offline";
        await camera.save();

        // 🔔 Notify frontend via Socket.IO
        req.io.emit("camera-status-update", {
          cameraId: camera._id,
          name: camera.name,
          status: camera.streamStatus,
          userId: camera.userId,
        });

        console.log(`✅ Updated ${camera.name} → ${camera.streamStatus}`);
      } else {
        console.warn(`⚠️ No camera found for ARN: ${channelArn}`);
      }
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("❌ Error processing event:", err);
    res.status(500).send("Internal Server Error");
  }
};
  // const { io } = req
//   input will get like this
// {
//   "version": "0",
//   "id": "3db8494b-fe49-15ed-5a47-e20501bf4911",
//   "detail-type": "IVS Stream State Change",
//   "source": "aws.ivs",
//   "account": "565393033359",
//   "time": "2025-11-03T06:04:21Z",
//   "region": "ap-south-1",
//   "resources": [
//     "arn:aws:ivs:ap-south-1:565393033359:channel/IwuyTv0XAc8u"
//   ],
//   "detail": {
//     "event_name": "Stream End",
//     "channel_name": "stream-1",
//     "stream_id": "st-1EayOoSXyIVUvuDKn6ZXDDT"
//   }
// }


  module.exports=webhookController