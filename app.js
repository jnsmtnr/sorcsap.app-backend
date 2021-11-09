import express, { json } from 'express'
import cors from 'cors'
import usersRoutes from './routes/users.js'
import beersRoutes from './routes/beers.js'
import ratingsRoutes from './routes/ratings.js'

const port = process.env.PORT || 8000

const app = express()

app.use(json())
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS.split(',')
}))

app.use('/users/ratings', ratingsRoutes)
app.use('/users', usersRoutes)
app.use('/beers', beersRoutes)

app.get('/', function (_, res) {
    res.send('Hello World')
})

app.listen(port, function () { console.log(`server listening on port ${port}`) })
