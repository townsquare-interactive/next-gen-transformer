import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ValidationError, TransformError, SiteDeploymentError, handleError, DataUploadError } from './errors.js'
import * as s3Functions from '../utilities/s3Functions.js'

describe('handleError', () => {
    let consoleErrorMock: any

    //mock console error
    beforeEach(() => {
        consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {})
        // Mocking uuidv4 to always return the same UUID
        vi.mock('uuid', () => ({
            v4: vi.fn().mockReturnValue('12345678-1234-1234-1234-123456789abc'),
        }))
    })

    afterEach(() => {
        consoleErrorMock.mockRestore()
    })

    beforeEach(() => {
        // Mock utility functions
        vi.spyOn(s3Functions, 'addFileS3').mockResolvedValue('')
        vi.spyOn(s3Functions, 'getFileS3').mockResolvedValue({
            companyName: 'test',
        })
    })

    it('should log the error and send response with error ID for ValidationError', async () => {
        const mockResponse: any = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        }
        const error = new ValidationError({
            message: 'Validation error',
            errorType: 'VAL-001',
            state: { erroredFields: [{ fieldPath: ['phone'], message: 'zod message' }] },
        })

        await handleError(error, mockResponse)

        // Check if console.error was called with the correct message
        expect(console.error).toHaveBeenCalledWith(
            '[Error ID: 12345678-1234-1234-1234-123456789abc]',
            { errorType: 'VAL-001', state: { erroredFields: [{ fieldPath: ['phone'], message: 'zod message' }] }, error: expect.anything() },

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

    it('should log the error and send response with error ID for TransformError', async () => {
        const mockResponse: any = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        }
        const error = new TransformError({
            message: 'Transform error',
            errorType: 'TRN-001',
            state: { siteStatus: 'deploymentState' },
        })

        await handleError(error, mockResponse, 'example.com')

        // Check if console.error was called with the correct message
        expect(console.error).toHaveBeenCalledWith(
            '[Error ID: 12345678-1234-1234-1234-123456789abc]',
            { errorType: 'TRN-001', state: { siteStatus: 'deploymentState' }, error: expect.anything() },

            expect.any(String)
        )

        // Check if response was sent with the correct status and JSON
        expect(mockResponse.status).toHaveBeenCalledWith(500)
        expect(mockResponse.json).toHaveBeenCalledWith({
            id: '12345678-1234-1234-1234-123456789abc',
            errorType: 'TRN-001',
            message: 'Error transforming site data: Transform error (Error ID: 12345678-1234-1234-1234-123456789abc)',
            domain: 'example.com',
            state: { siteStatus: 'deploymentState' },
            status: 'Error',
        })
    })

    it('should log the error and send response with error ID for SiteDeploymentError', async () => {
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

        await handleError(error, mockResponse)

        // Check if console.error was called with the correct message
        expect(console.error).toHaveBeenCalledWith(
            '[Error ID: 12345678-1234-1234-1234-123456789abc]',
            {
                errorType: 'DEP-001',
                state: {
                    domainStatus: 'Domain unable to be removed from project',
                },
                error: expect.anything(),
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
    it('should log the error and send response with error ID for DataUploadError', async () => {
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

        await handleError(error, mockResponse)

        // Check if console.error was called with the correct message
        expect(console.error).toHaveBeenCalledWith(
            '[Error ID: 12345678-1234-1234-1234-123456789abc]',
            { errorType: 'AWS-007', state: { fileStatus: 'deploymentState' }, error: expect.anything() },
            expect.any(String)
        )

        // Check if response was sent with the correct status and JSON
        expect(mockResponse.status).toHaveBeenCalledWith(500)
        expect(mockResponse.json).toHaveBeenCalledWith({
            id: '12345678-1234-1234-1234-123456789abc',
            errorType: 'AWS-007',
            message: 'Error uploading data: Data upload error (Error ID: 12345678-1234-1234-1234-123456789abc)',
            domain: 'example.com',
            state: { fileStatus: 'deploymentState' },
            status: 'Error',
        })
    })

    it('should log the error and send response with error ID for unexpected errors', async () => {
        const mockResponse: any = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        }
        const error: any = new Error('Function failed to call')

        await handleError(error, mockResponse, 'example.com')

        // Check if console.error was called with the correct message
        expect(console.error).toHaveBeenCalledWith(
            '[Error ID: 12345678-1234-1234-1234-123456789abc]',
            { errorType: undefined, state: undefined, error: expect.anything() },
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

    it('should upload error data to s3', async () => {
        const mockResponse: any = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        }
        const error: any = new Error('Error upload test')

        await handleError(error, mockResponse, 'example.com', true, true)

        // Check if S3 functions were called with correct arguments
        const { addFileS3, getFileS3 } = s3Functions

        // Verify getFileS3 was called with correct path
        expect(getFileS3).toHaveBeenCalledWith(expect.stringContaining('/scraped/siteData.json'), null)

        // Verify addFileS3 was called twice - once for error file and once for siteData
        expect(addFileS3).toHaveBeenCalledTimes(2)

        // First call should be for the error file
        expect(addFileS3).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                id: '12345678-1234-1234-1234-123456789abc',
                error: error,
                stack: expect.any(String),
                date: expect.any(String),
            }),
            expect.stringContaining('/errors/'),
            'json'
        )

        // Second call should be for updating siteData
        expect(addFileS3).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                companyName: 'test',
                error: expect.objectContaining({
                    id: '12345678-1234-1234-1234-123456789abc',
                }),
            }),
            expect.stringContaining('/scraped/siteData'),
            'json'
        )

        // Check if response was sent with the correct status and JSON
        expect(mockResponse.status).toHaveBeenCalledWith(500)
        expect(mockResponse.json).toHaveBeenCalledWith({
            id: '12345678-1234-1234-1234-123456789abc',
            errorType: 'GEN-003',
            message: 'An unexpected error occurred: Error upload test (Error ID: 12345678-1234-1234-1234-123456789abc)',
            status: 'Error',
            domain: 'example.com',
            state: undefined,
        })
    })

    it('should add error to existing siteData when getFileS3 returns valid JSON', async () => {
        const mockResponse: any = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        }
        const error: any = new Error('Error upload test')

        // Mock getFileS3 to return specific siteData for this test
        vi.spyOn(s3Functions, 'getFileS3').mockResolvedValueOnce({
            baseUrl: 'https://example.com',
            pages: [],
            businessInfo: {
                companyName: 'Test Company',
                email: 'test@example.com',
            },
        })

        await handleError(error, mockResponse, 'example.com', true, true)

        // Verify getFileS3 was called with correct path
        expect(s3Functions.getFileS3).toHaveBeenCalledWith(expect.stringContaining('/scraped/siteData.json'), null)

        // Verify addFileS3 was called with the combined data
        expect(s3Functions.addFileS3).toHaveBeenCalledWith(
            expect.objectContaining({
                baseUrl: 'https://example.com',
                pages: [],
                businessInfo: {
                    companyName: 'Test Company',
                    email: 'test@example.com',
                },
                error: expect.objectContaining({
                    id: '12345678-1234-1234-1234-123456789abc',
                    error: error,
                    stack: expect.any(String),
                    date: expect.any(String),
                }),
            }),
            expect.stringContaining('/scraped/siteData'),
            'json'
        )
    })

    it('should handle S3 upload failures by calling handleError again without uploading', async () => {
        const mockResponse: any = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        }
        const error = new ValidationError({
            message: 'Original error',
            errorType: 'VAL-001',
            state: { erroredFields: [{ fieldPath: ['phone'], message: 'validation failed' }] },
        })

        // Make addFileS3 throw an error
        vi.spyOn(s3Functions, 'addFileS3').mockRejectedValueOnce(new Error('S3 upload failed'))

        // First call to handleError with uploadErrorData = true
        await handleError(error, mockResponse, 'example.com', true, true)

        // Verify handleError was called again (through the catch block) with uploadErrorData = false
        expect(mockResponse.json).toHaveBeenCalledTimes(2)
        expect(mockResponse.json).toHaveBeenNthCalledWith(1, {
            id: '12345678-1234-1234-1234-123456789abc',
            errorType: 'VAL-001',
            message: 'Original error (Error ID: 12345678-1234-1234-1234-123456789abc)',
            state: { erroredFields: [{ fieldPath: ['phone'], message: 'validation failed' }] },
            status: 'Error',
        })
        expect(mockResponse.json).toHaveBeenNthCalledWith(2, {
            id: '12345678-1234-1234-1234-123456789abc',
            errorType: 'VAL-001',
            message: 'Original error (Error ID: 12345678-1234-1234-1234-123456789abc)',
            state: { erroredFields: [{ fieldPath: ['phone'], message: 'validation failed' }] },
            status: 'Error',
        })

        // Verify addFileS3 was called only once (the failed attempt)
        expect(s3Functions.addFileS3).toHaveBeenCalledTimes(1)
    })
})
