import { describe, it, expect, vi, afterEach } from 'vitest';
import { removeSiteFromS3 } from './remove-landing-controller'; // Replace with actual path
import { deleteFolderS3, getFileS3 } from '../utilities/s3Functions.js'; // Replace with actual path
// Mock the S3 functions with correct typing
vi.mock('../utilities/s3Functions.js', () => ({
    getFileS3: vi.fn(), // Correct typing for async function
    deleteFolderS3: vi.fn(), // Correct typing for async function
}));
describe('removeSiteFromS3', () => {
    const apexID = 'testApex';
    afterEach(() => {
        vi.clearAllMocks();
    });
    it('should follow the correct path if siteLayout is not a string', async () => {
        const mockLayout = { publishedDomains: [] } // Simulate an object layout
        ;
        getFileS3.mockResolvedValueOnce(mockLayout);
        await removeSiteFromS3(apexID);
        expect(getFileS3).toHaveBeenCalledWith(`${apexID}/layout.json`, 'site not found in s3');
        expect(deleteFolderS3).toHaveBeenCalledWith(apexID);
    });
    it('should not delete the S3 folder if there are alternate domains', async () => {
        const mockLayout = { publishedDomains: ['domain1', 'domain2'] };
        getFileS3.mockResolvedValueOnce(mockLayout);
        await removeSiteFromS3(apexID);
        expect(getFileS3).toHaveBeenCalledWith(`${apexID}/layout.json`, 'site not found in s3');
        expect(deleteFolderS3).not.toHaveBeenCalled();
    });
    it('should follow the correct path if siteLayout is a string (redirect file exists)', async () => {
        const mockLayoutString = 'some-string';
        const mockRedirectFile = { apexId: 'originalApexID' };
        const mockOriginalLayout = { publishedDomains: [] };
        getFileS3.mockResolvedValueOnce(mockLayoutString) // First call returns string
        ;
        getFileS3.mockResolvedValueOnce(mockRedirectFile) // Second call returns redirect file
        ;
        getFileS3.mockResolvedValueOnce(mockOriginalLayout); // Third call returns original layout
        await removeSiteFromS3(apexID);
        expect(getFileS3).toHaveBeenCalledWith(`${apexID}/layout.json`, 'site not found in s3');
        expect(getFileS3).toHaveBeenCalledWith(`${apexID}/redirect.json`, 'site not found in s3');
        expect(deleteFolderS3).toHaveBeenCalledWith(apexID);
        expect(deleteFolderS3).toHaveBeenCalledWith('originalApexID');
    });
    it('should throw an error if the redirectFile is a string', async () => {
        const mockLayoutString = 'some-string';
        const mockRedirectString = 'another-string' // Just a plain string
        ;
        getFileS3.mockResolvedValueOnce(mockLayoutString) // First call returns string
        ;
        getFileS3.mockResolvedValueOnce(mockRedirectString); // Second call returns string
        await expect(removeSiteFromS3(apexID)).rejects.toThrowError(`ApexID ${apexID} not found in list of created sites during S3 deletion`);
        expect(getFileS3).toHaveBeenCalledWith(`${apexID}/layout.json`, 'site not found in s3');
        expect(getFileS3).toHaveBeenCalledWith(`${apexID}/redirect.json`, 'site not found in s3');
        expect(deleteFolderS3).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlLWxhbmRpbmctY29udHJvbGxlci50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbnRyb2xsZXJzL3JlbW92ZS1sYW5kaW5nLWNvbnRyb2xsZXIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUM1RCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQSxDQUFDLDJCQUEyQjtBQUMxRixPQUFPLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBRSxNQUFNLDZCQUE2QixDQUFBLENBQUMsMkJBQTJCO0FBRW5HLDRDQUE0QztBQUM1QyxFQUFFLENBQUMsSUFBSSxDQUFDLDZCQUE2QixFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDMUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQU8sRUFBRSxvQ0FBb0M7SUFDN0QsY0FBYyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQU8sRUFBRSxvQ0FBb0M7Q0FDckUsQ0FBQyxDQUFDLENBQUE7QUFFSCxRQUFRLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO0lBQzlCLE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQTtJQUV6QixTQUFTLENBQUMsR0FBRyxFQUFFO1FBQ1gsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFBO0lBQ3RCLENBQUMsQ0FBQyxDQUFBO0lBRUYsRUFBRSxDQUFDLDhEQUE4RCxFQUFFLEtBQUssSUFBSSxFQUFFO1FBQzFFLE1BQU0sVUFBVSxHQUFHLEVBQUUsZ0JBQWdCLEVBQUUsRUFBRSxFQUFFLENBQUMsNEJBQTRCO1NBQ3ZFO1FBQUMsU0FBcUIsQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUV6RCxNQUFNLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBRTlCLE1B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