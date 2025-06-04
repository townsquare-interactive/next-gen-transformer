import { v4 as uuidv4 } from 'uuid'
import { Response } from 'express'
import { LandingReq } from '../schema/input-zod.js'
import { Dns } from '../../types.js'
import { addFileS3, getFileS3 } from './s3Functions.js'
import { s3ScrapedSitesFolder } from '../api/scrapers/constants.js'
import { convertUrlToApexId } from './utils.js'
import { ScrapedAndAnalyzedSiteData } from '../schema/output-zod.js'

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
        pages?: string[]
    } & ErrorState
}

interface ValidationErrorType extends ErrorClass {
    state: {
        erroredFields?: ErroredFields[]
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
        dudaErrorCode?: string
        dudaErrorStatus?: number
        missingFields?: string[]
    } & ErrorState
}

interface AuthorizationErrorType extends ErrorClass {
    state: ErrorState
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

export class AuthorizationError extends BaseError {
    constructor({ message, errorType, state }: AuthorizationErrorType) {
        super({ message, errorType, state })
    }
}

const errorStatus = 'Error'

async function uploadErrorDataToService(error: BaseError, errorId: string, url = '', res: Response) {
    try {
        const currentDate = new Date().toISOString().split('T')[0]

        const errorData = {
            id: errorId,
            message: error.message,
            error: error,
            stack: error.stack,
            date: currentDate,
        }

        const basePath = convertUrlToApexId(url)

        const folderPath = `${s3ScrapedSitesFolder}errors/${currentDate}/${basePath}`
        await addFileS3(errorData, folderPath, 'json')

        //add to error field in current siteData file
        if (url) {
            const siteDataFilePath = `${s3ScrapedSitesFolder}${basePath}/scraped/siteData`
            const siteData: ScrapedAndAnalyzedSiteData = await getFileS3(siteDataFilePath + '.json', null)
            if (siteData) {
                siteData.error = errorData
                await addFileS3(siteData, siteDataFilePath, 'json')
            } else {
                await addFileS3({ error: errorData }, siteDataFilePath, 'json')
            }
        }

        return error
    } catch (err) {
        console.log('error ocurred while trying to upload error data', err)
        //handle error without uploading
        handleError(error, res, url, true, false)
    }
}

// Handles all types of errors and calls the specified error class
export const handleError = async (err: BaseError, res: Response, url: string = '', sendResponse: boolean = true, uploadErrorData = false) => {
    const errorID = uuidv4()

    const errorData = {
        errorType: err.errorType,
        state: err.state,
        error: err,
    }

    const errorIDMessage = ` (Error ID: ${errorID})`

    // Log the error with the unique ID
    console.error(`[Error ID: ${errorID}]`, errorData, `${err.stack}`)

    //upload error details to s3
    if (uploadErrorData) {
        await uploadErrorDataToService(err, errorID, url, res)
    }

    if (sendResponse) {
        let statusType = null

        if (err.errorType === 'AMS-006') {
            statusType = 404
        }

        if (err.errorType === 'GEN-003') {
            statusType = 500
        }

        if (err.errorType === 'DUD-019') {
            statusType = 404
        }

        if (err instanceof ValidationError) {
            res.status(statusType || 400).json({
                id: errorID,
                errorType: err.errorType,
                message: err.message + errorIDMessage,
                state: err.state,
                status: errorStatus,
            })
        } else if (err instanceof TransformError) {
            res.status(statusType || 500).json({
                id: errorID,
                errorType: err.errorType,
                message: 'Error transforming site data: ' + err.message + errorIDMessage,
                domain: url,
                state: err.state,
                status: errorStatus,
            })
        } else if (err instanceof SiteDeploymentError) {
            res.status(statusType || 500).json({
                id: errorID,
                errorType: err.errorType,
                message: 'Error with site deployment: ' + err.message + errorIDMessage,
                domain: err.domain,
                state: err.state,
                status: errorStatus,
            })
        } else if (err instanceof DataUploadError) {
            res.status(statusType || 500).json({
                id: errorID,
                errorType: err.errorType,
                message: 'Error uploading data: ' + err.message + errorIDMessage,
                domain: err.domain,
                state: err.state,
                status: errorStatus,
            })
        } else if (err instanceof ScrapingError) {
            res.status(statusType || 400).json({
                id: errorID,
                errorType: err.errorType,
                message: 'Scraping Error: ' + err.message + errorIDMessage,
                domain: url,
                state: err.state,
                status: errorStatus,
            })
        } else if (err instanceof AuthorizationError) {
            res.status(statusType || 401).json({
                id: errorID,
                errorType: err.errorType,
                message: err.message + errorIDMessage,
                state: err.state,
                status: errorStatus,
            })
        } else {
            res.status(statusType || 500).json({
                id: errorID,
                errorType: 'GEN-003',
                message: 'An unexpected error occurred: ' + err.message + errorIDMessage,
                status: errorStatus,
                state: err.state,
                domain: url,
            })
        }
    }
}
