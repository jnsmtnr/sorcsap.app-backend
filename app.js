const express = require('express')
const cors = require('cors')
const app = express()

const bodyParser = express.json()
app.use(bodyParser)

const usersRoutes = require('./routes/users.js')
const auth = require('./middleware/auth.js')

const port = process.env.PORT || 8000

app.use(cors())

app.use('/users', usersRoutes)

app.get('/', function (_, res) {
    res.send('Hello World')
})

// test auth middleware
app.get('/test', auth, function(req, res) {
    if (req.user.email === 'test@test.com') {
        res.status(200).send(true)
    } else {
        res.status(400).send(false)
    }
})

app.listen(port, function () { console.log(`server listening on port ${port}`) })

