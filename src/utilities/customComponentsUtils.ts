import { addProtocolToLink } from './utils.js'

function getATags(substring: string) {
    //const count = (substring.match(/<a\b[^>]*>/g) || []).length;

    // Extract href attributes from <a> tags
    const hrefs: string[] = []
    const hrefRegex = /href="([^"]*)"/g
    let match
    while ((match = hrefRegex.exec(substring)) !== null) {
        hrefs.push(match[1])
    }

    return { hrefs }
}

function parseSocialItemsFlex(inputString: string): { hrefs: string[] } | null {
    //check for className
    const startIndex = inputString.indexOf(`'<div class="social_items_flex"`)
    if (startIndex === -1) {
        console.log('first not found')
        return null
    }

    // Find the single quote ending the statement
    const closingQuoteIndex = inputString.indexOf("'", startIndex + 1)
    if (closingQuoteIndex === -1) {
        console.log('end not found')
        return null
    }

    // Extract the code from the beginning div to the end of the code
    const substring = inputString.substring(startIndex, closingQuoteIndex)

    // Count the number of <a> tags
    const tagInfo = getATags(substring)
    console.log('tags', tagInfo)
    return tagInfo
}

export const getFloatingReviewButtons = (code: string) => {
    const parsedResult = parseSocialItemsFlex(code)

    if (parsedResult !== null) {
        const buttons = []

        for (let x = 0; x < parsedResult.hrefs.length; x++) {
            let socialType = null
            const href = parsedResult.hrefs[x]
            if (href.includes('facebook')) {
                socialType = 'facebook'
            } else if (href.includes('google') || href.includes('g.co')) {
                socialType = 'google'
            } else {
                socialType = null
            }
            if (socialType != null) {
                buttons.push({
                    type: socialType,
                    link: addProtocolToLink(parsedResult.hrefs[x]),
                    content: socialType === 'google' ? 'Review Us On Google!' : 'Review Us On Facebook!',
                })
            }
        }

        return buttons
    } else {
        //social button code not found
        return null
    }
}

export const createCustomComponents = (code: { footer: string; header: string }) => {
    const customComponents = []

    if (code) {
        const floatingReviewButtons = getFloatingReviewButtons(code.footer || '' + code.header || '')

        if (floatingReviewButtons) {
            customComponents.push({
                type: 'FloatingReviewButtons',
                btns: floatingReviewButtons,
            })
        }
    }

    return customComponents
}

//decide if youtube iframe is in desc tag and extract src to use if so
export function extractIframeSrc(input: string) {
    // Regular expression to match iframe tags
    const iframeRegex = /<iframe.*?<\/iframe>/gi

    const iframeMatches = input.match(iframeRegex)

    if (iframeMatches && iframeMatches.length > 0) {
        // Extract the first iframe tag found
        const iframeTag = iframeMatches[0]

        // Extract the src attribute value from the iframe tag
        const srcRegex = /src=['"]([^'"]*?)['"]/i
        const srcMatch = iframeTag.match(srcRegex)

        if (srcMatch && srcMatch.length > 1) {
            // Return the src attribute value
            const srcValue = srcMatch[1]
            if (srcValue.includes('youtube') || srcValue.includes('vimeo')) {
                // Remove the iframe tag from the input string
                const stringWithoutIframe = input.replace(iframeTag, '')
                return { srcValue: srcValue, newDesc: stringWithoutIframe }
            }
        }
    }

    return null
}

export const transformVcita = (vcita: any, engage: any, businessInfo: any) => {
    let showMyAccountBtn = false
    const defineActions = (actionsObject: any, isStarterPackage = false) => {
        const actions: any = []
        Object.keys(actionsObject).forEach(function (action) {
            const object = actionsObject[action]

            if (object.active === false) return
            switch (action) {
                case 'schedule':
                    if (!isStarterPackage) {
                        actions.push({ name: 'schedule', text: object.label ? object.label : 'Schedule now' })
                    }
                    break
                case 'payment':
                    if (!isStarterPackage) {
                        actions.push({ name: 'pay', text: object.label ? object.label : 'Make a Payment' })
                    }
                    break
                case 'call':
                    actions.push({
                        name: 'call',
                        text: object.label ? object.label : 'Click to give us a call',
                    })
                    break
                case 'packages':
                    if (!isStarterPackage) {
                        actions.push({ name: 'package', text: object.label ? object.label : 'Purchase package' })
                    }
                    break
                case 'shareDocument':
                    actions.push({ name: 'document', text: object.label ? object.label : 'Send a document' })
                    break
                case 'email':
                    actions.push({ name: 'contact', text: object.label ? object.label : 'Get in touch' })
                    break
                case 'direction':
                    actions.push({ name: 'googlemaps', text: object.label ? object.label : 'Our business address' })
                    break
                case 'myAccountButton':
                    showMyAccountBtn = object.active
                    break
            }
        })
        return actions
    }

    const actions = defineActions(vcita.options.actions)

    function getThemeColors(themeColor: string) {
        let color: string, bgColor: string, buttonTextColor: string, buttonBgColor: string, labelTextColor: string, labelBgColor: string

        switch (themeColor) {
            case 'Blue':
                color = '#30414f'
                bgColor = '#ffffff'
                buttonTextColor = '#ffffff'
                buttonBgColor = '#3e87d9'
                labelTextColor = '#ffffff'
                labelBgColor = '#3e87d9'
                break
            case 'Red':
                color = '#30414f'
                bgColor = '#ffffff'
                buttonTextColor = '#ffffff'
                buttonBgColor = '#d94b3e'
                labelTextColor = '#ffffff'
                labelBgColor = '#d94b3e'
                break
            case 'Green':
                color = '#30414f'
                bgColor = '#ffffff'
                buttonTextColor = '#ffffff'
                buttonBgColor = '#73b200'
                labelTextColor = '#ffffff'
                labelBgColor = '#73b200'
                break
            case 'Carrot':
                color = '#30414f'
                bgColor = '#ffffff'
                buttonTextColor = '#ffffff'
                buttonBgColor = '#ff9c00'
                labelTextColor = '#524e4c'
                labelBgColor = '#ffffff'
                break
            case 'Magenta':
                color = '#30414f'
                bgColor = '#f5f5f5'
                buttonTextColor = '#ffffff'
                buttonBgColor = '#8d27e4'
                labelTextColor = '#8d27e4'
                labelBgColor = '#f5f5f5'
                break
            case 'Soft Blue':
                color = '#30414f'
                bgColor = '#c9dbe5'
                buttonTextColor = '#ffffff'
                buttonBgColor = '#4e819e'
                labelTextColor = '#c9dbe5'
                labelBgColor = '#4e819e'
                break
            case 'Lemon':
                color = '#726134'
                bgColor = '#ffefc7'
                buttonTextColor = '#726134'
                buttonBgColor = '#fdd15f'
                labelTextColor = '#726134'
                labelBgColor = '#fdd15f'
                break
            case 'Rose':
                color = '#d4ccc8'
                bgColor = '#464646'
                buttonTextColor = '#ffffff'
                buttonBgColor = '#eb2872'
                labelTextColor = '#ffffff'
                labelBgColor = '#eb2872'
                break
            case 'Forest Green':
                color = '#30414f'
                bgColor = '#fec931'
                buttonTextColor = '#ffffff'
                buttonBgColor = '#3eaa66'
                labelTextColor = '#ffffff'
                labelBgColor = '#3eaa66'
                break
            case 'Arctic Blue':
                color = '#ffffff'
                bgColor = '#1eaaf1'
                buttonTextColor = '#212121'
                buttonBgColor = '#ffffff'
                labelTextColor = '#ffffff'
                labelBgColor = '#212121'
                break
            case 'Corn':
                color = '#666666'
                bgColor = '#f8f8f8'
                buttonTextColor = '#141517'
                buttonBgColor = '#ffcc00'
                labelTextColor = '#ffffff'
                labelBgColor = '#353535'
                break
            case 'Amethyst':
                color = '#ffffff'
                bgColor = '#8b62a8'
                buttonTextColor = '#ffffff'
                buttonBgColor = '#4f2c69'
                labelTextColor = '#ffffff'
                labelBgColor = '#8a64a6'
                break
            case 'Brown':
                color = '#666666'
                bgColor = '#f6f3ee'
                buttonTextColor = '#ffffff'
                buttonBgColor = '#795b3f'
                labelTextColor = '#ffffff'
                labelBgColor = '#96ad21'
                break
            case 'Turquoise':
                color = '#ffffff'
                bgColor = '#2faaa8'
                buttonTextColor = '#141517'
                buttonBgColor = '#ffffff'
                labelTextColor = '#ffffff'
                labelBgColor = '#2faaa8'
                break
            case 'Black':
                color = '#666666'
                bgColor = '#ffffff'
                buttonTextColor = '#ffffff'
                buttonBgColor = '#333333'
                labelTextColor = '#ffffff'
                labelBgColor = '#000000'
                break
            default:
                return ''
        }

        return {
            color: color,
            bgColor: bgColor,
            buttonTextColor: buttonTextColor,
            buttonBgColor: buttonBgColor,
            labelTextColor: labelTextColor,
            labelBgColor: labelBgColor,
        }
    }

    const themeColors = getThemeColors(vcita.options.themeColor)

    return {
        actions: actions,
        showMyAccountBtn: showMyAccountBtn,
        themeColors: themeColors,
        businessId: engage.businessInfo.business_id,
        titleText: vcita.options.titleText || '',
        mainAction: vcita.options.mainAction || '',
        bodyText: vcita.options.bodyText || '',
        widgetLabel: vcita.options.widgetLabel || '',
        businessInfo: businessInfo,
    }
}
