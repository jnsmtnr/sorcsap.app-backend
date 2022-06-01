import getClient from '../../mongodb.js'
import auth from '../../auth.js'

export default async function(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).json(({
            body: "OK"
        }))
    }

    if (req.method !== 'GET') return res.status(404).send('not found');

    if (!auth(req) || !req.user.admin) return res.status(401).send('auth error')

    const client = getClient()

    try {
        await client.connect()

        const users = client.db().collection('users')

        const allUsers = await users.find().project({ password: 0 }).toArray()

        const ratings = client.db().collection('ratings')

        const userRatings = await ratings.aggregate([
            { $group: { _id: '$userId', count: { $sum: 1 } } }
        ]).toArray()
        
        allUsers.forEach(user => {
            user.ratings = userRatings.find(rating => rating._id.toString() === user._id.toString())?.count || 0
        })

        res.send(allUsers)
    }
    catch (error) {
        res.status(401).send({ message: error.message })
    }
    finally {
        client.close()
    }
}
