const { test, describe, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const Blog = require('../models/blogs')
const User = require('../models/users')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const supertest = require('supertest')
const app = require('../app')
const _ = require('lodash')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const api = supertest(app)


describe('when there is initially some blogs', () => {
    beforeEach(async () => {
        await Blog.deleteMany({})
        let blog = new Blog(helper.initialBlogs[0])
        await blog.save()
        blog = new Blog(helper.initialBlogs[1])
        await blog.save()
    })

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
    
    test('the first blog is about tests', async () => {
        const response = await api.get('/api/blogs')
        const titles = response.body.map(e => e.title)
        assert(titles.includes('First class tests'))
    })

    test('the unique identifier is caller "id"', async () => {
        const response = await api.get('/api/blogs')
        response.body.forEach(blog => {
            assert('id' in blog);
        })
    })
})

describe('tests for adding, updating or deleting a blog', () => {

    beforeEach(async () => {
        await User.deleteMany({})
        await Blog.deleteMany({})
        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({
            username: 'root',
            passwordHash
        })
        await user.save()
        const userForToken = { username: 'root', id: user._id }
        token = jwt.sign(userForToken, process.env.SECRET)
        let blog = new Blog(helper.initialBlogs[0])
        blog.user = user._id
        await blog.save()
        blog = new Blog(helper.initialBlogs[1])
        blog.user = user._id
        await blog.save()
    })
    
    const newBlog = {
        title: 'Test blog',
        author: 'Test Author',
        url: 'http://test.com',
        likes: 5
    }

    test('a valid blog can be added', async () => {
        const blogsAtStart = helper.blogsInDb()
        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('content-Type', /application\/json/)
    
        const response = await api.get('/api/blogs')
    
        const blogsAtEnd = await helper.blogsInDb()
    
        assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
        
        const titles = blogsAtEnd.map(n => n.title)
        assert(titles.includes('Test blog'))
    })

    test('if no likes in request, it takes 0 by default', async () => {
        const blogsAtStart = helper.blogsInDb()
        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(_.omit(newBlog, ['likes']))
            .expect(201)
    
        const blogsAtEnd = await helper.blogsInDb();
        const lastBlogAdded = blogsAtEnd[blogsAtEnd.length-1]
    
        assert('likes' in lastBlogAdded)
        assert.strictEqual(0, lastBlogAdded.likes)
        
    })

    test('if title is missing blog is not added', async () => {
        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(_.omit(newBlog, ['title']))
            .expect(400)
        
    })
    
    test('if url is missing blog is not added', async () => {
        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(_.omit(newBlog, ['url']))
            .expect(400)
    })

    test("deleting a blog by it's id", async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToDelete = blogsAtStart[0]
    
        await api  
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)
    
        const blogsAtEnd = await helper.blogsInDb()
        
        const titles = blogsAtEnd.map(blog => blog.title)
        assert(!titles.includes(blogToDelete.title))
        assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length -1)
    })
    
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

    test('if token is missing Unauthorize', async () => {
        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)
    })
})

after(async () => {
    await mongoose.connection.close()
})