const blogsRouter = require('express').Router()
const Blog = require('../models/blogs')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs)   
})

blogsRouter.post('/', async (request, response) => {
    const body = request.body

    const blog = new Blog({
        title: body.title || 'no-title',
        author: body.author || 'no-author',
        url: body.url || 'no-url',
        likes: body.likes || 0,
    })

    try {
        const savedBlog = await blog.save()
    response.status(201).json(savedBlog)
    } catch(exception) {
        next(exception)
    }
})


module.exports = blogsRouter

