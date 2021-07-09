const express = require('express')
const app = express()

const bodyParser = express.json()
app.use(bodyParser)

const port = process.env.PORT || 8000

const getClient = require('./mongodb.js')

app.get('/', function (req, res) {
    res.send('Hello World')
})

app.get('/test', async function (req, res) {
    const client = getClient()

    await client.connect()

    const test = client.db('test').collection('test')

    const data = await test.find().toArray()

    await client.close()

    res.send({ data })
})

app.post('/test', async function (req, res) {
    const client = getClient()

    await client.connect()

    const test = client.db('test').collection('test')

    const response = await test.insertOne({ ...req.body })

    await client.close()

    res.send(response)
})

app.listen(port, function () { console.log(`server listening on port ${port}`) })

