import mongoose from "mongoose";

const ConnectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully ✅");
  } catch (err) {
    console.error("MongoDB connection failed ❌", err);
    process.exit(1); // Stop server if DB fails
  }
};

export default ConnectDB;
