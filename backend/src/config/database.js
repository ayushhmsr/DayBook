import mongoose from "mongoose";
import config from "./config.js";

async function connectDB() {
  await mongoose.connect(config.mongoURI, )
  console.log("MongoDB connected");
}

export default connectDB;