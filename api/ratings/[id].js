import { ObjectId } from 'mongodb'

import getClient from '../../mongodb.js'
import auth from '../../middleware/_auth.js'

export default async function (req, res) {
    if (req.method === 'OPTIONS') return res.status(200).json({ body: "OK" })

    if (req.method !== 'PATCH' && req.method !== 'DELETE') return res.status(404).send('not found')
    
    if (req.method === 'PATCH') {
        if (!auth(req)) return res.status(401).send('auth error')

        const client = getClient()

        const { rating } = req.body

        if (typeof rating !== 'number' || rating > 5 || rating < 1) {
            return res.status(400).send(400)
        }

        try {
            const userId = new ObjectId(req.user.id)
            const id = new ObjectId(req.query.id)

            await client.connect()

            const ratings = client.db().collection('ratings')

            await ratings.updateOne({ _id: id, userId }, { $set: { rating } })

            res.status(201).send()
        }
        catch (error) {
            res.status(400).send({ message: error.message })
        }
        finally {
            client.close()
        }
    }

    if (req.method === 'DELETE') {
        if (!auth(req)) return res.status(401).send('auth error')

        const client = getClient()

        try {
            const id = new ObjectId(req.query.id)
            const userId = new ObjectId(req.user.id)

            await client.connect()

            const ratings = client.db().collection('ratings')

            await ratings.deleteOne({ _id: id, userId })

            res.status(201).send()
        }
        catch (error) {
            res.status(400).send({ message: error.message })
        }
        finally {
            client.close()
        }
    }
}
