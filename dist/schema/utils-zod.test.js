import { describe, it, expect, vi } from 'vitest';
import { logZodDataParse, zodDataParse } from './utils-zod';
import { z } from 'zod';
import { ValidationError } from '../src/errors.js';
const ExampleSchema = z.object({
    name: z.string(),
    age: z.number().min(0).optional(),
    status: z
        .object({
        occupation: z.string(),
    })
        .optional(),
});
describe('zodDataParse', () => {
    it('should return parsed data for valid input', () => {
        const data = { name: 'John Doe', age: 30 };
        const result = zodDataParse(data, ExampleSchema);
        expect(result).toEqual(data);
    });
    it('should throw a ValidationError for invalid input with parse', () => {
        const dataError = { name: 'John Doe', age: -5 };
        try {
            zodDataParse(dataError, ExampleSchema, 'input');
        }
        catch (error) {
            expect(error).toBeInstanceOf(ValidationError);
            expect(error.message).toBe('Error validating form fields');
            expect(error.errorType).toBe('VAL-004');
            expect(error.state).toEqual({
                erroredFields: [
                    {
                        fieldPath: ['age'],
                        message: 'Number must be greater than or equal to 0',
                    },
                ],
            });
        }
    });
    it('should provide all field error data when multiple are present', () => {
        const dataMultipleErrors = { name: 'John Doe', age: -5, status: { occupation: null } };
        try {
            zodDataParse(dataMultipleErrors, ExampleSchema, 'input');
        }
        catch (error) {
            expect(error).toBeInstanceOf(ValidationError);
            expect(error.message).toBe('Error validating form fields');
            expect(error.errorType).toBe('VAL-004');
            expect(error.state.erroredFields).toContainEqual({
                fieldPath: ['status', 'occupation'],
                message: 'Expected string, received null',
            });
            expect(error.state.erroredFields).toContainEqual({
                fieldPath: ['status', 'occupation'],
                message: 'Expected string, received null',
            });
            const testArr = [{ name: 'jo' }];
            expect(testArr).toContainEqual({ name: 'jo' });
        }
    });
    it('should throw a ValidationError when a required field is not present', () => {
        const dataNoName = { age: 5, status: { occupation: 'construction' } };
        try {
            zodDataParse(dataNoName, ExampleSchema, 'input');
        }
        catch (error) {
            expect(error).toBeInstanceOf(ValidationError);
            expect(error.message).toBe('Error validating form fields');
            expect(error.errorType).toBe('VAL-004');
            expect(error.state).toEqual({
                erroredFields: [
                    {
                        fieldPath: ['name'],
                        message: 'Required',
                    },
                ],
            });
        }
    });
    it('should NOT throw an error when an optional field is not included', () => {
        const dataNoAge = { name: 'Jo', status: { occupation: 'construction' } };
        const parsedDataOutput = zodDataParse(dataNoAge, ExampleSchema, 'input');
        expect(parsedDataOutput).toBeTruthy();
    });
    it('should log a different message and type for output data', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
        const data2 = { name: 'John Doe', age: -5 };
        try {
            zodDataParse(data2, ExampleSchema, 'output');
        }
        catch (error) {
            expect(consoleSpy).toHaveBeenCalledWith({
                message: 'Validation error on output data going to S3',
                errorType: 'VAL-005',
                state: {
                    erroredFields: [
                        {
                            fieldPath: ['age'],
                            message: 'Number must be greater than or equal to 0',
                        },
                    ],
                },
            });
            consoleSpy.mockRestore();
        }
    });
});
describe('logZodDataParse', () => {
    it('should log the zod error but NOT throw an error with an invalid input with the logZodDataParse function', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
        const dataErrorSafe = { name: 'John Doe', age: -5 };
        logZodDataParse(dataErrorSafe, ExampleSchema, 'input');
        expect(consoleSpy).toHaveBeenCalledWith('Zod parse error', {
            message: 'Zod parsing error log on input',
            erroredFields: [
                {
                    fieldPath: ['age'],
                    message: 'Number must be greater than or equal to 0',
                },
            ],
        });
        consoleSpy.mockRestore();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMtem9kLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zY2hlbWEvdXRpbHMtem9kLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUNqRCxPQUFPLEVBQUUsZUFBZSxFQUFFLFlBQVksRUFBRSxNQUFNLGFBQWEsQ0FBQTtBQUMzRCxPQUFPLEVBQUUsQ0FBQyxFQUFFLE1BQU0sS0FBSyxDQUFBO0FBQ3ZCLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUVsRCxNQUFNLGFBQWEsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQzNCLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO0lBQ2hCLEdBQUcsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRTtJQUNqQyxNQUFNLEVBQUUsQ0FBQztTQUNKLE1BQU0sQ0FBQztRQUNKLFVBQVUsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO0tBQ3pCLENBQUM7U0FDRCxRQUFRLEVBQUU7Q0FDbEIsQ0FBQyxDQUFBO0FBRUYsUUFBUSxDQUFDLGNBQWMsRUFBRSxHQUFHLEVBQUU7SUFDMUIsRUFBRSxDQUFDLDJDQUEyQyxFQUFFLEdBQUcsRUFBRTtRQUNqRCxNQUFNLElBQUksR0FBRyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFBO1FBQzFDLE1BQU0sTUFBTSxHQUFHLFlBQVksQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUE7UUFDaEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNoQyxDQUFDLENBQUMsQ0FBQTtJQUVGLEVBQUUsQ0FBQyw2REFBNkQsRUFBRSxH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