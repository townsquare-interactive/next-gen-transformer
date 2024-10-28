import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkPageListForDeployements } from './create-site-controller.js'
import { SiteDeploymentError } from '../utilities/errors'
import { getFileS3 } from '../utilities/s3Functions'
import { verifyDomain } from './domain-controller.js'

/* const mockResponse = {
    configuredBy: null,
    nameservers: ['ns1.safesecureweb.com', 'ns2.safesecureweb.com', 'ns3.safesecureweb.com'],
    serviceType: 'external',
    cnames: [],
    aValues: ['3.18.255.247', '34.224.149.186'],
    conflicts: [],
    acceptedChallenges: [],
    misconfigured: true,
} */

// Mock the external functions and partially mock the module
vi.mock('./domain-controller.js', async (importOriginal) => {
    const actual = await importOriginal<typeof import('./domain-controller.js')>()
    return {
        ...actual,
        modifyDomainPublishStatus: vi.fn(),
        //fetchDomainConfig: vi.fn(),
        fetchDomainConfig: vi.fn().mockResolvedValue({
            configuredBy: null,
            nameservers: ['ns1.safesecureweb.com', 'ns2.safesecureweb.com', 'ns3.safesecureweb.com'],
            serviceType: 'external',
            cnames: [],
            aValues: ['3.18.255.247', '34.224.149.186'],
            conflicts: [],
            acceptedChallenges: [],
            misconfigured: true,
        }),
        verifyDomain: vi.fn().mockRejectedValue(true),
        fetchDomainData: vi.fn().mockRejectedValue(true),
    }
})

vi.mock('../utilities/s3Functions', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../utilities/s3Functions')>()
    return {
        ...actual,
        getFileS3: vi.fn(),
    }
})

/* describe('removeDomainFromVercel', () => {
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
}) */

describe('checkPageListForDeployements', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    /*     it('should return true if an alternative page is found', async () => {
        const apexID = 'apex123'
        const pageUri = 'test-page'
        const domainName = 'examplesite.com'
        const mockPageList = {
            pages: [
                { slug: 'other-page' },
                { slug: 'test-page' }, // The page we're looking for
            ],
        }

        // Mock the getFileS3 function to return the page list
        vi.mocked(getFileS3).mockResolvedValue(mockPageList)

        // Mock verifyDomain to return true for the domain check
        vi.mocked(verifyDomain).mockResolvedValue(true)

        const result = await checkPageListForDeployements(apexID, 'other-page', domainName)

        expect(result).toBe(true)
        expect(verifyDomain).toHaveBeenCalledWith(`${domainName}/other-page`)
    }) */

    it('should return false if no alternative page is found', async () => {
        const apexID = 'apex123'
        const pageUri = 'test-page'
        const domainName = 'examplesite.com'
        const mockPageList = {
            pages: [
                { slug: 'test-page' }, // Only the matching page exists
            ],
        }

        // Mock the getFileS3 function to return the page list
        vi.mocked(getFileS3).mockResolvedValue(mockPageList)

        // Mock verifyDomain to return false, meaning no other page is found
        vi.mocked(verifyDomain).mockResolvedValue(false)

        const result = await checkPageListForDeployements(apexID, pageUri, domainName)

        expect(result).toBe(false)
    })

    it('should return false if page-list.json is not found', async () => {
        const apexID = 'apex123'
        const pageUri = 'test-page'
        const domainName = 'examplesite.com'

        // Mock the getFileS3 function to return a string indicating the file was not found
        vi.mocked(getFileS3).mockResolvedValue('not found')

        const result = await checkPageListForDeployements(apexID, pageUri, domainName)

        expect(result).toBe(false)
        expect(verifyDomain).not.toHaveBeenCalled() // verifyDomain shouldn't be called if the file isn't found
    })
})
