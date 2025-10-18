import mongoose from "mongoose";

const userSchema= new mongoose.Schema({
  name:{
    type:String,
    required:true,
  },
  email:{
    type:String,
    required:true,
  },
  password:{
    type:String,
    required:true,
  },
  age:{
    type:Number,
    required:true,
  },
  location: {
    city: String,
    state: String,
    country: String
  },
  healthConditions:{
    type:[String],
    required:false,
  },
  createdAt:{
    type:Date,
    default:Date.now,
  },
  updatedAt:{
    type:Date,
    default:Date.now,
  }
},{timestamps:true});

export const User = mongoose.model("User",userSchema);