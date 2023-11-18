const mongoHandler = require('./mongoHandler.js')
const User = require("./Schemas/User.js")
const Blog = require("./Schemas/Blog.js")
const bcrypt = require('bcryptjs')
const bodyParser = require('body-parser')
const cors = require('cors');
const express = require('express');
const { mongo } = require('mongoose')
const server = express();

server.use(express.static(__dirname));

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

server.use(cors({
    origin: '*',
    allowedHeaders: ['Content-Type', 'application/json']
}))




 server.post('/register', async (req, res) => {
    const username = req.body.username
    mongoHandler.connectDatabase();
    const user = await mongoHandler.getUser(username);
    if(user === null) {
        const createdUser = await mongoHandler.createNewUser(req.body);
        res.end(JSON.stringify(createdUser));
    } else {
        res.end(JSON.stringify({error: "Useralready exit"}));
    }
})

server.post('/login', async (req, res) => {
    const username = req.body.username
    const password = req.body.password
    mongoHandler.connectDatabase();
    const user = await mongoHandler.getUser(username);
    if(user === null) {
        res.end(JSON.stringify({error: "Username does not exist"}));
    } else if(!bcrypt.compareSync(password, user.password)) {
        res.end(JSON.stringify({error: "Wrong password "}));
    } else {
        res.end(JSON.stringify(user));
    }
})

//LOGIN SAME AS EDIT --> MAKE ONE FUNCTION OUT OF IT LATER
server.post('/editProfile', async (req, res) => {
    const username = req.body.username
    const password = req.body.password

    mongoHandler.connectDatabase();
    const user = await mongoHandler.getUser(username);
    if(user === undefined) {
        res.end(JSON.stringify({error: "Username does not exist"}));
    } else if(!bcrypt.compareSync(password, user.password)) {
        res.end(JSON.stringify({error: "Wrong password "}));
    } else {
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.age = req.body.age;
        user.save();
        res.end(JSON.stringify(user));
    }
})

server.get('/trending', async (req, res) => {
    await mongoHandler.connectDatabase();
    const blogs = await mongoHandler.getTrending(res);
    res.end(JSON.stringify(blogs));
})

server.get('/profile/:user?', async (req, res) => {
    var username = req.params.user;
    mongoHandler.connectDatabase();
    const user = await mongoHandler.getUser(username +"");
    if(user === undefined) {
        res.end(JSON.stringify({}));
    } else {
        const titles = {}
        for(const blog of user.blogs) {
            const ret = await mongoHandler.getBlog(blog)
            titles[blog] = ret.title;
        }
        const converted = user.toObject();
        converted.titles = titles;
        res.end(JSON.stringify(converted));
    }
    
})

server.get('/blog/:blogId?', async (req, res) => {
    var blogId = req.params.blogId;
    mongoHandler.connectDatabase();
    const blogData = await mongoHandler.getBlog(blogId);
    res.end(JSON.stringify(blogData));
})

server.post('/blog/:blogId?', async (req, res) => {
    const id = req.params.blogId;
    const title = req.body.title;
    const content = req.body.content;
    
    mongoHandler.connectDatabase();
    const blog = await mongoHandler.getBlog(id);
    blog.title = title;
    blog.content = content;
    blog.save();
    res.end(JSON.stringify({}));
})

server.delete('/blog/:blogId?', async (req, res) => {
    const id = req.params.blogId;
    mongoHandler.connectDatabase();
    const user = await mongoHandler.getUserByBlogID(id);
    user.blogs.pop(id);
    user.save();
    await mongoHandler.deleteBlog(id);
    res.end(JSON.stringify({}))
})

server.post('/comment', async (req, res) => {
    const commentContent = req.body.commentContent;
    const blogID = req.body.blogID;

    mongoHandler.connectDatabase();
    const blog = await mongoHandler.getBlog(blogID);
    blog.comments.push(commentContent);
    blog.save();
    
    res.end(JSON.stringify({comments: blog.comments}));
})

server.post('/deleteComment', async (req, res) => {
    const comment = req.body.data;
    mongoHandler.connectDatabase();
    console.log(req.body.blog);
    const blog = await mongoHandler.getBlog(req.body.blog);
    const newC = blog.comments.filter((c) => c.user !== comment.user || c.comment !== comment.comment);
    blog.comments = newC;
    blog.save();
    res.end(JSON.stringify({comments: blog.comments}))
})


server.post('/like', async (req, res) => {
    mongoHandler.connectDatabase();
    const username = req.body.username;
    const blog = await mongoHandler.getBlog(req.body.blogID);
    if(blog.likes.includes(username)) {
        const newLikes = blog.likes.filter(user => user !== username);
        blog.likes = newLikes;
        blog.save();
    } else {
        blog.likes.push(username);
        blog.save();
    }
    res.end(JSON.stringify(blog))
})

server.post('/new', async (req, res) => {
    mongoHandler.connectDatabase();
    const user = await mongoHandler.getUser(req.body.user);
    if(user === null) {
        res.end(JSON.stringify({error: "User does not exist."}))
    } else {
        const blog = await mongoHandler.createNewBlog(req.body)
        user.blogs.push(blog._id);
        user.save();
        res.end(JSON.stringify(blog))
    }
})

server.post("/change", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    mongoHandler.connectDatabase();
    const user = await mongoHandler.getUser(username);
    if(user === null) {
        res.end(JSON.stringify({error: "User not defined"}))
    } else  if (!bcrypt.compareSync(password, user.password)) {
        res.end(JSON.stringify({error: "Wrong password"}))
    } else {
        user.password = await bcrypt.hashSync(req.body.newPassword, 10);
        user.save();
        res.end(JSON.stringify({}))
    }
})

server.post('/search', async (req, res) =>{
    const value = req.body.value;
    await mongoHandler.connectDatabase();
    const blogs = await mongoHandler.searchForBlog(value);
    res.end(JSON.stringify(blogs));
})

server.listen(5000, ()=>{
    console.log("Server online")
})