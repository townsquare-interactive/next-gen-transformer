import { v4 as uuidv4 } from 'uuid'
import { Response } from 'express'
import { LandingReq } from '../schema/input-zod'
import { Dns } from '../../types'

//Type declarations
interface ErrorState {
    req?: LandingReq
    fileStatus?: string
}

interface ErrorClass {
    message: string
    errorType: string
    state: ErrorState
}

interface SiteDeploymentErrorType extends ErrorClass {
    domain: string
    state: {
        domainStatus?: string
        dns?: Dns[]
        dataStatus?: string
    } & ErrorState
}

interface TransformErrorType extends ErrorClass {
    state: {
        siteStatus: string
    } & ErrorState
}

interface ScrapingErrorType extends ErrorClass {
    domain: string
    state: {
        scrapeStatus?: string
        method?: string
    } & ErrorState
}

interface ValidationErrorType extends ErrorClass {
    state: {
        erroredFields: ErroredFields[]
    } & ErrorState
}

interface ErroredFields {
    fieldPath: string[]
    message: string
}

interface DataUploadErrorType extends ErrorClass {
    domain: string
    state: {
        fileStatus: string
    } & ErrorState
}

abstract class BaseError extends Error {
    public errorType: string
    public state: ErrorState

    constructor({ message, errorType, state }: ErrorClass) {
        super(message)
        this.name = new.target.name
        this.errorType = errorType
        this.state = state
        Error.captureStackTrace(this, this.constructor)
    }
}

//Error custom classes
export class ValidationError extends BaseError {
    constructor({ message, errorType, state }: ValidationErrorType) {
        super({ message, errorType, state })
    }
}

export class TransformError extends BaseError {
    constructor({ message, errorType, state }: TransformErrorType) {
        super({ message, errorType, state })
    }
}

export class SiteDeploymentError extends BaseError {
    public domain: string

    constructor({ message, domain, errorType, state }: SiteDeploymentErrorType) {
        super({ message, errorType, state })
        this.domain = domain
    }
}

export class DataUploadError extends BaseError {
    public domain: string

    constructor({ message, domain, errorType, state }: DataUploadErrorType) {
        super({ message, errorType, state })
        this.domain = domain
    }
}

//Error custom classes
export class ScrapingError extends BaseError {
    public domain: string

    constructor({ message, domain, errorType, state }: ScrapingErrorType) {
        super({ message, errorType, state })
        this.domain = domain
    }
}

export class MegError extends BaseError {
    public domain: string

    constructor({ message, domain, errorType, state }: DataUploadErrorType) {
        super({ message, errorType, state })
        this.domain = domain
    }
}

const errorStatus = 'Error'

// Handles all types of errors and calls the specified error class
export const handleError = (err: BaseError, res: Response, url: string = '') => {
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
            state: err.state,
            status: errorStatus,
        })
    } else if (err instanceof TransformError) {
        res.status(400).json({
            id: errorID,
            errorType: err.errorType,
            message: 'Error transforming site data: ' + err.message + errorIDMessage,
            domain: url,
            state: err.state,
            status: errorStatus,
        })
    } else if (err instanceof SiteDeploymentError) {
        res.status(500).json({
            id: errorID,
            errorType: err.errorType,
            message: 'Error with site deployment: ' + err.message + errorIDMessage,
            domain: err.domain,
            state: err.state,
            status: errorStatus,
        })
    } else if (err instanceof DataUploadError) {
        res.status(500).json({
            id: errorID,
            errorType: err.errorType,
            message: 'Error uploading to S3: ' + err.message + errorIDMessage,
            domain: err.domain,
            state: err.state,
            status: errorStatus,
        })
    } else if (err instanceof ScrapingError) {
        res.status(400).json({
            id: errorID,
            errorType: err.errorType,
            message: 'Scraping Error: ' + err.message + errorIDMessage,
            domain: url,
            state: err.state,
            status: errorStatus,
        })
    } else {
        res.status(500).json({
            id: errorID,
            errorType: 'GEN-003',
            message: 'An unexpected error occurred: ' + err.message + errorIDMessage,
            status: errorStatus,
            state: err.state,
            domain: url,
        })
    }
}
