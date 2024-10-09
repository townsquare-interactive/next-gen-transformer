import { describe, it, expect, afterEach, vi } from 'vitest';
import { removeDomainAndS3, removeLandingProject, removeSiteFromS3 } from './remove-landing-controller';
import { getFileS3 } from '../utilities/s3Functions.js';
//import { removeDomainFromVercel } from './create-site-controller'
vi.mock('../utilities/s3Functions.js', () => ({
    getFileS3: vi.fn(),
    deleteFolderS3: vi.fn(),
}));
// Partially mock the remove-landing-controller module
/* vi.mock('./create-site-controller', async () => ({
    removeDomainFromVercel: vi.fn<any>(), // Mock removeDomainFromVercel as well
})) */
// Partially mock the remove-landing-controller module
vi.mock('./create-site-controller', async () => ({
    removeDomainFromVercel: vi.fn(), // Mock removeDomainFromVercel as well
}));
// Partially mock the remove-landing-controller module
vi.mock('./remove-landing-controller', async () => {
    const actual = await vi.importActual('./remove-landing-controller'); //don't mock this one
    return {
        ...actual,
        //removeDomainAndS3: vi.fn<any>(), // Mock only removeDomainAndS3
        removeDomainAndS3: vi.fn(), // Mock removeDomainAndS3
        removeSiteFromS3: vi.fn(),
    };
});
describe('removeLandingProject', () => {
    const apexID = 'testApex';
    afterEach(() => {
        vi.clearAllMocks();
    });
    it('should remove each domain', async () => {
        const mockLayout = { publishedDomains: ['thetest.vercel.app', 'thetest.com', 'newtest3.com'] };
        getFileS3.mockResolvedValue(mockLayout);
        removeDomainAndS3.mockResolvedValue({ siteLayout: { publishedDomains: ['thetest.vercel.app'] } });
        removeSiteFromS3.mockResolvedValue(mockLayout);
        // Mock removeDomainAndS3 to return appropriate layout during the nested call
        /*  ;(removeDomainAndS3 as any)
            .mockResolvedValueOnce({ siteLayout: { publishedDomains: ['thetest.vercel.app'] } })
            .mockResolvedValueOnce({ siteLayout: { publishedDomains: ['thetest.com'] } })
            .mockResolvedValueOnce({ siteLayout: { publishedDomains: ['newtest3.com'] } }) */
        await removeLandingProject({ apexID });
        expect(getFileS3).toHaveBeenCalledWith(`${apexID}/layout.json`, 'site not found in s3');
        // expect(deleteFolderS3).toHaveBeenCalledWith(apexID)
        await expect(removeDomainAndS3).toHaveBeenCalledTimes(3);
        await expect(removeDomainAndS3).toHaveBeenNthCalledWith(1, 'thetest.vercel.app');
        await expect(removeDomainAndS3).toHaveBeenNthCalledWith(2, 'thetest.com');
        await expect(removeDomainAndS3).toHaveBeenNthCalledWith(3, 'newtest3.com');
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlLWxhbmRpbmctdHdvLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udHJvbGxlcnMvcmVtb3ZlLWxhbmRpbmctdHdvLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsTUFBTSxRQUFRLENBQUE7QUFDNUQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLG9CQUFvQixFQUFFLGdCQUFnQixFQUFFLE1BQU0sNkJBQTZCLENBQUE7QUFDdkcsT0FBTyxFQUFrQixTQUFTLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUV2RSxtRUFBbUU7QUFFbkUsRUFBRSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQzFDLFNBQVMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFPO0lBQ3ZCLGNBQWMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFPO0NBQy9CLENBQUMsQ0FBQyxDQUFBO0FBRUgsc0RBQXNEO0FBQ3REOztNQUVNO0FBRU4sc0RBQXNEO0FBQ3RELEVBQUUsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsS0FBSyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQzdDLHNCQUFzQixFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQU8sRUFBRSxzQ0FBc0M7Q0FDL0UsQ0FBQyxDQUFDLENBQUE7QUFFSCxzREFBc0Q7QUFDdEQsRUFBRSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxLQUFLLElBQUksRUFBRTtJQUM5QyxNQUFNLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQyxZQUFZLENBQStDLDZCQUE2QixDQUFDLENBQUEsQ0FBQyxxQkFBcUI7SUFDdkksT0FBTztRQUNILEdBQUcsTUFBTTtRQUNULGlFQUFpRTtRQUNqRSxpQkFBaUIsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFPLEVBQUUseUJBQXlCO1FBQzFELGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQU87S0FDakMsQ0FBQTtBQUNMLENBQUMsQ0FBQyxDQUFBO0FBRUYsUUFBUSxDQUFDLHNCQUFzQixFQUFFLEdBQUcsRUFBRTtJQUNsQyxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUE7SUFFekIsU0FBUyxDQUFDLEdBQUcsRUFBRTtRQUNYLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQTtJQUN0QixDQUFDLENBQUMsQ0FBQTtJQUVGLEVBQUUsQ0FBQywyQkFBMkIsRUFBRSxLQUFLLElBQUksRUFBRTtRQUN2QyxNQUFNLFVBQVUsR0FBRyxFQUFFLGdCQUFnQixFQUFFLENBQUMsb0JBQW9CLEVBQUUsYUFBYSxFQUFFLGNBQWMsQ0FBQyxFQUFFLENBRzdGO1FBQUMsU0FBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FDaEQ7UUFBQyxpQkFBeUIsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLFVBQVUsRUFBRSxFQUFFLGdCQUFnQixFQUFFLENBQUMsb0JBQW9CLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FDMUc7UUFBQyxnQkFBd0IsQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUV4RCw2RUFBNkU7UUFDN0U7Ozs2RkFHcUY7UUFFckYsTUFBTSxvQkFBb0IsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUE7UUFFdEMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLEdBQUcsTUFBTSxjQUFjLEVBQUUsc0JBQXNCLENBQUMsQ0FBQTtRQUN2RixzREFBc0Q7UUFDdEQsTUFBTSxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN4RCxNQUFNLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFBO1FBQ2hGLE1BQU0sTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFBO1FBQ3pFLE1BQU0sTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFBO0lBQzlFLENBQUMsQ0FBQyxDQUFBO0FBQ04sQ0FBQyxDQUFDLENBQUEifQ==