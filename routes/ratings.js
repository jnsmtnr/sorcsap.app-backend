import { Router } from 'express'
import getClient from '../mongodb.js'
import { auth } from '../middleware/auth.js'

const router = Router()

router.post('/', auth, async function (req, res) {
    const client = getClient()

    const { email } = req.user

    const { id, rating } = req.body

    try {
        await client.connect()

        const users = client.db().collection('users')

        const { ratings } = await users.findOne({ email })

        if (ratings.find((rating) => rating.id === id)) throw new Error('Rating already exists')

        await users.updateOne({ email }, { $push: { ratings: { id, rating } } })

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

    const { email } = req.user
    const { id } = req.params
    const { rating } = req.body

    try {
        await client.connect()

        const users = client.db().collection('users')

        await users.updateOne(
            { email }, 
            { $set: { "ratings.$[beer].rating": rating } }, 
            { arrayFilters: [{ "beer.id": id }] }
        )

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
