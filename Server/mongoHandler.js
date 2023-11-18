const mongoose = require("mongoose");
const User = require("./Schemas/User.js")
const Blog = require("./Schemas/Blog.js")
const bcrypt = require('bcrypt')

exports.connectDatabase = function connectDatabase() {
    mongoose.connect("mongodb://127.0.0.1:27017/blogwebsite");
} 

exports.createNewUser =  async function createNewUser(data) {
    const result = await User.create({
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        password: await bcrypt.hashSync(data.password, 10)
    });
    return result;
}

exports.getTrending = async function getTrending() {
    const blogs =  await Blog.find({}).limit(100);
    return blogs;
} 

exports.getUserByBlogID = async function getUserByBlogID(id) {
    const blog = await Blog.findById(id);
    const user = await User.findOne({username: blog.author});
    return user;
}

exports.searchForBlog = async function searchForBlog(search) {
    const blogs = await Blog.find({"title": {"$regex": `.*${search}`, "$options": `i`}}).limit(100);
    return blogs;
}

exports.getBlog = async function getBlog(id) {
    const title =  await Blog.findOne({_id: id});
    return title;
} 

exports.getUser = async function getUser(user) {
    const result = await User.findOne({username: user})
    return result;
}

exports.createNewBlog = async function createNewBlog(body){
    const result = await Blog.create({
        title: body.title,
        content: body.content,
        likes: [],
        author: body.user,
        uploadDate: getTimeString()
    });
    return result;
}

exports.deleteBlog = async function deleteBlog(id) {
    await Blog.deleteOne({_id: id});
}

function getTimeString() {
    var t = new Date();
    return t.getDate()+ '.' + (t.getMonth() + 1) + "." + t.getFullYear();
}


