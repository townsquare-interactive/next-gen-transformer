import { describe, it, expect, vi } from 'vitest'
import { ValidationError } from '../../utilities/errors.js'
import { validateLandingRequestData } from '../../controllers/landing-controller'

// Define a valid example input that matches the LandingInputSchema
const validExampleData = {
    siteName: 'Example Site',
    url: 'https://example.com',
    s3Folder: 'https://example.com',
    email: 'example@example.com',
    colors: {
        primary: '#000000',
        accent: '#FFFFFF',
    },
    page: {
        sections: [
            {
                headline: 'Example Headline',
                reviews: [
                    {
                        text: 'Great service!',
                    },
                ],
            },
        ],
    },
}

describe('validateLandingRequestData', () => {
    it('should return parsed data for valid input', () => {
        const req = { body: validExampleData }
        const result = validateLandingRequestData(req)
        expect(result.siteData).toEqual(req.body)
        expect(result.apexID).toBeTruthy()
    })

    it('should strip the url to create a valid apexID', () => {
        const req = { body: { ...validExampleData, s3Folder: 'https://www.clientname.com' } }
        const result = validateLandingRequestData(req)
        expect(result.apexID).toEqual('clientname')
    })

    it('should use subdomainOverride instead of url to create the apexID when available', () => {
        const overrideReq = { body: { ...validExampleData, subdomainOverride: 'newdomain.vercel.app' } }
        const result = validateLandingRequestData(overrideReq)
        expect(result.apexID).toEqual('example')
        expect(result.domainOptions).toEqual({ domain: 'newdomain', usingPreview: true })
    })

    it('should handle a productionDomain correctly', () => {
        const overrideReq = { body: { ...validExampleData, productionDomain: 'newdomain.vercel.app' } }
        const result = validateLandingRequestData(overrideReq)
        expect(result.apexID).toEqual('example')
        expect(result.domainOptions).toEqual({ domain: 'newdomain.vercel.app', usingPreview: false })
    })

    it('should throw a ValidationError for invalid input', () => {
        const req = {
            body: {
                ...validExampleData,
                email: 'invalid-email',
            },
        }

        try {
            validateLandingRequestData(req)
        } catch (error) {
            expect(error).toBeInstanceOf(ValidationError)
            expect(error.message).toBe('Error validating form fields')
            expect(error.errorType).toBe('VAL-004')
            expect(error.state.erroredFields).toContainEqual({
                fieldPath: ['email'],
                message: 'Invalid email',
            })
        }
    })

    it('should provide all field error data when multiple are present', () => {
        const req: any = {
            body: {
                ...validExampleData,
                email: 'invalid-email',
                colors: {
                    primary: '#000000',
                    accent: 123, // invalid type
                },
            },
        }

        try {
            validateLandingRequestData(req)
        } catch (error) {
            expect(error).toBeInstanceOf(ValidationError)
            expect(error.message).toBe('Error validating form fields')
            expect(error.errorType).toBe('VAL-004')
            expect(error.state.erroredFields).toContainEqual({
                fieldPath: ['email'],
                message: 'Invalid email',
            })
            expect(error.state.erroredFields).toContainEqual({
                fieldPath: ['colors', 'accent'],
                message: 'Expected string, received number',
            })
        }
    })

    it('should throw a ValidationError when a required field is not present', () => {
        const req: any = {
            body: {
                ...validExampleData,
                siteName: undefined, // siteName is required
            },
        }

        try {
            validateLandingRequestData(req)
        } catch (error) {
            expect(error).toBeInstanceOf(ValidationError)
            expect(error.message).toBe('Error validating form fields')
            expect(error.errorType).toBe('VAL-004')
            expect(error.state.erroredFields).toContainEqual({
                fieldPath: ['siteName'],
                message: 'Required',
            })
        }
    })

    it('should NOT throw an error when an optional field is not included', () => {
        const req = {
            body: {
                ...validExampleData,
                favicon: undefined, // favicon is optional
            },
        }

        const result = validateLandingRequestData(req)
        expect(result.siteData).toEqual(req.body)
    })
})
