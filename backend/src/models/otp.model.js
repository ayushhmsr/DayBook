import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    userId: {    
type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
    email: {
      type: String,
      required: true,
    },
    otpHash: {
        type: String,
        required: true,
    }
  },{
    timestamps: true,
  }
);

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
