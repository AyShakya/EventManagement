const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// in config/cloudinary.js, AFTER cloudinary.config(...)
console.log("Cloudinary config loaded:", {
  cloud_name: cloudinary.config().cloud_name,
  api_key: cloudinary.config().api_key,
  // DO NOT log api_secret
});


module.exports = cloudinary;