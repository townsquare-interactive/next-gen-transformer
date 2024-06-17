import { fontList } from '../templates/layout-variables.js'
import { convertDescText, createFontImport, socialConvert } from './utils.js'
export const transformSocial = (socials) => {
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
export const addGuarnSpan = (text) => {
    if (text) {
        return `<span class='guarntext'>` + text + '</span>'
    } else return ''
}
export const createModulesWithSections = (sections) => {
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
export const createReviewItems = (reviews) => {
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
function getTopTwoFontFamilies(scrapedFonts) {
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
    return modifiedKeys.filter(Boolean)
}
export const transformFonts = (scrapedFonts) => {
    function getFontObjectsFromTopTwoFonts(topTwoFonts, fontList) {
        //assign default values
        let fontObject = {
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
export const createFontData = (fontsReq) => {
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
export const addSiteInfoToWebchat = (customComponents, logo, siteName) => {
    for (let i = 0; i < customComponents.length; i++) {
        if (customComponents[i].type === 'Webchat') {
            customComponents[i].logo = logo
            customComponents[i].siteName = siteName
        }
    }
    return customComponents
}
export const changeBMPToEngage = (customComponents) => {
    for (let i = 0; i < customComponents.length; i++) {
        if (customComponents[i].type === 'BMP') {
            customComponents[i].type = 'Engage'
        }
    }
    return customComponents
}
export const checkComponentsForScheduleNowApi = (customComponents) => {
    for (let i = 0; i < customComponents.length; i++) {
        if (customComponents[i].type === 'ScheduleEngine') {
            if (customComponents[i].apiKey) {
                return true
            }
        }
    }
    return false
}
export const customizeWidgets = (customComponents, themeColors, logo, siteName, phoneNumber) => {
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
    const createHeaderButtons = (phoneNumber, scheduleEngineWidgetActive, hasEngage) => {
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
export function transformDLText(inputText) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZGluZy11dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sYW5kaW5nLXV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQTtBQUUzRCxPQUFPLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxNQUFNLFlBQVksQ0FBQTtBQUU3RSxNQUFNLENBQUMsTUFBTSxlQUFlLEdBQUcsQ0FBQyxPQUFpQixFQUFFLEVBQUU7SUFDakQsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFBO0lBQ25CLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDdEMsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNiLFVBQVUsQ0FBQyxJQUFJLENBQUM7Z0JBQ1osR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ2YsSUFBSSxFQUFFLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9CLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQ25CLENBQUMsQ0FBQTtRQUNOLENBQUM7SUFDTCxDQUFDO0lBQ0QsT0FBTyxVQUFVLENBQUE7QUFDckIsQ0FBQyxDQUFBO0FBRUQsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLENBQUMsSUFBWSxFQUFFLEVBQUU7SUFDekMsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUNQLE9BQU8sMEJBQTBCLEdBQUcsSUFBSSxHQUFHLFNBQVMsQ0FBQTtJQUN4RCxDQUFDOztRQUFNLE9BQU8sRUFBRSxDQUFBO0FBQ3BCLENBQUMsQ0FBQTtBQUVELE1BQU0sQ0FBQyxNQUFNLHlCQUF5QixHQUFHLENBQUMsUUFBa0IsRUFBRSxFQUFFO0lBQzVELElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQTtJQUNoQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ3ZDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUMzQixJQUFJLE9BQU8sQ0FBQyxRQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQzlCLE9BQU8sQ0FBQyxJQUFJLENBQUM7Z0JBQ1QsUUFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFRO2dCQUMxQixTQUFTLEVBQUUsT0FBTyxDQUFDLE9BQU8sSUFBSSxnQkFBZ0I7Z0JBQzlDLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSztnQkFDeEQsU0FBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTO2dCQUM1QixJQUFJLEVBQUUsSUFBSTtnQkFDVixPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU87YUFDakUsQ0FBQyxDQUFBO1FBQ04sQ0FBQztRQUNELElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ1YsSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUM7b0JBQ1QsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsUUFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFRO29CQUMxQixTQUFTLEVBQUUsT0FBTyxDQUFDLE9BQU8sSUFBSSxhQUFhO29CQUMzQyxPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU87aUJBQ2pFLENBQUMsQ0FBQTtZQUNOLENBQUM7WUFDRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDZixPQUFPLENBQUMsSUFBSSxDQUFDO29CQUNULElBQUksRUFBRSxjQUFjO29CQUNwQixLQUFLLEVBQUUsT0FBTyxDQUFDLElBQUk7b0JBQ25CLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSztvQkFDcEIsUUFBUSxFQUFFLFlBQVksQ0FBQyxPQUFPLENBQUMsU0FBUyxJQUFJLEVBQUUsQ0FBQztpQkFDbEQsQ0FBQyxDQUFBO1lBQ04sQ0FBQztRQUNMLENBQUM7UUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNULElBQUksT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDO29CQUNULElBQUksRUFBRSxVQUFVO29CQUNoQixRQUFRLEVBQUUsT0FBTyxDQUFDLGNBQWM7aUJBQ25DLENBQUMsQ0FBQTtZQUNOLENBQUM7WUFDRCxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDbEIsT0FBTyxDQUFDLElBQUksQ0FBQztvQkFDVCxJQUFJLEVBQUUsU0FBUztvQkFDZixPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU87aUJBQzNCLENBQUMsQ0FBQTtZQUNOLENBQUM7WUFDRCxJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQztvQkFDVCxJQUFJLEVBQUUsUUFBUTtvQkFDZCxRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVE7b0JBQzFCLFNBQVMsRUFBRSxPQUFPLENBQUMsT0FBTyxJQUFJLGFBQWE7b0JBQzNDLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTztpQkFDakUsQ0FBQyxDQUFBO1lBQ04sQ0FBQztRQUNMLENBQUM7UUFDRCxJQUFJLE9BQU8sQ0FBQyxVQUFVLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDdEQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ2pELElBQUksZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtnQkFDNUMsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFLENBQUM7b0JBQ3JDLE9BQU8sQ0FBQyxJQUFJLENBQUM7d0JBQ1QsSUFBSSxFQUFFLFFBQVE7d0JBQ2QsS0FBSyxFQUFFLGdCQUFnQixDQUFDLEtBQUs7cUJBQ2hDLENBQUMsQ0FBQTtnQkFDTixDQUFDO3FCQUFNLElBQUksZ0JBQWdCLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRSxDQUFDO29CQUMxQyxPQUFPLENBQUMsSUFBSSxDQUFDO3dCQUNULElBQUksRUFBRSxNQUFNO3FCQUNmLENBQUMsQ0FBQTtnQkFDTixDQUFDO3FCQUFNLElBQUksZ0JBQWdCLENBQUMsSUFBSSxLQUFLLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxRQUFRLElBQUksMkJBQTJCLEVBQUUsQ0FBQztvQkFDdkcsT0FBTyxDQUFDLElBQUksQ0FBQzt3QkFDVCxJQUFJLEVBQUUsT0FBTzt3QkFDYixRQUFRLEVBQUUsZ0JBQWdCLENBQUMsUUFBUTtxQkFDdEMsQ0FBQyxDQUFBO2dCQUNOLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFRCxPQUFPLE9BQU8sQ0FBQTtBQUNsQixDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FBRyxDQUFDLE9BQTBDLEVBQUUsRUFBRTtJQUM1RSxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUE7SUFDZCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ3RDLE1BQU0sT0FBTyxHQUFHO1lBQ1osSUFBSSxFQUFFLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ3RDLEtBQUssRUFBRSxRQUFRO1lBQ2YsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJO1lBQ3pCLFNBQVMsRUFBRSxLQUFLO1lBQ2hCLFFBQVEsRUFBRSxDQUFDO1lBQ1gsVUFBVSxFQUFFLEtBQUs7WUFDakIsYUFBYSxFQUFFLEtBQUs7WUFDcEIsU0FBUyxFQUFFLENBQUM7U0FDZixDQUFBO1FBQ0QsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUN2QixDQUFDO0lBQ0QsT0FBTyxLQUFLLENBQUE7QUFDaEIsQ0FBQyxDQUFBO0FBUUQsU0FBUyxxQkFBcUIsQ0FBQyxZQUE4QztJQUN6RSw2REFBNkQ7SUFDN0QsTUFBTSxXQUFXLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ2xFLDZCQUE2QjtJQUM3QixNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUMzQywrQ0FBK0M7SUFDL0MsTUFBTSxZQUFZLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1FBQzFDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFBO1FBQ3pDLElBQUksS0FBSyxFQUFFLENBQUM7WUFDUixPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQ3RDLENBQUM7UUFDRCxPQUFPLEVBQUUsQ0FBQTtJQUNiLENBQUMsQ0FBQyxDQUFBO0lBQ0YsT0FBTyxZQUFZLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBYSxDQUFBO0FBQ25ELENBQUM7QUFFRCxNQUFNLENBQUMsTUFBTSxjQUFjLEdBQUcsQ0FBQyxZQUE0QixFQUFFLEVBQUU7SUFhM0QsU0FBUyw2QkFBNkIsQ0FBQyxXQUFxQixFQUFFLFFBQWtCO1FBTzVFLHVCQUF1QjtRQUN2QixJQUFJLFVBQVUsR0FBZTtZQUN6QixZQUFZLEVBQUU7Z0JBQ1YsS0FBSyxFQUFFLFFBQVE7Z0JBQ2YsTUFBTSxFQUFFLGdCQUFnQjtnQkFDeEIsYUFBYSxFQUFFLFVBQVU7YUFDNUI7WUFDRCxRQUFRLEVBQUU7Z0JBQ04sS0FBSyxFQUFFLFdBQVc7Z0JBQ2xCLE1BQU0sRUFBRSx1Q0FBdUM7Z0JBQy9DLGFBQWEsRUFBRSxhQUFhO2FBQy9CO1lBQ0QsWUFBWSxFQUFFO2dCQUNWLEtBQUssRUFBRSxRQUFRO2dCQUNmLE1BQU0sRUFBRSxnQkFBZ0I7Z0JBQ3hCLGFBQWEsRUFBRSxVQUFVO2FBQzVCO1NBQ0osQ0FBQTtRQUVELHVCQUF1QjtRQUN2QixJQUFJLFlBQVksR0FBRztZQUNmLElBQUksRUFBRTtnQkFDRixLQUFLLEVBQUUsV0FBVztnQkFDbEIsS0FBSyxFQUFFLFFBQVE7Z0JBQ2YsTUFBTSxFQUFFLFVBQVU7YUFDckI7WUFDRCxJQUFJLEVBQUU7Z0JBQ0YsS0FBSyxFQUFFLE1BQU07Z0JBQ2IsS0FBSyxFQUFFLFdBQVc7Z0JBQ2xCLE1BQU0sRUFBRSxhQUFhO2FBQ3hCO1lBQ0QsSUFBSSxFQUFFO2dCQUNGLEtBQUssRUFBRSxvQkFBb0I7Z0JBQzNCLEtBQUssRUFBRSxRQUFRO2dCQUNmLE1BQU0sRUFBRSxVQUFVO2FBQ3JCO1NBQ0osQ0FBQTtRQUNELFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDbkMsd0NBQXdDO1lBQ3hDLE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFBO1lBQ2xELEtBQUssTUFBTSxHQUFHLElBQUksUUFBUSxFQUFFLENBQUM7Z0JBQ3pCLElBQUksZUFBZSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO29CQUNoQyx3REFBd0Q7b0JBQ3hELGdEQUFnRDtvQkFFaEQsd0NBQXdDO29CQUN4QyxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUUsQ0FBQzt3QkFDZCxVQUFVLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTt3QkFDbkMsWUFBWSxDQUFDLElBQUksR0FBRyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUE7b0JBQ2xFLENBQUM7eUJBQU0sSUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFLENBQUM7d0JBQ3JCLFVBQVUsQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO3dCQUN2QyxVQUFVLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQTt3QkFFdkMsWUFBWSxDQUFDLElBQUksR0FBRyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUE7d0JBQ25FLFlBQVksQ0FBQyxJQUFJLEdBQUcsRUFBRSxLQUFLLEVBQUUsb0JBQW9CLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUE7b0JBQ2hGLENBQUM7b0JBRUQsTUFBSztnQkFDVCxDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFBO1FBQ0YsTUFBTSxVQUFVLEdBQUcsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLENBQUE7UUFDckgsa0VBQWtFO1FBQ2xFLE9BQU8sRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsZUFBZSxFQUFFLENBQUE7SUFDakYsQ0FBQztJQUVELE1BQU0sV0FBVyxHQUFHLHFCQUFxQixDQUFDLFlBQVksQ0FBQyxDQUFBO0lBQ3ZELE1BQU0sUUFBUSxHQUFHLDZCQUE2QixDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUNyRSxPQUFPLFFBQVEsQ0FBQTtBQUNuQixDQUFDLENBQUE7QUFRRCxNQUFNLENBQUMsTUFBTSxjQUFjLEdBQUcsQ0FBQyxRQUF3QixFQUFFLEVBQUU7SUFDdkQsNkNBQTZDO0lBQzdDLE1BQU0sZUFBZSxHQUFHO1FBQ3BCLFFBQVEsRUFBRTtZQUNOLElBQUksRUFBRTtnQkFDRixLQUFLLEVBQUUsV0FBVztnQkFDbEIsS0FBSyxFQUFFLFFBQVE7Z0JBQ2YsTUFBTSxFQUFFLFVBQVU7YUFDckI7WUFDRCxJQUFJLEVBQUU7Z0JBQ0YsS0FBSyxFQUFFLE1BQU07Z0JBQ2IsS0FBSyxFQUFFLFdBQVc7Z0JBQ2xCLE1BQU0sRUFBRSxhQUFhO2FBQ3hCO1lBQ0QsSUFBSSxFQUFFO2dCQUNGLEtBQUssRUFBRSxvQkFBb0I7Z0JBQzNCLEtBQUssRUFBRSxRQUFRO2dCQUNmLE1BQU0sRUFBRSxVQUFVO2FBQ3JCO1NBQ0o7UUFDRCxVQUFVLEVBQ04sa0xBQWtMO0tBQ3pMLENBQUE7SUFFRCxJQUFJLEtBQUssR0FBRztRQUNSLFFBQVEsRUFBRSxlQUFlLENBQUMsUUFBUTtRQUNsQyxJQUFJLEVBQUUsUUFBUTtLQUNqQixDQUFBO0lBQ0QsSUFBSSxVQUFVLEdBQUcsZUFBZSxDQUFDLFVBQVUsQ0FBQTtJQUMzQyxJQUFJLFFBQVEsRUFBRSxDQUFDO1FBQ1gsTUFBTSxRQUFRLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ3pDLFVBQVUsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFBO1FBRWhDLEtBQUssR0FBRztZQUNKLFFBQVEsRUFBRSxRQUFRLENBQUMsWUFBWTtZQUMvQixJQUFJLEVBQUUsUUFBUTtTQUNqQixDQUFBO0lBQ0wsQ0FBQztJQUVELE9BQU8sRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLENBQUE7QUFDaEMsQ0FBQyxDQUFBO0FBRUQsTUFBTSxDQUFDLE1BQU0sb0JBQW9CLEdBQUcsQ0FDaEMsZ0JBQXVGLEVBQ3ZGLElBQVksRUFDWixRQUFnQixFQUNsQixFQUFFO0lBQ0EsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQy9DLElBQUksZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ3pDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUE7WUFDL0IsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtRQUMzQyxDQUFDO0lBQ0wsQ0FBQztJQUNELE9BQU8sZ0JBQWdCLENBQUE7QUFDM0IsQ0FBQyxDQUFBO0FBRUQsTUFBTSxDQUFDLE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxnQkFBdUYsRUFBRSxFQUFFO0lBQ3pILEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUMvQyxJQUFJLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxLQUFLLEVBQUUsQ0FBQztZQUNyQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFBO1FBQ3ZDLENBQUM7SUFDTCxDQUFDO0lBQ0QsT0FBTyxnQkFBZ0IsQ0FBQTtBQUMzQixDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsTUFBTSxnQ0FBZ0MsR0FBRyxDQUFDLGdCQUF1RixFQUFFLEVBQUU7SUFDeEksS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQy9DLElBQUksZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLGdCQUFnQixFQUFFLENBQUM7WUFDaEQsSUFBSSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDN0IsT0FBTyxJQUFJLENBQUE7WUFDZixDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFDRCxPQUFPLEtBQUssQ0FBQTtBQUNoQixDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLGdCQUFtQyxFQUFFLFdBQXdCLEVBQUUsSUFBWSxFQUFFLFFBQWdCLEVBQUUsV0FBbUIsRUFBRSxFQUFFO0lBQ25KLElBQUkscUJBQXFCLENBQUE7SUFDekIsSUFBSSxLQUFLLENBQUE7SUFDVCxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUE7SUFDckIsSUFBSSwwQkFBMEIsR0FBRyxLQUFLLENBQUE7SUFFdEMsd0NBQXdDO0lBQ3hDLElBQUksZ0JBQWdCLEVBQUUsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQy9CLHFCQUFxQixHQUFHLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLENBQUE7UUFFM0QsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUNQLHFCQUFxQixHQUFHLG9CQUFvQixDQUFDLGdCQUFnQixFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQTtRQUNsRixDQUFDO1FBRUQsMEJBQTBCLEdBQUcsZ0NBQWdDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtRQUUvRSxNQUFNLFdBQVcsR0FBRyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDLENBQUE7UUFFNUYsU0FBUyxHQUFHLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFBO1FBRWxDLElBQUksU0FBUyxFQUFFLENBQUM7WUFDWixNQUFNLE9BQU8sR0FBRztnQkFDWjtvQkFDSSxJQUFJLEVBQUUsVUFBVTtvQkFDaEIsSUFBSSxFQUFFLGNBQWM7b0JBQ3BCLElBQUksRUFBRSxzRkFBc0Y7b0JBQzVGLE1BQU0sRUFBRSxFQUFFO29CQUNWLFVBQVUsRUFBRSxlQUFlO29CQUMzQixLQUFLLEVBQUUsbUJBQW1CO2lCQUM3QjtnQkFDRDtvQkFDSSxJQUFJLEVBQUUsU0FBUztvQkFDZixJQUFJLEVBQUUsY0FBYztvQkFDcEIsSUFBSSxFQUFFLHNGQUFzRjtvQkFDNUYsTUFBTSxFQUFFLEVBQUU7b0JBQ1YsVUFBVSxFQUFFLGVBQWU7b0JBQzNCLFdBQVcsRUFBRSxnQ0FBZ0M7aUJBQ2hEO2FBQ0osQ0FBQTtZQUVELDhDQUE4QztZQUM5QyxxQkFBcUIsR0FBRyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDLENBQUE7WUFDakcsMEJBQTBCLEdBQUcsS0FBSyxDQUFBO1lBRWxDLEtBQUssR0FBRztnQkFDSixVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU07Z0JBQ2pDLE9BQU8sRUFBRSxPQUFPO2dCQUNoQixXQUFXLEVBQUUsV0FBVzthQUMzQixDQUFBO1FBQ0wsQ0FBQztRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQTtJQUN0QyxDQUFDO0lBRUQsdUJBQXVCO0lBQ3ZCLE1BQU0sbUJBQW1CLEdBQUcsQ0FBQyxXQUFtQixFQUFFLDBCQUFtQyxFQUFFLFNBQWtCLEVBQUUsRUFBRTtRQUN6RyxtQkFBbUI7UUFDbkIsT0FBTztZQUNILGNBQWMsRUFBRTtnQkFDWjtvQkFDSSxLQUFLLEVBQUUsMkJBQTJCO29CQUNsQyxJQUFJLEVBQUUsT0FBTyxXQUFXLEVBQUU7b0JBQzFCLE1BQU0sRUFBRSxJQUFJO29CQUNaLFVBQVUsRUFBRSxDQUFDLENBQUM7b0JBQ2QsTUFBTSxFQUFFLENBQUM7b0JBQ1QsT0FBTyxFQUFFLGlCQUFpQjtvQkFDMUIsT0FBTyxFQUFFLFFBQVE7b0JBQ2pCLFVBQVUsRUFBRSw0RUFBNEU7b0JBQ3hGLElBQUksRUFBRTt3QkFDRixVQUFVLEVBQUUsS0FBSzt3QkFDakIsU0FBUyxFQUFFLGVBQWU7cUJBQzdCO2lCQUNKO2dCQUNEO29CQUNJLEtBQUssRUFBRSxjQUFjO29CQUNyQixJQUFJLEVBQUUsT0FBTyxXQUFXLEVBQUU7b0JBQzFCLE1BQU0sRUFBRSxJQUFJO29CQUNaLFVBQVUsRUFBRSxDQUFDLENBQUM7b0JBQ2QsTUFBTSxFQUFFLENBQUM7b0JBQ1QsT0FBTyxFQUFFLGlCQUFpQjtvQkFDMUIsT0FBTyxFQUFFLFFBQVE7b0JBQ2pCLFVBQVUsRUFBRSx3RUFBd0U7b0JBQ3BGLE1BQU0sRUFBRSwwQkFBMEIsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUNwRCxJQUFJLEVBQUU7d0JBQ0YsVUFBVSxFQUFFLEtBQUs7d0JBQ2pCLFNBQVMsRUFBRSxVQUFVO3FCQUN4QjtpQkFDSjthQUNKO1lBQ0QsbUJBQW1CLEVBQUU7Z0JBQ2pCO29CQUNJLEtBQUssRUFBRSxVQUFVO29CQUNqQixJQUFJLEVBQUUsT0FBTyxXQUFXLEVBQUU7b0JBQzFCLE1BQU0sRUFBRSxJQUFJO29CQUNaLFVBQVUsRUFBRSxDQUFDLENBQUM7b0JBQ2QsTUFBTSxFQUFFLENBQUM7b0JBQ1QsT0FBTyxFQUFFLGlCQUFpQjtvQkFDMUIsT0FBTyxFQUFFLFFBQVE7b0JBQ2pCLFVBQVUsRUFBRSw0RUFBNEU7b0JBQ3hGLElBQUksRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLGVBQWUsRUFBRTtpQkFDMUQ7Z0JBQ0Q7b0JBQ0ksS0FBSyxFQUFFLFVBQVU7b0JBQ2pCLElBQUksRUFBRSxPQUFPLFdBQVcsRUFBRTtvQkFDMUIsTUFBTSxFQUFFLElBQUk7b0JBQ1osVUFBVSxFQUFFLENBQUMsQ0FBQztvQkFDZCxNQUFNLEVBQUUsQ0FBQztvQkFDVCxPQUFPLEVBQUUsaUJBQWlCO29CQUMxQixPQUFPLEVBQUUsUUFBUTtvQkFDakIsVUFBVSxFQUFFLHdFQUF3RTtvQkFDcEYsTUFBTSxFQUFFLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQ3BELElBQUksRUFBRTt3QkFDRixVQUFVLEVBQUUsS0FBSzt3QkFDakIsU0FBUyxFQUFFLFVBQVU7cUJBQ3hCO2lCQUNKO2FBQ0o7U0FDSixDQUFBO1FBQ0Q7Ozs7OzttQkFNVztJQUNmLENBQUMsQ0FBQTtJQUVELE1BQU0sYUFBYSxHQUFHLG1CQUFtQixDQUFDLFdBQVcsRUFBRSwwQkFBMEIsRUFBRSxTQUFTLENBQUMsQ0FBQTtJQUU3RixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUscUJBQXFCLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxDQUFBO0FBQzVFLENBQUMsQ0FBQTtBQUVELE1BQU0sVUFBVSxlQUFlLENBQUMsU0FBaUI7SUFDN0Msa0NBQWtDO0lBQ2xDLE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7SUFFbEMsb0JBQW9CO0lBQ3BCLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUE7SUFFbEMsdUNBQXVDO0lBQ3ZDLE1BQU0sYUFBYSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7SUFFckMsd0NBQXdDO0lBQ3hDLE1BQU0sVUFBVSxHQUFHO21DQUNZLGFBQWE7OzhCQUVsQixRQUFRO0tBQ2pDLENBQUE7SUFFRCxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUE7QUFDdEMsQ0FBQyJ9
