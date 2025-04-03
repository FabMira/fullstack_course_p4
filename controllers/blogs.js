const blogsRouter = require('express').Router()
const Blog = require('../models/blogs')

blogsRouter.get('/', async (request, response, next) => {
    try {
        const blogs = await Blog.find({})
        response.json(blogs)   
    } catch(exception) {
        next(exception)
    }
})

blogsRouter.post('/', async (request, response, next) => {
    const blog = new Blog(request.body)
    try {
        const result = await blog.save()
        response.status(201).json(result)
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

// const body = request.body

//     const blog = new Blog({
//         title: body.title || 'no-title',
//         author: body.author,
//         url: body.url || 'no-url',
//         likes: body.likes || 0,
//     })

//     try {
//         const savedBlog = await blog.save()
//     response.status(201).json(savedBlog)
//     } catch(exception) {
//         next(exception)
//     }