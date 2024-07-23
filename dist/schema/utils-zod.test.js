import { describe, it, expect, vi } from 'vitest'
import { zodDataParse } from './utils-zod'
import { z } from 'zod'
import { ValidationError } from '../src/errors.js'
describe('zodDataParse', () => {
    const ExampleSchema = z.object({
        name: z.string(),
        age: z.number().min(0).optional(),
        status: z
            .object({
                occupation: z.string(),
            })
            .optional(),
    })
    it('should return parsed data for valid input', () => {
        const data = { name: 'John Doe', age: 30 }
        const result = zodDataParse(data, ExampleSchema)
        expect(result).toEqual(data)
    })
    it('should throw a ValidationError for invalid input with parse', () => {
        const dataError = { name: 'John Doe', age: -5 }
        try {
            zodDataParse(dataError, ExampleSchema, 'input', 'parse')
        } catch (error) {
            expect(error).toBeInstanceOf(ValidationError)
            expect(error.message).toBe('Error validating form fields')
            expect(error.errorType).toBe('VAL-004')
            expect(error.state).toEqual({
                erroredFields: [
                    {
                        fieldPath: ['age'],
                        message: 'Number must be greater than or equal to 0',
                    },
                ],
            })
        }
    })
    it('should log the zod error but NOT throw an error with an invalid input with safeParse param', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
        const dataErrorSafe = { name: 'John Doe', age: -5 }
        zodDataParse(dataErrorSafe, ExampleSchema, 'input', 'safeParse')
        expect(consoleSpy).toHaveBeenCalledWith('Zod parse error', {
            message: 'Error validating form fields',
            errorType: 'VAL-004',
            state: {
                erroredFields: [
                    {
                        fieldPath: ['age'],
                        message: 'Number must be greater than or equal to 0',
                    },
                ],
            },
        })
        consoleSpy.mockRestore()
    })
    it('should provide all field error data when multiple are present', () => {
        const dataMultipleErrors = { name: 'John Doe', age: -5, status: { occupation: null } }
        try {
            zodDataParse(dataMultipleErrors, ExampleSchema, 'input', 'parse')
        } catch (error) {
            expect(error).toBeInstanceOf(ValidationError)
            expect(error.message).toBe('Error validating form fields')
            expect(error.errorType).toBe('VAL-004')
            expect(error.state).toEqual({
                erroredFields: [
                    {
                        fieldPath: ['age'],
                        message: 'Number must be greater than or equal to 0',
                    },
                    {
                        fieldPath: ['status', 'occupation'],
                        message: 'Expected string, received null',
                    },
                ],
            })
        }
    })
    it('should throw a ValidationError when a required field is not present', () => {
        const dataNoName = { age: 5, status: { occupation: 'construction' } }
        try {
            zodDataParse(dataNoName, ExampleSchema, 'input', 'parse')
        } catch (error) {
            expect(error).toBeInstanceOf(ValidationError)
            expect(error.message).toBe('Error validating form fields')
            expect(error.errorType).toBe('VAL-004')
            expect(error.state).toEqual({
                erroredFields: [
                    {
                        fieldPath: ['name'],
                        message: 'Required',
                    },
                ],
            })
        }
    })
    it('should NOT throw an error when an optional field is not included', () => {
        const dataNoAge = { name: 'Jo', status: { occupation: 'construction' } }
        const parsedDataOutput = zodDataParse(dataNoAge, ExampleSchema, 'input', 'parse')
        expect(parsedDataOutput).toBeTruthy()
    })
    it('should log a different message and type for output data', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
        const data2 = { name: 'John Doe', age: -5 }
        zodDataParse(data2, ExampleSchema, 'output', 'safeParse')
        expect(consoleSpy).toHaveBeenCalledWith('Zod parse error', {
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
        })
        consoleSpy.mockRestore()
    })
})
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMtem9kLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zY2hlbWEvdXRpbHMtem9kLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUNqRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sYUFBYSxDQUFBO0FBQzFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsTUFBTSxLQUFLLENBQUE7QUFDdkIsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGVBQWUsQ0FBQTtBQUUvQyxRQUFRLENBQUMsY0FBYyxFQUFFLEdBQUcsRUFBRTtJQUMxQixNQUFNLGFBQWEsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQzNCLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO1FBQ2hCLEdBQUcsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRTtRQUNqQyxNQUFNLEVBQUUsQ0FBQzthQUNKLE1BQU0sQ0FBQztZQUNKLFVBQVUsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO1NBQ3pCLENBQUM7YUFDRCxRQUFRLEVBQUU7S0FDbEIsQ0FBQyxDQUFBO0lBRUYsRUFBRSxDQUFDLDJDQUEyQyxFQUFFLEdBQUcsRUFBRTtRQUNqRCxNQUFNLElBQUksR0FBRyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFBO1FBQzFDLE1BQU0sTUFBTSxHQUFHLFlBQVksQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUE7UUFDaEQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNoQyxDQUFDLENBQUMsQ0FBQTtJQUVGLEVBQUUsQ0FBQyw2REFBNkQsRUFBRSxHQUFHLEVBQUU7UUFD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
