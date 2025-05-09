import { transformContentToBusinessInfo, transformAIContent } from '../../api/scrapers/utils.js'
import { SaveGeneratedContentReq } from '../../schema/input-zod.js'
import { getDudaSiteId, uploadBusinessInfo } from '../duda-api.js'

export const saveGeneratedContent = async (
    validatedRequest: SaveGeneratedContentReq,
    functions?: {
        getDudaSiteId?: (gpid: string) => Promise<string>
        saveContentToDuda?: (siteId: string, data: { site_texts: { custom: { label: string; text: string }[] } }) => void
    }
) => {
    const gpid = validatedRequest.gpid
    const saveContentToDuda = functions?.saveContentToDuda || uploadBusinessInfo
    const getDudaSiteIdFunction = functions?.getDudaSiteId || getDudaSiteId

    const dudaSiteId = await getDudaSiteIdFunction(gpid)

    //transform content to duda format
    const formattedContent = transformAIContent(validatedRequest)
    const businessInfo = transformContentToBusinessInfo(formattedContent)

    //save content to duda
    await saveContentToDuda(dudaSiteId, businessInfo)

    return `Content uploaded to ${dudaSiteId}`
}
