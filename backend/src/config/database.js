import mongoose from "mongoose";
import config from "./config.js";

async function connectDB() {
  await mongoose.connect(config.mongoURI);
  console.log("MongoDB connected");
  try {
    const userColl = mongoose.connection.collection("users");
    const indexes = await userColl.indexes();
    const hasNameIndex = indexes.some(idx => idx.name === 'name_1');
    if (hasNameIndex) {
      await userColl.dropIndex('name_1');
      console.log("Dropped legacy unique name index from users collection");
    }
  } catch {}
}

export default connectDB;