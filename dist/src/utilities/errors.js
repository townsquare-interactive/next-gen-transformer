import { v4 as uuidv4 } from 'uuid';
class BaseError extends Error {
    errorType;
    state;
    constructor({ message, errorType, state }) {
        super(message);
        this.name = new.target.name;
        this.errorType = errorType;
        this.state = state;
        Error.captureStackTrace(this, this.constructor);
    }
}
//Error custom classes
export class ValidationError extends BaseError {
    constructor({ message, errorType, state }) {
        super({ message, errorType, state });
    }
}
export class TransformError extends BaseError {
    constructor({ message, errorType, state }) {
        super({ message, errorType, state });
    }
}
export class SiteDeploymentError extends BaseError {
    domain;
    constructor({ message, domain, errorType, state }) {
        super({ message, errorType, state });
        this.domain = domain;
    }
}
export class DataUploadError extends BaseError {
    domain;
    constructor({ message, domain, errorType, state }) {
        super({ message, errorType, state });
        this.domain = domain;
    }
}
//Error custom classes
export class ScrapingError extends BaseError {
    domain;
    constructor({ message, domain, errorType, state }) {
        super({ message, errorType, state });
        this.domain = domain;
    }
}
export class MegError extends BaseError {
    domain;
    constructor({ message, domain, errorType, state }) {
        super({ message, errorType, state });
        this.domain = domain;
    }
}
const errorStatus = 'Error';
// Handles all types of errors and calls the specified error class
export const handleError = (err, res, url = '') => {
    const errorID = uuidv4();
    const errorData = {
        errorType: err.errorType,
        state: err.state,
    };
    const errorIDMessage = ` (Error ID: ${errorID})`;
    // Log the error with the unique ID
    console.error(`[Error ID: ${errorID}]`, errorData, `${err.stack}`);
    if (err instanceof ValidationError) {
        res.status(400).json({
            id: errorID,
            errorType: err.errorType,
            message: err.message + errorIDMessage,
            state: err.state,
            status: errorStatus,
        });
    }
    else if (err instanceof TransformError) {
        res.status(400).json({
            id: errorID,
            errorType: err.errorType,
            message: 'Error transforming site data: ' + err.message + errorIDMessage,
            domain: url,
            state: err.state,
            status: errorStatus,
        });
    }
    else if (err instanceof SiteDeploymentError) {
        res.status(500).json({
            id: errorID,
            errorType: err.errorType,
            message: 'Error with site deployment: ' + err.message + errorIDMessage,
            domain: err.domain,
            state: err.state,
            status: errorStatus,
        });
    }
    else if (err instanceof DataUploadError) {
        res.status(500).json({
            id: errorID,
            errorType: err.errorType,
            message: 'Error uploading to S3: ' + err.message + errorIDMessage,
            domain: err.domain,
            state: err.state,
            status: errorStatus,
        });
    }
    else if (err instanceof ScrapingError) {
        res.status(400).json({
            id: errorID,
            errorType: err.errorType,
            message: 'Error scraping URL ' + err.message + errorIDMessage,
            domain: err.domain,
            state: err.state,
            status: errorStatus,
        });
    }
    else {
        res.status(500).json({
            id: errorID,
            errorType: 'GEN-003',
            message: 'An unexpected error occurred: ' + err.message + errorIDMessage,
            status: errorStatus,
            state: err.state,
            domain: url,
        });
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9lcnJvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLEVBQUUsSUFBSSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUE7QUF3RG5DLE1BQWUsU0FBVSxTQUFRLEtBQUs7SUFDM0IsU0FBUyxDQUFRO0lBQ2pCLEtBQUssQ0FBWTtJQUV4QixZQUFZLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQWM7UUFDakQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ2QsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQTtRQUMzQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtRQUMxQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtRQUNsQixLQUFLLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtJQUNuRCxDQUFDO0NBQ0o7QUFFRCxzQkFBc0I7QUFDdEIsTUFBTSxPQUFPLGVBQWdCLFNBQVEsU0FBUztJQUMxQyxZQUFZLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQXVCO1FBQzFELEtBQUssQ0FBQyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQTtJQUN4QyxDQUFDO0NBQ0o7QUFFRCxNQUFNLE9BQU8sY0FBZSxTQUFRLFNBQVM7SUFDekMsWUFBWSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFzQjtRQUN6RCxLQUFLLENBQUMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUE7SUFDeEMsQ0FBQztDQUNKO0FBRUQsTUFBTSxPQUFPLG1CQUFvQixTQUFRLFNBQVM7SUFDdkMsTUFBTSxDQUFRO0lBRXJCLFlBQVksRUFBRSxPQUFP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