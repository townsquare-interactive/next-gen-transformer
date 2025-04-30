import { Request, Response } from 'express'
import middleware from '../middleware/AuthMiddleware.js'
import { handleError } from '../../utilities/errors.js'
import { createLandingPageFiles } from '../../translation-engines/landing.js'
import { saveToS3 } from '../../output/save-to-s3.js'
import { DomainRes } from '../../../types.js'
import { checkDomainConfigOnVercel, publishDomainToVercel } from '../../services/domain-service.js'
import { getRequestData, validateLandingRequestData } from '../../services/landing-service.js'
import { removeLandingProject, removeLandingSite } from '../../services/remove-landing-service.js'
import { saveInputSchema, createSiteInputSchema, SubdomainInputSchema, RequestDataReq, RequestDataSchema } from '../../schema/input-zod.js'
import { zodDataParse } from '../../schema/utils-zod.js'

const useDomainPublish = process.env.CREATE_SITE_DOMAINS === '0' ? false : true

export const createLanding = async (req: Request, res: Response) => {
    try {
        middleware(req)
        const { apexID, siteData, domainOptions } = validateLandingRequestData(req)
        const data = await createLandingPageFiles(siteData, apexID)
        const s3Res = await saveToS3({ ...data })

        if (useDomainPublish) {
            const domainResponse: DomainRes = await publishDomainToVercel(domainOptions, apexID, siteData.pageUri || '')
            console.log(domainResponse)
            res.json(domainResponse)
        } else {
            console.log(s3Res)
            res.json(s3Res)
        }
    } catch (err) {
        err.state = { ...err.state, req: req.body }
        handleError(err, res, req.body.url)
    }
}

export const removeLandingDomain = async (req: Request, res: Response) => {
    try {
        const response = await removeLandingSite({ domain: req.params.domain })
        res.json(response)
    } catch (err) {
        err.state = { ...err.state, req: req.params }
        handleError(err, res, req.params.domain)
    }
}

export const removeApexID = async (req: Request, res: Response) => {
    try {
        const response = await removeLandingProject({ apexID: req.params.apexID })
        res.json(response)
    } catch (err) {
        err.state = { ...err.state, req: req.params }
        handleError(err, res, req.params.apexID)
    }
}

export const checkDomainConfig = async (req: Request, res: Response) => {
    try {
        const domain = req.query.domain || ''

        if (typeof domain !== 'string') {
            return res.status(400).json({ error: 'Invalid domain parameter' })
        }

        const response = await checkDomainConfigOnVercel(domain)
        res.json(response)
    } catch (err) {
        err.state = { ...err.state, req: req.body }
        handleError(err, res)
    }
}

export const getLandingRequestData = async (req: Request, res: Response) => {
    try {
        const reqData = zodDataParse<RequestDataReq, typeof RequestDataSchema>(req.query as RequestDataReq, RequestDataSchema, 'parse')
        const domain = reqData.domain
        const response = await getRequestData(domain)
        res.json(response)
    } catch (err) {
        err.state = { ...err.state, req: req.body }
        handleError(err, res)
    }
}
