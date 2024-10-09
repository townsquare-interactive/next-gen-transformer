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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9lcnJvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLEVBQUUsSUFBSSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUE7QUFnRG5DLE1BQWUsU0FBVSxTQUFRLEtBQUs7SUFDM0IsU0FBUyxDQUFRO0lBQ2pCLEtBQUssQ0FBWTtJQUV4QixZQUFZLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQWM7UUFDakQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ2QsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQTtRQUMzQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtRQUMxQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQTtRQUNsQixLQUFLLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtJQUNuRCxDQUFDO0NBQ0o7QUFFRCxzQkFBc0I7QUFDdEIsTUFBTSxPQUFPLGVBQWdCLFNBQVEsU0FBUztJQUMxQyxZQUFZLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQXVCO1FBQzFELEtBQUssQ0FBQyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQTtJQUN4QyxDQUFDO0NBQ0o7QUFFRCxNQUFNLE9BQU8sY0FBZSxTQUFRLFNBQVM7SUFDekMsWUFBWSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFzQjtRQUN6RCxLQUFLLENBQUMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUE7SUFDeEMsQ0FBQztDQUNKO0FBRUQsTUFBTSxPQUFPLG1CQUFvQixTQUFRLFNBQVM7SUFDdkMsTUFBTSxDQUFRO0lBRXJCLFlBQVksRUFBRSxPQUFP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