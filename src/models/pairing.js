import mongoose from 'mongoose';
import { DEVICE_TYPE, PAIRING_STATUS } from '../utils/const/enums.js';

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
  { _id: false },
);

const pairingSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    initiator: { type: deviceSchema, required: true },

    receivers: {
      type: [deviceSchema],
      default: [],
    },

    status: {
      type: String,
      enum: Object.values(PAIRING_STATUS),
      default: PAIRING_STATUS.PENDING,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true },
);

pairingSchema.index({ 'initiator.deviceId': 1, status: 1 });
pairingSchema.index({ 'receivers.deviceId': 1, status: 1 });

export const Pairing = mongoose.model('Pairing', pairingSchema);
