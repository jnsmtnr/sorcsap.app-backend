import { ObjectId } from 'bson'
import { Router } from 'express'
import { auth, isAdmin } from '../middleware/auth.js'
import getClient from '../mongodb.js'

const router = Router()

router.get('/', auth, isAdmin, async function (req, res) {
    const client = getClient()

    try {
        await client.connect()

        const ratings = client.db().collection('ratings')

        const newBeers = await ratings.find({ beerId: { $exists: false } }).toArray()

        res.status(200).send(newBeers)
    }
    catch (error) {
        res.status(400).send({ message: error.message })
    }
    finally {
        client.close()
    }
})

router.post('/', auth, async function (req, res) {
    const client = getClient()

    const userId = new ObjectId(req.user.id)
    const name = req.body.name
    const brewery = req.body.brewery
    const type = req.body.type
    const alc = req.body.alc
    const rating = req.body.rating

    try {
        await client.connect()

        const beers = client.db().collection('beers')

        const beer = await beers.findOne({ name })

        if (beer) throw new Error('Beer already exists')

        const ratings = client.db().collection('ratings')

        const newBeer = await ratings.findOne({ name, userId })

        if (newBeer) throw new Error('Rating already exists')

        await ratings.insertOne({ userId, name, brewery, type, alc, rating })

        res.sendStatus(201)
    }
    catch (error) {
        res.status(400).send({ message: error.message })
    }
    finally {
        client.close()
    }
})

export default router
