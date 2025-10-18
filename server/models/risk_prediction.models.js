import mongoose from "mongoose";

const risk_predictionSchema= new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true 
    },
    environmentId: { type: mongoose.Schema.Types.ObjectId, 
        ref: "EnvironmentalData", 
        required: true 
    },
    riskPercentage: Number,
    riskLevel: String,
    recommendedActions:{
        type:String,
    }

},{timestamps:true});

export const RiskPrediction= mongoose.model("RiskPrediction",risk_predictionSchema);