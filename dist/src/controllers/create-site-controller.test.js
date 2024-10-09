import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkDomainConfigOnVercel, removeDomainFromVercel } from './create-site-controller.js';
import { SiteDeploymentError } from '../utilities/errors';
import { getFileS3 } from '../utilities/s3Functions';
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
    const actual = await importOriginal();
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
    };
});
vi.mock('../utilities/s3Functions', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        getFileS3: vi.fn(),
    };
});
describe('removeDomainFromVercel', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });
    it('should remove the domain successfully if it is published in S3', async () => {
        const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: () => ({}) });
        global.fetch = mockFetch;
        const subdomain = 'examplesite.townsquareignite.ai';
        const mockLayout = {
            publishedDomains: [subdomain],
        };
        // Mock the getFileS3 function to return the layout
        vi.mocked(getFileS3).mockResolvedValue(mockLayout);
        const result = await removeDomainFromVercel(subdomain);
        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining(`/domains/${subdomain}`), expect.objectContaining({ method: 'DELETE' }));
        expect(result).toEqual({ message: 'site domain unpublished', domain: subdomain, status: 'Success' });
    });
    it('should throw an error if the domain is not published in S3', async () => {
        const subdomain = 'examplesite.townsquareignite.ai';
        const noDomainsLayout = {
            publishedDomains: [],
        };
        // Mock the getFileS3 function to return the layout
        vi.mocked(getFileS3).mockResolvedValue(noDomainsLayout);
        await expect(removeDomainFromVercel(subdomain)).rejects.toThrow(SiteDeploymentError);
    });
    it('should throw an error if the site is not found in S3', async () => {
        const subdomain = 'examplesite.townsquareignite.ai';
        const noS3 = 'Site not found';
        // Mock the getFileS3 function to return the layout
        vi.mocked(getFileS3).mockResolvedValue(noS3);
        await expect(removeDomainFromVercel(subdomain)).rejects.toThrow(SiteDeploymentError);
    });
    it('should throw an error if the fetch fails', async () => {
        const mockFetch = vi.fn().mockRejectedValue(new Error('Fetch error'));
        global.fetch = mockFetch;
        const subdomain = 'examplesite.townsquareignite.ai';
        const exSiteLayout = {
            publishedDomains: [subdomain],
        };
        // Mock the getFileS3 function to return the layout
        vi.mocked(getFileS3).mockResolvedValue(exSiteLayout);
        await expect(removeDomainFromVercel(subdomain)).rejects.toThrow(SiteDeploymentError);
        expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining(`/domains/${subdomain}`), expect.objectContaining({ method: 'DELETE' }));
    });
});
describe('checkDomainConfigOnVercel', () => {
    it('should create an array from a response with A records', async () => {
        const domain = 'testdomain.com';
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
        };
        // Mock the fetch function to return the expected response
        global.fetch = vi.fn().mockResolvedValue(mockResponse);
        // Call the function being tested
        const result = await checkDomainConfigOnVercel(domain);
        // Check individual fields
        expect(result.misconfigured).toBe(true);
        expect(result.domain).toBe(domain);
        expect(result.dnsRecords).toHaveLength(2);
        // Check that the dnsRecords array contains both expected objects
        expect(result.dnsRecords).toEqual(expect.arrayContaining([
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
        ]));
    });
    it('the DNS section of the return should be empty when there are no aValues from the fetch', async () => {
        const domain = 'testdomain.com';
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
        };
        // Mock the fetch function to return the expected response
        global.fetch = vi.fn().mockResolvedValue(mockResponse);
        // Call the function being tested
        const result = await checkDomainConfigOnVercel(domain);
        // Check that the dnsRecords array contains both expected objects
        expect(result.dnsRecords).toHaveLength(0);
    });
    it('should throw an error if the fetch response is invalid or unsuccessful', async () => {
        const domain = 'testdomain.com';
        const mockErrorResponse = {
            ok: false,
            json: async () => ({
                message: 'Invalid domain configuration',
            }),
        };
        // Mock the fetch function to return the invalid response
        global.fetch = vi.fn().mockResolvedValue(mockErrorResponse);
        // Use the `.rejects` matcher to check for the thrown error
        await expect(checkDomainConfigOnVercel(domain)).rejects.toThrow('Error checking domain config');
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXNpdGUtY29udHJvbGxlci50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbnRyb2xsZXJzL2NyZWF0ZS1zaXRlLWNvbnRyb2xsZXIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUM3RCxPQUFPLEVBQUUseUJBQXlCLEVBQXFCLHNCQUFzQixFQUFFLE1BQU0sNkJBQTZCLENBQUE7QUFDbEgsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0scUJBQXFCLENBQUE7QUFDekQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDBCQUEwQixDQUFBO0FBRXBEOzs7Ozs7Ozs7SUFTSTtBQUVKLDREQUE0RDtBQUM1RCxFQUFFLENBQUMsSUFBSSxDQUFDLDZCQUE2QixFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsRUFBRTtJQUM1RCxNQUFNLE1BQU0sR0FBRyxNQUFNLGNBQWMsRUFBZ0QsQ0FBQTtJQUNuRixPQUFPO1FBQ0gsR0FBRyxNQUFNO1FBQ1QseUJBQXlCLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNsQyw2QkFBNkI7UUFDN0IsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDO1lBQ3pDLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFdBQVcsRUFBRSxDQUFDLHVCQUF1QixFQUFFLHVCQUF1QixFQUFFLHVCQUF1QixDQUFDO1lBQ3hGLFdBQVcsRUFBRSxVQUFVO1lBQ3ZCLE1BQU0sRUFBRSxFQUFFO1lBQ1YsT0FBTyxFQUFFLENBQUMsY0FBYyxFQUFFLGdCQUFnQixDQUFDO1lBQzNDLFNBQVMsRUFBRSxFQUFFO1lBQ2Isa0JBQWtCLEVBQUUsRUFBRTtZQUN0QixhQUFhLEVBQUUsSUFBSTtTQUN0QixDQUFDO0tBQ0wsQ0FB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