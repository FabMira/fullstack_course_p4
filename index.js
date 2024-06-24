require('dotenv').config({path: '.env'}) //dotenv: libreria para gestion de variables de entorno
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./person')

morgan.token('reqContent', function getContent (req) {
  if(req.method === 'POST') {
    return JSON.stringify(req.body)
  }
})

app.use(morgan(':method :url :status :res[content-length] :response-time ms :reqContent'))
app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
let persons = []

app.get('/', (req, res) => {
  res.send('<h1>Phonebook backend</h1>')
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(person => {
    res.json(person)
    persons = (JSON.parse(JSON.stringify(person)))
  })
})

app.get('/info', (req, res) => {
  const reqTime = new Date()
  res.send(`<p>Phonebook has info for ${persons.length} people</p>
    <p>${reqTime.toString()}</p>`)
})

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.findById(id)
    .then(person => {
      if(person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  Person.findByIdAndDelete(id)
    .then(result => {
      res.json(result)
      persons = persons.filter(person => person.name !== result.name)
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  const person = new Person({
    name: body.name,
    number: body.number
  })
  /*let err
  err = person.validateSync()*/


  person.save()
    .then(savedPerson => {
      res.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(req.params.id, person, {new: true})
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`)
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({error: 'uknown endpoint'})
}
//controlador de solicitudes con endpoint desconocido
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }
  next(error)
}

//este debe ser el ultimo middleware cargado, ¡tambien todas las rutas deben ser registradas antes que esto!
app.use(errorHandler)