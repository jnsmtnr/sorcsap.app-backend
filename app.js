const express = require('express')
const cors = require('cors')
const app = express()

const bodyParser = express.json()
app.use(bodyParser)

const usersRoutes = require('./routes/users.js')
const {auth, isAdmin} = require('./middleware/auth.js')

const port = process.env.PORT || 8000

app.use(cors())

app.use('/users', usersRoutes)

app.get('/', function (_, res) {
    res.send('Hello World')
})

// test auth middleware
app.get('/test', auth, function (req, res) {
    res.status(200).send(req.user.email)
})

app.get('/test-admin', auth, isAdmin, function (req, res) {
    res.sendStatus(200)
})

app.listen(port, function () { console.log(`server listening on port ${port}`) })

