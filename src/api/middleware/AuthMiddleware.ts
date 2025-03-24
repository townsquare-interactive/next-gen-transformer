import { AuthorizationError, ValidationError } from '../../utilities/errors.js'
import { Request } from 'express'

export default (req: Request): void => {
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
