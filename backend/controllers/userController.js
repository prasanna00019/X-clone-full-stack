import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinary} from "cloudinary"
import bcrypt from "bcryptjs";
export const getUserProfile=async(req,res)=>{
    const {username}=req.params;
    try {
        const user=await User.findOne({username}).select('-password');
        if(!user){
            res.status(404).json({message:"USER NOT FOUND !!! "});
        }
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({error:error.message});
        console.log("ERROR IN GET USER PROFILE");
    }
}
export const followUnfollowUser=async(req,res)=>{
    try {
        const {id}=req.params;
        const userToModify=await User.findById(id);
        const CurrentUser=await User.findById(req.user._id);
        if(id===req.user._id.toString()){
            return res.status(400).json({error:"CANT FOLLOW OR UNFOLLOW YOURSELF"});
        }
        if(!userToModify|| !CurrentUser){
            return res.status(400).json({error:"user not found"});
        }
        const isFollowing=CurrentUser.following.includes(id);
        if(isFollowing){
            await User.findByIdAndUpdate(id,{$pull:{followers:req.user._id}});
            await User.findByIdAndUpdate(req.user._id,{$pull:{following:id}});
            res.status(200).json({message:"UNFOLLOWED SUCCESSFULY"});
        }
        else{
            await User.findByIdAndUpdate(id,{$push:{followers:req.user._id}});
            await User.findByIdAndUpdate(req.user._id,{$push:{following:id}});
            res.status(200).json({message:"FOLLOWED SUCCESSFULY"});
           const newNotification=new Notification({
            type:"follow",
            from:req.user._id,
            to:userToModify._id,
           })
           await newNotification.save();
                 //send notification to user
        }
        
    } catch (error) {
        
        res.status(500).json({error:error.message});
        console.log("ERROR IN GET follow unfollow ");
    }   
}
export const getSuggestedUsers=async(req,res)=>{
    try {
        const userId=req.user._id;
        const userFollowedByMe=await User.findById(userId).select("following");
        const users=await User.aggregate([
            {
                $match:{
                    _id:{$ne:userId}
                },
                
            },{$sample:{size:10}}
        ])
        const filteredUsers=users.filter((user)=>!userFollowedByMe.following.includes(user._id));
        const suggestedUsers=filteredUsers.slice(0,4);
        suggestedUsers.forEach((user)=>(user.password=null));
        res.status(200).json(suggestedUsers);
    } catch (error) {
        res.status(500).json({error:error.message});
        console.log("ERROR IN GET suggested users");
    }   
    }
export const updateUser=async(req,res)=>{
    const {fullName,email,username,CurrentPassword,newPassword,bio,link}=req.body;
    let {profileImg,coverImg}=req.body;
    const userId=req.user._id;
    try {
        let user =await User.findById(userId);
        if(!user) return res.status(400).json({message:"USER NOT FOUND"});
        if((!newPassword && CurrentPassword)||(!CurrentPassword && newPassword)){
            return res.status(400).json({error:"please provide both fields"})
        }
        if(CurrentPassword && newPassword){
            const isMatch=await bcrypt.compare(CurrentPassword,user.password);
            if(!isMatch){res.status(400).json({error:"current password is incorrect"})};
            if(newPassword.length<8){
                res.status(400).json({error:"passwod must be atleast 8 length"})
            }
            const salt=await bcrypt.genSalt(10);
            user.password=await bcrypt.hash(newPassword,salt); 
        }
        if(profileImg){
            if(user.profileImg){
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
            }
       const uploadedResponse=await cloudinary.uploader.upload(profileImg);
       profileImg=uploadedResponse.secure_url;
        }
        if(coverImg){
            if(user.coverImg){
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
            }
            const uploadedResponse=await cloudinary.uploader.upload(coverImg);
            coverImg=uploadedResponse.secure_url;
        }
      user.fullName=fullName||user.fullName;
      user.email=email||user.email;
      user.username=username|| user.username;
      user.bio=bio||user.bio;
      user.link=link||user.link;
      user.profileImg=profileImg||user.profileImg;
      user.coverImg=coverImg||user.coverImg;
     user=await user.save();
     user.password=null;
    //  await user.save();
     return res.status(200).json(user);  
    } catch (error) {
        res.status(500).json({error:error.message});
        console.log("ERROR IN UPDATE PROFILE");
    
    }
}   