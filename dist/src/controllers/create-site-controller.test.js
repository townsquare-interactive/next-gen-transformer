import { describe, it, expect, vi, beforeEach } from 'vitest';
import { removeDomainFromVercel } from './create-site-controller.js';
import { SiteDeploymentError } from '../utilities/errors';
import { getFileS3 } from '../utilities/s3Functions';
// Mock the external functions and partially mock the module
vi.mock('./create-site-controller.js', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        modifyDomainPublishStatus: vi.fn(),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXNpdGUtY29udHJvbGxlci50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbnRyb2xsZXJzL2NyZWF0ZS1zaXRlLWNvbnRyb2xsZXIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUM3RCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUNwRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQTtBQUN6RCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sMEJBQTBCLENBQUE7QUFFcEQsNERBQTREO0FBQzVELEVBQUUsQ0FBQyxJQUFJLENBQUMsNkJBQTZCLEVBQUUsS0FBSyxFQUFFLGNBQWMsRUFBRSxFQUFFO0lBQzVELE1BQU0sTUFBTSxHQUFHLE1BQU0sY0FBYyxFQUFnRCxDQUFBO0lBQ25GLE9BQU87UUFDSCxHQUFHLE1BQU07UUFDVCx5QkFBeUIsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO0tBQ3JDLENBQUE7QUFDTCxDQUFDLENBQUMsQ0FBQTtBQUVGLEVBQUUsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsS0FBSyxFQUFFLGNBQWMsRUFBRSxFQUFFO0lBQ3pELE1BQU0sTUFBTSxHQUFHLE1BQU0sY0FBYyxFQUE2QyxDQUFBO0lBQ2hGLE9BQU87UUFDSCxHQUFHLE1BQU07UUFDVCxTQUFTLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRTtLQUNyQixDQUFBO0FBQ0wsQ0FBQyxDQUFDLENBQUE7QUFFRixRQUFRLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFO0lBQ3BDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDWixFQUFFLENBQUMsYUFBYSxFQUFFLENBQUE7SUFDdEIsQ0FBQyxDQUFDLENBQUE7SUFF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