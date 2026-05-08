import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    used: {
      type: Number,
      default: 0
    },

    count: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const userStorageSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    image: {
      type: categorySchema,
      default: () => ({})
    },

    video: {
      type: categorySchema,
      default: () => ({})
    },

    document: {
      type: categorySchema,
      default: () => ({})
    },

    other: {
      type: categorySchema,
      default: () => ({})
    },

    totalUsed: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("UserStorage", userStorageSchema);