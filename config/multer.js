import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const allowedExtensions = [
  ".jpg", ".jpeg", ".png", ".webp",
  ".mp4", ".mov", ".avi",
  ".pdf", ".zip", ".apk"
];

const allowedMimePrefixes = [
  "image/",
  "video/",
  "application/pdf",
  "application/zip",
  "application/vnd.android.package-archive"
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  const validExt = allowedExtensions.includes(ext);
  const validMime = allowedMimePrefixes.some(type =>
    file.mimetype.startsWith(type)
  );

  if (validExt && validMime) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

export const uploader = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  fileFilter
});