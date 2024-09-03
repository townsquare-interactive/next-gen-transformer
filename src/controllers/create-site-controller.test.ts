import { describe, it, expect, vi, beforeEach } from 'vitest'
import { removeDomainFromVercel } from './create-site-controller.js'
import { SiteDeploymentError } from '../utilities/errors'
import { getFileS3 } from '../utilities/s3Functions'

// Mock the external functions and partially mock the module
vi.mock('./create-site-controller.js', async (importOriginal) => {
    const actual = await importOriginal<typeof import('./create-site-controller.js')>()
    return {
        ...actual,
        modifyDomainPublishStatus: vi.fn(),
    }
})

vi.mock('../utilities/s3Functions', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../utilities/s3Functions')>()
    return {
        ...actual,
        getFileS3: vi.fn(),
    }
})

describe('removeDomainFromVercel', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it('should remove the domain successfully if it is published in S3', async () => {
        const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: () => ({}) })
        global.fetch = mockFetch as any

        const subdomain = 'examplesite.townsquareignite.ai'
        const mockLayout = {
            publishedDomains: [subdomain],
        }

        // Mock the getFileS3 function to return the layout
        vi.mocked(getFileS3).mockResolvedValue(mockLayout)

        const result = await removeDomainFromVercel(subdomain)

        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining(`/domains/${subdomain}`), expect.objectContaining({ method: 'DELETE' }))
        expect(result).toEqual({ message: 'site domain unpublished', domain: subdomain, status: 'Success' })
    })

    it('should throw an error if the domain is not published in S3', async () => {
        const subdomain = 'examplesite.townsquareignite.ai'
        const noDomainsLayout = {
            publishedDomains: [],
        }

        // Mock the getFileS3 function to return the layout
        vi.mocked(getFileS3).mockResolvedValue(noDomainsLayout)

        await expect(removeDomainFromVercel(subdomain)).rejects.toThrow(SiteDeploymentError)
    })

    it('should throw an error if the site is not found in S3', async () => {
        const subdomain = 'examplesite.townsquareignite.ai'
        const noS3 = 'Site not found'

        // Mock the getFileS3 function to return the layout
        vi.mocked(getFileS3).mockResolvedValue(noS3)

        await expect(removeDomainFromVercel(subdomain)).rejects.toThrow(SiteDeploymentError)
    })

    it('should throw an error if the fetch fails', async () => {
        const mockFetch = vi.fn().mockRejectedValue(new Error('Fetch error'))
        global.fetch = mockFetch as any

        const subdomain = 'examplesite.townsquareignite.ai'
        const exSiteLayout = {
            publishedDomains: [subdomain],
        }

        // Mock the getFileS3 function to return the layout
        vi.mocked(getFileS3).mockResolvedValue(exSiteLayout)

        await expect(removeDomainFromVercel(subdomain)).rejects.toThrow(SiteDeploymentError)

        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining(`/domains/${subdomain}`), expect.objectContaining({ method: 'DELETE' }))
    })
})
