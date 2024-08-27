import { describe, it, expect, vi } from 'vitest'
import { logZodDataParse, zodDataParse } from './utils-zod'
import { z } from 'zod'
import { ValidationError } from '../utilities/errors.js'

const ExampleSchema = z.object({
    name: z.string(),
    age: z.number().min(0).optional(),
    status: z
        .object({
            occupation: z.string(),
        })
        .optional(),
})

describe('zodDataParse', () => {
    it('should return parsed data for valid input', () => {
        const data = { name: 'John Doe', age: 30 }
        const result = zodDataParse(data, ExampleSchema)
        expect(result).toEqual(data)
    })

    it('should throw a ValidationError for invalid input with parse', () => {
        const dataError = { name: 'John Doe', age: -5 }

        try {
            zodDataParse(dataError, ExampleSchema, 'input')
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

    it('should provide all field error data when multiple are present', () => {
        const dataMultipleErrors = { name: 'John Doe', age: -5, status: { occupation: null } }

        try {
            zodDataParse(dataMultipleErrors, ExampleSchema, 'input')
        } catch (error) {
            expect(error).toBeInstanceOf(ValidationError)
            expect(error.message).toBe('Error validating form fields')
            expect(error.errorType).toBe('VAL-004')
            expect(error.state.erroredFields).toContainEqual({
                fieldPath: ['status', 'occupation'],
                message: 'Expected string, received null',
            })
            expect(error.state.erroredFields).toContainEqual({
                fieldPath: ['status', 'occupation'],
                message: 'Expected string, received null',
            })

            const testArr = [{ name: 'jo' }]
            expect(testArr).toContainEqual({ name: 'jo' })
        }
    })

    it('should throw a ValidationError when a required field is not present', () => {
        const dataNoName = { age: 5, status: { occupation: 'construction' } }

        try {
            zodDataParse(dataNoName, ExampleSchema, 'input')
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

        const parsedDataOutput = zodDataParse(dataNoAge, ExampleSchema, 'input')
        expect(parsedDataOutput).toBeTruthy()
    })

    it('should log a different message and type for output data', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
        const data2 = { name: 'John Doe', age: -5 }
        try {
            zodDataParse(data2, ExampleSchema, 'output')
        } catch (error) {
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
            })

            consoleSpy.mockRestore()
        }
    })
})

describe('logZodDataParse', () => {
    it('should log the zod error but NOT throw an error with an invalid input with the logZodDataParse function', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
        const dataErrorSafe = { name: 'John Doe', age: -5 }
        logZodDataParse(dataErrorSafe, ExampleSchema, 'input')

        expect(consoleSpy).toHaveBeenCalledWith('Zod parse error', {
            message: 'Zod parsing error log on input',
            erroredFields: [
                {
                    fieldPath: ['age'],
                    message: 'Number must be greater than or equal to 0',
                },
            ],
        })

        consoleSpy.mockRestore()
    })
})
