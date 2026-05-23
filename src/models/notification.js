import mongoose from 'mongoose';
import { NOTIFICATION_TYPE } from '../utils/const/enums.js';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    subtitle: {
      type: String,
      default: '',
      trim: true,
    },

    body: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {},
    },

    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPE),
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('Notification', notificationSchema);