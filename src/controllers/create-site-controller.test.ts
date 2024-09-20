import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkDomainConfigOnVercel, fetchDomainConfig, removeDomainFromVercel } from './create-site-controller.js'
import { SiteDeploymentError } from '../utilities/errors'
import { getFileS3 } from '../utilities/s3Functions'

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
vi.mock('./create-site-controller.js', async (importOriginal) => {
    const actual = await importOriginal<typeof import('./create-site-controller.js')>()
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

describe('checkDomainConfigOnVercel', () => {
    it('should create an array from a response with A records', async () => {
        const domain = 'testdomain.com'
        const mockResponse = {
            ok: true,
            json: async () => ({
                configuredBy: null,
                nameservers: ['ns1.safesecureweb.com', 'ns2.safesecureweb.com', 'ns3.safesecureweb.com'],
                serviceType: 'external',
                cnames: [],
                aValues: ['3.18.255.247', '34.224.149.186'],
                conflicts: [],
                acceptedChallenges: [],
                misconfigured: true,
            }),
        }

        // Mock the fetch function to return the expected response
        global.fetch = vi.fn().mockResolvedValue(mockResponse)

        // Call the function being tested
        const result = await checkDomainConfigOnVercel(domain)

        // Check individual fields
        expect(result.misconfigured).toBe(true)
        expect(result.domain).toBe(domain)
        expect(result.dnsRecords).toHaveLength(2)

        // Check that the dnsRecords array contains both expected objects
        expect(result.dnsRecords).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    type: 'A',
                    host: '@',
                    value: '3.18.255.247',
                    ttl: 3600,
                }),
                expect.objectContaining({
                    type: 'A',
                    host: '@',
                    value: '34.224.149.186',
                    ttl: 3600,
                }),
            ])
        )
    })
    it('the DNS section of the return should be empty when there are no aValues from the fetch', async () => {
        const domain = 'testdomain.com'
        const mockResponse = {
            ok: true,
            json: async () => ({
                configuredBy: null,
                nameservers: ['ns1.safesecureweb.com', 'ns2.safesecureweb.com', 'ns3.safesecureweb.com'],
                serviceType: 'external',
                cnames: [],
                aValues: [],
                conflicts: [],
                acceptedChallenges: [],
                misconfigured: true,
            }),
        }

        // Mock the fetch function to return the expected response
        global.fetch = vi.fn().mockResolvedValue(mockResponse)

        // Call the function being tested
        const result = await checkDomainConfigOnVercel(domain)

        // Check that the dnsRecords array contains both expected objects
        expect(result.dnsRecords).toHaveLength(0)
    })

    it('should throw an error if the fetch response is invalid or unsuccessful', async () => {
        const domain = 'testdomain.com'

        const mockErrorResponse = {
            ok: false,
            json: async () => ({
                message: 'Invalid domain configuration',
            }),
        }

        // Mock the fetch function to return the invalid response
        global.fetch = vi.fn().mockResolvedValue(mockErrorResponse)

        // Use the `.rejects` matcher to check for the thrown error
        await expect(checkDomainConfigOnVercel(domain)).rejects.toThrow('Error checking domain config')
    })
})
