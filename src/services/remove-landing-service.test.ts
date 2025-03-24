import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest'
import { removeSiteFromS3, removeLandingPage, removeDomainAndS3, removeLandingProject } from './remove-landing-service.js'
import { deleteFolderS3, getFileS3, deleteFileS3, addFileS3 } from '../utilities/s3Functions.js'
import { checkPageListForDeployements, getPageLayoutVars, getPageList, getPageandLanding } from '../services/create-site-service.js'

// Mock the S3 functions with correct typing
vi.mock('../utilities/s3Functions.js', () => ({
    getFileS3: vi.fn<any>(),
}))

vi.mock('./remove-landing-service', async (importOriginal) => {
    const actual = await importOriginal<typeof import('./remove-landing-service.js')>()
    return {
        ...actual,
        removeDomainAndS3: vi.fn(),
        removeSiteFromS3: vi.fn(),
        removeLandingPage: vi.fn().mockResolvedValue({}),
    }
})

// Mock the S3 functions with correct typing
vi.mock('../utilities/s3Functions.js', () => ({
    getFileS3: vi.fn<any>(),
    addFileS3: vi.fn<any>(),
    deleteFileS3: vi.fn<any>(),
}))

vi.mock('./create-site-service.js', () => ({
    getPageList: vi.fn<any>(),
    getPageLayoutVars: vi.fn<any>(),
    getPageandLanding: vi.fn<any>(),
    checkPageListForDeployements: vi.fn<any>(),
    modifyLandingDomainPublishStatus: vi.fn<any>(),
}))

describe('removeLandingProject', () => {
    const req = { apexID: 'testApex' }

    afterEach(() => {
        vi.clearAllMocks()
    })

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
        }

        const fakeValue: any = 'some string'

        vi.mocked(getPageList).mockResolvedValue(pageList)
        vi.mocked(getPageLayoutVars).mockResolvedValue(fakeValue)
        vi.mocked(getFileS3).mockResolvedValue(fakeValue)

        await expect(removeLandingProject(req)).rejects.toThrowError(`ApexID ${req.apexID} not found in list of client site files`)

        //expect(getFileS3).toHaveBeenCalledWith(`${req.apexID}/layout.json`, 'site not found in s3')
        expect(getPageLayoutVars).toHaveBeenCalledWith(req.apexID, 'name')
        expect(removeDomainAndS3).not.toHaveBeenCalled()
    })
})
