import { ObjectId } from 'mongodb'

import getClient from '../../../mongodb.js'
import auth from '../../../middleware/_auth.js'

export default async function (req, res) {
    if (req.method === 'OPTIONS') return res.status(200).json({ body: "OK" })

    if (req.method !== 'POST') return res.status(404).send('not found')

    if (!auth(req) || !req.user.admin) return res.status(401).send('auth error')

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

        res.status(201).send()
    }
    catch (error) {
        res.status(500).send({ message: error.message })
    }
    finally {
        client.close()
    }
}
