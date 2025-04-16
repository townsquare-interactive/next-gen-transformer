import { Request, Response } from 'express'
import { zodDataParse } from '../../schema/utils-zod.js'
import { GetPageListSchema, ScrapePagesSchema, ScrapeWebsiteSchema, GetScrapeDataSchema, MoveS3DataToDudaSchema } from '../../schema/input-zod.js'
import {
    getPageList as getPageListService,
    getScrapedDataFromS3,
    getScrapeSettings,
    moveS3DataToDuda as moveS3DataToDudaService,
    scrapeAssetsFromSite,
    removeScrapedFolder,
} from '../../services/scrape-service.js'
import { save } from '../../output/save-scraped-data.js'
import { handleError } from '../../utilities/errors.js'
import checkAuthToken from '../middleware/AuthMiddleware.js'
import { waitUntil } from '@vercel/functions'

export const getPageList = async (req: Request, res: Response) => {
    try {
        checkAuthToken(req)
        const validatedRequest = zodDataParse(req.query, GetPageListSchema, 'getPagesInput')
        const url = validatedRequest.url as string
        const scrapeSettings = getScrapeSettings({ url: url })
        const pages = await getPageListService(scrapeSettings)
        res.json(pages)
    } catch (err) {
        err.state = { ...err.state, req: req.query }
        handleError(err, res, req.query.url as string)
    }
}

export const scrapePages = async (req: Request, res: Response) => {
    try {
        checkAuthToken(req)
        const validatedRequest = zodDataParse(req.body, ScrapePagesSchema, 'scrapedPagesInput')
        const scrapeSettings = getScrapeSettings(validatedRequest)
        const scrapedData = await scrapeAssetsFromSite(scrapeSettings, validatedRequest.pages)
        const saveResponse = await save(scrapeSettings, scrapedData)
        res.json(saveResponse)
    } catch (err) {
        err.state = { ...err.state, req: req.body }
        handleError(err, res, req.body.url)
    }
}

export const scrapeSite = async (req: Request, res: Response) => {
    try {
        checkAuthToken(req)
        const validatedRequest = zodDataParse(req.body, ScrapeWebsiteSchema, 'scrapedInput')
        const scrapeSettings = getScrapeSettings(validatedRequest)

        //queue scraping to happen after response is sent if enabled
        if (scrapeSettings.queueScrape) {
            res.status(202).json({ message: `Scraping in progress for ${scrapeSettings.url}` })

            waitUntil(
                new Promise(async (resolve, reject) => {
                    try {
                        const pages = await getPageListService(scrapeSettings)
                        const scrapedData = await scrapeAssetsFromSite(scrapeSettings, pages.pages)
                        await save(scrapeSettings, scrapedData)
                        console.log('Background scraping completed successfully')
                        resolve(true)
                    } catch (err) {
                        //seperate error handling for background process
                        err.state = { ...err.state, req: req.body }
                        handleError(err, res, req.body.url, false)
                        reject(err)
                    }
                })
            )
            return
        } else {
            const pages = await getPageListService(scrapeSettings)
            const scrapedData = await scrapeAssetsFromSite(scrapeSettings, pages.pages)
            const saveResponse = await save(scrapeSettings, scrapedData)
            res.json(saveResponse)
        }
    } catch (err) {
        err.state = { ...err.state, req: req.body }
        handleError(err, res, req.body.url)
    }
}

export const removeScrapedContent = async (req: Request, res: Response) => {
    try {
        checkAuthToken(req)
        const url = req.params.url
        const response = await removeScrapedFolder(url)
        res.status(response.status === 'success' ? 200 : 404).json(response)
    } catch (err) {
        err.state = { ...err.state, req: req.params }
        handleError(err, res, req.params.url)
    }
}

export const getScrapedData = async (req: Request, res: Response) => {
    try {
        checkAuthToken(req)
        const validatedRequest = zodDataParse(req.query, GetScrapeDataSchema, 'getScrapedData')
        const url = validatedRequest.url as string
        const scrapedData = await getScrapedDataFromS3(url)
        res.json(scrapedData)
    } catch (err) {
        err.state = { ...err.state, req: req.query }
        handleError(err, res, req.query.url as string)
    }
}

export const moveS3DataToDuda = async (req: Request, res: Response) => {
    try {
        checkAuthToken(req)
        const validatedRequest = zodDataParse(req.body, MoveS3DataToDudaSchema, 'moveS3DataToDuda')
        const scrapedData = await getScrapedDataFromS3(validatedRequest.url)
        const moveResponse = await moveS3DataToDudaService(scrapedData, validatedRequest.uploadLocation, validatedRequest.siteType)
        res.json(moveResponse)
    } catch (err) {
        err.state = { ...err.state, req: req.body }
        handleError(err, res, req.body.url)
    }
}
