const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "devtinder-posts",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "mp4", "mov", "webm"],
    resource_type: "auto", // auto-detect image vs video
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
});

module.exports = { cloudinary, upload };
