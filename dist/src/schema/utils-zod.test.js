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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMtem9kLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc2NoZW1hL3V0aWxzLXpvZC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsTUFBTSxRQUFRLENBQUE7QUFDakQsT0FBTyxFQUFFLGVBQWUsRUFBRSxZQUFZLEVBQUUsTUFBTSxhQUFhLENBQUE7QUFDM0QsT0FBTyxFQUFFLENBQUMsRUFBRSxNQUFNLEtBQUssQ0FBQTtBQUN2QixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFFeEQsTUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUMzQixJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtJQUNoQixHQUFHLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUU7SUFDakMsTUFBTSxFQUFFLENBQUM7U0FDSixNQUFNLENBQUM7UUFDSixVQUFVLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtLQUN6QixDQUFDO1NBQ0QsUUFBUSxFQUFFO0NBQ2xCLENBQUMsQ0FBQTtBQUVGLFFBQVEsQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFO0lBQzFCLEVBQUUsQ0FBQywyQ0FBMkMsRUFBRSxHQUFHLEVBQUU7UUFDakQsTUFBTSxJQUFJLEdBQUcsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQTtRQUMxQyxNQUFNLE1BQU0sR0FBRyxZQUFZLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFBO1FBQ2hELE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDaEMsQ0FBQyxDQUFDLENBQUE7SUFFRixFQUFFLENBQUMsNkRBQTZELEVBQUUsR0FBRyxFQUFFO1FBQ25FLE1BQU0sU0FBUyxHQUFHLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtRQUUvQyxJQUFJLENBQUM7WUFDRCxZQUFZLENBQUMsU0FBUyxFQUFFLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQTtRQUNuRCxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNiLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLENBQUE7WUFDN0MsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQTtZQUMxRCxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtZQUN2QyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQztnQkFDeEIsYUFBYSxFQUFFO29CQUNYO3dCQUNJLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQzt3QkFDbEIsT0FBTyxFQUFFLDJDQUEyQztxQkFDdkQ7aUJBQ0o7YUFDSixDQUFDLENBQUE7UUFDTixDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUE7SUFFRixFQUFFLENBQUMsK0RBQStELEVBQUUsR0FBRyxFQUFFO1FBQ3JFLE1BQU0sa0JBQWtCLEdBQUcsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQTtRQUV0RixJQUFJLENBQUM7WUFDRCxZQUFZLENBQUMsa0JBQWtCLEVBQUUsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFBO1FBQzVELENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2IsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQTtZQUM3QyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxDQUFBO1lBQzFELE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1lBQ3ZDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLGNBQWMsQ0FBQztnQkFDN0MsU0FBUyxFQUFFLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQztnQkFDbkMsT0FBTyxFQUFFLGdDQUFnQzthQUM1QyxDQUFDLENBQUE7WUFDRixNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxjQUFjLENBQUM7Z0JBQzdDLFNBQVMsRUFBRSxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUM7Z0JBQ25DLE9BQU8sRUFBRSxnQ0FBZ0M7YUFDNUMsQ0FBQyxDQUFBO1lBRUYsTUFBTSxPQUFPLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFBO1lBQ2hDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxjQUFjLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQTtRQUNsRCxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUE7SUFFRixFQUFFLENBQUMscUVBQXFFLEVBQUUsR0FBRyxFQUFFO1FBQzNFLE1BQU0sVUFBVSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLEVBQUUsQ0FBQTtRQUVyRSxJQUFJLENBQUM7WUFDRCxZQUFZLENBQUMsVUFBVSxFQUFFLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQTtRQUNwRCxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNiLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLENBQUE7WUFDN0MsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQTtZQUMxRCxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtZQUN2QyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQztnQkFDeEIsYUFBYSxFQUFFO29CQUNYO3dCQUNJLFNBQVMsRUFBRSxDQUFDLE1BQU0sQ0FBQzt3QkFDbkIsT0FBTyxFQUFFLFVBQVU7cUJBQ3RCO2lCQUNKO2FBQ0osQ0FBQyxDQUFBO1FBQ04sQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFBO0lBQ0YsRUFBRSxDQUFDLGtFQUFrRSxFQUFFLEdBQUcsRUFBRTtRQUN4RSxNQUFNLFNBQVMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxFQUFFLENBQUE7UUFFeEUsTUFBTSxnQkFBZ0IsR0FBRyxZQUFZLENBQUMsU0FBUyxFQUFFLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQTtRQUN4RSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQTtJQUN6QyxDQUFDLENBQUMsQ0FBQTtJQUVGLEVBQUUsQ0FBQyx5REFBeUQsRUFBRSxHQUFHLEVBQUU7UUFDL0QsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsa0JBQWtCLENBQUMsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDLENBQUE7UUFDeEUsTUFBTSxLQUFLLEdBQUcsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFBO1FBQzNDLElBQUksQ0FBQztZQUNELFlBQVksQ0FBQyxLQUFLLEVBQUUsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBQ2hELENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2IsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLG9CQUFvQixDQUFDO2dCQUNwQyxPQUFPLEVBQUUsNkNBQTZDO2dCQUN0RCxTQUFTLEVBQUUsU0FBUztnQkFDcEIsS0FBSyxFQUFFO29CQUNILGFBQWEsRUFBRTt3QkFDWDs0QkFDSSxTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUM7NEJBQ2xCLE9BQU8sRUFBRSwyQ0FBMkM7eUJBQ3ZEO3FCQUNKO2lCQUNKO2FBQ0osQ0FBQyxDQUFBO1lBRUYsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFBO1FBQzVCLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQTtBQUNOLENBQUMsQ0FBQyxDQUFBO0FBRUYsUUFBUSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRTtJQUM3QixFQUFFLENBQUMseUdBQXlHLEVBQUUsR0FBRyxFQUFFO1FBQy9HLE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQyxDQUFBO1FBQ3hFLE1BQU0sYUFBYSxHQUFHLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtRQUNuRCxlQUFlLENBQUMsYUFBYSxFQUFFLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQTtRQUV0RCxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsb0JBQW9CLENBQUMsaUJBQWlCLEVBQUU7WUFDdkQsT0FBTyxFQUFFLGdDQUFnQztZQUN6QyxhQUFhLEVBQUU7Z0JBQ1g7b0JBQ0ksU0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDO29CQUNsQixPQUFPLEVBQUUsMkNBQTJDO2lCQUN2RDthQUNKO1NBQ0osQ0FBQyxDQUFBO1FBRUYsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFBO0lBQzVCLENBQUMsQ0FBQyxDQUFBO0FBQ04sQ0FBQyxDQUFDLENBQUEifQ==