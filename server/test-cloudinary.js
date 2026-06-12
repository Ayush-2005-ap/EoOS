const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dkakqsczc',
  api_key: '155913784393144',
  api_secret: '6SB5CoghPBc6hInIe6i1oNt9ZQM',
});

cloudinary.uploader.upload(
  "data:text/plain;base64,SGVsbG8gV29ybGQ=", 
  { folder: "test", resource_type: "raw" },
  (error, result) => {
    if (error) {
      console.error("Upload failed:", error);
    } else {
      console.log("Upload succeeded:", result?.secure_url);
    }
  }
);
