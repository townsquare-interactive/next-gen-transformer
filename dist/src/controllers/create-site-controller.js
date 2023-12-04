import { addFileS3, getFileS3 } from '../s3Functions.js';
//add created site params to list in s3
//may not be needed later if we are checking DB before and have publishedDomains in Layout file
/*export const addToSiteList = async (websiteData: CreateSiteParams) => {
    const basePath = websiteData.subdomain
    websiteData.publishedDomains = []
    const currentSiteList: CreateSiteParams[] = await getFileS3(`sites/site-list.json`, [])
    websiteData.id = (currentSiteList.length + 1).toString()
    console.log('current site list', currentSiteList)

    //Add site to s3 site-list if it is not already there
    if (currentSiteList.filter((site) => site.subdomain === basePath).length <= 0) {
        currentSiteList.push(websiteData)
        console.log('new site list', currentSiteList)
        await addFileS3(currentSiteList, `sites/site-list`)
        return `Site added, ClientId: ${websiteData.id}, Subdomain: ${websiteData.subdomain}  `
    } else {
        return `Site has already been created, ClientId: ${websiteData.clientId}, Subdomain: ${websiteData.subdomain}  `
    }
}

//modify site array to add published publishedDomains or remove unpublished domains
 const modifySitePublishedDomainsList = async (
    subdomain: string,
    currentSiteList: CreateSiteParams[],
    currentSiteData: CreateSiteParams,
    domainName: string,
    method: 'POST' | 'DELETE'
) => {
    let newSiteData = currentSiteData
    if (method === 'POST') {
        newSiteData.publishedDomains?.push(domainName)
    } else if (method === 'DELETE') {
        newSiteData.publishedDomains = currentSiteData.publishedDomains.filter((domain) => domain != domainName)
    }

    //create array with all but current site working on
    const newSitesArr = currentSiteList.filter((site) => site.subdomain != subdomain)
    //push updated site with the others
    newSitesArr.push(newSiteData)
    console.log('new list', newSitesArr)

    await addFileS3(newSitesArr, `sites/site-list`)
}
 */
//select current site data from site-list using subdomain or id
export const getSiteObjectFromS3 = async (subdomain, currentSiteList, searchBy = 'subdomain', id = '') => {
    const arrWithSiteObject = searchBy === 'subdomain' ? currentSiteList.filter((site) => site.subdomain === subdomain) : currentSiteList.filter((site) => site.id === id);
    if (arrWithSiteObject.length > 0) {
        const currentSiteData = arrWithSiteObject[0];
        return currentSiteData;
    }
    else {
        return `${searchBy === 'subdomain' ? 'subdomain' : 'id'} does not match any created sites`;
    }
};
//takes a site domain and either adds it to vercel or removes it depending on method (POST or DELETE)
export const modifyVercelDomainPublishStatus = async (subdomain, method = 'POST') => {
    const currentSiteList = await getFileS3(`sites/site-list.json`, []);
    console.log('current site list', currentSiteList);
    let siteLayout = await getFileS3(`${subdomain}/layout.json`, 'site not found in s3');
    if (typeof siteLayout != 'string') {
        const domainName = subdomain + '.vercel.app';
        //new check with layout file
        const filteredDomainList = siteLayout.publishedDomains?.filter((domain) => domain === domainName);
        const isDomainPublishedAlready = filteredDomainList.length > 0;
        if (method === 'POST' ? !isDomainPublishedAlready : isDomainPublishedAlready) {
            console.log('here is the domain: ', domainName);
            //add domains to layout file or removes if deleting
            if (method === 'POST') {
                siteLayout.publishedDomains ? siteLayout.publishedDomains.push(domainName) : (siteLayout.publishedDomains = [domainName]);
            }
            else if (method === 'DELETE') {
                //remove site from list if deleting
                siteLayout.publishedDomains = siteLayout.publishedDomains?.filter((domain) => domain != domainName);
            }
            await addFileS3(siteLayout, `${subdomain}/layout`);
            //vercep api url changes between post vs delete
            const vercelApiUrl = method === 'POST'
                ? `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains?teamId=${process.env.NEXT_PUBLIC_VERCEL_TEAM_ID}`
                : method === 'DELETE'
                    ? `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domainName}?teamId=${process.env.NEXT_PUBLIC_VERCEL_TEAM_ID}`
                    : '';
            //Add or remove domain to vercel via vercel api
            try {
                const response = await fetch(vercelApiUrl, {
                    method: method,
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_VERCEL_AUTH_TOKEN}`,
                    },
                    body: JSON.stringify({
                        name: domainName,
                    }),
                });
            }
            catch (err) {
                console.log('Domain task error: ', err);
            }
        }
        else {
            return `Domain is not ready for ${method} in layout file`;
        }
    }
    else {
        return 'Subdomain not found in list of created sites';
    }
    return `site domain ${method === 'POST' ? 'published' : 'unpublished'}`;
};
export const transformToWebsiteObj = (site) => {
    return {
        clientId: site.clientId,
        type: site.type,
        subdomain: site.subdomain,
        identifier: site.id,
    };
};
export const changePublishStatusInSiteData = async (subdomain, status) => {
    let siteLayoutFile = await getFileS3(`${subdomain}/layout.json`, 'site not found in s3');
    if (typeof siteLayoutFile != 'string') {
        siteLayoutFile.published = status;
        await addFileS3(siteLayoutFile, `${subdomain}/layout`);
        return `Domain: ${subdomain} publish status changed`;
    }
    else {
        return `Error: ${subdomain} not found in s3`;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXNpdGUtY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cm9sbGVycy9jcmVhdGUtc2l0ZS1jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE1BQU0sbUJBQW1CLENBQUE7QUFFeEQsdUNBQXVDO0FBQ3ZDLCtGQUErRjtBQUMvRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F5Q0c7QUFDSCwrREFBK0Q7QUFDL0QsTUFBTSxDQUFDLE1BQU0sbUJBQW1CLEdBQUcsS0FBSyxFQUFFLFNBQWlCLEVBQUUsZUFBbUMsRUFBRSxRQUFRLEdBQUcsV0FBVyxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRTtJQUNqSSxNQUFNLGlCQUFpQixHQUNuQixRQUFRLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFBO0lBRWhKLElBQUksaUJBQWlCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUM5QixNQUFNLGVBQWUsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM1QyxPQUFPLGVBQWUsQ0FBQTtLQUN6QjtTQUFNO1FBQ0gsT0FBTyxHQUFHLFFBQVEsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxtQ0FBbUMsQ0FBQTtLQUM3RjtBQUNMLENBQUMsQ0FBQTtBQUVELHFHQUFxRztBQUNyRyxNQUFNLENBQUMsTUFBTSwrQkFBK0IsR0FBRyxL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