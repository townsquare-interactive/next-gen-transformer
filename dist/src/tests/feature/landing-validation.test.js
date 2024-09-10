import { describe, it, expect } from 'vitest';
import { ValidationError } from '../../utilities/errors.js';
import { validateLandingRequestData } from '../../controllers/landing-controller';
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
    it('should handle a finalDomain correctly', () => {
        const overrideReq = { body: { ...validExampleData, finalDomain: 'newdomain.vercel.app' } };
        const result = validateLandingRequestData(overrideReq);
        expect(result.apexID).toEqual('example');
        expect(result.domainOptions).toEqual({ domain: 'newdomain.vercel.app', usingPreview: false });
    });
    it('should throw a ValidationError for invalid input', () => {
        const req = {
            body: {
                ...validExampleData,
                email: 'invalid-email',
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
                fieldPath: ['email'],
                message: 'Invalid email',
            });
        }
    });
    it('should provide all field error data when multiple are present', () => {
        const req = {
            body: {
                ...validExampleData,
                email: 'invalid-email',
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
                fieldPath: ['email'],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZGluZy12YWxpZGF0aW9uLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdGVzdHMvZmVhdHVyZS9sYW5kaW5nLXZhbGlkYXRpb24udGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQU0sTUFBTSxRQUFRLENBQUE7QUFDakQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDJCQUEyQixDQUFBO0FBQzNELE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLHNDQUFzQyxDQUFBO0FBRWpGLG1FQUFtRTtBQUNuRSxNQUFNLGdCQUFnQixHQUFHO0lBQ3JCLFFBQVEsRUFBRSxjQUFjO0lBQ3hCLEdBQUcsRUFBRSxxQkFBcUI7SUFDMUIsUUFBUSxFQUFFLHFCQUFxQjtJQUMvQixLQUFLLEVBQUUscUJBQXFCO0lBQzVCLE1BQU0sRUFBRTtRQUNKLE9BQU8sRUFBRSxTQUFTO1FBQ2xCLE1BQU0sRUFBRSxTQUFTO0tBQ3BCO0lBQ0QsSUFBSSxFQUFFO1FBQ0YsUUFBUSxFQUFFO1lBQ047Z0JBQ0ksUUFBUSxFQUFFLGtCQUFrQjtnQkFDNUIsT0FBTyxFQUFFO29CQUNMO3dCQUNJLElBQUksRUFBRSxnQkFBZ0I7cUJBQ3pCO2lCQUNKO2FBQ0o7U0FDSjtLQUNKO0NBQ0osQ0FBQTtBQUVELFFBQVEsQ0FBQyw0QkFBNEIsRUFBRSxHQUFHLEVBQUU7SUFDeEMsRUFBRSxDQUFDLDJDQUEyQyxFQUFFLEdBQUcsRUFBRTtRQUNqRCxNQUFNLEdBQUcsR0FBRyxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxDQUFBO1FBQ3RDLE1BQU0sTUFBTSxHQUFHLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzlDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUN6QyxNQUFN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