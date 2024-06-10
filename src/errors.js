export class ValidationError extends Error {
    constructor(message) {
        super(message)
        this.name = 'ValidationError'
    }
}

export class TransformError extends Error {
    constructor(message) {
        super(message)
        this.name = 'TransformError'
    }
}

export class SiteDeploymentError extends Error {
    constructor(message) {
        super(message)
        this.name = 'SiteDeploymentError'
    }
}

export const handleError = (err, res, url) => {
    console.error(err)
    if (err instanceof ValidationError) {
        res.status(400).json({ message: 'Incorrect data structure received: ' + err.message, status: 'Error', domain: url })
    } else if (err instanceof TransformError) {
        res.status(500).json({ message: 'Error transforming site data: ' + err.message, status: 'Error', domain: url })
    } else if (err instanceof SiteDeploymentError) {
        res.status(500).json({ message: 'Error creating site: ' + err.message, status: 'Error', domain: url })
    } else {
        res.status(500).json({ message: 'An unexpected error occurred:' + err.message, status: 'Error', domain: url })
    }
}
