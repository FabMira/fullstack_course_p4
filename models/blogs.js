const mongoose = require('mongoose')

const BlogSchema = mongoose.Schema({
    title: String,
    author: String,
    url: String,
    likes: Number,
})

// const Blog = mongoose.model('Blog', blogSchema)

module.exports = mongoose.model('Blog', BlogSchema);