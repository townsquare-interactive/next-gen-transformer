import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest'
import { removeSiteFromS3, removeLandingPage, removeDomainAndS3, removeLandingProject } from './remove-landing-controller.js'
import { deleteFolderS3, getFileS3, deleteFileS3, addFileS3 } from '../utilities/s3Functions.js'
import { getPageLayoutVars } from './create-site-controller.js'

// Mock the S3 functions with correct typing
vi.mock('../utilities/s3Functions.js', () => ({
    getFileS3: vi.fn<any>(),
}))

vi.mock('./remove-landing-controller', async (importOriginal) => {
    const actual = await importOriginal<typeof import('./remove-landing-controller')>()
    return {
        ...actual,
        removeDomainAndS3: vi.fn(),
        removeSiteFromS3: vi.fn(),
        removeLandingPage: vi.fn(),
    }
})

describe('removeLandingProject', () => {
    const req = { apexID: 'testApex' }

    afterEach(() => {
        vi.clearAllMocks()
    })

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
        vi.mocked(getFileS3).mockResolvedValue('some-string')

        await expect(removeLandingProject(req)).rejects.toThrowError(`ApexID ${req.apexID} not found in list of client site files`)

        expect(getFileS3).toHaveBeenCalledWith(`${req.apexID}/layout.json`, 'site not found in s3')
        expect(removeDomainAndS3).not.toHaveBeenCalled()
    })
})
