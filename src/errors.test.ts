import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ValidationError, TransformError, SiteDeploymentError, handleError, DataUploadError } from './errors'

// Mocking uuidv4 to always return the same UUID
vi.mock('uuid', () => ({
    v4: vi.fn().mockReturnValue('12345678-1234-1234-1234-123456789abc'),
}))

describe('handleError', () => {
    let consoleErrorMock: any

    //mock console error
    beforeEach(() => {
        consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        consoleErrorMock.mockRestore()
    })

    it('should log the error and send response with error ID for ValidationError', () => {
        const mockResponse: any = {
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
        const mockResponse: any = {
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
        const mockResponse: any = {
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
            message: 'Error creating site: Deployment error (Error ID: 12345678-1234-1234-1234-123456789abc)',
            domain: 'example.com',
            state: {
                domainStatus: 'Domain unable to be removed from project',
            },
            status: 'Error',
        })
    })
    it('should log the error and send response with error ID for DataUploadError', () => {
        const mockResponse: any = {
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
        const mockResponse: any = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        }
        const error: any = new Error('Function failed to call')

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
