const express = require('express')
const app = express()

const bodyParser = express.json()
app.use(bodyParser)

const usersRoutes = require('./routes/users.js')

const port = process.env.PORT || 8000

app.use('/users', usersRoutes)

app.get('/', function (_, res) {
    res.send('Hello World')
})

app.listen(port, function () { console.log(`server listening on port ${port}`) })

