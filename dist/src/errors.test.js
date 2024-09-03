import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ValidationError, TransformError, SiteDeploymentError, handleError, DataUploadError } from './errors'
// Mocking uuidv4 to always return the same UUID
vi.mock('uuid', () => ({
    v4: vi.fn().mockReturnValue('12345678-1234-1234-1234-123456789abc'),
}))
describe('handleError', () => {
    let consoleErrorMock
    //mock console error
    beforeEach(() => {
        consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {})
    })
    afterEach(() => {
        consoleErrorMock.mockRestore()
    })
    it('should log the error and send response with error ID for ValidationError', () => {
        const mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        }
        const error = new ValidationError({
            message: 'Validation error',
            errorType: 'VAL-001',
            state: { erroredFields: [{ fieldPath: ['phone'], message: 'zod message' }] },
        })
        handleError(error, mockResponse)
        // Check if console.error was called with the correct message
        expect(console.error).toHaveBeenCalledWith(
            '[Error ID: 12345678-1234-1234-1234-123456789abc]',
            { errorType: 'VAL-001', state: { erroredFields: [{ fieldPath: ['phone'], message: 'zod message' }] } },
            expect.any(String)
        )
        // Check if response was sent with the correct status and JSON
        expect(mockResponse.status).toHaveBeenCalledWith(400)
        expect(mockResponse.json).toHaveBeenCalledWith({
            id: '12345678-1234-1234-1234-123456789abc',
            errorType: 'VAL-001',
            message: 'Validation error (Error ID: 12345678-1234-1234-1234-123456789abc)',
            domain: undefined,
            state: { erroredFields: [{ fieldPath: ['phone'], message: 'zod message' }] },
            status: 'Error',
        })
    })
    it('should log the error and send response with error ID for TransformError', () => {
        const mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        }
        const error = new TransformError({
            message: 'Transform error',
            errorType: 'TRN-001',
            state: { siteStatus: 'deploymentState' },
        })
        handleError(error, mockResponse, 'example.com')
        // Check if console.error was called with the correct message
        expect(console.error).toHaveBeenCalledWith(
            '[Error ID: 12345678-1234-1234-1234-123456789abc]',
            { errorType: 'TRN-001', state: { siteStatus: 'deploymentState' } },
            expect.any(String)
        )
        // Check if response was sent with the correct status and JSON
        expect(mockResponse.status).toHaveBeenCalledWith(400)
        expect(mockResponse.json).toHaveBeenCalledWith({
            id: '12345678-1234-1234-1234-123456789abc',
            errorType: 'TRN-001',
            message: 'Error transforming site data: Transform error (Error ID: 12345678-1234-1234-1234-123456789abc)',
            domain: 'example.com',
            state: { siteStatus: 'deploymentState' },
            status: 'Error',
        })
    })
    it('should log the error and send response with error ID for SiteDeploymentError', () => {
        const mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        }
        const error = new SiteDeploymentError({
            message: 'Deployment error',
            domain: 'example.com',
            errorType: 'DEP-001',
            state: {
                domainStatus: 'Domain unable to be removed from project',
            },
        })
        handleError(error, mockResponse)
        // Check if console.error was called with the correct message
        expect(console.error).toHaveBeenCalledWith(
            '[Error ID: 12345678-1234-1234-1234-123456789abc]',
            {
                errorType: 'DEP-001',
                state: {
                    domainStatus: 'Domain unable to be removed from project',
                },
            },
            expect.any(String)
        )
        // Check if response was sent with the correct status and JSON
        expect(mockResponse.status).toHaveBeenCalledWith(500)
        expect(mockResponse.json).toHaveBeenCalledWith({
            id: '12345678-1234-1234-1234-123456789abc',
            errorType: 'DEP-001',
            message: 'Error with site deployment: Deployment error (Error ID: 12345678-1234-1234-1234-123456789abc)',
            domain: 'example.com',
            state: {
                domainStatus: 'Domain unable to be removed from project',
            },
            status: 'Error',
        })
    })
    it('should log the error and send response with error ID for DataUploadError', () => {
        const mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        }
        const error = new DataUploadError({
            message: 'Data upload error',
            domain: 'example.com',
            errorType: 'AWS-007',
            state: { fileStatus: 'deploymentState' },
        })
        handleError(error, mockResponse)
        // Check if console.error was called with the correct message
        expect(console.error).toHaveBeenCalledWith(
            '[Error ID: 12345678-1234-1234-1234-123456789abc]',
            { errorType: 'AWS-007', state: { fileStatus: 'deploymentState' } },
            expect.any(String)
        )
        // Check if response was sent with the correct status and JSON
        expect(mockResponse.status).toHaveBeenCalledWith(500)
        expect(mockResponse.json).toHaveBeenCalledWith({
            id: '12345678-1234-1234-1234-123456789abc',
            errorType: 'AWS-007',
            message: 'Error uploading to S3: Data upload error (Error ID: 12345678-1234-1234-1234-123456789abc)',
            domain: 'example.com',
            state: { fileStatus: 'deploymentState' },
            status: 'Error',
        })
    })
    it('should log the error and send response with error ID for unexpected errors', () => {
        const mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        }
        const error = new Error('Function failed to call')
        handleError(error, mockResponse, 'example.com')
        // Check if console.error was called with the correct message
        expect(console.error).toHaveBeenCalledWith(
            '[Error ID: 12345678-1234-1234-1234-123456789abc]',
            { errorType: undefined, state: undefined },
            expect.any(String)
        )
        // Check if response was sent with the correct status and JSON
        expect(mockResponse.status).toHaveBeenCalledWith(500)
        expect(mockResponse.json).toHaveBeenCalledWith({
            id: '12345678-1234-1234-1234-123456789abc',
            errorType: 'GEN-003',
            message: 'An unexpected error occurred: Function failed to call (Error ID: 12345678-1234-1234-1234-123456789abc)',
            status: 'Error',
            domain: 'example.com',
            state: undefined,
        })
    })
})
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3JzLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZXJyb3JzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLE1BQU0sUUFBUSxDQUFBO0FBQ3hFLE9BQU8sRUFBRSxlQUFlLEVBQUUsY0FBYyxFQUFFLG1CQUFtQixFQUFFLFdBQVcsRUFBRSxlQUFlLEVBQUUsTUFBTSxVQUFVLENBQUE7QUFFN0csZ0RBQWdEO0FBQ2hELEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDbkIsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUMsc0NBQXNDLENBQUM7Q0FDdEUsQ0FBQyxDQUFDLENBQUE7QUFFSCxRQUFRLENBQUMsYUFBYSxFQUFFLEdBQUcsRUFBRTtJQUN6QixJQUFJLGdCQUFxQixDQUFBO0lBRXpCLG9CQUFvQjtJQUNwQixVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ1osZ0JBQWdCLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsa0JBQWtCLENBQUMsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDLENBQUE7SUFDOUUsQ0FBQyxDQUFDLENBQUE7SUFFRixTQUFTLENBQUMsR0FBRyxFQUFFO1FBQ1gsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLENBQUE7SUFDbEMsQ0FBQyxDQUFDLENBQUE7SUFFRixFQUFFLENBQUMsMEVBQTBFLEVBQUUsR0FBRyxFQUFFO1FBQ2hGLE1BQU0sWUFBWSxHQUFRO1lBQ3RCLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsY0FBYyxFQUFFO1lBQ2hDLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO1NBQ2hCLENBQUE7UUFD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
