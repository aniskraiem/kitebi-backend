const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema(
    {
        userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
        desc: {type: String, max: 500, required: true},
        img: {type: String},
        audioId: {type: String},
        likes: {type: Array, default: []},
        comments: [
            {
              user: {
                type: Schema.Types.ObjectId,
                ref: 'users',
              },
              text: {
                type: String,
              },
              firstname: {
                type: String,
              },
              lastname: {
                type: String,
              },
              avatar: {
                type: String,
              },
              date: {
                type: Date,
                default: Date.now,
              },
            },
          ],
    },
    {timestamps: true}
);

module.exports = mongoose.model("Post", PostSchema);
