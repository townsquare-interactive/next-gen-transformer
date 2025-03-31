import { ScrapedAndAnalyzedSiteData } from '../../schema/output-zod.js'
import { PageObject } from '../../types/duda-api-type.js'
import { createDudaPage } from '../duda-api.js'

type ScrapedPageData = ScrapedAndAnalyzedSiteData['pages'][number]

export async function savePagesToDuda(siteId: string, pages: ScrapedAndAnalyzedSiteData['pages']) {
    if (!Array.isArray(pages)) {
        throw new TypeError(`Expected an array of pages, but received ${typeof pages}`)
    }

    for (const pageData of pages) {
        await savePageToDuda(siteId, pageData)
    }
}

export async function savePageToDuda(siteId: string, page: ScrapedPageData) {
    const transformedPageData: PageObject = transformScrapedPageDataToDudaFormat(page)

    try {
        const response = await createDudaPage(siteId, transformedPageData)
        console.log(`Page successfully saved to Duda for site: ${siteId}`, response)
    } catch (error) {
        console.error(`Error saving page to Duda for site: ${siteId}`, error)
        throw new Error(`Failed to save page for site: ${siteId}`)
    }
}

export function transformScrapedPageDataToDudaFormat(page: ScrapedPageData): PageObject {
    return {
        seo: {
            no_index: false,
            title: page?.seo?.title ?? '',
            description: page?.seo?.metaDescription ?? '',
            og_image: page.images.length > 0 ? page.images[0] : '', // Using the first image as OG image
        },
        draft_status: 'STAGED_DRAFT',
        title: page?.seo?.title ?? '',
        path: new URL(page.url).pathname === '/' ? '/index' : new URL(page.url).pathname, // Duda Api does not accept '/'
    }
}
