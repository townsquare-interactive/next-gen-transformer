import { describe, it, expect, afterEach, vi } from 'vitest';
import { removeDomainAndS3, removeLandingProject } from './remove-landing-controller.js';
import { getFileS3 } from '../utilities/s3Functions.js';
import { getPageLayoutVars, getPageList } from './create-site-controller.js';
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
        removeLandingPage: vi.fn().mockResolvedValue({}),
    };
});
// Mock the S3 functions with correct typing
vi.mock('../utilities/s3Functions.js', () => ({
    getFileS3: vi.fn(),
    addFileS3: vi.fn(),
    deleteFileS3: vi.fn(),
}));
vi.mock('./create-site-controller.js', () => ({
    getPageList: vi.fn(),
    getPageLayoutVars: vi.fn(),
    getPageandLanding: vi.fn(),
    checkPageListForDeployements: vi.fn(),
    modifyLandingDomainPublishStatus: vi.fn(),
}));
describe('removeLandingProject', () => {
    const req = { apexID: 'testApex' };
    afterEach(() => {
        vi.clearAllMocks();
    });
    /*      it('should remove domains when siteLayout is not a string', async () => {
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
    })  */
    /*  it('should remove the domain correctly when the layout file is right', async () => {
        const pageList = {
            pages: [
                {
                    slug: 'name',
                    name: 'name',
                    url: '/name',
                    id: 'sdfdsf',
                },
            ],
        }
        const mockLayout: any = { publishedDomains: ['name'] }
        const pageLayout: any = { mockLayout }

        const resolvedPageAndLanding = { mockLayout, pageLayout }

        vi.mocked(getPageList).mockResolvedValue(pageList)
        vi.mocked(getPageLayoutVars).mockResolvedValue(mockLayout)
        vi.mocked(getFileS3).mockResolvedValue('some-string')
        vi.mocked(getPageandLanding).mockResolvedValue({ siteLayout: mockLayout, sitePage: pageLayout })
        //checkPageListForDeployements
        vi.mocked(checkPageListForDeployements).mockResolvedValue(true)
        vi.mocked(removeLandingPage).mockResolvedValue()

        //

        const response = await removeLandingProject(req)

        expect(getPageLayoutVars).toHaveBeenCalledWith(req.apexID, 'name')
        expect(removeDomainAndS3).toHaveBeenCalledTimes(1)
        expect(removeDomainAndS3).toHaveBeenCalledWith('name')
        expect(response).toEqual({
            message: 'apexID removed sucessfully',
            apexID: 'testApex',
            status: 'Success',
        })
    }) */
    it('should throw an error if siteLayout is a string', async () => {
        const pageList = {
            pages: [
                {
                    slug: 'name',
                    name: 'name',
                    url: '/name',
                    id: 'sdfdsf',
                },
            ],
        };
        const fakeValue = 'some string';
        vi.mocked(getPageList).mockResolvedValue(pageList);
        vi.mocked(getPageLayoutVars).mockResolvedValue(fakeValue);
        vi.mocked(getFileS3).mockResolvedValue(fakeValue);
        await expect(removeLandingProject(req)).rejects.toThrowError(`ApexID ${req.apexID} not found in list of client site files`);
        //expect(getFileS3).toHaveBeenCalledWith(`${req.apexID}/layout.json`, 'site not found in s3')
        expect(getPageLayoutVars).toHaveBeenCalledWith(req.apexID, 'name');
        expect(removeDomainAndS3).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlLWxhbmRpbmctY29udHJvbGxlci50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbnRyb2xsZXJzL3JlbW92ZS1sYW5kaW5nLWNvbnRyb2xsZXIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBYyxNQUFNLFFBQVEsQ0FBQTtBQUN4RSxPQUFPLEVBQXVDLGlCQUFpQixFQUFFLG9CQUFvQixFQUFFLE1BQU0sZ0NBQWdDLENBQUE7QUFDN0gsT0FBTyxFQUFrQixTQUFTLEVBQTJCLE1BQU0sNkJBQTZCLENBQUE7QUFDaEcsT0FBTyxFQUFnQyxpQkFBaUIsRUFBRSxXQUFXLEVBQXFCLE1BQU0sNkJBQTZCLENBQUE7QUFFN0gsNENBQTRDO0FBQzVDLEVBQUUsQ0FBQyxJQUFJLENBQUMsNkJBQTZCLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUMxQyxTQUFTLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBTztDQUMxQixDQUFDLENBQUMsQ0FBQTtBQUVILEVBQUUsQ0FBQyxJQUFJLENBQUMsNkJBQTZCLEVBQUUsS0FBSyxFQUFFLGNBQWMsRUFBRSxFQUFFO0lBQzVELE1BQU0sTUFBTSxHQUFHLE1BQU0sY0FBYyxFQUFnRCxDQUFBO0lBQ25GLE9BQU87UUFDSCxHQUFHLE1BQU07UUFDVCxpQkFBaUIsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQzFCLGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDekIsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsQ0FBQztLQUNuRCxDQUFBO0FBQ0wsQ0FBQyxDQUFDLENBQUE7QUFFRiw0Q0FBNEM7QUFDNUMsRUFBRSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQzFDLFNBQVMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFPO0lBQ3ZCLFNBQVMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFPO0lBQ3ZCLFlBQVksRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFPO0NBQzdCLENBQUMsQ0FBQyxDQUFBO0FBRUgsRUFBRSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQzFDLFdBQVcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFPO0lBQ3pCLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQU87SUFDL0IsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBTztJQUMvQiw0QkFBNEIsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFPO0lBQzFDLGdDQUFnQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQU87Q0FDakQsQ0FBQyxDQUFDLENBQUE7QUFFSCxRQUFRLENBQUMsc0JBQXNCLEVBQUUsR0FBRyxFQUFFO0lBQ2xDLE1BQU0sR0FBRyxHQUFHLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxDQUFBO0lBRWxDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7UUFDWCxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUE7SUFDdEIsQ0FBQyxDQUFDLENBQUE7SUFFRjs7Ozs7Ozs7Ozs7Ozs7Ozs7VUFpQk07SUFFTjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBb0NLO0lBRUwsRUFBRSxDQUFDLGlEQUFpRCxFQUFFLEtBQUssSUFBSSxFQUFFO1FBQzdELE1BQU0sUUFBUSxHQUFHO1lBQ2IsS0FBSyxFQUFFO2dCQUNIO29CQUNJLElBQUksRUFBRSxNQUFNO29CQUNaLElBQUksRUFBRSxNQUFNO29CQUNaLEdBQUcsRUFBRSxPQUFPO29CQUNaLEVBQUUsRUFBRSxRQUFRO2lCQUNmO2FBQ0o7U0FDSixDQUFBO1FBRUQsTUFBTSxTQUFTLEdBQVEsYUFBYSxDQUFBO1FBRXBDLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDbEQsRUFBRSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQ3pELEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUE7UUFFakQsTUFBTSxNQUFNLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFVBQVUsR0FBRyxDQUFDLE1BQU0seUNBQXlDLENBQUMsQ0FBQTtRQUUzSCw2RkFBNkY7UUFDN0YsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQTtRQUNsRSxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQTtJQUNwRCxDQUFDLENBQUMsQ0FBQTtBQUNOLENBQUMsQ0FBQyxDQUFBIn0=