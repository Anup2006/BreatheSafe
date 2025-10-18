import mongoose from "mongoose";

const notificationSchema= new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    environmentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "EnvironmentalData", 
        required: true 
    },
    message: String,
    isRead: { 
        type: Boolean, 
        default: false 
    }
},{timestamps:true});

export const Notification = mongoose.model("Notification",notificationSchema);