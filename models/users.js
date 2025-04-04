const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
    username: {
        minLength: 3,
        type: String,
        required: true,
        unique: true // esto asegura la unicidad de username
    },
    name: String,
    passwordHash: {
        minLength: 3,
        type: String,
        required: true
    },
    blogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blog'
        }
    ]
})

UserSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        // el passwordHash no debe mostrarse
        delete returnedObject.passwordHash
    }
})

module.exports = mongoose.model('User', UserSchema)