import { describe, it, expect, vi } from 'vitest';
import { logZodDataParse, zodDataParse } from './utils-zod';
import { z } from 'zod';
import { ValidationError } from '../utilities/errors.js';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMtem9kLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2NoZW1hL3V0aWxzLXpvZC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsTUFBTSxRQUFRLENBQUE7QUFDakQsT0FBTyxFQUFFLGVBQWUsRUFBRSxZQUFZLEVBQUUsTUFBTSxhQUFhLENBQUE7QUFDM0QsT0FBTyxFQUFFLENBQUMsRUFBRSxNQUFNLEtBQUssQ0FBQTtBQUN2QixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFFeEQsTUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUMzQixJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtJQUNoQixHQUFHLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUU7SUFDakMsTUFBTSxFQUFFLENBQUM7U0FDSixNQUFNLENBQUM7UUFDSixVQUFVLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtLQUN6QixDQUFDO1NBQ0QsUUFBUSxFQUFFO0NBQ2xCLENBQUMsQ0FBQTtBQUVGLFFBQVEsQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFO0lBQzFCLEVBQUUsQ0FBQywyQ0FBMkMsRUFBRSxHQUFHLEVBQUU7UUFDakQsTUFBTSxJQUFJLEdBQUcsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQTtRQUMxQyxNQUFNLE1BQU0sR0FBRyxZQUFZLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFBO1FBQ2hELE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDaEMsQ0FBQyxDQUFDLENBQUE7SUFFRixFQUFFLENBQUMsNkRBQTZE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