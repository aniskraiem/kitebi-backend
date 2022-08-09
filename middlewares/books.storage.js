const multer = require("multer")
const path = require('path');

const storage = multer.diskStorage({
    destination: function (request, file, callback) {
        callback(null, './uploads/books');
    },
    filename: function (request, file, callback) {
        callback(null, "book" + Date.now() + path.extname(file.originalname));
    }
});

module.exports = multer({storage: storage})