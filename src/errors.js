export class ValidationError extends Error {
    constructor({ message, errorID, erroredFields }) {
        super(message)
        this.name = 'ValidationError'
        this.erroredFields = erroredFields
        this.errorID = errorID
        Error.captureStackTrace(this, this.constructor)
    }
}

export class TransformError extends Error {
    constructor(message) {
        super(message)
        this.name = 'TransformError'
        this.errorID = errorID
        Error.captureStackTrace(this, this.constructor)
    }
}

export class SiteDeploymentError extends Error {
    constructor({ message, domain, errorID }) {
        super(message)
        this.name = 'SiteDeploymentError'
        this.domain = domain
        this.errorID = errorID
        Error.captureStackTrace(this, this.constructor)
    }
}

const errorStatus = 'Error'

//Handles all types of errors and calls the specificed error class
export const handleError = (err, res, url = '') => {
    console.error(err)
    if (err instanceof ValidationError) {
        res.status(400).json({
            message: err.message,
            domain: err.domain,
            errorID: err.errorID,
            erroredFields: err.erroredFields,
            status: errorStatus,
        })
    } else if (err instanceof TransformError) {
        res.status(400).json({ message: 'Error transforming site data: ' + err.message, domain: url, errorID: err.errorID, status: errorStatus })
    } else if (err instanceof SiteDeploymentError) {
        res.status(500).json({
            message: 'Error creating site:' + err.message,
            domain: err.domain,
            errorID: err.errorID,
            status: errorStatus,
        })
    } else {
        res.status(500).json({ message: 'An unexpected error occurred:' + err.message, status: errorStatus, domain: url })
    }
}
