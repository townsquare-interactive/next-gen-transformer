import { describe, it, expect, vi } from 'vitest'
import { toggleBusinessSchema } from './toggleBusinessSchema.js'
import { DataUploadError } from '../../utilities/errors.js'

describe('toggleBusinessSchema', () => {
    it('should enable business schema when no missing required fields', async () => {
        const mockGetDudaFunction = vi.fn().mockResolvedValue({
            schemas: {
                local_business: {
                    enabled: true,
                },
            },
        })
        const mockUpdateSiteFunction = vi.fn().mockResolvedValue({})
        const result = await toggleBusinessSchema('test-site', true, {
            getDudaFunction: mockGetDudaFunction,
            updateSiteContentFunction: mockUpdateSiteFunction,
        })
        expect(result).toEqual('business schema enabled')
    })
    it('should disable business schema', async () => {
        const mockGetDudaFunction = vi.fn().mockResolvedValue({
            schemas: {
                local_business: {
                    enabled: true,
                },
            },
        })
        const mockUpdateSiteFunction = vi.fn().mockResolvedValue({})
        const result = await toggleBusinessSchema('test-site', false, {
            getDudaFunction: mockGetDudaFunction,
            updateSiteContentFunction: mockUpdateSiteFunction,
        })
        expect(result).toEqual('business schema disabled')
    })
    it('should throw an error when missing required fields', async () => {
        const mockGetDudaFunction = vi.fn().mockResolvedValue({
            schemas: {
                local_business: {
                    enabled: true,
                    missing_required_fields: ['Business Name', 'Geo Coordinates', 'Physical Address'],
                },
            },
        })
        const mockUpdateSiteFunction = vi.fn().mockResolvedValue({})
        try {
            const result = await toggleBusinessSchema('test-site', true, {
                getDudaFunction: mockGetDudaFunction,
                updateSiteContentFunction: mockUpdateSiteFunction,
            })
        } catch (error) {
            expect(error).toBeInstanceOf(DataUploadError)
        }
    })
})
