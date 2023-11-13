import { CreateSiteParams } from '../../types.js'
import { addFileS3, getFileS3 } from '../s3Functions.js'

//add created site params to list in s3
export const addToSiteList = async (websiteData: CreateSiteParams) => {
    const basePath = websiteData.subdomain
    const currentSiteList: CreateSiteParams[] = await getFileS3(`sites/site-list.json`, [])
    console.log('current site list', currentSiteList)

    if (currentSiteList.filter((site) => site.subdomain === basePath).length <= 0) {
        currentSiteList.push(websiteData)
        console.log('new site list', currentSiteList)
    }

    await addFileS3(currentSiteList, `sites/site-list`)
}
