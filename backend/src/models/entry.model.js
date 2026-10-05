import mongoose from "mongoose";

const entrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },
    templateId: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    values: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

entrySchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

const Entry = mongoose.model("Entry", entrySchema);

export default Entry;
