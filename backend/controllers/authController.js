import User from "../models/userModel.js";
import bcrypt from "bcryptjs"
import { generateTokenAndSetCookie } from "../lib/utils/generateTokens.js";
export const signup=async(req,res)=>{
   try {
    const{fullName,username,email,password}=req.body;
    const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
        return res.status(400).json({error:"invalid email format"})
    }
    const existinguser=await User.findOne({username});
     if(existinguser){
        return res.status(400).json({error:"USERNAME ALREADY TAKEN !!!!"});
     }   
    const existingemail=await User.findOne({email});
     if(existingemail){
        return res.status(400).json({error:"EMAIL ALREADY TAKEN !!!!"});
     }   
     if(password.length<8){
        return res.status(400).json({error:"PASSWORD MUST BE MINIMUM 8 LENGTH"});
     }
     //hash passwords
     const salt=await bcrypt.genSalt(10);
     const hashPassword=await bcrypt.hash(password,salt);
     const newUser=new User({
        fullName:fullName,
        username:username,
        email:email,
        password:hashPassword,
 })
 if(newUser){
    generateTokenAndSetCookie(newUser._id,res);
    // generateTokenAndSetCookie(newUser._id,res);
    await newUser.save();
    res.status(201).json({
        _id:newUser._id,
        fullName:newUser.fullName,
        username:newUser.username,
        email:newUser.email,
        followers:newUser.followers,
        following:newUser.following,
        profileImg:newUser.profileImg,
        coverImg:newUser.coverImg,
    })
 }  else{
   res.status(400).json({error:"invalid user data"});
 }

} catch (error) {
    console.log("error in signup controlelr")
    res.status(500).json({error:"internal server error"})
   }
}
export const login=async(req,res)=>{
   try {
    const{username,password}=req.body;
    const user=await User.findOne({username});
    const isPasswordCorrect=await bcrypt.compare(password,user?.password||"");
    if(!user || !isPasswordCorrect){
        return res.status(400).json({error:"Invalid Username or Password !!! "})
    }
    generateTokenAndSetCookie(user._id,res);
    res.status(200).json({
        _id:user._id,
        fullName:user.fullName,
        username:user.username,
        email:user.email,
        followers:user.followers,
        following:user.following,
        profileImg:user.profileImg,
        coverImg:user.coverImg,
    })
   } catch (error) {
    console.log("error in login controller",error.message);
    res.status(500).json({error:"internal server error"})
   }
}
export const logout=async(req,res)=>{
   try {
    res.cookie("jwt","",{maxAge:0})
    res.status(200).json({message:"LOGGED OUT SUCCESSFULY"});
   } catch (error) {
    console.log("error in logout controller")
    res.status(500).json({error:"internal server error"})
   }
}
export const getMe=async(req,res)=>{
    try {
        const user=await User.findById(req.user._id).select('-password');
        res.status(200).json(user);
    } catch (error) {
        console.log("error in getMe controller")
        res.status(500).json({error:"internal server error"})
    }
}