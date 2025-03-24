import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkDomainConfigOnVercel, verifyDomain } from './domain-service.js'

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
