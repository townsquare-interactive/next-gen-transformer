import { describe, it, expect, afterEach, vi } from 'vitest'
//import { removeDomainAndS3, removeLandingProject, removeSiteFromS3 } from './remove-landing-controller'
import { deleteFolderS3, getFileS3 } from '../utilities/s3Functions.js'
import { removeDomainFromVercel } from './create-site-controller.js'
//import { removeDomainFromVercel } from './create-site-controller'

/* vi.mock('../utilities/s3Functions.js', () => ({
    getFileS3: vi.fn<any>(),
    deleteFolderS3: vi.fn<any>(),
}))
 */
// Partially mock the remove-landing-controller module
//vi.mock('./create-site-controller', async () => ({
//removeDomainFromVercel: vi.fn<any>(), // Mock removeDomainFromVercel as well
//}))

// Partially mock the remove-landing-controller module
/* vi.mock('./create-site-controller', async () => ({
    removeDomainFromVercel: vi.fn<any>(), // Mock removeDomainFromVercel as well
})) */

// Partially mock the remove-landing-controller module
/* vi.mock('./remove-landing-controller', async () => {
    const actual = await vi.importActual<typeof import('./remove-landing-controller')>('./remove-landing-controller') //don't mock this one
    return {
        ...actual,
        //removeDomainAndS3: vi.fn<any>(), // Mock only removeDomainAndS3
        removeDomainAndS3: vi.fn<any>(), // Mock removeDomainAndS3
        removeSiteFromS3: vi.fn<any>(),
    }
}) */

/* describe('removeLandingProject', () => {
    const apexID = 'testApex'

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should remove each domain', async () => {
        const mockLayout = { publishedDomains: ['thetest.vercel.app', 'thetest.com', 'newtest3.com'] }

        // Mock getFileS3 for layout
        ;(getFileS3 as any).mockResolvedValue(mockLayout)
        ;(removeDomainAndS3 as any).mockResolvedValue({ siteLayout: { publishedDomains: ['thetest.vercel.app'] } })
        ;(removeSiteFromS3 as any).mockResolvedValue(mockLayout)


        await removeLandingProject({ apexID })

        expect(getFileS3).toHaveBeenCalledWith(`${apexID}/layout.json`, 'site not found in s3')
        // expect(deleteFolderS3).toHaveBeenCalledWith(apexID)
        await expect(removeDomainAndS3).toHaveBeenCalledTimes(3)
        await expect(removeDomainAndS3).toHaveBeenNthCalledWith(1, 'thetest.vercel.app')
        await expect(removeDomainAndS3).toHaveBeenNthCalledWith(2, 'thetest.com')
        await expect(removeDomainAndS3).toHaveBeenNthCalledWith(3, 'newtest3.com')
    })
}) */
