const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  username: String,
  text: String
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  username: {
    type: String,
    required: true
  },
  text: {
    type: String
  },
  imageUrl: {
    type: String
  },
  likes: [String],
  comments: [commentSchema]
}, { timestamps: true });


module.exports = mongoose.model("Post", postSchema);