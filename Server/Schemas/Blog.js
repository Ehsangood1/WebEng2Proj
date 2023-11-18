const mongoose = require("mongoose")

const blogSchema = new mongoose.Schema({
    title: String,
    content: String,
    likes: [String],
    author: String,
    uploadDate: String,
    comments: [{user: String, comment: String}]
})

module.exports = mongoose.model("Blog", blogSchema);
