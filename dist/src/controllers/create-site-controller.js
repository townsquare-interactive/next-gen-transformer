import { addFileS3, getFileS3 } from '../s3Functions.js';
import { sql } from '@vercel/postgres';
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
        console.log('is pub already', isDomainPublishedAlready);
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
                console.log('vercel domain response', response);
                //if domain name already exists try adding again with postfix
                if (response.status === 409) {
                    console.log('domain already exists, adding -preview');
                    const secondDomain = await fetch(vercelApiUrl, {
                        method: method,
                        headers: {
                            Authorization: `Bearer ${process.env.NEXT_PUBLIC_VERCEL_AUTH_TOKEN}`,
                        },
                        body: JSON.stringify({
                            name: subdomain + '-preview' + '.vercel.app',
                        }),
                    });
                    if (secondDomain.status === 409) {
                        throw new Error('Unable to create domain, both versions taken');
                    }
                }
            }
            catch (err) {
                console.log('Domain task error: ', err);
                throw new Error('Domain task error: ');
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
export async function checkIfSiteExistsPostgres(domain) {
    try {
        const domainCheck = await sql `SELECT * FROM Domains WHERE domain = ${domain};`;
        const domainExists = domainCheck.rowCount > 0 ? true : false;
        const foundStatus = domainExists === true ? 'site exists' : 'not found';
        console.log(foundStatus);
        return foundStatus;
    }
    catch (error) {
        console.log(error);
        throw { 'this is error': { error } };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLXNpdGUtY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cm9sbGVycy9jcmVhdGUtc2l0ZS1jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE1BQU0sbUJBQW1CLENBQUE7QUFDeEQsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBRXRDLHFHQUFxRztBQUNyRyxNQUFNLENBQUMsTUFBTSwrQkFBK0IsR0FBRyxLQUFLLEVBQUUsU0FBaUIsRUFBRSxTQUE0QixNQUFNLEVBQUUsRUFBRTtJQUMzRyxNQUFNLGVBQWUsR0FBdUIsTUFBTSxTQUFTLENBQUMsc0JBQXNCLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDdkYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxlQUFlLENBQUMsQ0FBQTtJQUVqRCxJQUFJLFVBQVUsR0FBVyxNQUFNLFNBQVMsQ0FBQyxHQUFHLFNBQVMsY0FBYyxFQUFFLHNCQUFzQixDQUFDLENBQUE7SUFFNUYsSUFBSSxPQUFPLFVBQVUsSUFBSSxRQUFRLEVBQUU7UUFDL0IsTUFBTSxVQUFVLEdBQUcsU0FBUyxHQUFHLGFBQWEsQ0FBQTtRQUU1Qyw0QkFBNEI7UUFDNUIsSUFBSSxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFBO1FBQ3JGLE1BQU0sd0JBQXdCLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLEtBQUssVUFBVSxDQUFDLENBQUMsTUFBTSxDQUFBO1FBQ2xHLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsd0JBQXdCLENBQUMsQ0FBQTtRQUV2RCxJQUFJLE1BQU0sS0FBSyxNQUFNLENB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