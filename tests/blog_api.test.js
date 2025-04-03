const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const Blog = require('../models/blogs')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')
const _ = require('lodash')
const { title } = require('node:process')
const { application } = require('express')

const api = supertest(app)

beforeEach(async () => {
    await Blog.deleteMany({})
    let blog = new Blog(helper.initialBlogs[0])
    await blog.save()
    blog = new Blog(helper.initialBlogs[1])
    await blog.save()
})
describe('when there is initially some blogs', () => {
    test('blogs are returned as json', async () => {
        await api
        .get('/api/blogs')
        .expect(200)
        .expect('content-Type', /application\/json/)
    })
    
    test('there are two blogs', async () => {
        const response = await api.get('/api/blogs')
        assert.strictEqual(response.body.length, helper.initialBlogs.length)
    })
    
    test('the first blog is about React patterns', async () => {
        const response = await api.get('/api/blogs')
        const titles = response.body.map(e => e.title)
        assert(titles.includes('React patterns'))
    })
})

describe('proper unique identifier', () => {
    test('the unique identifier is caller "id"', async () => {
        const response = await api.get('/api/blogs')
        response.body.forEach(blog => {
            assert('id' in blog);
        })
    })
})

describe('test for adding blogs', () => {
    test('a valid blog can be added', async () => {
        const newBlog = {
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
            likes: 12,
        }
    
        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('content-Type', /application\/json/)
    
        const response = await api.get('/api/blogs')
    
        const blogsAtEnd = await helper.blogsInDb()
    
        assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
        
        const titles = blogsAtEnd.map(n => n.title)
        assert(titles.includes('Canonical string reduction'))
    })
})
// test('blog without author is not added', async () => {
//     const newBlog = {
//         title: "Canonical string reduction",
//         url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
//         likes: 12,
//     }
    
//     await api
//         .post('/api/blogs')
//         .send(newBlog)
//         .expect(400)

//     const blogsAtEnd = await helper.blogsInDb()
//     assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
// })
describe('missing likes of the new blog', () => {
    test('if no likes in request, it takes 0 by default', async () => {
        const newBlog = {
            title: "First class tests",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll"
        }
    
        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
    
        const blogsAtEnd = await helper.blogsInDb();
        const lastBlogAdded = blogsAtEnd[blogsAtEnd.length-1]
    
        assert('likes' in lastBlogAdded)
        assert.strictEqual(0, lastBlogAdded.likes)
        
    })
})

describe('missing required properties', () => {
    const newBlog = {
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        likes: 12,
    }

    test('if title is missing blog is not added', async () => {
        await api
            .post('/api/blogs')
            .send(_.omit(newBlog, ['title']))
            .expect(400)
        
    })

    test('if url is missing blog is not added', async () => {
        await api
            .post('/api/blogs')
            .send(_.omit(newBlog, ['url']))
            .expect(400)
    })
})

describe('deleting a blog', () => {
    test("deleting a blog by it's id", async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToDelete = blogsAtStart[0]

        await api  
            .delete(`/api/blogs/${blogToDelete.id}`)
            .expect(204)

        const blogsAtEnd = await helper.blogsInDb()
        
        const titles = blogsAtEnd.map(blog => blog.title)
        assert(!titles.includes(blogToDelete.title))
        assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length -1)
    })
})

describe('updating a blog by id', () => {
    test('updating likes of a blog', async () => {
        const blogsAtStart = await helper.blogsInDb()

        const blogToUpdate = {
            title: blogsAtStart[0].title,
            author: blogsAtStart[0].author,
            url: blogsAtStart[0].url,
            likes: blogsAtStart[0].likes + 10
        }

        await api  
            .put(`/api/blogs/${blogsAtStart[0].id}`)
            .send(blogToUpdate)
            .expect(200)

        const blogAtEnd = await helper.blogsInDb()
        const blogUpdated = blogAtEnd[0]
        assert.notStrictEqual(blogUpdated.likes, blogsAtStart[0].likes)
    })
})

after(async () => {
    await mongoose.connection.close()
})