import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()
const connectDB = async () =>{
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Connected to DB successfully");
        
    } catch (error) {
        console.error("error connecting to DB", error.message)
        process.exit(1)
    }
}

export default connectDB;