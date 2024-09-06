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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tQ29tcG9uZW50c1V0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9jdXN0b21Db21wb25lbnRzVXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sWUFBWSxDQUFBO0FBRTlDLFNBQVMsUUFBUSxDQUFDLFNBQWlCO0lBQy9CLDhEQUE4RDtJQUU5RCx3Q0FBd0M7SUFDeEMsTUFBTSxLQUFLLEdBQWEsRUFBRSxDQUFBO0lBQzFCLE1BQU0sU0FBUyxHQUFHLGlCQUFpQixDQUFBO0lBQ25DLElBQUksS0FBSyxDQUFBO0lBQ1QsT0FBTyxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUM7UUFDbEQsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN4QixDQUFDO0lBRUQsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFBO0FBQ3BCLENBQUM7QUFFRCxTQUFTLG9CQUFvQixDQUFDLFdBQW1CO0lBQzdDLHFCQUFxQjtJQUNyQixNQUFNLFVBQVUsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLGlDQUFpQyxDQUFDLENBQUE7SUFDekUsSUFBSSxVQUFVLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUE7UUFDOUIsT0FBTyxJQUFJLENBQUE7SUFDZixDQUFDO0lBRUQsNkNBQTZDO0lBQzdDLE1BQU0saUJBQWlCLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBQ2xFLElBQUksaUJBQWlCLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUMzQixPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxD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