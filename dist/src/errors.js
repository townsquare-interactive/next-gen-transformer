export class ValidationError extends Error {
    constructor({ message, errorID, erroredFields }) {
        super(message);
        this.name = 'ValidationError';
        this.erroredFields = erroredFields;
        this.errorID = errorID;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class TransformError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TransformError';
        this.errorID = errorID;
        Error.captureStackTrace(this, this.constructor);
    }
}
export class SiteDeploymentError extends Error {
    constructor({ message, domain, errorID }) {
        super(message);
        this.name = 'SiteDeploymentError';
        this.domain = domain;
        this.errorID = errorID;
        Error.captureStackTrace(this, this.constructor);
    }
}
const errorStatus = 'Error';
//Handles all types of errors and calls the specificed error class
export const handleError = (err, res, url = '') => {
    console.error(err);
    if (err instanceof ValidationError) {
        res.status(400).json({
            message: err.message,
            domain: err.domain,
            errorID: err.errorID,
            erroredFields: err.erroredFields,
            status: errorStatus,
        });
    }
    else if (err instanceof TransformError) {
        res.status(400).json({ message: 'Error transforming site data: ' + err.message, domain: url, errorID: err.errorID, status: errorStatus });
    }
    else if (err instanceof SiteDeploymentError) {
        res.status(500).json({
            message: 'Error creating site:' + err.message,
            domain: err.domain,
            errorID: err.errorID,
            status: errorStatus,
        });
    }
    else {
        res.status(500).json({ message: 'An unexpected error occurred:' + err.message, status: errorStatus, domain: url });
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Vycm9ycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLE9BQU8sZUFBZ0IsU0FBUSxLQUFLO0lBQ3RDLFlBQVksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRTtRQUMzQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDZCxJQUFJLENBQUMsSUFBSSxHQUFHLGlCQUFpQixDQUFBO1FBQzdCLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFBO1FBQ2xDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO1FBQ3RCLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBQ25ELENBQUM7Q0FDSjtBQUVELE1BQU0sT0FBTyxjQUFlLFNBQVEsS0FBSztJQUNyQyxZQUFZLE9BQU87UUFDZixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDZCxJQUFJLENBQUMsSUFBSSxHQUFHLGdCQUFnQixDQUFBO1FBQzVCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO1FBQ3RCLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBQ25ELENBQUM7Q0FDSjtBQUVELE1BQU0sT0FBTyxtQkFBb0IsU0FBUSxLQUFLO0lBQzFDLFlBQVksRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRTtRQUNwQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDZCxJQUFJLENBQUMsSUFBSSxHQUFHLHFCQUFxQixDQUFBO1FBQ2pDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO1FBQ3BCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO1FBQ3RCLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBQ25ELENBQUM7Q0FDSjtBQUVELE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQTtBQUUzQixrRUFBa0U7QUFDbEUsTUFBTSxDQUFDLE1BQU0sV0FBVyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUcsRUFBRSxFQUFFLEVBQUU7SUFDOUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUNsQixJQUFJLEdBQUcsWUFBWSxlQUFlLEVBQUUsQ0FBQztRQUNqQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNqQixPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU87WUFDcEIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNO1lBQ2xCLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTztZQUNwQixhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWE7WUFDaEMsTUFBTSxFQUFFLFdBQVc7U0FDdEIsQ0FBQyxDQUFBO0lBQ04sQ0FBQztTQUFNLElBQUksR0FBRyxZQUFZLGNBQWMsRUFBRSxDQUFDO1FBQ3ZDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLGdDQUFnQyxHQUFHLEdBQUcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQTtJQUM3SSxDQUFDO1NBQU0sSUFBSSxHQUFHLFlBQVksbUJBQW1CLEVBQUUsQ0FBQztRQUM1QyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNqQixPQUFPLEVBQUUsc0JBQXNCLEdBQUcsR0FBRyxDQUFDLE9BQU87WUFDN0MsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNO1lBQ2xCLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTztZQUNwQixNQUFNLEVBQUUsV0FBVztTQUN0QixDQUFDLENBQUE7SUFDTixDQUFDO1NBQU0sQ0FBQztRQUNKLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLCtCQUErQixHQUFHLEdBQUcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQTtJQUN0SCxDQUFDO0FBQ0wsQ0FBQyxDQUFBIn0=