import { Router } from 'express'
import getClient from '../mongodb.js'
import { auth } from '../middleware/auth.js'
import { ObjectId } from 'mongodb'

const router = Router()

router.post('/', auth, async function (req, res) {
    const client = getClient()

    let beerId = req.body.beerId
    const beerRating = req.body.rating

    if (typeof beerId !== 'string' || typeof beerRating !== 'number' || beerRating > 5 || beerRating < 1) {
        return res.sendStatus(400)
    }

    try {
        const userId = new ObjectId(req.user.id)
        beerId = new ObjectId(req.body.beerId)

        await client.connect()

        const ratings = client.db().collection('ratings')

        const rating = await ratings.findOne({ beerId, userId })

        if (rating) throw new Error('Rating already exists')

        await ratings.insertOne({ beerId, userId, rating: beerRating })

        res.sendStatus(201)
    }
    catch (error) {
        res.status(400).send({ message: error.message })
    }
    finally {
        client.close()
    }
})

router.patch('/:id', auth, async function (req, res) {
    const client = getClient()

    const { rating } = req.body

    if (typeof rating !== 'number' || rating > 5 || rating < 1) {
        return res.sendStatus(400)
    }

    try {
        const userId = new ObjectId(req.user.id)
        const id = new ObjectId(req.params.id)
        
        await client.connect()

        const ratings = client.db().collection('ratings')

        await ratings.updateOne({ _id: id, userId }, { $set: { rating } })

        res.sendStatus(201)
    }
    catch (error) {
        res.status(400).send({ message: error.message })
    }
    finally {
        client.close()
    }
})

router.delete('/:id', auth, async function (req, res) {
    const client = getClient()

    try {
        const id = new ObjectId(req.params.id)
        const userId = new ObjectId(req.user.id)

        await client.connect()

        const ratings = client.db().collection('ratings')

        await ratings.deleteOne({ _id: id, userId })

        res.sendStatus(201)
    }
    catch (error) {
        res.status(400).send({ message: error.message })
    }
    finally {
        client.close()
    }
})

router.get('/', auth, async function (req, res) {
    const client = getClient()

    try {
        const userId = new ObjectId(req.user.id)

        await client.connect()

        const ratings = client.db().collection('ratings')

        const userRatings = await ratings.find({ userId }).project({ userId: 0 }).toArray()

        res.status(200).send(userRatings)
    }
    catch (error) {
        res.status(400).send({ message: error.message })
    }
    finally {
        client.close()
    }
})

export default router
