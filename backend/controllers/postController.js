import Notification from "../models/notificationModel.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost=async(req,res)=>{
    try {
        const {text}=req.body;
        let{img}=req.body;
        const userId=req.user._id.toString();   
        const user= await User.findById(userId);
        if(!user){return res.status(404).json({message:"USER NOT FOUND 404 !!!"})};
        if(!text && !img){return res.status(404).json({message:"post or text NOT FOUND 404 !!!"})};
        if(img){
            const uploadedResponse=await cloudinary.uploader.upload(img);
            img=uploadedResponse.secure_url;
        }
        const newPost=new Post({
            user:userId,
            text,
            img
        })
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({error:error.message});
        console.log("erro in create post controller",error);
    }
    }
export const deletePost=async(req,res)=>{
    try {
        const post=await Post.findById(req.params.id);
        if(!post){
            return res.status(400).json({error:"post not found"});
        }
        if(post.user.toString()!==req.user._id.toString()){
            return res.status(401).json({error:"You are not authorised to delete this post"});
        }
        if(post.img){
          const imgId=post.img.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(imgId); 
        }
        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({message:"post deleted successfuly !!! "});
    } catch (error) {
        res.status(500).json({error:error.message});
        console.log("ERROR IN DELETING POST");
    }
    }
export const commentOnPost=async(req,res)=>{
    try {
        const{text}=req.body;
        const postId=req.params.id;
        const userId=req.user._id;
        if(!text){
            return res.status(400).json({error:"Text field is required"});
        }
        const post=await Post.findById(postId);
        if(!post){
            return res.status(404).json({error:"POST NOT FOUND"});
        }
        const comment={user:userId,text};
        post.comments.push(comment);
        await post.save();
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({error:error.message});
        console.log("ERROR IN commenting");
    }
}
export const likeUnlikePost=async(req,res)=>{
    try {
       const userId=req.user._id;
       const{id:postId}=req.params;
       const post=await Post.findById(postId);
       if(!post){
        return res.status(404).json({error:"POST NOT FOUND !!!"});
       } 
       const userLikedPost=post.likes.includes(userId);
       if(userLikedPost){
          await Post.updateOne({_id:postId},{$pull:{likes:userId}});
          await User.updateOne({_id:userId},{$pull:{likedPosts:postId}}); 
          const UpdatedLikes=post.likes.filter((id)=>id.toString()!==userId.toString());
          res.status(200).json(UpdatedLikes);
       }
       else{
        post.likes.push(userId)
        await User.updateOne({_id:userId},{$push:{likedPosts:postId}});
        await post.save();
        const notification=new Notification({
            from:userId,
            to:post.user,
            type:"like"
        })
        await notification.save(); 
        res.status(200).json(post.likes)
       }
    } catch (error) {
        res.status(500).json({error:error.message});
        console.log("ERROR IN GET LIKE/DSILIKE");
       
    }
}
export const getAllPosts=async(req,res)=>{
    try {
        const posts=await Post.find().sort({createdAt:-1}).populate({
            path:"user",
            select:"-password"
        }).populate({
            path:"comments.user",
            select:"-password"
        })
        ;
        if(posts.length===0){
            return res.status(200).json([]);
        }
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({error:error.message});
        console.log("ERROR in getallPosts");
    
    }
}
export const getLikedPosts=async(req,res)=>{
    const userId=req.params.id;
    try {
        const user=await User.findById(userId);
        if(!user){return res.status(404).json({error:"user not found"});};
        const likedPosts=await Post.find({_id:{$in:user.likedPosts},user: { $ne: userId } }).populate({
            path:"user",
            select:"-password"
        }).populate({
            path:"comments.user",
            select:"-password",
        });
        res.status(200).json(likedPosts)
    } catch (error) {
        res.status(500).json({error:error.message});
        console.log("ERROR IN GETliked controller ");
    }
}  
export const getFollowingPosts=async(req,res)=>{
    try {
        const userId=req.user._id;
        const user=await User.findById(userId);
        if(!user){return res.status(404).json({error:"USER NOT FOUND"})};
        const following=user.following;
        const feedPosts=await Post.find({user:{$in:following}}).sort({createdAt:-1}).
        populate({
            path:"user",
            select:"-password",
        }).populate({
            path:"comments.user",
            select:"-password",
        });
        res.status(200).json(feedPosts);
    } catch (error) {
        res.status(500).json({error:error.message});
        console.log("ERROR IN GET all following posts");
    }
}
export const getUserPosts=async(req,res)=>{
    try {
        const {username}=req.params;
        const user=await User.findOne({username});
        if(!user){return res.status(404).json({error:"USER NOT FOUND !!!"});};
        const posts=await Post.find({user:user._id}).sort({createdAt:-1}).populate({
            path:"user",
            select:"-password",
        }).populate({
            path:"comments.user",
            select:"-password"
        })
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({error:error.message});
        console.log("ERROR IN GET USER posts ");
    }
}