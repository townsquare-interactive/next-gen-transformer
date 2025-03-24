import { Request, Response } from 'express'
import { zodDataParse } from '../../schema/utils-zod.js'
import { createSiteInputSchema, SubdomainInputSchema } from '../../schema/input-zod.js'
import { folderExistsInS3, getFileS3 } from '../../utilities/s3Functions.js'
import { transformCreateSite } from '../../translation-engines/create-site.js'
import { saveToS3 } from '../../output/save-to-s3.js'
import { publishDomainToVercel, removeDomainFromVercel } from '../../services/domain-service.js'
import { changePublishStatusInSiteData } from '../../services/create-site-service.js'
import { handleError } from '../../utilities/errors.js'

export const createSite = async (req: Request, res: Response) => {
    try {
        zodDataParse(req.body, createSiteInputSchema, 'createSite')
        const siteExistsInS3 = await folderExistsInS3(req.body.subdomain)

        if (siteExistsInS3) {
            return res.status(500).json('site already exists')
        }

        const data = await transformCreateSite(req.body)
        await saveToS3({ ...data })
        const response = await publishDomainToVercel({ domain: req.body.subdomain, usingPreview: true }, req.body.subdomain)
        console.log('domain status: ', response)
        res.json(' Domain status: ' + response)
    } catch (err) {
        console.error(err)
        res.status(500).json(err.message || 'Domain not able to be created. (Already created or error)')
    }
}

export const publishDomain = async (req: Request, res: Response) => {
    try {
        const validatedRequest = zodDataParse(req.body, SubdomainInputSchema, 'input')
        const response = await publishDomainToVercel({ domain: validatedRequest.subdomain, usingPreview: true }, validatedRequest.subdomain)
        console.log(response)
        res.json(response)
    } catch (err) {
        handleError(err, res)
    }
}

export const removeDomain = async (req: Request, res: Response) => {
    try {
        const validatedRequest = zodDataParse(req.body, SubdomainInputSchema, 'input')
        const response = await removeDomainFromVercel(validatedRequest.subdomain, '', 'fullSite')
        console.log(response)
        res.json(response)
    } catch (err) {
        handleError(err, res)
    }
}

export const publishSite = async (req: Request, res: Response) => {
    try {
        const validatedRequest = zodDataParse(req.body, SubdomainInputSchema, 'input')
        const response = await changePublishStatusInSiteData(validatedRequest.subdomain, true, '')
        console.log(response)
        res.json(response)
    } catch (err) {
        handleError(err, res)
    }
}

export const unpublishSite = async (req: Request, res: Response) => {
    try {
        const validatedRequest = zodDataParse(req.body, SubdomainInputSchema, 'input')
        const response = await changePublishStatusInSiteData(validatedRequest.subdomain, false, '')
        console.log(response)
        res.json(response)
    } catch (err) {
        handleError(err, res)
    }
}

export const getTemplates = async (req: Request, res: Response) => {
    try {
        const siteTemplates = await getFileS3(`global-assets/templates/siteTemplates.json`, 'templates not found in s3')
        res.json(siteTemplates)
    } catch (err) {
        handleError(err, res)
    }
}

export const updateDomain = async (req: Request, res: Response) => {
    console.log('redirect', req.body)
    const domainName = req.body.subdomain + '.vercel.app'

    try {
        console.log('starting fetch', domainName)
        const response = await fetch(
            `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains/${domainName}?teamId=${process.env.NEXT_PUBLIC_VERCEL_TEAM_ID}`,
            {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_VERCEL_AUTH_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    redirect: 'joesburgers.vercel.app', //currently only works with domains on same project
                    redirectStatusCode: 301,
                }),
            }
        )

        console.log(response)
        res.json(response)
    } catch (err) {
        handleError(err, res)
    }
}
