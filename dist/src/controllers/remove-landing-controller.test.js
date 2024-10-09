import { describe, it, expect, afterEach, vi } from 'vitest';
import { removeSiteFromS3 } from './remove-landing-controller';
import { deleteFolderS3, getFileS3 } from '../utilities/s3Functions.js';
// Mock the S3 functions with correct typing
vi.mock('../utilities/s3Functions.js', () => ({
    getFileS3: vi.fn(),
    deleteFolderS3: vi.fn(),
}));
describe('removeSiteFromS3', () => {
    const apexID = 'testApex';
    afterEach(() => {
        vi.clearAllMocks();
    });
    it('should follow the correct path if siteLayout is not a string', async () => {
        const mockLayout = { publishedDomains: [] };
        getFileS3.mockResolvedValueOnce(mockLayout);
        await removeSiteFromS3(apexID, '');
        expect(getFileS3).toHaveBeenCalledWith(`${apexID}/layout.json`, 'site not found in s3');
        expect(deleteFolderS3).toHaveBeenCalledWith(apexID);
    });
    it('should not delete the S3 folder if there are alternate domains', async () => {
        const mockLayout = { publishedDomains: ['domain1', 'domain2'] };
        getFileS3.mockResolvedValueOnce(mockLayout);
        await removeSiteFromS3(apexID, '');
        expect(getFileS3).toHaveBeenCalledWith(`${apexID}/layout.json`, 'site not found in s3');
        expect(deleteFolderS3).not.toHaveBeenCalled();
    });
    it('should follow the correct path if siteLayout is a string (redirect file exists)', async () => {
        const mockLayoutString = 'some-string';
        const mockRedirectFile = { apexId: 'originalApexID' };
        const mockOriginalLayout = { publishedDomains: [] };
        getFileS3.mockResolvedValueOnce(mockLayoutString);
        getFileS3.mockResolvedValueOnce(mockRedirectFile);
        getFileS3.mockResolvedValueOnce(mockOriginalLayout);
        await removeSiteFromS3(apexID, '');
        expect(getFileS3).toHaveBeenCalledWith(`${apexID}/layout.json`, 'site not found in s3');
        expect(getFileS3).toHaveBeenCalledWith(`${apexID}/redirect.json`, 'site not found in s3');
        expect(deleteFolderS3).toHaveBeenCalledWith(apexID);
        expect(deleteFolderS3).toHaveBeenCalledWith('originalApexID');
    });
    it('should throw an error if the redirectFile is a string', async () => {
        const mockLayoutString = 'some-string';
        const mockRedirectString = 'another-string';
        getFileS3.mockResolvedValueOnce(mockLayoutString);
        getFileS3.mockResolvedValueOnce(mockRedirectString);
        await expect(removeSiteFromS3(apexID, '')).rejects.toThrowError(`ApexID ${apexID} not found in list of created sites during S3 deletion`);
        expect(getFileS3).toHaveBeenCalledWith(`${apexID}/layout.json`, 'site not found in s3');
        expect(getFileS3).toHaveBeenCalledWith(`${apexID}/redirect.json`, 'site not found in s3');
        expect(deleteFolderS3).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlLWxhbmRpbmctY29udHJvbGxlci50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbnRyb2xsZXJzL3JlbW92ZS1sYW5kaW5nLWNvbnRyb2xsZXIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUM1RCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUM5RCxPQUFPLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBRSxNQUFNLDZCQUE2QixDQUFBO0FBRXZFLDRDQUE0QztBQUM1QyxFQUFFLENBQUMsSUFBSSxDQUFDLDZCQUE2QixFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDMUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQU87SUFDdkIsY0FBYyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQU87Q0FDL0IsQ0FBQyxDQUFDLENBQUE7QUFFSCxRQUFRLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO0lBQzlCLE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQTtJQUV6QixTQUFTLENBQUMsR0FBRyxFQUFFO1FBQ1gsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFBO0lBQ3RCLENBQUMsQ0FBQyxDQUFBO0lBRUYsRUFBRSxDQUFDLDhEQUE4RCxFQUFFLEtBQUssSUFBSSxFQUFFO1FBQzFFLE1BQU0sVUFBVSxHQUFHLEVBQUUsZ0JBQWdCLEVBQUUsRUFBRSxFQUFFLENBQzFDO1FBQUMsU0FBaUIsQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUVyRCxNQUFNLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUVsQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsb0JBQW9CLENBQUMsR0FBRyxNQUFNLGNBQWMs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