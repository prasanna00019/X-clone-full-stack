import Notification from "../models/notificationModel.js";

export const getNotifications=async(req,res)=>{
    try {
        const userId=req.user._id;
        const notifications=await Notification.find({to:userId}).populate({
            path:"from",
            select:"username profileImg",
        })
        await Notification.updateMany({to:userId},{read:true});
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({error:error.message});
        console.log("ERROR IN notfication contoller");
    }
}
export const DeleteNotifications=async(req,res)=>{
  try {
    const userId=req.user._id;
    await Notification.deleteMany({to:userId});
    res.status(200).json({message:"NOTIFICATIONS DELETED"})
  } catch (error) {
    res.status(500).json({error:error.message});
        console.log("ERROR IN deleting not");
  }
}
export const DeleteNotification=async(req,res)=>{

  try {
    const notificationId=req.params.id;
    const userId=req.user._id;
    const notification=await Notification.findById(notificationId);
    if(!notification){
        return res.status(404).json({error:"notificayons not found"});
    }
    if(notification.to.toString()!==userId.toString()){
        return res.status(403).json({error:"not allowed"});
    }
    await Notification.findByIdAndDelete(notificationId);
    res.status(200).json({message:"deleted"})
  } catch (error) {
    res.status(500).json({error:error.message});
        console.log("ERROR ");
  }
}