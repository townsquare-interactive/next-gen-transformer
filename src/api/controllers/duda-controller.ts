import { Request, Response } from 'express'
import { createDudaPage } from '../../services/duda-api'
import { PageObject } from '../../types/duda-api-type'

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
