const multer = require("multer");
const mimeTypes = {
  "images.jpg": "jpg",
  "images/jpeg": "jpg",
  "images/png": "png",
};
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = mimeTypes[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});
module.exports = multer({ storage }).single("image");
