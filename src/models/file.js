import mongoose from "mongoose";
import { FILE_PROVIDERS, FILE_TYPES, FILE_STATUS } from "../utils/const/enums.js";

const fileSchema = new mongoose.Schema({
  fileId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  originalName: {
    type: String,
    required: true
  },

  fileName: {
    type: String
  },

  provider: {
    type: String,
    enum: Object.values(FILE_PROVIDERS),
    required: true
  },

  url: {
    type: String,
    required: true
  },

  key: {
    type: String
  },

  size: {
    type: Number,
    required: true
  },

  mimeType: {
    type: String,
    required: true
  },

  // 👇 normalized type (VERY USEFUL)
  fileType: {
    type: String,
    enum: Object.values(FILE_TYPES),
    required: true
  },

  userId: {
    type: String,
    required: true,
    index: true
  },

  expiresAt: {
    type: Date,
    required: true,
    index: true
  },

  deleteAt: {
    type: Date,
    required: true,
    index: true
  },

  status: {
    type: String,
    enum: Object.values(FILE_STATUS),
    default: FILE_STATUS.ACTIVE,
    index: true
  },

  downloadCount: {
    type: Number,
    default: 0
  }

}, {
  timestamps: true
});

fileSchema.index(
  { deleteAt: 1 },
  { expireAfterSeconds: 0 }
);

export default mongoose.model("File", fileSchema);