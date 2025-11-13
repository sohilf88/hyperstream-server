
const asyncHandler = require("express-async-handler");
const Camera = require("../../models/camera.model");
const { ApplicationError } = require("../../middlewares/errorHandler");

const webhookController = asyncHandler(async (req, res, next) => {
  const event = req.body;
  const { id, timestamp, action } = event;

  const camera = await Camera.findOne({ streamId: id });
  console.log(camera)
  if (!camera) {
    return next(new ApplicationError(`stream id ${id} not found`, 404));
  }

  const time = new Date(Number(timestamp));

  if (action === "liveStreamStarted") {
    camera.isLive = true;
    camera.streamStart = time;
  } else if (action === "liveStreamEnded") {
    camera.isLive = false;
    camera.streamEnd = time;
  } else {
    return res.status(200).json({ status: true, message: "ignored event" });
  }

  await camera.save();

  // (Optional) notify frontend
  req.io?.to(camera.userId.toString()).emit("cameraUpdate", camera);

  return res.status(200).json({ status: true, message: "received" });
});

// const webhookController =asyncHandler( async (req, res, next) => {
// // console.log(req.currentUser)  
//   const event = req.body;
//   // console.log(new Date(Number(event.timestamp)).toLocaleString("en-IN"))
//   console.log(event)
//   const{ id,timestamp,action}=event
//   const CameraByStreamId= await Camera.findOne({streamId:id})
//   // console.log(CameraByStreamId)
//   if(!CameraByStreamId){
//     return (new ApplicationError(`stream id ${id} not found`, 404))
//   }
//   if(action=="liveStreamStarted"){
//     const updateStreamStatus=await Camera.findOneAndUpdate({streamId:id},{isLive:true},{streamStart:new Date(Number(timestamp)).toLocaleString("en-IN")},{ new: true })
//     console.log(updateStreamStatus.isLive)
//    return res.status(200).json({status:true,message:"received"})
//   }
//   if(action=="liveStreamEnded"){
//     const updateStreamStatus=await Camera.findOneAndUpdate({streamId:id},{isLive:false},{streamEnd:new Date(Number(timestamp)).toLocaleString("en-IN")},{ new: true })
//      console.log(updateStreamStatus.isLive)
//     return res.status(200).json({status:true,message:"received"})
//   }
  
 

//   req.io.to("sohil").emit("cameraUpdate", event);  
// //   req.io.emit(req.userId,event)  
// // if(action=="liveStreamEnded"){
// //     console.log("stream down for id "+id)
// //     const camera = await Camera.findOneAndUpdate(
// //     { streamId: id },
// //     { isActive:true },
// //     // { ...req.body },
// //     { new: true }
    
// //   );
// //   if(!camera){
// //     return (new ApplicationError("wrong Stream id", 400))
// //   }
// //   return {
// //     success:true,
// //     message:camera
// //   }
// //   }
// //   // }
// //   // webhook input recieved
// // // //  {
// // //   app: 'LiveApp',
// // //   action: 'liveStreamStarted',
// // //   id: 'stream-100',
// // //   streamName: 'stream-100',
// // //   timestamp: '1762744526886'
// // // }
// // // POST /api/v1/webhook 200 5.776 ms - 2
// // // {
// // //   app: 'LiveApp',
// // //   action: 'liveStreamEnded',
// // //   id: 'stream-100',
// // //   streamName: 'stream-100',
// // //   timestamp: '1762744541892'
// // // }
// // if(action=="liveStreamStarted"){
// //     console.log("stream down for id "+id)
// //     const camera = await Camera.findOneAndUpdate(
// //     { streamId: id },
// //     { isActive:true },
// //     // { ...req.body },
// //     { new: true }
    
// //   );
// //   if(!camera){
// //     return (new ApplicationError("wrong Stream id", 400))
// //   }
// //   return {
// //     success:true,
// //     message:camera
// //   }
// //   }
// });




  module.exports=webhookController