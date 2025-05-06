import { AuthorizationError, ValidationError } from '../../utilities/errors.js'
import { Request } from 'express'

export default (req: Request): { vercelLogUrl?: string } => {
    try {
        const authHeader = req.headers['authorization']
        if (!authHeader) {
            throw new AuthorizationError({
                message: 'No authorization header present',
                errorType: 'AUT-017',
                state: {},
            })
        }

        const token = authHeader.split(' ')[1] // Extract the token (Bearer <token>)
        if (token !== process.env.TRANSFORMER_API_KEY) {
            throw new AuthorizationError({
                message: 'Incorrect authorization bearer token',
                errorType: 'AUT-017',
                state: {},
            })
        }

        //get vercel request id url if available
        const requestId = req.headers['x-vercel-id']
        let vercelLogUrl: string | undefined
        if (requestId) {
            try {
                const vercelLogBaseUrl = 'https://vercel.com/townsquare-interactive/apex-transformer/logs?selectedLogId='
                const strippedRequestId = requestId.toString().split('::')[1] // Split on '::' and take second part
                vercelLogUrl = vercelLogBaseUrl + strippedRequestId
                return { vercelLogUrl }
            } catch (error) {
                console.log('Failed to process Vercel request ID:', requestId, error)
            }
        }

        return { vercelLogUrl }
    } catch (err) {
        if (err instanceof AuthorizationError) {
            throw err
        }
        throw new ValidationError({
            message: 'Error attempting to validate Bearer token: ' + err.message,
            errorType: 'VAL-015',
            state: {},
        })
    }
}
