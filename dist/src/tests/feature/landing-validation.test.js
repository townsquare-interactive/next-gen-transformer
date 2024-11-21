import { describe, it, expect } from 'vitest';
import { ValidationError } from '../../utilities/errors.js';
import { validateLandingRequestData } from '../../controllers/landing-controller';
// Define a valid example input that matches the LandingInputSchema
const validExampleData = {
    siteName: 'Example Site',
    url: 'https://example.com',
    s3Folder: 'https://example.com',
    contactData: {
        email: 'example@example.com',
    },
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
    customOptions: {},
    logos: {},
};
describe('validateLandingRequestData', () => {
    it('should return parsed data for valid input', () => {
        const req = { body: validExampleData };
        const result = validateLandingRequestData(req);
        expect(result.siteData).toEqual(req.body);
        expect(result.apexID).toBeTruthy();
    });
    it('should strip the url to create a valid apexID', () => {
        const req = { body: { ...validExampleData, s3Folder: 'https://www.clientname.com' } };
        const result = validateLandingRequestData(req);
        expect(result.apexID).toEqual('clientname');
    });
    it('should use subdomainOverride instead of url to create the apexID when available', () => {
        const overrideReq = { body: { ...validExampleData, subdomainOverride: 'newdomain.vercel.app' } };
        const result = validateLandingRequestData(overrideReq);
        expect(result.apexID).toEqual('example');
        expect(result.domainOptions).toEqual({ domain: 'newdomain', usingPreview: true });
    });
    it('should handle a productionDomain correctly', () => {
        const overrideReq = { body: { ...validExampleData, productionDomain: 'newdomain.vercel.app' } };
        const result = validateLandingRequestData(overrideReq);
        expect(result.apexID).toEqual('example');
        expect(result.domainOptions).toEqual({ domain: 'newdomain.vercel.app', usingPreview: false });
    });
    it('should throw a ValidationError for Invalid email', () => {
        const req = {
            body: {
                ...validExampleData,
                contactData: {
                    email: 'invalid-email',
                },
            },
        };
        try {
            validateLandingRequestData(req);
        }
        catch (error) {
            expect(error).toBeInstanceOf(ValidationError);
            expect(error.message).toBe('Error validating form fields');
            expect(error.errorType).toBe('VAL-004');
            expect(error.state.erroredFields).toContainEqual({
                fieldPath: ['contactData', 'email'],
                message: 'Invalid email',
            });
        }
    });
    it('should provide all field error data when multiple are present', () => {
        const req = {
            body: {
                ...validExampleData,
                contactData: {
                    email: 'invalidinput',
                },
                colors: {
                    primary: '#000000',
                    accent: 123, // invalid type
                },
            },
        };
        try {
            validateLandingRequestData(req);
        }
        catch (error) {
            expect(error).toBeInstanceOf(ValidationError);
            expect(error.message).toBe('Error validating form fields');
            expect(error.errorType).toBe('VAL-004');
            expect(error.state.erroredFields).toContainEqual({
                fieldPath: ['contactData', 'email'],
                message: 'Invalid email',
            });
            expect(error.state.erroredFields).toContainEqual({
                fieldPath: ['colors', 'accent'],
                message: 'Expected string, received number',
            });
        }
    });
    it('should throw a ValidationError when a required field is not present', () => {
        const req = {
            body: {
                ...validExampleData,
                siteName: undefined, // siteName is required
            },
        };
        try {
            validateLandingRequestData(req);
        }
        catch (error) {
            expect(error).toBeInstanceOf(ValidationError);
            expect(error.message).toBe('Error validating form fields');
            expect(error.errorType).toBe('VAL-004');
            expect(error.state.erroredFields).toContainEqual({
                fieldPath: ['siteName'],
                message: 'Required',
            });
        }
    });
    it('should NOT throw an error when an optional field is not included', () => {
        const req = {
            body: {
                ...validExampleData,
                favicon: undefined, // favicon is optional
            },
        };
        const result = validateLandingRequestData(req);
        expect(result.siteData).toEqual(req.body);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZGluZy12YWxpZGF0aW9uLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdGVzdHMvZmVhdHVyZS9sYW5kaW5nLXZhbGlkYXRpb24udGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQU0sTUFBTSxRQUFRLENBQUE7QUFDakQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDJCQUEyQixDQUFBO0FBQzNELE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLHNDQUFzQyxDQUFBO0FBR2pGLG1FQUFtRTtBQUNuRSxNQUFNLGdCQUFnQixHQUFlO0lBQ2pDLFFBQVEsRUFBRSxjQUFjO0lBQ3hCLEdBQUcsRUFBRSxxQkFBcUI7SUFDMUIsUUFBUSxFQUFFLHFCQUFxQjtJQUMvQixXQUFXLEVBQUU7UUFDVCxLQUFLLEVBQUUscUJBQXFCO0tBQy9CO0lBQ0QsTUFBTSxFQUFFO1FBQ0osT0FBTyxFQUFFLFNBQVM7UUFDbEIsTUFBTSxFQUFFLFNBQVM7S0FDcEI7SUFDRCxJQUFJLEVBQUU7UUFDRixRQUFRLEVBQUU7WUFDTjtnQkFDSSxRQUFRLEVBQUUsa0JBQWtCO2dCQUM1QixPQUFPLEVBQUU7b0JBQ0w7d0JBQ0ksSUFBSSxFQUFFLGdCQUFnQjtxQkFDekI7aUJBQ0o7YUFDSjtTQUNKO0tBQ0o7SUFDRCxhQUFhLEVBQUUsRUFBRTtJQUNqQixLQUFLLEVBQUUsRUFBRTtDQUNaLENBQUE7QUFFRCxRQUFRLENBQUMsNEJBQTRCLEVBQUUsR0FBRyxFQUFFO0lBQ3hDLEVBQUUsQ0FBQywyQ0FBMkMsRUFBRSxHQUFHLEVBQUU7UUFDakQsTUFBTSxHQUFHLEdBQUcsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQTtRQUN0QyxNQUFNLE1BQU0sR0FBRywwQkFBMEIsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUM5QyxNQUFNLENBQUMsTUFBTSxDQUFD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