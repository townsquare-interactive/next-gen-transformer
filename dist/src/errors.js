const errorIDList = {
    'DMN-001': 'Domain not able to be added to Vercel. Both the normal URL and the postfix (-lp) version are taken. Try another URL name.',
    'DMN-002': 'After 3 attempts to verify URL is live we are not able to receive a 200 status from the new URL.',
    'GEN-003': 'General JavaScript error when going through site deployment tasks.',
    'VAL-004': 'Error validating incoming request data.',
    'VAL-005': 'Error validating transformed data being sent to S3.',
};
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
export const handleError = (err, res, url) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Vycm9ycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLFdBQVcsR0FBRztJQUNoQixTQUFTLEVBQUUsMkhBQTJIO0lBQ3RJLFNBQVMsRUFBRSxrR0FBa0c7SUFDN0csU0FBUyxFQUFFLG9FQUFvRTtJQUMvRSxTQUFTLEVBQUUseUNBQXlDO0lBQ3BELFNBQVMsRUFBRSxxREFBcUQ7Q0FDbkUsQ0FBQTtBQUVELE1BQU0sT0FBTyxlQUFnQixTQUFRLEtBQUs7SUFDdEMsWUFBWSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFO1FBQzNDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUNkLElBQUksQ0FBQyxJQUFJLEdBQUcsaUJBQWlCLENBQUE7UUFDN0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUE7UUFDbEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7UUFDdEIsS0FBSyxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7SUFDbkQsQ0FBQztDQUNKO0FBRUQsTUFBTSxPQUFPLGNBQWUsU0FBUSxLQUFLO0lBQ3JDLFlBQVksT0FBTztRQUNmLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUNkLElBQUksQ0FBQyxJQUFJLEdBQUcsZ0JBQWdCLENBQUE7UUFDNUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7UUFDdEIsS0FBSyxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7SUFDbkQsQ0FBQztDQUNKO0FBRUQsTUFBTSxPQUFPLG1CQUFvQixTQUFRLEtBQUs7SUFDMUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFO1FBQ3BDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUNkLElBQUksQ0FBQyxJQUFJLEdBQUcscUJBQXFCLENBQUE7UUFDakMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7UUFDcEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7UUFDdEIsS0FBSyxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7SUFDbkQsQ0FBQztDQUNKO0FBRUQsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFBO0FBRTNCLGtFQUFrRTtBQUNsRSxNQUFNLENBQUMsTUFBTSxXQUFXLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQ3pDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDbEIsSUFBSSxHQUFHLFlBQVksZUFBZSxFQUFFLENBQUM7UUFDakMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDakIsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPO1lBQ3BCLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTTtZQUNsQixPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU87WUFDcEIsYUFBYSxFQUFFLEdBQUcsQ0FBQyxhQUFhO1lBQ2hDLE1BQU0sRUFBRSxXQUFXO1NBQ3RCLENBQUMsQ0FBQTtJQUNOLENBQUM7U0FBTSxJQUFJLEdBQUcsWUFBWSxjQUFjLEVBQUUsQ0FBQztRQUN2QyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxnQ0FBZ0MsR0FBRyxHQUFHLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUE7SUFDN0ksQ0FBQztTQUFNLElBQUksR0FBRyxZQUFZLG1CQUFtQixFQUFFLENBQUM7UUFDNUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDakIsT0FBTyxFQUFFLHNCQUFzQixHQUFHLEdBQUcsQ0FBQyxPQUFPO1lBQzdDLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTTtZQUNsQixPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU87WUFDcEIsTUFBTSxFQUFFLFdBQVc7U0FDdEIsQ0FBQyxDQUFBO0lBQ04sQ0FBQztTQUFNLENBQUM7UUFDSixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSwrQkFBK0IsR0FBRyxHQUFHLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUE7SUFDdEgsQ0FBQztBQUNMLENBQUMsQ0FBQSJ9