import mongoose from "mongoose";
import config from "../src/config/config.js";
import Entry from "../src/models/entry.model.js";

async function clearEntries() {
  try {
    await mongoose.connect(config.mongoURI);
    console.log("Connected to MongoDB...");
    const result = await Entry.deleteMany({});
    console.log(`✅ Successfully deleted ${result.deletedCount} entries from the database.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to clear entries:", error.message);
    process.exit(1);
  }
}

clearEntries();
