import { v4 as uuidv4 } from 'uuid'
class BaseError extends Error {
    errorType
    state
    constructor({ message, errorType, state }) {
        super(message)
        this.name = new.target.name
        this.errorType = errorType
        this.state = state
        Error.captureStackTrace(this, this.constructor)
    }
}
//Error custom classes
export class ValidationError extends BaseError {
    constructor({ message, errorType, state }) {
        super({ message, errorType, state })
    }
}
export class TransformError extends BaseError {
    constructor({ message, errorType, state }) {
        super({ message, errorType, state })
    }
}
export class SiteDeploymentError extends BaseError {
    domain
    constructor({ message, domain, errorType, state }) {
        super({ message, errorType, state })
        this.domain = domain
    }
}
export class DataUploadError extends BaseError {
    domain
    constructor({ message, domain, errorType, state }) {
        super({ message, errorType, state })
        this.domain = domain
    }
}
const errorStatus = 'Error'
// Handles all types of errors and calls the specified error class
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Vycm9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsRUFBRSxJQUFJLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQTtBQThDbkMsTUFBZSxTQUFVLFNBQVEsS0FBSztJQUMzQixTQUFTLENBQVE7SUFDakIsS0FBSyxDQUFZO0lBRXhCLFlBQVksRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBYztRQUNqRCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDZCxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFBO1FBQzNCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO1FBQzFCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO1FBQ2xCLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBQ25ELENBQUM7Q0FDSjtBQUVELHNCQUFzQjtBQUN0QixNQUFNLE9BQU8sZUFBZ0IsU0FBUSxTQUFTO0lBQzFDLFlBQVksRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBdUI7UUFDMUQsS0FBSyxDQUFDLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFBO0lBQ3hDLENBQUM7Q0FDSjtBQUVELE1BQU0sT0FBTyxjQUFlLFNBQVEsU0FBUztJQUN6QyxZQUFZLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQXNCO1FBQ3pELEtBQUssQ0FBQyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQTtJQUN4QyxDQUFDO0NBQ0o7QUFFRCxNQUFNLE9BQU8sbUJBQW9CLFNBQVEsU0FBUztJQUN2QyxNQUFNLENBQVE7SUFFckIsWUFBWSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVB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
