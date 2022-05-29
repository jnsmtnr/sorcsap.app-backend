import { ObjectId } from 'mongodb'

import getClient from '../../mongodb.js'
import auth from '../../auth.js'

export default async function (req, res) {
    if (req.method === 'OPTIONS') return res.status(200).json({ body: "OK" })

    if (req.method !== 'GET' && req.method !== 'POST') return res.status(404).send('not found')

    if (req.method === 'GET') {
        if (!auth(req)) return res.status(401).send('auth error')

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
    }

    if (req.method === 'POST') {
        if (!auth(req)) return res.status(401).send('auth error')

        const client = getClient()

        let beerId = req.body.beerId
        const beerRating = req.body.rating

        if (typeof beerId !== 'string' || typeof beerRating !== 'number' || beerRating > 5 || beerRating < 1) {
            return res.status(400).send()
        }

        try {
            const userId = new ObjectId(req.user.id)
            beerId = new ObjectId(req.body.beerId)

            await client.connect()

            const ratings = client.db().collection('ratings')

            const rating = await ratings.findOne({ beerId, userId })

            if (rating) {
                return res.status(409).send({ message: 'Rating already exits', rating: rating.rating })
            }

            await ratings.insertOne({ beerId, userId, rating: beerRating })

            res.status(201).send()
        }
        catch (error) {
            res.status(500).send({ message: error.message })
        }
        finally {
            client.close()
        }
    }
}
