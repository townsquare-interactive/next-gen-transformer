import { addProtocolToLink } from './utils.js';
function getATags(substring) {
    //const count = (substring.match(/<a\b[^>]*>/g) || []).length;
    // Extract href attributes from <a> tags
    const hrefs = [];
    const hrefRegex = /href="([^"]*)"/g;
    let match;
    while ((match = hrefRegex.exec(substring)) !== null) {
        hrefs.push(match[1]);
    }
    return { hrefs };
}
function parseSocialItemsFlex(inputString) {
    //check for className
    const startIndex = inputString.indexOf(`'<div class="social_items_flex"`);
    if (startIndex === -1) {
        console.log('first not found');
        return null;
    }
    // Find the single quote ending the statement
    const closingQuoteIndex = inputString.indexOf("'", startIndex + 1);
    if (closingQuoteIndex === -1) {
        console.log('end not found');
        return null;
    }
    // Extract the code from the beginning div to the end of the code
    const substring = inputString.substring(startIndex, closingQuoteIndex);
    // Count the number of <a> tags
    const tagInfo = getATags(substring);
    console.log('tags', tagInfo);
    return tagInfo;
}
export const getFloatingReviewButtons = (code) => {
    const parsedResult = parseSocialItemsFlex(code);
    if (parsedResult !== null) {
        const buttons = [];
        for (let x = 0; x < parsedResult.hrefs.length; x++) {
            let socialType = null;
            const href = parsedResult.hrefs[x];
            if (href.includes('facebook')) {
                socialType = 'facebook';
            }
            else if (href.includes('google') || href.includes('g.co')) {
                socialType = 'google';
            }
            else {
                socialType = null;
            }
            if (socialType != null) {
                buttons.push({
                    type: socialType,
                    link: addProtocolToLink(parsedResult.hrefs[x]),
                    content: socialType === 'google' ? 'Review Us On Google!' : 'Review Us On Facebook!',
                });
            }
        }
        return buttons;
    }
    else {
        //social button code not found
        return null;
    }
};
export const createCustomComponents = (code) => {
    const customComponents = [];
    if (code) {
        const floatingReviewButtons = getFloatingReviewButtons(code.footer || '' + code.header || '');
        if (floatingReviewButtons) {
            customComponents.push({
                type: 'FloatingReviewButtons',
                btns: floatingReviewButtons,
            });
        }
    }
    return customComponents;
};
//decide if youtube iframe is in desc tag and extract src to use if so
export function extractIframeSrc(input) {
    // Regular expression to match iframe tags
    const iframeRegex = /<iframe.*?<\/iframe>/gi;
    const iframeMatches = input.match(iframeRegex);
    if (iframeMatches && iframeMatches.length > 0) {
        // Extract the first iframe tag found
        const iframeTag = iframeMatches[0];
        // Extract the src attribute value from the iframe tag
        const srcRegex = /src=['"]([^'"]*?)['"]/i;
        const srcMatch = iframeTag.match(srcRegex);
        if (srcMatch && srcMatch.length > 1) {
            // Return the src attribute value
            const srcValue = srcMatch[1];
            if (srcValue.includes('youtube') || srcValue.includes('vimeo')) {
                // Remove the iframe tag from the input string
                const stringWithoutIframe = input.replace(iframeTag, '');
                return { srcValue: srcValue, newDesc: stringWithoutIframe };
            }
        }
    }
    return null;
}
export const transformVcita = (vcita, engage, businessInfo) => {
    let showMyAccountBtn = false;
    const defineActions = (actionsObject, isStarterPackage = false) => {
        const actions = [];
        Object.keys(actionsObject).forEach(function (action) {
            var object = actionsObject[action];
            if (object.active === false)
                return;
            switch (action) {
                case 'schedule':
                    if (!isStarterPackage) {
                        actions.push({ name: 'schedule', text: object.label ? object.label : 'Schedule now' });
                    }
                    break;
                case 'payment':
                    if (!isStarterPackage) {
                        actions.push({ name: 'pay', text: object.label ? object.label : 'Make a Payment' });
                    }
                    break;
                case 'call':
                    actions.push({
                        name: 'call',
                        text: object.label ? object.label : 'Click to give us a call',
                    });
                    break;
                case 'packages':
                    if (!isStarterPackage) {
                        actions.push({ name: 'package', text: object.label ? object.label : 'Purchase package' });
                    }
                    break;
                case 'shareDocument':
                    actions.push({ name: 'document', text: object.label ? object.label : 'Send a document' });
                    break;
                case 'email':
                    actions.push({ name: 'contact', text: object.label ? object.label : 'Get in touch' });
                    break;
                case 'direction':
                    actions.push({ name: 'googlemaps', text: object.label ? object.label : 'Our business address' });
                    break;
                case 'myAccountButton':
                    showMyAccountBtn = object.active;
                    break;
            }
        });
        return actions;
    };
    const actions = defineActions(vcita.options.actions);
    function getThemeColors(themeColor) {
        let color, bgColor, buttonTextColor, buttonBgColor, labelTextColor, labelBgColor;
        switch (themeColor) {
            case 'Blue':
                color = '#30414f';
                bgColor = '#ffffff';
                buttonTextColor = '#ffffff';
                buttonBgColor = '#3e87d9';
                labelTextColor = '#ffffff';
                labelBgColor = '#3e87d9';
                break;
            case 'Red':
                color = '#30414f';
                bgColor = '#ffffff';
                buttonTextColor = '#ffffff';
                buttonBgColor = '#d94b3e';
                labelTextColor = '#ffffff';
                labelBgColor = '#d94b3e';
                break;
            case 'Green':
                color = '#30414f';
                bgColor = '#ffffff';
                buttonTextColor = '#ffffff';
                buttonBgColor = '#73b200';
                labelTextColor = '#ffffff';
                labelBgColor = '#73b200';
                break;
            case 'Carrot':
                color = '#30414f';
                bgColor = '#ffffff';
                buttonTextColor = '#ffffff';
                buttonBgColor = '#ff9c00';
                labelTextColor = '#524e4c';
                labelBgColor = '#ffffff';
                break;
            case 'Magenta':
                color = '#30414f';
                bgColor = '#f5f5f5';
                buttonTextColor = '#ffffff';
                buttonBgColor = '#8d27e4';
                labelTextColor = '#8d27e4';
                labelBgColor = '#f5f5f5';
                break;
            case 'Soft Blue':
                color = '#30414f';
                bgColor = '#c9dbe5';
                buttonTextColor = '#ffffff';
                buttonBgColor = '#4e819e';
                labelTextColor = '#c9dbe5';
                labelBgColor = '#4e819e';
                break;
            case 'Lemon':
                color = '#726134';
                bgColor = '#ffefc7';
                buttonTextColor = '#726134';
                buttonBgColor = '#fdd15f';
                labelTextColor = '#726134';
                labelBgColor = '#fdd15f';
                break;
            case 'Rose':
                color = '#d4ccc8';
                bgColor = '#464646';
                buttonTextColor = '#ffffff';
                buttonBgColor = '#eb2872';
                labelTextColor = '#ffffff';
                labelBgColor = '#eb2872';
                break;
            case 'Forest Green':
                color = '#30414f';
                bgColor = '#fec931';
                buttonTextColor = '#ffffff';
                buttonBgColor = '#3eaa66';
                labelTextColor = '#ffffff';
                labelBgColor = '#3eaa66';
                break;
            case 'Arctic Blue':
                color = '#ffffff';
                bgColor = '#1eaaf1';
                buttonTextColor = '#212121';
                buttonBgColor = '#ffffff';
                labelTextColor = '#ffffff';
                labelBgColor = '#212121';
                break;
            case 'Corn':
                color = '#666666';
                bgColor = '#f8f8f8';
                buttonTextColor = '#141517';
                buttonBgColor = '#ffcc00';
                labelTextColor = '#ffffff';
                labelBgColor = '#353535';
                break;
            case 'Amethyst':
                color = '#ffffff';
                bgColor = '#8b62a8';
                buttonTextColor = '#ffffff';
                buttonBgColor = '#4f2c69';
                labelTextColor = '#ffffff';
                labelBgColor = '#8a64a6';
                break;
            case 'Brown':
                color = '#666666';
                bgColor = '#f6f3ee';
                buttonTextColor = '#ffffff';
                buttonBgColor = '#795b3f';
                labelTextColor = '#ffffff';
                labelBgColor = '#96ad21';
                break;
            case 'Turquoise':
                color = '#ffffff';
                bgColor = '#2faaa8';
                buttonTextColor = '#141517';
                buttonBgColor = '#ffffff';
                labelTextColor = '#ffffff';
                labelBgColor = '#2faaa8';
                break;
            case 'Black':
                color = '#666666';
                bgColor = '#ffffff';
                buttonTextColor = '#ffffff';
                buttonBgColor = '#333333';
                labelTextColor = '#ffffff';
                labelBgColor = '#000000';
                break;
            default:
                return '';
        }
        return {
            color: color,
            bgColor: bgColor,
            buttonTextColor: buttonTextColor,
            buttonBgColor: buttonBgColor,
            labelTextColor: labelTextColor,
            labelBgColor: labelBgColor,
        };
    }
    const themeColors = getThemeColors(vcita.options.themeColor);
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
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tQ29tcG9uZW50c1V0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2N1c3RvbUNvbXBvbmVudHNVdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxZQUFZLENBQUE7QUFFOUMsU0FBUyxRQUFRLENBQUMsU0FBaUI7SUFDL0IsOERBQThEO0lBRTlELHdDQUF3QztJQUN4QyxNQUFNLEtBQUssR0FBYSxFQUFFLENBQUE7SUFDMUIsTUFBTSxTQUFTLEdBQUcsaUJBQWlCLENBQUE7SUFDbkMsSUFBSSxLQUFLLENBQUE7SUFDVCxPQUFPLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUU7UUFDakQsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUN2QjtJQUVELE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQTtBQUNwQixDQUFDO0FBRUQsU0FBUyxvQkFBb0IsQ0FBQyxXQUFtQjtJQUM3QyxxQkFBcUI7SUFDckIsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFBO0lBQ3pFLElBQUksVUFBVSxLQUFLLENBQUMsQ0FBQyxFQUFFO1FBQ25CLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtRQUM5QixPQUFPLElBQUksQ0FBQTtLQUNkO0lBRUQsNkNBQTZDO0lBQzdDLE1BQU0saUJBQWlCLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBQ2xFLElBQUksaUJBQWlCLEtBQUssQ0FBQyxDQUFDLEVBQUU7UUFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQTtRQUM1QixPQUFPLElBQUksQ0FBQTtLQUNkO0lBRUQsaUVB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