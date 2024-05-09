import type { Sections } from '../schema/input-zod.js'
import { fontList } from '../templates/layout-variables.js'
import { FontType } from '../types.js'
import { convertDescText, createFontImport, socialConvert } from './utils.js'

export const transformSocial = (socials: string[]) => {
    let newSocials = []
    for (let i = 0; i < socials.length; i++) {
        newSocials.push({
            url: socials[i],
            icon: socialConvert(socials[i]),
            name: socials[i],
        })
    }
    return newSocials
}

export const addGuarnSpan = (text: string) => {
    if (text) {
        return `<span class='guarntext'>` + text + '</span>'
    } else return ''
}

export const createModulesWithSections = (sections: Sections) => {
    let modules = []
    for (let i = 0; i < sections.length; i++) {
        const section = sections[i]
        if (section.headline && i === 0) {
            modules.push({
                headline: section.headline,
                actionlbl: section.ctaText || 'GIVE US A CALL',
                image: section.image,
                subheader: section.subheader,
                type: 'dl',
                weblink: section.ctaLink,
            })
        }
        if (i === 1) {
            if (section.headline) {
                modules.push({
                    type: 'banner',
                    headline: section.headline,
                    actionlbl: section.ctaLink || 'CALL US NOW',
                    weblink: section.ctaLink,
                })
            }
            if (section.desc) {
                modules.push({
                    type: 'text content',
                    desc1: section.desc,
                    desc2: section.desc2,
                    headline: addGuarnSpan(section.subheader || ''),
                })
            }
        }
        if (i == 2) {
            if (section.reviewHeadline) {
                modules.push({
                    type: 'headline',
                    headline: section.reviewHeadline,
                })
            }
            if (section.reviews) {
                modules.push({
                    type: 'reviews',
                    reviews: section.reviews,
                })
            }
            if (section.headline) {
                modules.push({
                    type: 'banner',
                    headline: section.headline,
                    actionlbl: section.ctaLink || 'CALL US NOW',
                    weblink: section.ctaLink,
                })
            }
        }
        if (section.components?.length > 0) {
            for (let x = 0; x < section.components.length; x++) {
                let currentComponent = section.components[x]
                if (currentComponent.type === 'coupon') {
                    modules.push({
                        type: 'coupon',
                        image: currentComponent.image,
                    })
                } else if (currentComponent.type === 'form') {
                    modules.push({
                        type: 'form',
                    })
                } else if (currentComponent.type === 'video') {
                    modules.push({
                        type: 'video',
                        videoUrl: currentComponent.videoUrl,
                    })
                }
            }
        }
    }

    return modules
}

export const createReviewItems = (reviews: { name: string; text: string }[]) => {
    let items = []
    for (let i = 0; i < reviews.length; i++) {
        const newItem = {
            desc: convertDescText(reviews[i].text),
            align: 'center',
            headline: reviews[i].name,
            linkNoBtn: false,
            btnCount: 0,
            isWrapLink: false,
            visibleButton: false,
            itemCount: 1,
        }
        items.push(newItem)
    }
    return items
}

interface ScrapedFonts {
    key: string
    count: number
    isFirstPlace: boolean
}

function getTopTwoFontFamilies(scrapedFonts: { key: string; count: number }[]): string[] {
    // Sort scrapedFonts array based on count in descending order
    const sortedFonts = scrapedFonts.sort((a, b) => b.count - a.count)
    // Get the first two elements
    const topTwoFonts = sortedFonts.slice(0, 2)
    // Modify keys by replacing spaces with hyphens
    const modifiedKeys = topTwoFonts.map((font) => {
        const match = font.key.match(/"([^"]+)"/)
        if (match) {
            return match[1].replace(/ /g, '-')
        }
        return ''
    })
    return modifiedKeys.filter(Boolean) as string[]
}

export const transformFonts = (scrapedFonts: ScrapedFonts[]) => {
    interface FontList {
        [key: string]: {
            label: string
            google?: string
            'font-family': string
            'is-body-font': string
            'is-feat-font': string
            'is-hdrs-font': string
            'is-logo-font': string
        }
    }

    function getFontObjectsFromTopTwoFonts(topTwoFonts: string[], fontList: FontList) {
        interface FontObject {
            headlineFont: FontType
            bodyFont: FontType
            featuredFont: FontType
        }

        //assign default values
        let fontObject: FontObject = {
            headlineFont: {
                label: 'Oswald',
                google: 'Oswald:400,700',
                'font-family': "'Oswald'",
            },
            bodyFont: {
                label: 'Open Sans',
                google: 'Open+Sans:400,700,400italic,700italic',
                'font-family': "'Open Sans'",
            },
            featuredFont: {
                label: 'Oswald',
                google: 'Oswald:400,700',
                'font-family': "'Oswald'",
            },
        }

        //assign default values
        let fontSections = {
            hdrs: {
                label: 'Headlines',
                value: 'Oswald',
                family: "'Oswald'",
            },
            body: {
                label: 'Text',
                value: 'Open-Sans',
                family: "'Open Sans'",
            },
            feat: {
                label: 'Featured Headlines',
                value: 'Oswald',
                family: "'Oswald'",
            },
        }
        topTwoFonts.forEach((fontKey, index) => {
            // Add dashes for between space to match
            const modifiedFontKey = fontKey.replace(/ /g, '-')
            for (const key in fontList) {
                if (modifiedFontKey.includes(key)) {
                    //const type = index === 0 ? 'bodyFont' : 'headlineFont'
                    //fontLabels.push({ font: fontList[key], type })

                    // Determine type of font based on index
                    if (index === 0) {
                        fontObject.bodyFont = fontList[key]
                        fontSections.body = { label: 'Text', value: key, family: key }
                    } else if (index === 1) {
                        fontObject.headlineFont = fontList[key]
                        fontObject.featuredFont = fontList[key]

                        fontSections.hdrs = { label: 'Headlines', value: key, family: key }
                        fontSections.feat = { label: 'Featured Headlines', value: key, family: key }
                    }

                    break
                }
            }
        })
        const fontImport = createFontImport(fontObject.headlineFont, fontObject.bodyFont, fontObject.featuredFont, 'landing')
        //sections used for css, fontImport for importing google font link
        return { fontSections: fontSections, fontImport: fontImport.fontImportGroup }
    }

    const topTwoFonts = getTopTwoFontFamilies(scrapedFonts)
    const fontData = getFontObjectsFromTopTwoFonts(topTwoFonts, fontList)
    return fontData
}
