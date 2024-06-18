import type { CustomComponent, LandingColors, Sections } from '../schema/input-zod.js'
import { fontList } from '../templates/layout-variables.js'
import { FontType, ThemeStyles } from '../types.js'
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
            if (section.reviews && section.reviews.length > 0) {
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
    customComponents: { type: string; logo?: string; apiKey?: string; siteName?: string }[],
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

export const changeBMPToEngage = (customComponents: { type: string; logo?: string; apiKey?: string; siteName?: string }[]) => {
    for (let i = 0; i < customComponents.length; i++) {
        if (customComponents[i].type === 'BMP') {
            customComponents[i].type = 'Engage'
        }
    }
    return customComponents
}

export const checkComponentsForScheduleNowApi = (customComponents: { type: string; logo?: string; apiKey?: string; siteName?: string }[]) => {
    for (let i = 0; i < customComponents.length; i++) {
        if (customComponents[i].type === 'ScheduleEngine') {
            if (customComponents[i].apiKey) {
                return true
            }
        }
    }
    return false
}

export const customizeWidgets = (customComponents: CustomComponent[], themeColors: ThemeStyles, logo: string, siteName: string, phoneNumber: string) => {
    let transformedComponents
    let vcita
    let hasEngage = false
    let scheduleEngineWidgetActive = false

    //assign logo/sitename to webchat widget
    if (customComponents?.length > 0) {
        transformedComponents = changeBMPToEngage(customComponents)

        if (logo) {
            transformedComponents = addSiteInfoToWebchat(customComponents, logo, siteName)
        }

        scheduleEngineWidgetActive = checkComponentsForScheduleNowApi(customComponents)

        const engageArray = transformedComponents.filter((component) => component.type === 'Engage')

        hasEngage = engageArray.length > 0

        if (hasEngage) {
            const actions = [
                {
                    name: 'schedule',
                    text: 'Schedule Now',
                    href: 'https://tstest.myclients.io/site/9mov7u02gx2b57pf/action/w4h7zch15hst5825?mode=embed',
                    target: '',
                    dataOrigin: 'livesite_menu',
                    class: 'livesite-schedule',
                },
                {
                    name: 'contact',
                    text: 'Get in touch',
                    href: 'https://tstest.myclients.io/site/9mov7u02gx2b57pf/action/195y3g4o90w7gk0x?mode:embed',
                    target: '',
                    dataOrigin: 'livesite_menu',
                    dataOptions: 'title:Contact Request;message:',
                },
            ]

            //Filter out webchat when engage is being used
            transformedComponents = transformedComponents.filter((component) => component.type !== 'Webchat')
            scheduleEngineWidgetActive = false

            vcita = {
                businessId: engageArray[0].apiKey,
                actions: actions,
                themeStyles: themeColors,
            }
        }
        console.log(transformedComponents)
    }

    //create header buttons
    const createHeaderButtons = (phoneNumber: string, scheduleEngineWidgetActive: boolean, hasEngage: boolean) => {
        //if (!hasEngage) {
        return {
            desktopButtons: [
                {
                    label: 'GET 24/7 SERVICE CALL NOW',
                    link: `tel:${phoneNumber}`,
                    active: true,
                    opensModal: -1,
                    window: 1,
                    btnType: 'btn_cta_landing',
                    btnSize: 'btn_md',
                    googleIcon: "<span class='material-symbols-outlined call cta-icon'>phone_android</span>",
                    icon: {
                        iconPrefix: 'fas',
                        iconModel: 'mobile-screen',
                    },
                },
                {
                    label: 'Schedule NOW',
                    link: `tel:${phoneNumber}`,
                    active: true,
                    opensModal: -1,
                    window: 1,
                    btnType: 'btn_cta_landing',
                    btnSize: 'btn_md',
                    googleIcon: "<span class='material-symbols-outlined cta-icon'>calendar_clock</span>",
                    action: scheduleEngineWidgetActive ? 'schedule' : '',
                    icon: {
                        iconPrefix: 'far',
                        iconModel: 'calendar',
                    },
                },
            ],
            mobileHeaderButtons: [
                {
                    label: 'CALL NOW',
                    link: `tel:${phoneNumber}`,
                    active: true,
                    opensModal: -1,
                    window: 1,
                    btnType: 'btn_cta_landing',
                    btnSize: 'btn_md',
                    googleIcon: "<span class='material-symbols-outlined call cta-icon'>phone_android</span>",
                    icon: { iconPrefix: 'fas', iconModel: 'mobile-screen' },
                },
                {
                    label: 'Schedule',
                    link: `tel:${phoneNumber}`,
                    active: true,
                    opensModal: -1,
                    window: 1,
                    btnType: 'btn_cta_landing',
                    btnSize: 'btn_md',
                    googleIcon: "<span class='material-symbols-outlined cta-icon'>calendar_clock</span>",
                    action: scheduleEngineWidgetActive ? 'schedule' : '',
                    icon: {
                        iconPrefix: 'far',
                        iconModel: 'calendar',
                    },
                },
            ],
        }
        /*}  else {
                               {
                    name: 'call',
                    text: 'Click to give us a call',
                }, 
                    
                }*/
    }

    const headerButtons = createHeaderButtons(phoneNumber, scheduleEngineWidgetActive, hasEngage)

    return { customComponents: transformedComponents, headerButtons, vcita }
}

export function transformDLText(inputText: string): string {
    // Split the input text into words
    const words = inputText.split(' ')

    // Get the last word
    const lastWord = words.pop() || ''

    // Join the remaining words with spaces
    const remainingText = words.join(' ')

    // Create the output text with span tags
    const outputText = `
        <span class='mobiletext'>${remainingText}</span>
        <br>
        <span class='guarn'>${lastWord}</span>
    `

    return inputText ? outputText : ''
}

export const createLandingColors = (colors: LandingColors) => {
    return {
        logoColor: '#444444',
        headingColor: colors.accent || '#092150',
        subHeadingColor: colors.accent || '#092150',
        textColor: '#444444',
        linkColor: colors.primary || '#db1a21',
        linkHover: colors.primary || '#db1a21',
        btnText: '#ffffff',
        btnBackground: colors.primary || '#db1a21',
        textColorAccent: '#ffffff',
        heroSubheadline: '#ffffff',
        heroText: '#ffffff',
        heroBtnText: '#ffffff',
        heroBtnBackground: '#444444',
        heroLink: '#DDDDDD',
        heroLinkHover: '#dddddd',
        captionText: '#ffffff',
        captionBackground: 'rgba(0,0,0,0.4)',
        NavText: '#666666',
        navHover: colors.primary || '#db1a21',
        navCurrent: colors.primary || '#db1a21',
        backgroundMain: '#ffffff',
        bckdContent: 'rgba(255,255,255,1)',
        headerBackground: colors.headerBackground ? colors.headerBackground : 'rgba(255,255,255,1)',
        BckdHeaderSocial: '#ffffff',
        accentBackgroundColor: colors.accent || '#092150',
        backgroundHero: colors.accent || '#092150',
        footerBackground: colors.footerBackground ? colors.footerBackground : colors.accent || '#fff',
        footerText: colors.footerText || '#fff',
        footerTextOverride: colors.footerText || '',
        footerLink: colors.tertiary || '#7fa7b8',
        promoText: '#ffffff',
        promoColor: colors.primary || '#db1a21',
        promoColor2: colors.accent || '#092150',
        promoColor3: colors.tertiary || '#7fa7b8',
        promoColor4: colors.accent || '#092150',
        promoColor5: colors.tertiary || '#f2f6fc',
        promoColor6: colors.accent || '#092150',
    }
}
