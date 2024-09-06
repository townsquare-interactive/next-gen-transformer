import { describe, it, expect } from 'vitest';
import { ValidationError } from '../../utilities/errors.js';
import { validateLandingRequestData } from '../../controllers/landing-controller';
// Define a valid example input that matches the LandingInputSchema
const validExampleData = {
    siteName: 'Example Site',
    url: 'https://example.com',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZGluZy12YWxpZGF0aW9uLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdGVzdHMvZmVhdHVyZS9sYW5kaW5nLXZhbGlkYXRpb24udGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQU0sTUFBTSxRQUFRLENBQUE7QUFDakQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDJCQUEyQixDQUFBO0FBQzNELE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLHNDQUFzQyxDQUFBO0FBRWpGLG1FQUFtRTtBQUNuRSxNQUFNLGdCQUFnQixHQUFHO0lBQ3JCLFFBQVEsRUFBRSxjQUFjO0lBQ3hCLEdBQUcsRUFBRSxxQkFBcUI7SUFDMUIsS0FBSyxFQUFFLHFCQUFxQjtJQUM1QixNQUFNLEVBQUU7UUFDSixPQUFPLEVBQUUsU0FBUztRQUNsQixNQUFNLEVBQUUsU0FBUztLQUNwQjtJQUNELElBQUksRUFBRTtRQUNGLFFBQVEsRUFBRTtZQUNOO2dCQUNJLFFBQVEsRUFBRSxrQkFBa0I7Z0JBQzVCLE9BQU8sRUFBRTtvQkFDTDt3QkFDSSxJQUFJLEVBQUUsZ0JBQWdCO3FCQUN6QjtpQkFDSjthQUNKO1NBQ0o7S0FDSjtDQUNKLENBQUE7QUFFRCxRQUFRLENBQUMsNEJBQTRCLEVBQUUsR0FBRyxFQUFFO0lBQ3hDLEVBQUUsQ0FBQywyQ0FBMkMsRUFBRSxHQUFHLEVBQUU7UUFDakQsTUFBTSxHQUFHLEdBQUcsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQTtRQUN0QyxNQUFNLE1BQU0sR0FBRywwQkFBMEIsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUM5QyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDekMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENB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