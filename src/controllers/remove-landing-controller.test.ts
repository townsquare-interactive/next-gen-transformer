import { describe, it, expect, afterEach, vi } from 'vitest'
import { removeSiteFromS3 } from './remove-landing-controller'
import { deleteFolderS3, getFileS3 } from '../utilities/s3Functions.js'

// Mock the S3 functions with correct typing
vi.mock('../utilities/s3Functions.js', () => ({
    getFileS3: vi.fn<any>(),
    deleteFolderS3: vi.fn<any>(),
}))

describe('removeSiteFromS3', () => {
    const apexID = 'testApex'

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should follow the correct path if siteLayout is not a string', async () => {
        const mockLayout = { publishedDomains: [] }
        ;(getFileS3 as any).mockResolvedValueOnce(mockLayout)

        await removeSiteFromS3(apexID)

        expect(getFileS3).toHaveBeenCalledWith(`${apexID}/layout.json`, 'site not found in s3')
        expect(deleteFolderS3).toHaveBeenCalledWith(apexID)
    })

    it('should not delete the S3 folder if there are alternate domains', async () => {
        const mockLayout = { publishedDomains: ['domain1', 'domain2'] }
        ;(getFileS3 as any).mockResolvedValueOnce(mockLayout)

        await removeSiteFromS3(apexID)

        expect(getFileS3).toHaveBeenCalledWith(`${apexID}/layout.json`, 'site not found in s3')
        expect(deleteFolderS3).not.toHaveBeenCalled()
    })

    it('should follow the correct path if siteLayout is a string (redirect file exists)', async () => {
        const mockLayoutString = 'some-string'
        const mockRedirectFile = { apexId: 'originalApexID' }
        const mockOriginalLayout = { publishedDomains: [] }

        // Handle multiple mockResolvedValueOnce calls properly
        ;(getFileS3 as any).mockResolvedValueOnce(mockLayoutString)
        ;(getFileS3 as any).mockResolvedValueOnce(mockRedirectFile)
        ;(getFileS3 as any).mockResolvedValueOnce(mockOriginalLayout)

        await removeSiteFromS3(apexID)

        expect(getFileS3).toHaveBeenCalledWith(`${apexID}/layout.json`, 'site not found in s3')
        expect(getFileS3).toHaveBeenCalledWith(`${apexID}/redirect.json`, 'site not found in s3')
        expect(deleteFolderS3).toHaveBeenCalledWith(apexID)
        expect(deleteFolderS3).toHaveBeenCalledWith('originalApexID')
    })

    it('should throw an error if the redirectFile is a string', async () => {
        const mockLayoutString = 'some-string'
        const mockRedirectString = 'another-string'

        ;(getFileS3 as any).mockResolvedValueOnce(mockLayoutString)
        ;(getFileS3 as any).mockResolvedValueOnce(mockRedirectString)

        await expect(removeSiteFromS3(apexID)).rejects.toThrowError(`ApexID ${apexID} not found in list of created sites during S3 deletion`)

        expect(getFileS3).toHaveBeenCalledWith(`${apexID}/layout.json`, 'site not found in s3')
        expect(getFileS3).toHaveBeenCalledWith(`${apexID}/redirect.json`, 'site not found in s3')
        expect(deleteFolderS3).not.toHaveBeenCalled()
    })
})
