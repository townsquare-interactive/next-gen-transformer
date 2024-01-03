import { addFileS3, getFileS3 } from '../s3Functions.js';
//takes a site domain and either adds it to vercel or removes it depending on method (POST or DELETE)
export const modifyVercelDomainPublishStatus = async (subdomain, method = 'POST') => {
    const currentSiteList = await getFileS3(`sites/site-list.json`, []);
    console.log('current site list', currentSiteList);
    let siteLayout = await getFileS3(`${subdomain}/layout.json`, 'site not found in s3');
    if (typeof siteLayout != 'string') {
        const domainName = subdomain + '.vercel.app';
        //new check with layout file
        let publishedDomains = siteLayout.publishedDomains ? siteLayout.publishedDomains : [];
        const isDomainPublishedAlready = publishedDomains.filter((domain) => domain === domainName).length;
        if (method === 'POST' ? !isDomainPublishedAlready : isDomainPublishedAlready) {
            console.log('here is the domain: ', domainName);
            //add domains to layout file or removes if deleting
            if (method === 'POST') {
                siteLayout.publishedDomains ? siteLayout.publishedDomains.push(domainName) : (siteLayout.publishedDomains = [domainName]);
                console.log('published domains', siteLayout.publishedDomains);
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
//add created site params to list in s3
//may not be needed later if we can check s3 for folder
export const addToSiteList = async (websiteData) => {
    const basePath = websiteData.subdomain;
    websiteData.publishedDomains = [];
    const currentSiteList = await getFileS3(`sites/site-list.json`, []);
    console.log('current site list', currentSiteList);
    //Add site to s3 site-list if it is not already there
    if (currentSiteList.filter((site) => site.subdomain === basePath).length <= 0) {
        currentSiteList.push(websiteData);
        console.log('new site list', currentSiteList);
        await addFileS3(currentSiteList, `sites/site-list`);
        return `Site added, ClientId: ${websiteData.id}, Subdomain: ${websiteData.subdomain}  `;
    }
    else {
        throw new Error(`Site has already been created, ClientId: ${websiteData.clientId}, Subdomain: ${websiteData.subdomain}  `);
    }
};
//modify site array to add published publishedDomains or remove unpublished domains
/* const modifySitePublishedDomainsList = async (
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

//select current site data from site-list using subdomain or id
export const getSiteObjectFromS3 = async (subdomain: string, currentSiteList: CreateSiteParams[], searchBy = 'subdomain', id = '') => {
    const arrWithSiteObject =
        searchBy === 'subdomain' ? currentSiteList.filter((site) => site.subdomain === subdomain) : currentSiteList.filter((site) => site.id === id)

    if (arrWithSiteObject.length > 0) {
        const currentSiteData = arrWithSiteObject[0]
        return currentSiteData
    } else {
        return `${searchBy === 'subdomain' ? 'subdomain' : 'id'} does not match any created sites`
    }
}
*/
export const getDomainList = async () => {
    const domainList = await getFileS3(`sites/domains.json`, []);
    return domainList;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXNpdGUtY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cm9sbGVycy9jcmVhdGUtc2l0ZS1jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE1BQU0sbUJBQW1CLENBQUE7QUFFeEQscUdBQXFHO0FBQ3JHLE1BQU0sQ0FBQyxNQUFNLCtCQUErQixHQUFHLEtBQUssRUFBRSxTQUFpQixFQUFFLFNBQTRCLE1BQU0sRUFBRSxFQUFFO0lBQzNHLE1BQU0sZUFBZSxHQUF1QixNQUFNLFNBQVMsQ0FBQyxzQkFBc0IsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUN2RixPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLGVBQWUsQ0FBQyxDQUFBO0lBRWpELElBQUksVUFBVSxHQUFXLE1BQU0sU0FBUyxDQUFDLEdBQUcsU0FBUyxjQUFjLEVBQUUsc0JBQXNCLENBQUMsQ0FBQTtJQUU1RixJQUFJLE9BQU8sVUFBVSxJQUFJLFFBQVEsRUFBRTtRQUMvQixNQUFNLFVBQVUsR0FBRyxTQUFTLEdBQUcsYUFBYSxDQUFBO1FBRTVDLDRCQUE0QjtRQUM1QixJQUFJLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUE7UUFDckYsTUFBTSx3QkFBd0IsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sS0FBSyxVQUFVLENBQUMsQ0FBQyxNQUFNLENBQUE7UUFFbEcsSUFBSSxNQUFNLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyx3QkFBd0IsRUFBRTtZQUMxRSxPQUFPLENBQUMsR0FBRyxDQUFDLHNCQUFzQixFQUFFLFVBQVUsQ0FB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