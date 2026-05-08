import mongoose from "mongoose";
import { USER_TYPES } from "../utils/const/enums.js";

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  type: {
    type: String,
    enum: Object.values(USER_TYPES),
    default: USER_TYPES.GUEST
  },

  email: {
    type: String,
    lowercase: true,
    trim: true,
    sparse: true
  },

  monthlyUsage: {
    type: Number,
    default: 0
  },

  storage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserStorage",
    default: null
  },

  usageResetAt: {
    type: Date,
    required: true
  }

}, { timestamps: true });

export default mongoose.model("User", userSchema);

