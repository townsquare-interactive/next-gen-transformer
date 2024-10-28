import { describe, it, expect, afterEach, vi } from 'vitest';
import { removeDomainAndS3, removeLandingProject } from './remove-landing-controller.js';
import { getFileS3 } from '../utilities/s3Functions.js';
// Mock the S3 functions with correct typing
vi.mock('../utilities/s3Functions.js', () => ({
    getFileS3: vi.fn(),
}));
vi.mock('./remove-landing-controller', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        removeDomainAndS3: vi.fn(),
        removeSiteFromS3: vi.fn(),
        removeLandingPage: vi.fn(),
    };
});
describe('removeLandingProject', () => {
    const req = { apexID: 'testApex' };
    afterEach(() => {
        vi.clearAllMocks();
    });
    /* it('should remove domains when siteLayout is not a string', async () => {
        const mockLayout = { publishedDomains: ['domain1', 'domain2'] }

        vi.mocked(getFileS3).mockResolvedValue(mockLayout)
        vi.mocked(removeDomainAndS3).mockResolvedValue({ domain: 'domain1', message: 'removed', status: 'Success' })

        const response = await removeLandingProject(req)

        expect(getFileS3).toHaveBeenCalledWith(`${req.apexID}/layout.json`, 'site not found in s3')
        expect(removeDomainAndS3).toHaveBeenCalledTimes(2)
        expect(removeDomainAndS3).toHaveBeenCalledWith('domain1')
        expect(removeDomainAndS3).toHaveBeenCalledWith('domain2')
        expect(response).toEqual({
            message: 'apexID removed sucessfully',
            apexID: 'testApex',
            status: 'Success',
        })
    }) */
    it('should throw an error if siteLayout is a string', async () => {
        vi.mocked(getFileS3).mockResolvedValue('some-string');
        await expect(removeLandingProject(req)).rejects.toThrowError(`ApexID ${req.apexID} not found in list of client site files`);
        expect(getFileS3).toHaveBeenCalledWith(`${req.apexID}/layout.json`, 'site not found in s3');
        expect(removeDomainAndS3).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlLWxhbmRpbmctY29udHJvbGxlci50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbnRyb2xsZXJzL3JlbW92ZS1sYW5kaW5nLWNvbnRyb2xsZXIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBYyxNQUFNLFFBQVEsQ0FBQTtBQUN4RSxPQUFPLEVBQXVDLGlCQUFpQixFQUFFLG9CQUFvQixFQUFFLE1BQU0sZ0NBQWdDLENBQUE7QUFDN0gsT0FBTyxFQUFrQixTQUFTLEVBQTJCLE1BQU0sNkJBQTZCLENBQUE7QUFHaEcsNENBQTRDO0FBQzVDLEVBQUUsQ0FBQyxJQUFJLENBQUMsNkJBQTZCLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUMxQyxTQUFTLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBTztDQUMxQixDQUFDLENBQUMsQ0FBQTtBQUVILEVBQUUsQ0FBQyxJQUFJLENBQUMsNkJBQTZCLEVBQUUsS0FBSyxFQUFFLGNBQWMsRUFBRSxFQUFFO0lBQzVELE1BQU0sTUFBTSxHQUFHLE1BQU0sY0FBYyxFQUFnRCxDQUFBO0lBQ25GLE9BQU87UUFDSCxHQUFHLE1BQU07UUFDVCxpQkFBaUIsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQzFCLGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDekIsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRTtLQUM3QixDQUFBO0FBQ0wsQ0FBQyxDQUFDLENBQUE7QUFFRixRQUFRLENBQUMsc0JBQXNCLEVBQUUsR0FBRyxFQUFFO0lBQ2xDLE1BQU0sR0FBRyxHQUFHLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxDQUFBO0lBRWxDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7UUFDWCxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUE7SUFDdEIsQ0FBQyxDQUFDLENBQUE7SUFFRjs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FpQks7SUFFTCxFQUFFLENBQUMsaURBQWlELEVBQUUsS0FBSyxJQUFJLEVBQUU7UUFDN0QsRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsQ0FBQTtRQUVyRCxNQUFNLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsVUFBVSxHQUFHLENBQUMsTUFBTSx5Q0FBeUMsQ0FBQyxDQUFBO1FBRTNILE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLGNBQWMsRUFBRSxzQkFBc0IsQ0FBQyxDQUFBO1FBQzNGLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFBO0lBQ3BELENBQUMsQ0FBQyxDQUFBO0FBQ04sQ0FBQyxDQUFDLENBQUEifQ==