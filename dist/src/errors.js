import { v4 as uuidv4 } from 'uuid';
export class ValidationError extends Error {
    state;
    errorType;
    constructor({ message, errorType, state }) {
        super(message);
        this.name = 'ValidationError';
        this.state = state;
        this.errorType = errorType;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class TransformError extends Error {
    state;
    errorType;
    constructor({ message, errorType, state }) {
        super(message);
        this.name = 'TransformError';
        this.state = state;
        this.errorType = errorType;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class SiteDeploymentError extends Error {
    state;
    errorType;
    domain;
    constructor({ message, domain, errorType, state }) {
        super(message);
        this.name = 'SiteDeploymentError';
        this.state = state;
        this.domain = domain;
        this.errorType = errorType;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class DataUploadError extends Error {
    state;
    errorType;
    domain;
    constructor({ message, domain, errorType, state }) {
        super(message);
        this.name = 'DataUploadError';
        this.state = state;
        this.domain = domain;
        this.errorType = errorType;
        Error.captureStackTrace(this, this.constructor);
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
            message: 'Error creating site: ' + err.message + errorIDMessage,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Vycm9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsRUFBRSxJQUFJLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQTtBQXlCbkMsTUFBTSxPQUFPLGVBQWdCLFNBQVEsS0FBSztJQUMvQixLQUFLLENBQVk7SUFDakIsU0FBUyxDQUFRO0lBRXhCLFlBQVksRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBYztRQUNqRCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDZCxJQUFJLENBQUMsSUFBSSxHQUFHLGlCQUFpQixDQUFBO1FBQzdCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO1FBQ2xCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO1FBQzFCLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBQ25ELENBQUM7Q0FDSjtBQUVELE1BQU0sT0FBTyxjQUFlLFNBQVEsS0FBSztJQUM5QixLQUFLLENBQVk7SUFDakIsU0FBUyxDQUFRO0lBRXhCLFlBQVksRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBYztRQUNqRCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDZCxJQUFJLENBQUMsSUFBSSxHQUFHLGdCQUFnQixDQUFBO1FBQzVCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFBO1FBQ2xCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO1FBQzFCLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBQ25ELENBQUM7Q0FDSjtBQUVELE1BQU0sT0FBTyxtQkFBb0IsU0FBUSxLQUFLO0lBQ25DLEtBQUssQ0FBWTtJQUNqQixTQUFTLENBQVE7SUFDakIsTUFBTSxDQUFRO0lBRXJCLFlB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