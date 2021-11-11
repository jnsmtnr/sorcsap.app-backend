import { Router } from 'express'
import getClient from '../mongodb.js'
import { auth } from '../middleware/auth.js'
import { ObjectId } from 'mongodb'

const router = Router()

router.post('/', auth, async function (req, res) {
    const client = getClient()

    const userId = new ObjectId(req.user.id)
    const beerId = new ObjectId(req.body.beerId)
    const beerRating = req.body.rating

    try {
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

    const userId = new ObjectId(req.user.id)
    const id = new ObjectId(req.params.id)
    const { rating } = req.body

    try {
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

    const id = new ObjectId(req.params.id)
    const userId = new ObjectId(req.user.id)

    try {
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

export default router
