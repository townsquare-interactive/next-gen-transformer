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
        const error = new ValidationError({ message: 'Validation error', errorType: 'VAL-001', state: { erroredFields: ['phone'] } });
        handleError(error, mockResponse);
        // Check if console.error was called with the correct message
        expect(console.error).toHaveBeenCalledWith('[Error ID: 12345678-1234-1234-1234-123456789abc]', { errorType: 'VAL-001', state: { erroredFields: ['phone'] } }, expect.any(String));
        // Check if response was sent with the correct status and JSON
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            id: '12345678-1234-1234-1234-123456789abc',
            errorType: 'VAL-001',
            message: 'Validation error (Error ID: 12345678-1234-1234-1234-123456789abc)',
            domain: undefined,
            state: { erroredFields: ['phone'] },
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
            state: { domainStatus: 'deploymentState' },
        });
        handleError(error, mockResponse, 'example.com');
        // Check if console.error was called with the correct message
        expect(console.error).toHaveBeenCalledWith('[Error ID: 12345678-1234-1234-1234-123456789abc]', { errorType: 'TRN-001', state: { domainStatus: 'deploymentState' } }, expect.any(String));
        // Check if response was sent with the correct status and JSON
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            id: '12345678-1234-1234-1234-123456789abc',
            errorType: 'TRN-001',
            message: 'Error transforming site data: Transform error (Error ID: 12345678-1234-1234-1234-123456789abc)',
            domain: 'example.com',
            state: { domainStatus: 'deploymentState' },
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
            message: 'Error creating site: Deployment error (Error ID: 12345678-1234-1234-1234-123456789abc)',
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
            state: { domainStatus: 'deploymentState' },
        });
        handleError(error, mockResponse);
        // Check if console.error was called with the correct message
        expect(console.error).toHaveBeenCalledWith('[Error ID: 12345678-1234-1234-1234-123456789abc]', { errorType: 'AWS-007', state: { domainStatus: 'deploymentState' } }, expect.any(String));
        // Check if response was sent with the correct status and JSON
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            id: '12345678-1234-1234-1234-123456789abc',
            errorType: 'AWS-007',
            message: 'Error uploading to S3: Data upload error (Error ID: 12345678-1234-1234-1234-123456789abc)',
            domain: 'example.com',
            state: 'deploymentState',
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
            message: 'An unexpected error occurred:Function failed to call (Error ID: 12345678-1234-1234-1234-123456789abc)',
            status: 'Error',
            domain: 'example.com',
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXJyb3JzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLE1BQU0sUUFBUSxDQUFBO0FBQ3hFLE9BQU8sRUFBRSxlQUFlLEVBQUUsY0FBYyxFQUFFLG1CQUFtQixFQUFFLFdBQVcsRUFBRSxlQUFlLEVBQUUsTUFBTSxVQUFVLENBQUE7QUFFN0csZ0RBQWdEO0FBQ2hELEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDbkIsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUMsc0NBQXNDLENBQUM7Q0FDdEUsQ0FBQyxDQUFDLENBQUE7QUFFSCxRQUFRLENBQUMsYUFBYSxFQUFFLEdBQUcsRUFBRTtJQUN6QixJQUFJLGdCQUFxQixDQUFBO0lBRXpCLG9CQUFvQjtJQUNwQixVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ1osZ0JBQWdCLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsa0JBQWtCLENBQUMsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDLENBQUE7SUFDOUUsQ0FBQyxDQUFDLENBQUE7SUFFRixTQUFTLENBQUMsR0FBRyxFQUFFO1FBQ1gsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDbEMsQ0FBQyxDQUFDLENBQUE7SUFFRixFQUFFLENBQUMsMEVBQTBFLEVBQUUsR0FBRyxFQUFFO1FBQ2hGLE1BQU0sWUFBWSxHQUFRO1lBQ3RCLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsY0FBYyxFQUFFO1lBQ2hDLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO1NBQ2hCLENBQUE7UUFD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