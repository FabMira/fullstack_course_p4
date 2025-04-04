const usersRouter = require('express').Router()
const bycrypt = require('bcryptjs')
const User = require('../models/users')

usersRouter.post('/', async (request, response, next) => {
    const { username, name, password } = request.body

    if ( password.length < 3 ) {
        return response.status(400).json({
            error: 'password is shorter thant the minimum allowed length (3)'
        })
    }

    const saltRounds = 10
    const passwordHash = await bycrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        passwordHash
    })

    try {
        const savedUser = await user.save()
        response.status(201).json(savedUser)
    } catch (exception) {
        next(exception)
    }
})

usersRouter.get('/', async (request, response) => {
    const users = await User.find({})
    response.json(users)
})


module.exports = usersRouter