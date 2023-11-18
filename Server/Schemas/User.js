const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {type: String, unique: true},
    firstName: String,
    lastName: String,
    age: Number,
    password: String,
    blogs: [mongoose.SchemaTypes.ObjectId]
});

module.exports = mongoose.model("User", userSchema);