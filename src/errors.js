import { v4 as uuidv4 } from 'uuid'
export class ValidationError extends Error {
    constructor({ message, errorType, state }) {
        super(message)
        this.name = 'ValidationError'
        this.state = state
        this.errorType = errorType
        Error.captureStackTrace(this, this.constructor)
    }
}

export class TransformError extends Error {
    constructor(message, errorType, state) {
        super(message)
        this.name = 'TransformError'
        this.state = state
        this.errorType = errorType
        Error.captureStackTrace(this, this.constructor)
    }
}

export class SiteDeploymentError extends Error {
    constructor({ message, domain, errorType, state }) {
        super(message)
        this.name = 'SiteDeploymentError'
        this.state = state
        this.domain = domain
        this.errorType = errorType
        Error.captureStackTrace(this, this.constructor)
    }
}

export class DataUploadError extends Error {
    constructor({ message, domain, errorType, state }) {
        super(message)
        this.name = 'DataUploadError'
        this.state = state
        this.domain = domain
        this.errorType = errorType
        Error.captureStackTrace(this, this.constructor)
    }
}

const errorStatus = 'Error'

//Handles all types of errors and calls the specificed error class
export const handleError = (err, res, url = '') => {
    const errorID = uuidv4()

    const errorData = {
        errorType: err.errorType,
        state: err.state,
    }

    const errorIDMessage = ` (Error ID: ${errorID})`

    // Log the error with the unique ID
    console.error(`[Error ID: ${errorID}]`, errorData, `${err.stack}`)
    if (err instanceof ValidationError) {
        res.status(400).json({
            id: errorID,
            errorType: err.errorType,
            message: err.message + errorIDMessage,
            domain: err.domain,
            state: err.state,
            status: errorStatus,
        })
    } else if (err instanceof TransformError) {
        res.status(400).json({
            id: errorID,
            errorType: err.errorType,
            message: 'Error transforming site data: ' + err.message + errorIDMessage,
            domain: url,
            status: errorStatus,
        })
    } else if (err instanceof SiteDeploymentError) {
        res.status(500).json({
            id: errorID,
            errorType: err.errorType,
            message: 'Error creating site: ' + err.message + errorIDMessage,
            domain: err.domain,
            status: errorStatus,
        })
    } else if (err instanceof DataUploadError) {
        res.status(500).json({
            id: errorID,
            errorType: err.errorType,
            message: 'Error uploading to S3: ' + err.message + errorIDMessage,
            domain: err.domain,
            status: errorStatus,
        })
    } else {
        res.status(500).json({
            id: errorID,
            errorType: 'GEN-003',
            message: 'An unexpected error occurred:' + err.message + errorIDMessage,
            status: errorStatus,
            domain: url,
        })
    }
}
