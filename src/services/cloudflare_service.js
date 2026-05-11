import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { default as s3 } from "../../config/cloudflare.js";
import dotenv from "dotenv";

dotenv.config();

export const uploadToR2 = async (file) => {
  const key = `${Date.now()}-${file.originalname}`;

  await s3.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  }));

  return {
    url: `${process.env.R2_PUBLIC_URL}/${key}`,
    key
  };
};

export const generateR2DownloadUrl = async (
  key,
  fileName
) => {

  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,

    ResponseContentDisposition:
      `attachment; filename="${fileName}"`
  });

  const signedUrl = await getSignedUrl(
    s3,
    command,
    {
      expiresIn: 60 * 5 // 5 min
    }
  );

  return signedUrl;
};

export const deleteFromR2 = async (key) => {

  if (!key) return false;

  await s3.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key
    })
  );

  return true;
};