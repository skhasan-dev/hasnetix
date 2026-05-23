export const USER_TYPES = Object.freeze({
  GUEST: "guest",
  GOOGLE: "google",
  EMAIL: "email"
});

export const FILE_PROVIDERS = Object.freeze({
  CLOUDINARY: "cloudinary",
  R2: "r2"
});

export const FILE_TYPES = Object.freeze({
  IMAGE: "image",
  VIDEO: "video",
  DOCUMENT: "document",
  OTHER: "other"
});

export const FILE_STATUS = Object.freeze({
  ACTIVE: "active",
  EXPIRED: "expired",
  DELETED: "deleted"
});

export const PAIRING_STATUS = {
  PENDING:  'pending',   
  ACTIVE:   'active',    
  EXPIRED:  'expired',  
};

export const DEVICE_TYPE = Object.freeze({
  MOBILE: "mobile",
  DESKTOP: "desktop",
});

export const NOTIFICATION_TYPE = Object.freeze({
  NOTIFICATION: "notification",
  DEVICE_PAIRED: "device_paired",
  FILE_UPLOADED: "file_uploaded",
  FILE_DOWNLOADED: "file_downloaded",
  FILE_EXPIRING_SOON: "file_expiring_soon",
  FILE_EXPIRED: "file_expired",
});