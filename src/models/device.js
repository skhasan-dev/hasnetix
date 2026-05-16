import mongoose from "mongoose";
import { DEVICE_TYPE } from "../utils/const/enums.js";

const deviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    deviceId: { type: String, required: true },

    deviceName: { type: String, required: true },

    deviceType: {
      type: String,
      enum: Object.values(DEVICE_TYPE),
      required: true,
    },

    fcmToken: { type: String, required: true },
  },
);

export default mongoose.model("Device", deviceSchema);