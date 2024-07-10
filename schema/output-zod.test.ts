import { describe, it, expect, vi } from 'vitest'
import { zodDataParse } from './output-zod'
import { z } from 'zod'
import { ValidationError } from '../src/errors'

describe('zodDataParse', () => {
    const ExampleSchema = z.object({
        name: z.string(),
        age: z.number().min(0),
    })

    it('should return parsed data for valid input', () => {
        const data = { name: 'John Doe', age: 30 }
        const result = zodDataParse(data, ExampleSchema)
        expect(result).toEqual(data)
    })

    it('should log the zod error with an invalid input with safeParse param', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
        const data = { name: 'John Doe', age: -5 }
        const result = zodDataParse(data, ExampleSchema, 'input', 'safeParse')

        expect(consoleSpy).toHaveBeenCalledWith('Zod parse error', {
            message: 'Error validating form fields',
            errorType: 'VAL-004',
            state: { errorFields: 'age' },
        })

        consoleSpy.mockRestore()
    })

    it('should throw ValidationError for invalid input with parse', () => {
        const data = { name: 'John Doe', age: -5 }

        expect(() => {
            zodDataParse(data, ExampleSchema, 'input', 'parse')
        }).toThrowError(
            new ValidationError({
                message: 'Error validating form fields',
                errorType: 'VAL-004',
                state: { errorFields: 'age' },
            })
        )
    })
})
