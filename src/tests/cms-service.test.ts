import { getPageData } from '../services/cms-services.js'
import { it, describe, expect } from 'vitest'

describe('Get Page Data', () => {
    const key = 774341
    const pages = {
        774341: {
            id: key,
            title: 'Home',
            post_type: 'page',
            post_status: 'publish',
            page_type: 'homepage',
            published: '04/16/2014 14:04:12',
            post_name: 'home',
            slug: 'home',
            url: '/',
            seo: {
                title: 'homepage',
                descr: null,
                selectedImages: null,
                imageOverride: null,
            },
        },
    }

    it('should extract the variables from the page data', () => {
        expect(getPageData(pages, key)).toStrictEqual({
            pageId: key,
            pageTitle: 'Home',
            pageSlug: 'home',
            pageType: 'homepage',
            url: '/',
            seo: {
                title: 'homepage',
                descr: '',
                selectedImages: '',
                imageOverride: '',
            },
        })
    })
})
