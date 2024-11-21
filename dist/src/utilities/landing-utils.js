import { fontList } from '../../templates/layout-variables.js';
import { convertDescText, createFontImport, socialConvert } from './utils.js';
export const transformSocial = (socials) => {
    let newSocials = [];
    for (let i = 0; i < socials.length; i++) {
        if (socials[i]) {
            newSocials.push({
                url: socials[i],
                icon: socialConvert(socials[i]),
                name: socials[i],
            });
        }
    }
    return newSocials;
};
export const addGuarnSpan = (text) => {
    if (text) {
        return `<span class='guarntext'>` + text + '</span>';
    }
    else
        return '';
};
function convertIframe(input) {
    // Regular expression to find the <iframe ... >
    const iframeRegex = /<iframe[^>]*>/i;
    const match = input.match(iframeRegex);
    if (match) {
        // Extract the matched <iframe ... >
        let iframeTag = match[0];
        // Ensure it ends with ' />'
        if (!iframeTag.endsWith('/>')) {
            iframeTag = iframeTag.slice(0, -1) + '/>';
        }
        // Return the modified iframe tag with closing </iframe>
        console.log(iframeTag + '</iframe>');
        return iframeTag + '</iframe>';
    }
    else {
        // Return an empty string if no match is found
        return '';
    }
}
//use the request sections to create modules
export const createModulesWithSections = (sections) => {
    let modules = [];
    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (section.headline && i === 0) {
            modules.push({
                headline: section.headline,
                actionlbl: section.ctaText || 'GIVE US A CALL',
                image: section.image,
                subheader: section.subheader,
                type: 'dl',
                weblink: section.ctaLink,
                dataLayerEventBtn: section.dataLayerEventBtn || '',
                dataLayerEventWrap: section.dataLayerEventWrap || '',
            });
        }
        if (i === 1) {
            if (section.headline) {
                modules.push({
                    type: 'banner',
                    headline: section.headline,
                    actionlbl: section.ctaText || 'CALL US NOW',
                    weblink: section.ctaLink,
                    dataLayerEventBtn: section.dataLayerEventBtn || '',
                    dataLayerEventWrap: section.dataLayerEventWrap || '',
                });
            }
            if (section.desc) {
                modules.push({
                    type: 'text content',
                    desc1: section.desc,
                    desc2: section.desc2,
                    headline: addGuarnSpan(section.subheader || ''),
                });
            }
        }
        if (i == 2) {
            if (section.reviewHeadline) {
                modules.push({
                    type: 'headline',
                    headline: section.reviewHeadline,
                });
            }
            if (section.reviews && section.reviews.length > 0) {
                modules.push({
                    type: 'reviews',
                    reviews: section.reviews,
                });
            }
            if (section.headline) {
                modules.push({
                    type: 'banner',
                    headline: section.headline,
                    actionlbl: section.ctaText || 'CALL US NOW',
                    weblink: section.ctaLink,
                    dataLayerEventBtn: section.dataLayerEventBtn || '',
                    dataLayerEventWrap: section.dataLayerEventWrap || '',
                });
            }
        }
        if (section.components && section.components.length > 0) {
            for (let x = 0; x < section.components.length; x++) {
                const currentComponent = section.components[x];
                if (currentComponent.type === 'coupon') {
                    modules.push({
                        type: 'coupon',
                        image: currentComponent.image,
                    });
                }
                else if (currentComponent.type === 'form') {
                    modules.push({
                        type: 'form',
                        embed: currentComponent.embed || '',
                        contactFormTitle: currentComponent.contactFormTitle,
                    });
                }
                else if (currentComponent.type === 'video') {
                    modules.push({
                        type: 'video',
                        videoUrl: currentComponent.videoUrl,
                    });
                }
            }
        }
    }
    return modules;
};
export const createReviewItems = (reviews) => {
    let items = [];
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
        };
        items.push(newItem);
    }
    return items;
};
function getTopTwoFontFamilies(scrapedFonts) {
    // Sort scrapedFonts array based on count in descending order
    const sortedFonts = scrapedFonts.sort((a, b) => b.count - a.count);
    // Get the first two elements
    const topTwoFonts = sortedFonts.slice(0, 2);
    // Modify keys by replacing spaces with hyphens
    const modifiedKeys = topTwoFonts.map((font) => {
        const match = font.key.match(/"([^"]+)"/);
        if (match) {
            return match[1].replace(/ /g, '-');
        }
        return '';
    });
    return modifiedKeys.filter(Boolean);
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
        };
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
        };
        topTwoFonts.forEach((fontKey, index) => {
            // Add dashes for between space to match
            const modifiedFontKey = fontKey.replace(/ /g, '-');
            for (const key in fontList) {
                if (modifiedFontKey.includes(key)) {
                    // Determine type of font based on index
                    if (index === 0) {
                        fontObject.bodyFont = fontList[key];
                        fontSections.body = { label: 'Text', value: key, family: key };
                    }
                    else if (index === 1) {
                        fontObject.headlineFont = fontList[key];
                        fontObject.featuredFont = fontList[key];
                        fontSections.hdrs = { label: 'Headlines', value: key, family: key };
                        fontSections.feat = { label: 'Featured Headlines', value: key, family: key };
                    }
                    break;
                }
            }
        });
        const fontImport = createFontImport(fontObject.headlineFont, fontObject.bodyFont, fontObject.featuredFont, 'landing');
        //sections used for css, fontImport for importing google font link
        return { fontSections: fontSections, fontImport: fontImport.fontImportGroup };
    }
    const topTwoFonts = getTopTwoFontFamilies(scrapedFonts);
    const fontData = getFontObjectsFromTopTwoFonts(topTwoFonts, fontList);
    return fontData;
};
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
        fontImport: '@import url(https://fonts.googleapis.com/css?family=Oswald:400,700|Open+Sans:400,700,400italic,700italic|Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap);',
    };
    let fonts = {
        sections: defaultFontData.sections,
        list: fontList,
    };
    let fontImport = defaultFontData.fontImport;
    if (fontsReq) {
        const fontInfo = transformFonts(fontsReq);
        fontImport = fontInfo.fontImport;
        fonts = {
            sections: fontInfo.fontSections,
            list: fontList,
        };
    }
    return { fonts, fontImport };
};
export const addSiteInfoToWebchat = (customComponents, logo, siteName) => {
    for (let i = 0; i < customComponents.length; i++) {
        if (customComponents[i].type === 'Webchat') {
            customComponents[i].logo = logo;
            customComponents[i].siteName = siteName;
        }
    }
    return customComponents;
};
export const changeBMPToEngage = (customComponents) => {
    for (let i = 0; i < customComponents.length; i++) {
        if (customComponents[i].type === 'BMP') {
            customComponents[i].type = 'Engage';
        }
    }
    return customComponents;
};
export function removeEmptyApiComponents(components) {
    return components.filter((component) => !!component.apiKey);
}
export const checkComponentsForScheduleNowApi = (customComponents) => {
    for (let i = 0; i < customComponents.length; i++) {
        if (customComponents[i].type === 'ScheduleEngine') {
            if (customComponents[i].apiKey) {
                return true;
            }
        }
    }
    return false;
};
export const checkModulesForBMP = (modules) => {
    let transformedComponents;
    transformedComponents = modules?.length > 0 ? changeBMPToEngage(modules) : [];
    const engageArray = transformedComponents.filter((component) => component.type === 'Engage' && component.apiKey != '');
    const hasEngage = engageArray.length > 0;
    return hasEngage;
};
export const customizeWidgets = (customComponents, themeColors, logo, siteName, phoneNumber, email, headerButtonData, hasEngage) => {
    let transformedComponents;
    let vcita;
    let scheduleEngineWidgetActive = false;
    //assign logo/sitename to webchat widget
    if (customComponents?.length > 0) {
        const validatedComponents = removeEmptyApiComponents(customComponents);
        transformedComponents = changeBMPToEngage(validatedComponents);
        if (logo) {
            transformedComponents = addSiteInfoToWebchat(customComponents, logo, siteName);
        }
        scheduleEngineWidgetActive = checkComponentsForScheduleNowApi(customComponents);
        const engageArray = transformedComponents.filter((component) => component.type === 'Engage' && component.apiKey != '');
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
            ];
            //Filter out webchat when engage is being used
            transformedComponents = transformedComponents.filter((component) => component.type !== 'Webchat');
            scheduleEngineWidgetActive = false;
            vcita = {
                businessId: engageArray[0].apiKey,
                actions: actions,
                themeStyles: themeColors,
            };
        }
        console.log(transformedComponents);
    }
    //create header buttons
    const createHeaderButtons = (phoneNumber, email, scheduleEngineWidgetActive, hasEngage, headerButtonData) => {
        const desktopButtons = [];
        const mobileHeaderButtons = [];
        const getButtonLabel = (hasEngage, phoneNumber, headerButtonData) => {
            if (headerButtonData?.button1?.label)
                return headerButtonData.button1.label;
            if (hasEngage)
                return 'CONTACT US';
            if (phoneNumber)
                return phoneNumber;
            if (email)
                return 'CONTACT US';
            return 'CONTACT US';
        };
        const getButtonLink = (phoneNumber, email, headerButtonData) => {
            if (headerButtonData?.button1?.link)
                return headerButtonData.button1.link;
            if (hasEngage)
                return '';
            return phoneNumber ? `tel:${phoneNumber}` : email ? `mailto:${email}` : '';
        };
        const icon1 = headerButtonData?.button1?.label ? '' : headerButtonData?.button1?.link ? '' : { iconPrefix: 'fas', iconModel: 'mobile-screen' };
        const icon2 = headerButtonData?.button2?.label
            ? ''
            : headerButtonData?.button2?.link
                ? ''
                : {
                    iconPrefix: 'far',
                    iconModel: 'calendar',
                };
        if (hasEngage || phoneNumber || headerButtonData?.button1?.link || email) {
            const label = getButtonLabel(hasEngage, phoneNumber, headerButtonData);
            const link = getButtonLink(phoneNumber, email, headerButtonData);
            const commonButtonProps = {
                label,
                link,
                active: true,
                opensModal: -1,
                window: headerButtonData?.button1?.link ? 1 : 0,
                btnType: 'btn_cta_landing',
                btnSize: 'btn_md',
                googleIcon: "<span class='material-symbols-outlined call cta-icon'>phone_android</span>",
                icon: icon1,
                action: headerButtonData?.button1?.link ? '' : hasEngage ? 'ls-contact' : '',
                dataLayerEvent: headerButtonData?.button1?.dataLayerEvent || 'header_btn_1_click',
                cName: 'header-btn-1',
            };
            desktopButtons.push(commonButtonProps);
            mobileHeaderButtons.push({
                ...commonButtonProps,
                label: headerButtonData?.button1?.label ? headerButtonData?.button1?.label : hasEngage ? 'CONTACT' : 'CALL NOW',
            });
        }
        //add schedule button if using widgets
        if (scheduleEngineWidgetActive || hasEngage || headerButtonData?.button2?.link || headerButtonData?.button2?.label) {
            const scheduleButton = {
                link: headerButtonData?.button2?.link ? headerButtonData?.button2?.link : ``,
                active: true,
                opensModal: -1,
                window: 1,
                btnType: 'btn_cta_landing',
                btnSize: 'btn_md',
                googleIcon: "<span class='material-symbols-outlined cta-icon'>calendar_clock</span>",
                action: headerButtonData?.button2?.link ? '' : scheduleEngineWidgetActive ? 'schedule' : hasEngage ? 'ls-schedule' : '',
                icon: icon2,
                dataLayerEvent: headerButtonData?.button2?.dataLayerEvent || 'header_btn_2_click',
                cName: 'header-btn-2',
            };
            desktopButtons.push({ ...scheduleButton, label: headerButtonData?.button2?.label || 'Schedule NOW' });
            mobileHeaderButtons.push({ ...scheduleButton, label: headerButtonData?.button2?.label || 'Schedule' });
        }
        return {
            desktopButtons: desktopButtons,
            mobileHeaderButtons: mobileHeaderButtons,
        };
    };
    const headerButtons = createHeaderButtons(phoneNumber, email, scheduleEngineWidgetActive, hasEngage, headerButtonData);
    return { customComponents: transformedComponents, headerButtons, vcita };
};
export function transformDLText(inputText) {
    // Split the input text into words
    const words = inputText.split(' ');
    // Get the last word
    const lastWord = words.pop() || '';
    // Join the remaining words with spaces
    const remainingText = words.join(' ');
    // Create the output text with span tags
    const outputText = `
        <span class='mobiletext'>${remainingText}</span>
        <br>
        <span class='guarn'>${lastWord}</span>
    `;
    return inputText ? outputText : '';
}
export const createLandingColors = (colors) => {
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
        captionBackground: 'rgb(0,0,0,0.3)',
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
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZGluZy11dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvbGFuZGluZy11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0scUNBQXFDLENBQUE7QUFFOUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLEVBQUUsTUFBTSxZQUFZLENBQUE7QUFFN0UsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUFHLENBQUMsT0FBaUIsRUFBRSxFQUFFO0lBQ2pELElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQTtJQUNuQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNyQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNaLFVBQVUsQ0FBQyxJQUFJLENBQUM7Z0JBQ1osR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ2YsSUFBSSxFQUFFLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9CLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQ25CLENBQUMsQ0FBQTtTQUNMO0tBQ0o7SUFDRCxPQUFPLFVBQVUsQ0FBQTtBQUNyQixDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsQ0FBQyxJQUFZLEVBQUUsRUFBRTtJQUN6QyxJQUFJLElBQUksRUFBRTtRQUNOLE9BQU8sMEJBQTBCLEdBQUcsSUFBSSxHQUFHLFNBQVMsQ0FBQTtLQUN2RDs7UUFBTSxPQUFPLEVBQUUsQ0FBQTtBQUNwQixDQUFDLENBQUE7QUFFRCxTQUFTLGFBQWEsQ0FBQyxLQUFhO0lBQ2hDLCtDQUErQztJQUMvQyxNQUFNLFdBQVcsR0FBRyxnQkFBZ0IsQ0FBQTtJQUNwQyxNQUFNLEtBQUssR0FBRyxLQUFL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