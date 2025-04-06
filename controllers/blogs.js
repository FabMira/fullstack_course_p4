const blogsRouter = require('express').Router()
const Blog = require('../models/blogs')
const User = require('../models/users')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response, next) => {
    try {
        const blogs = await Blog.find({}).populate('user', { username: 1, name: 1, userId: 1 })
        response.json(blogs)   
    } catch(exception) {
        next(exception)
    }
})


blogsRouter.post('/', middleware.userExtractor, async (request, response, next) => {
    try {
        const user = request.user
        const blog = new Blog(request.body)
        blog.user = user.id
        const savedBlog = await blog.save()
        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()
        
        response.status(201).json(savedBlog)
    } catch(exception) {
        next(exception)
    }
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response, next) => {
    try {
        const user = request.user
        const blog = await Blog.findById(request.params.id)
        if( blog.user.toString() === user.id ) {
            await Blog.findByIdAndDelete(request.params.id)
            response.status(204).end()
        } else {
            response.status(401).json({error: 'invalid user'})
        }
    } catch (exception) {
        next(exception)
    }
})

blogsRouter.put('/:id', async (request, response, next) => {
    const body = request.body

    const blog = {
        'title': body.title,
        'author': body.author,
        'url': body.url,
        'likes': body.likes
    }
    try {
        await Blog.findByIdAndUpdate(request.params.id, blog, {new: true})
        response.status(200).end()
    } catch(exception) {
        console.log('hay un exception');
        
        next(exception)
    }
})


module.exports = blogsRouter

