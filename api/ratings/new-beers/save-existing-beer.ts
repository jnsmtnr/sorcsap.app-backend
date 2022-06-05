import { VercelResponse } from '@vercel/node'
import { ObjectId } from 'mongodb'

import getClient from '../../../mongodb'
import auth from '../../../auth'
import { Request } from '../../../types'

export default async function (req: Request, res: VercelResponse) {
    if (req.method === 'OPTIONS') return res.status(200).json({ body: "OK" })

    if (req.method !== 'POST') return res.status(404).send('not found')

    if (!auth(req) || !req.user.admin) return res.status(401).send('auth error')

    const client = getClient()

    const { beerId, ratingIds } = req.body as { beerId: string, ratingIds: string[] }

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

        res.status(201).send('ok')
    }
    catch (e: any) {
        res.status(500).send({ message: e.message })
    }
    finally {
        client.close()
    }
}
