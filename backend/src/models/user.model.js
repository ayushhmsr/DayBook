import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profession: { type: String, default: 'trader' },
  verified: { type: Boolean, default: false },
  welcomeEmailSent: { type: Boolean, default: false },
});

const userModel = mongoose.model("users", userSchema);

export default userModel;


    