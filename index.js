const express = require('express')
const app = express()
const cors = require('cors')
const { initDatabase } = require('./database/db')
const { createUser, getAllUsers, addExercise, getUserLogs } = require('./routes/api')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

initDatabase()

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

app.post('/api/users', createUser)
app.get('/api/users', getAllUsers)
app.post('/api/users/:_id/exercises', addExercise)
app.get('/api/users/:_id/logs', getUserLogs)

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})