import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkPageListForDeployements } from './create-site-controller.js';
import { getFileS3 } from '../utilities/s3Functions';
import { verifyDomain } from './domain-controller.js';
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
        verifyDomain: vi.fn().mockRejectedValue(true),
        fetchDomainData: vi.fn().mockRejectedValue(true),
    };
});
vi.mock('../utilities/s3Functions', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        getFileS3: vi.fn(),
    };
});
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
        vi.resetAllMocks();
    });
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
        const apexID = 'apex123';
        const pageUri = 'test-page';
        const domainName = 'examplesite.com';
        const mockPageList = {
            pages: [
                { slug: 'test-page' }, // Only the matching page exists
            ],
        };
        // Mock the getFileS3 function to return the page list
        vi.mocked(getFileS3).mockResolvedValue(mockPageList);
        // Mock verifyDomain to return false, meaning no other page is found
        vi.mocked(verifyDomain).mockResolvedValue(false);
        const result = await checkPageListForDeployements(apexID, pageUri, domainName);
        expect(result).toBe(false);
    });
    it('should return false if page-list.json is not found', async () => {
        const apexID = 'apex123';
        const pageUri = 'test-page';
        const domainName = 'examplesite.com';
        // Mock the getFileS3 function to return a string indicating the file was not found
        vi.mocked(getFileS3).mockResolvedValue('not found');
        const result = await checkPageListForDeployements(apexID, pageUri, domainName);
        expect(result).toBe(false);
        expect(verifyDomain).not.toHaveBeenCalled(); // verifyDomain shouldn't be called if the file isn't found
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXNpdGUtY29udHJvbGxlci50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbnRyb2xsZXJzL2NyZWF0ZS1zaXRlLWNvbnRyb2xsZXIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUM3RCxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUUxRSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sMEJBQTBCLENBQUE7QUFDcEQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBRXJEOzs7Ozs7Ozs7SUFTSTtBQUVKLDREQUE0RDtBQUM1RCxFQUFFLENBQUMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsRUFBRTtJQUN2RCxNQUFNLE1BQU0sR0FBRyxNQUFNLGNBQWMsRUFBMkMsQ0FBQTtJQUM5RSxPQUFPO1FBQ0gsR0FBRyxNQUFNO1FBQ1QseUJBQXlCLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNsQyw2QkFBNkI7UUFDN0IsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDO1lBQ3pDLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFdBQVcsRUFBRSxDQUFDLHVCQUF1QixFQUFFLHVCQUF1QixFQUFFLHVCQUF1QixDQUFDO1lBQ3hGLFdBQVcsRUFBRSxVQUFVO1lBQ3ZCLE1BQU0sRUFBRSxFQUFFO1lBQ1YsT0FBTyxFQUFFLENBQUMsY0FBYyxFQUFFLGdCQUFnQixDQUFDO1lBQzNDLFNBQVMsRUFBRSxFQUFFO1lBQ2Isa0JBQWtCLEVBQUUsRUFBRTtZQUN0QixhQUFhLEVBQUUsSUFBSTtTQUN0QixDQUFDO1FBQ0YsWUFBWSxFQUFFLEVBQUUsQ0FB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