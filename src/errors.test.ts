import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ValidationError, TransformError, SiteDeploymentError, handleError } from './errors'

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
        const mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        }
        const error = new ValidationError({ message: 'Validation error', errorType: 'VAL-001', state: 'invalid' })

        handleError(error, mockResponse)

        // Check if console.error was called with the correct message
        expect(console.error).toHaveBeenCalledWith(
            '[Error ID: 12345678-1234-1234-1234-123456789abc]',
            { errorType: 'VAL-001', state: 'invalid' },
            expect.any(String)
        )

        // Check if response was sent with the correct status and JSON
        expect(mockResponse.status).toHaveBeenCalledWith(400)
        expect(mockResponse.json).toHaveBeenCalledWith({
            id: '12345678-1234-1234-1234-123456789abc',
            errorType: 'VAL-001',
            message: 'Validation error',
            domain: undefined,
            state: 'invalid',
            status: 'Error',
        })
    })

    it('should log the error and send response with error ID for TransformError', () => {
        const mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        }
        const error = new TransformError('Transform error', 'TRN-001', 'errorState')

        handleError(error, mockResponse, 'example.com')

        // Check if console.error was called with the correct message
        expect(console.error).toHaveBeenCalledWith(
            '[Error ID: 12345678-1234-1234-1234-123456789abc]',
            { errorType: 'TRN-001', state: 'errorState' },
            expect.any(String)
        )

        // Check if response was sent with the correct status and JSON
        expect(mockResponse.status).toHaveBeenCalledWith(400)
        expect(mockResponse.json).toHaveBeenCalledWith({
            id: '12345678-1234-1234-1234-123456789abc',
            errorType: 'TRN-001',
            message: 'Error transforming site data: Transform error',
            domain: 'example.com',
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
            state: 'deploymentState',
        })

        handleError(error, mockResponse)

        // Check if console.error was called with the correct message
        expect(console.error).toHaveBeenCalledWith(
            '[Error ID: 12345678-1234-1234-1234-123456789abc]',
            { errorType: 'DEP-001', state: 'deploymentState' },
            expect.any(String)
        )

        // Check if response was sent with the correct status and JSON
        expect(mockResponse.status).toHaveBeenCalledWith(500)
        expect(mockResponse.json).toHaveBeenCalledWith({
            id: '12345678-1234-1234-1234-123456789abc',
            errorType: 'DEP-001',
            message: 'Error creating site: Deployment error',
            domain: 'example.com',
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
            message: 'An unexpected error occurred:Function failed to call',
            status: 'Error',
            domain: 'example.com',
        })
    })
})
