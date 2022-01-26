import { ObjectId } from 'mongodb'
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

    const name = req.body.name
    const brewery = req.body.brewery
    const type = req.body.type
    const alc = req.body.alc
    const rating = req.body.rating

    if (
        !name || typeof name !== 'string' || name.length > 64 ||
        typeof brewery !== 'string' || brewery.length > 64 ||
        typeof alc !== 'number' || alc > 100 ||
        typeof type !== 'string' || type.length > 64 ||
        !rating || typeof rating !== 'number' || rating < 1 || rating > 5
    ) {
        return res.sendStatus(400)
    }

    try {
        const userId = new ObjectId(req.user.id)

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

router.post('/save-new-beer', auth, isAdmin, async function (req, res) {
    const client = getClient()

    const { name, brewery, alc, type, ratingIds } = req.body

    try {
        await client.connect()

        const beers = client.db().collection('beers')

        const response = await beers.insertOne({ name, brewery, alc, type })

        const newBeerId = response.insertedId

        const ratings = client.db().collection('ratings')

        await ratings.updateMany(
            { _id: { $in: ratingIds.map(id => new ObjectId(id)) } },
            {
                $set: { beerId: newBeerId },
                $unset: { name: '', brewery: '', type: '', alc: '' }
            }
        )

        res.sendStatus(201)
    }
    catch (error) {
        res.status(401).send({ message: error.message })
    }
    finally {
        client.close()
    }
})

router.post('/save-existing-beer', auth, isAdmin, async function(req,res) {
    const client = getClient()

    const { beerId, ratingIds } = req.body

    try {
        await client.connect()

        const ratings = client.db().collection('ratings')

        await ratings.updateMany(
            { _id: { $in: ratingIds.map(id => new ObjectId(id)) } },
            {
                $set: { beerId },
                $unset: { name: '', brewery: '', type: '', alc: '' }
            }
        )

        res.sendStatus(201)
    }
    catch (error) {
        res.status(401).send({ message: error.message })
    }
    finally {
        client.close()
    }
})

export default router
