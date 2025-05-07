import { GetSiteResponse } from '@dudadev/partner-api/dist/types/lib/sites/types.js'
import { DataUploadError } from '../../utilities/errors.js'
import { getDudaSite, updateSiteContent } from '../duda-api.js'

export async function toggleBusinessSchema(
    siteName: string,
    toggleOption: boolean,
    utilities?: { getDudaFunction?: () => Promise<GetSiteResponse>; updateSiteContentFunction?: () => Promise<void> }
) {
    const getDudaFunction = utilities?.getDudaFunction || getDudaSite
    const updateSiteContentFunction = utilities?.updateSiteContentFunction || updateSiteContent
    if (!toggleOption) {
        await updateSiteContentFunction(siteName, undefined, undefined, false)
        return 'business schema disabled'
    }

    //if no missing required fields turn on
    await updateSiteContentFunction(siteName, undefined, undefined, true)

    //check for missing required fields after enabling
    const currentBusinessSchema = await getDudaFunction(siteName)
    if (
        currentBusinessSchema?.schemas?.local_business?.missing_required_fields &&
        currentBusinessSchema.schemas.local_business.missing_required_fields.length > 0
    ) {
        //if missing required fields throw error
        throw new DataUploadError({
            message: 'Missing required schema fields: ' + currentBusinessSchema.schemas?.local_business.missing_required_fields,
            domain: siteName,
            errorType: 'DUD-019',
            state: {
                missingFields: currentBusinessSchema.schemas?.local_business.missing_required_fields,
                fileStatus: 'not uploaded',
            },
        })
    }

    return 'business schema enabled'
}
