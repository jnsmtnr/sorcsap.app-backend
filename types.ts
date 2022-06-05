import { VercelRequest } from '@vercel/node'

export interface Request extends VercelRequest {
    user: {
        email: string,
        id: string,
        admin?: boolean
    }
}
