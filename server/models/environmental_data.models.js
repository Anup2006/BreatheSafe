import mongoose from "mongoose";

const environmental_dataSchema= new mongoose.Schema({
    location: {
        city: String,
        state: String,
        country: String
    },
    AQI: Number,
    temperature: Number,
    humidity: Number,
    pollution: {
        PM2_5: Number,
        PM10: Number,
        CO: Number,
        NO2: Number,
        SO2: Number,
        O3: Number
    },
    otherFactors: mongoose.Schema.Types.Mixed

},{timestamps:true});

export const EnvironmentalData = mongoose.model("Environmental_Dat",environmental_dataSchema);