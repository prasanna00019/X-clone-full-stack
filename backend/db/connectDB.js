import mongoose from "mongoose";
const connectDB=async()=>{
    try {
        const connect=await mongoose.connect(process.env.MONGO_URI)
        console.log(`MONGO DB CONNECTED ${connect.connection.host}`)
    } catch (error) {
        console.log("ERROR CONNECTING MONGODB")
        process.exit(1);        
    }
}
export default connectDB;