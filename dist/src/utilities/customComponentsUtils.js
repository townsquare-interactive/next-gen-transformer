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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tQ29tcG9uZW50c1V0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9jdXN0b21Db21wb25lbnRzVXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sWUFBWSxDQUFBO0FBRTlDLFNBQVMsUUFBUSxDQUFDLFNBQWlCO0lBQy9CLDhEQUE4RDtJQUU5RCx3Q0FBd0M7SUFDeEMsTUFBTSxLQUFLLEdBQWEsRUFBRSxDQUFBO0lBQzFCLE1BQU0sU0FBUyxHQUFHLGlCQUFpQixDQUFBO0lBQ25DLElBQUksS0FBSyxDQUFBO0lBQ1QsT0FBTyxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFO1FBQ2pELEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FDdkI7SUFFRCxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUE7QUFDcEIsQ0FBQztBQUVELFNBQVMsb0JBQW9CLENBQUMsV0FBbUI7SUFDN0MscUJBQXFCO0lBQ3JCLE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsaUNBQWlDLENBQUMsQ0FBQTtJQUN6RSxJQUFJLFVBQVUsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUE7UUFDOUIsT0FBTyxJQUFJLENBQUE7S0FDZDtJQUVELDZDQUE2QztJQUM3QyxNQUFNLGlCQUFpQixHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUNsRSxJQUFJLGlCQUFpQixLQUFLLENBQUMsQ0FBQyxFQUFFO1FBQzFCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUE7UUFDNUIsT0FBTyxJQUFJLENBQUE7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