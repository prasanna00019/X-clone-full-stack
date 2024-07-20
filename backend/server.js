import express from "express"
import dotenv from "dotenv"
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import { v2 as cloudinary} from "cloudinary"
import connectDB from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import Post from "./models/postModel.js"
import NotificationRoutes from './routes/NotificationRoute.js'
import postRoutes from "./routes/postRoutes.js"
dotenv.config();
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
})

const app=express();
const PORT=process.env.PORT ||  8000;
app.use(express.json({limit:"5mb"}));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
// console.log(process.env.MONGO_URI);
app.use('/api/auth',authRoutes);
app.use('/api/users',userRoutes);
app.use('/api/posts',postRoutes);
app.use('/api/notifications',NotificationRoutes);
app.listen(PORT,()=>{
    console.log(`${PORT}`);
    connectDB();
})