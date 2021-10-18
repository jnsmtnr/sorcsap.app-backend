import express, { json } from 'express'
import cors from 'cors'
import usersRoutes from './routes/users.js'

const port = process.env.PORT || 8000

const app = express()

app.use(json())
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS.split(',')
}))

app.use('/users', usersRoutes)

app.get('/', function (_, res) {
    res.send('Hello World')
})

app.listen(port, function () { console.log(`server listening on port ${port}`) })
