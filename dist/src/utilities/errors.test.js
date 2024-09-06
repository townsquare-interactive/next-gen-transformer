import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ValidationError, TransformError, SiteDeploymentError, handleError, DataUploadError } from './errors';
// Mocking uuidv4 to always return the same UUID
vi.mock('uuid', () => ({
    v4: vi.fn().mockReturnValue('12345678-1234-1234-1234-123456789abc'),
}));
describe('handleError', () => {
    let consoleErrorMock;
    //mock console error
    beforeEach(() => {
        consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterEach(() => {
        consoleErrorMock.mockRestore();
    });
    it('should log the error and send response with error ID for ValidationError', () => {
        const mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
        const error = new ValidationError({
            message: 'Validation error',
            errorType: 'VAL-001',
            state: { erroredFields: [{ fieldPath: ['phone'], message: 'zod message' }] },
        });
        handleError(error, mockResponse);
        // Check if console.error was called with the correct message
        expect(console.error).toHaveBeenCalledWith('[Error ID: 12345678-1234-1234-1234-123456789abc]', { errorType: 'VAL-001', state: { erroredFields: [{ fieldPath: ['phone'], message: 'zod message' }] } }, expect.any(String));
        // Check if response was sent with the correct status and JSON
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            id: '12345678-1234-1234-1234-123456789abc',
            errorType: 'VAL-001',
            message: 'Validation error (Error ID: 12345678-1234-1234-1234-123456789abc)',
            domain: undefined,
            state: { erroredFields: [{ fieldPath: ['phone'], message: 'zod message' }] },
            status: 'Error',
        });
    });
    it('should log the error and send response with error ID for TransformError', () => {
        const mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
        const error = new TransformError({
            message: 'Transform error',
            errorType: 'TRN-001',
            state: { siteStatus: 'deploymentState' },
        });
        handleError(error, mockResponse, 'example.com');
        // Check if console.error was called with the correct message
        expect(console.error).toHaveBeenCalledWith('[Error ID: 12345678-1234-1234-1234-123456789abc]', { errorType: 'TRN-001', state: { siteStatus: 'deploymentState' } }, expect.any(String));
        // Check if response was sent with the correct status and JSON
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            id: '12345678-1234-1234-1234-123456789abc',
            errorType: 'TRN-001',
            message: 'Error transforming site data: Transform error (Error ID: 12345678-1234-1234-1234-123456789abc)',
            domain: 'example.com',
            state: { siteStatus: 'deploymentState' },
            status: 'Error',
        });
    });
    it('should log the error and send response with error ID for SiteDeploymentError', () => {
        const mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
        const error = new SiteDeploymentError({
            message: 'Deployment error',
            domain: 'example.com',
            errorType: 'DEP-001',
            state: {
                domainStatus: 'Domain unable to be removed from project',
            },
        });
        handleError(error, mockResponse);
        // Check if console.error was called with the correct message
        expect(console.error).toHaveBeenCalledWith('[Error ID: 12345678-1234-1234-1234-123456789abc]', {
            errorType: 'DEP-001',
            state: {
                domainStatus: 'Domain unable to be removed from project',
            },
        }, expect.any(String));
        // Check if response was sent with the correct status and JSON
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            id: '12345678-1234-1234-1234-123456789abc',
            errorType: 'DEP-001',
            message: 'Error with site deployment: Deployment error (Error ID: 12345678-1234-1234-1234-123456789abc)',
            domain: 'example.com',
            state: {
                domainStatus: 'Domain unable to be removed from project',
            },
            status: 'Error',
        });
    });
    it('should log the error and send response with error ID for DataUploadError', () => {
        const mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
        const error = new DataUploadError({
            message: 'Data upload error',
            domain: 'example.com',
            errorType: 'AWS-007',
            state: { fileStatus: 'deploymentState' },
        });
        handleError(error, mockResponse);
        // Check if console.error was called with the correct message
        expect(console.error).toHaveBeenCalledWith('[Error ID: 12345678-1234-1234-1234-123456789abc]', { errorType: 'AWS-007', state: { fileStatus: 'deploymentState' } }, expect.any(String));
        // Check if response was sent with the correct status and JSON
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            id: '12345678-1234-1234-1234-123456789abc',
            errorType: 'AWS-007',
            message: 'Error uploading to S3: Data upload error (Error ID: 12345678-1234-1234-1234-123456789abc)',
            domain: 'example.com',
            state: { fileStatus: 'deploymentState' },
            status: 'Error',
        });
    });
    it('should log the error and send response with error ID for unexpected errors', () => {
        const mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
        const error = new Error('Function failed to call');
        handleError(error, mockResponse, 'example.com');
        // Check if console.error was called with the correct message
        expect(console.error).toHaveBeenCalledWith('[Error ID: 12345678-1234-1234-1234-123456789abc]', { errorType: undefined, state: undefined }, expect.any(String));
        // Check if response was sent with the correct status and JSON
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            id: '12345678-1234-1234-1234-123456789abc',
            errorType: 'GEN-003',
            message: 'An unexpected error occurred: Function failed to call (Error ID: 12345678-1234-1234-1234-123456789abc)',
            status: 'Error',
            domain: 'example.com',
            state: undefined,
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL2Vycm9ycy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUN4RSxPQUFPLEVBQUUsZUFBZSxFQUFFLGNBQWMsRUFBRSxtQkFBbUIsRUFBRSxXQUFXLEVBQUUsZUFBZSxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBRTdHLGdEQUFnRDtBQUNoRCxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQ25CLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsZUFBZSxDQUFDLHNDQUFzQyxDQUFDO0NBQ3RFLENBQUMsQ0FBQyxDQUFBO0FBRUgsUUFBUSxDQUFDLGFBQWEsRUFBRSxHQUFHLEVBQUU7SUFDekIsSUFBSSxnQkFBcUIsQ0FBQTtJQUV6QixvQkFBb0I7SUFDcEIsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNaLGdCQUFnQixHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQyxDQUFBO0lBQzlFLENBQUMsQ0FBQyxDQUFBO0lBRUYsU0FBUyxDQUFDLEdBQUcsRUFBRTtRQUNYLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQ2xDLENBQUMsQ0FBQyxDQUFBO0lBRUYsRUFBRSxDQUFDLDBFQUEwRSxFQUFFLEdBQUcsRUFBRTtRQUNoRixNQUFNLFlBQVksR0FBUTtZQUN0QixNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLGNBQWMsRUFBRTtZQUNoQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRTtT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