const mongoose = require("mongoose");

const AudiobookSchema = new mongoose.Schema(
    {
        title: {type: String, required: true},
        author: {type: String, required: true},
        releaseDate: {type: Date, required: true},
        coverId: {type: String, required: true},
        audioId: {type: String, required: true},
        categories: {type: Array, default: []},
    },
    {
        timestamps: {currentTime: () => Date.now()},
    }
);
module.exports = mongoose.model("Audiobook", AudiobookSchema);
