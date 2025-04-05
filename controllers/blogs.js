const blogsRouter = require('express').Router()
const Blog = require('../models/blogs')
const User = require('../models/users')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response, next) => {
    try {
        const blogs = await Blog.find({}).populate('user', { username: 1, name: 1, userId: 1 })
        response.json(blogs)   
    } catch(exception) {
        next(exception)
    }
})

const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
        return authorization.replace('Bearer ', '')
    }
    return null
}

blogsRouter.post('/', async (request, response, next) => {
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
    if( !decodedToken.id ){
        return response.status(401).json({error: 'invalid token'})
    }
    const user = await User.findById(decodedToken.id)
    const blog = new Blog(request.body)
    blog.user = user.id
    try {
        const savedBlog = await blog.save()
        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()
        
        response.status(201).json(savedBlog)
    } catch(exception) {
        next(exception)
    }
})

blogsRouter.delete('/:id', async (request, response, next) => {
    try {
        await Blog.findByIdAndDelete(request.params.id)
        response.status(204).end()
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

