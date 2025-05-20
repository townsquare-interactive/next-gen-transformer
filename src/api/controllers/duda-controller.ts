import { Request, Response } from 'express'
import { createDudaLocation, createDudaPage } from '../../services/duda-api.js'
import { PageObject, LocationObject } from '../../types/duda-api-type.js'
import { handleError } from '../../utilities/errors.js'
import { toggleBusinessSchema } from '../../services/duda/toggleBusinessSchema.js'
import { SaveGeneratedContentSchema, ToggleBusinessSchema } from '../../schema/input-zod.js'
import { zodDataParse } from '../../schema/utils-zod.js'
import { saveGeneratedContent } from '../../services/duda/duda-service.js'
import middleware from '../middleware/AuthMiddleware.js'

/**
 * Controller to create a new Duda page.
 *
 * The request body should contain the following fields:
 *
 * - `siteName` (string) - The unique identifier for the site where the page will be created. (Required)
 * - `title` (string) - The title of the page to be created. (Required)
 * - `path` (string) - The URL path for the page to be created. (Required)
 * - `seo` (object, optional) - SEO settings for the page.
 *     - `no_index` (boolean, optional) - Whether the page should be indexed by search engines. Default is `false`.
 *     - `title` (string, optional) - The SEO title for the page, displayed in search results. Default is ``.
 *     - `description` (string, optional) - A description of the page for search engines. Default is ``.
 *     - `og_image` (string, optional) - The URL of an image to be used for social media sharing. Default is ``.
 * - `draft_status` (string, optional) - The status of the page draft. Default is `STAGED_DRAFT`.
 *
 * Example request body:
 *
 * {
 *   "siteName": "1ffc94702b8447358c14bad248ac242d",
 *   "title": "About Us",
 *   "path": "about",
 *   "seo": {
 *     "no_index": false,
 *     "title": "About Us",
 *     "description": "Learn more about our company",
 *     "og_image": "https://example.com/image.png"
 *   },
 *   "draft_status": "STAGED_DRAFT"
 * }
 *
 */
export const createPage = async (req: Request, res: Response) => {
    const { siteName, ...pageData } = req.body as { siteName: string } & PageObject

    if (!siteName) {
        return res.status(400).json({
            success: false,
            error: 'Missing required field: siteName.',
        })
    }

    if (!pageData.title || !pageData.path) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: title or path.',
        })
    }

    try {
        const response = await createDudaPage(siteName, pageData)
        return res.json({ success: true, data: response })
    } catch (error) {
        console.error('Error creating Duda page:', error)
        res.status(500).json({ success: false, error: error })
    }
}

/**
 * Controller to create a new Duda location.
 *
 * The request body should contain the following fields:
 *
 * - `siteName` (string) - The unique identifier for the site where the location will be created. (Required)
 * - `label` (string) - The name or label of the location. (Required)
 * - `phones` (array, optional) - An array of phone numbers associated with the location, each with a `phoneNumber` and `label`.
 * - `emails` (array, optional) - An array of email addresses associated with the location, each with an `emailAddress` and `label`.
 * - `social_accounts` (object, optional) - Social media account information, with fields like `facebook`, `twitter`, etc.
 * - `address` (object, optional) - The physical address of the location, including `streetAddress`, `city`, `postalCode`, and `country`.
 * - `logo_url` (string, optional) - The URL of the location's logo image.
 * - `business_hours` (array, optional) - Business hours for the location, each containing `days` (array of strings representing days of the week), `open`, and `close` times.
 *
 * Example request body:
 *
 * {
 *   "siteName": "1ffc94702b8447358c14bad248ac242d",
 *   "label": "Duda Colorado - Goosetail Labs",
 *   "phones": [
 *     { "phoneNumber": "123-123-4321", "label": "Main Phone" },
 *     { "phoneNumber": "123-123-5321", "label": "Scheduling" }
 *   ],
 *   "emails": [
 *     { "emailAddress": "colorado@duda.co", "label": "Colorado Office Email" }
 *   ],
 *   "social_accounts": {
 *     "facebook": "duda",
 *     "twitter": "dudamobile"
 *   },
 *   "address": {
 *     "streetAddress": "197 S 104th St C",
 *     "city": "Louisville",
 *     "postalCode": "80027",
 *     "country": "US"
 *   },
 *   "logo_url": "https://www.duda.co/developers/REST-API-Reference/images/duda.svg",
 *   "business_hours": [
 *     { "days": ["MON", "TUE", "WED", "THU", "FRI"], "open": "09:00", "close": "18:00" }
 *   ]
 * }
 *
 * This endpoint validates the required fields, such as `siteName`, and then attempts to create the location using the `createDudaLocation` function.
 * If successful, it returns the location data with a success status.
 * If any errors occur, a `500` status code is returned along with an error message.
 */
export const createLocation = async (req: Request, res: Response) => {
    const { siteName, ...locationObject } = req.body as { siteName: string } & LocationObject

    try {
        const response = await createDudaLocation(siteName, locationObject)
        return res.json({ success: true, data: response })
    } catch (error) {
        console.error('Error creating Duda location:', error)
        res.status(500).json({ success: false, error: error })
    }
}

export const changeBusinessSchemaStatus = async (req: Request, res: Response) => {
    try {
        middleware(req)
        const validatedRequest = zodDataParse(req.body, ToggleBusinessSchema, 'input')
        const response = await toggleBusinessSchema(validatedRequest.siteName, validatedRequest.toggleOption)
        return res.json({ data: response })
    } catch (err) {
        handleError(err, res)
    }
}

export const saveContent = async (req: Request, res: Response) => {
    try {
        middleware(req)
        const validatedRequest = zodDataParse(req.body, SaveGeneratedContentSchema, 'input')
        const response = await saveGeneratedContent(validatedRequest)

        return res.json({ response })
    } catch (err) {
        handleError(err, res)
    }
}
