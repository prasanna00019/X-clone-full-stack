import User from "../models/userModel.js";
import jwt from "jsonwebtoken"
export const protectRoute=async(req,res,next)=>{
    try {
        const token=req.cookies.jwt
        if(!token){
            return res.status(401).json({error:"unauthorised : no token provided"});
        }
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({error:"invalid token"});
        }
        const user=await User.findById(decoded.userId).select('-password');
        if(!user){
            return res.status(404).json({error:"USER NOT FOUND !!! "});
        }
        req.user=user;
        next();
    } catch (error) {
        console.log("ERROR IN PROTECTED ROUTES",error.message);
        return res.status(500).json({error:"INTERNAL SERVER ERROR IN PROTECTED ROUTES"});
    }
}