import { VercelResponse } from '@vercel/node'
import bcrypt from 'bcrypt'
import { ObjectId } from 'mongodb'

import getClient from '../../mongodb'
import auth from '../../auth'
import { Request } from '../../types'

export default async function(req: Request, res: VercelResponse) {
    if (req.method === 'OPTIONS') {
        return res.status(200).json(({
            body: "OK"
        }))
    }

    if (req.method !== 'PATCH' && req.method !== 'DELETE') return res.status(404).send('not found');

    if (!auth(req) || !req.user.admin) return res.status(401).send('auth error')

    if (req.method === 'PATCH') {
        const client = getClient()

        try {
            await client.connect()

            const users = client.db().collection('users')

            const setObject: any = {}
            const unsetObject: any = {}

            if (req.body.email) {
                setObject.email = req.body.email
            }

            if (req.body.password) {
                setObject.password = await bcrypt.hash(req.body.password, 10)
            }

            if (req.body.admin) {
                setObject.admin = true
            }

            if (req.body.admin === false) {
                unsetObject.admin = ''
            }

            await users.updateOne({ _id: new ObjectId(req.query.id as string) }, { $set: setObject, $unset: unsetObject })

            res.status(201).send('ok')
        }
        catch (e: any) {
            res.status(500).send({ message: e.message })
        }
        finally {
            client.close()
        }
    }

    if (req.method === 'DELETE') {
        const client = getClient()

        try {
            await client.connect()

            const ratings = client.db().collection('ratings')

            await ratings.deleteMany({ userId: new ObjectId(req.query.id as string) })

            const users = client.db().collection('users')

            await users.deleteOne({ _id: new ObjectId(req.query.id as string) })

            res.status(201).send('ok')
        }
        catch (e: any) {
            res.status(500).send({ message: e.message })
        }
        finally {
            client.close()
        }
    }
}
