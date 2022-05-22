import { ObjectId } from 'mongodb'

import getClient from '../../../mongodb.js'
import auth from '../../../auth.js'

export default async function (req, res) {
    if (req.method === 'OPTIONS') return res.status(200).json({ body: "OK" })

    if (req.method !== 'GET' && req.method !== 'POST') return res.status(404).send('not found')

    if (req.method === 'GET') {
        if (!auth(req) || !req.user.admin) return res.status('401').send('auth error')

        const client = getClient()

        try {
            await client.connect()

            const ratings = client.db().collection('ratings')

            const newBeers = await ratings.find({ beerId: { $exists: false } }).toArray()

            res.status(200).send(newBeers)
        }
        catch (error) {
            res.status(500).send({ message: error.message })
        }
        finally {
            client.close()
        }
    }

    if (req.method === 'POST') {
        if (!auth(req)) return res.status(401).send('auth error')

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
            return res.status(400).send()
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
