import type { Sections } from '../schema/input-zod.js'
import { fontList } from '../templates/layout-variables.js'
import { FontType } from '../types.js'
import { convertDescText, createFontImport, socialConvert } from './utils.js'

export const transformSocial = (socials: string[]) => {
    let newSocials = []
    for (let i = 0; i < socials.length; i++) {
        if (socials[i]) {
            newSocials.push({
                url: socials[i],
                icon: socialConvert(socials[i]),
                name: socials[i],
            })
        }
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
                image: section.image?.includes('[') ? '' : section.image,
                subheader: section.subheader,
                type: 'dl',
                weblink: section.ctaLink?.includes('[') ? '' : section.ctaLink,
            })
        }
        if (i === 1) {
            if (section.headline) {
                modules.push({
                    type: 'banner',
                    headline: section.headline,
                    actionlbl: section.ctaText || 'CALL US NOW',
                    weblink: section.ctaLink?.includes('[') ? '' : section.ctaLink,
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
                    actionlbl: section.ctaText || 'CALL US NOW',
                    weblink: section.ctaLink?.includes('[') ? '' : section.ctaLink,
                })
            }
        }
        if (section.components && section.components.length > 0) {
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
                } else if (currentComponent.type === 'video' && currentComponent.videoUrl != '[second_section_videoUrl]') {
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

export const createReviewItems = (reviews: { name?: string; text: string }[]) => {
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

interface FontRequest {
    key: string
    count: number
    isFirstPlace: boolean
}

export const createFontData = (fontsReq?: FontRequest[]) => {
    //set default fonts that can be changed later
    const defaultFontData = {
        sections: {
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
        },
        fontImport:
            '@import url(https://fonts.googleapis.com/css?family=Oswald:400,700|Open+Sans:400,700,400italic,700italic|Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap);',
    }

    let fonts = {
        sections: defaultFontData.sections,
        list: fontList,
    }
    let fontImport = defaultFontData.fontImport
    if (fontsReq) {
        const fontInfo = transformFonts(fontsReq)
        fontImport = fontInfo.fontImport

        fonts = {
            sections: fontInfo.fontSections,
            list: fontList,
        }
    }

    return { fonts, fontImport }
}

export const addSiteInfoToWebchat = (
    customComponents: { type: string; logo?: String; apiKey: string; siteName?: string }[],
    logo: string,
    siteName: string
) => {
    for (let i = 0; i < customComponents.length; i++) {
        if (customComponents[i].type === 'Webchat') {
            customComponents[i].logo = logo
            customComponents[i].siteName = siteName
        }
    }
    return customComponents
}
