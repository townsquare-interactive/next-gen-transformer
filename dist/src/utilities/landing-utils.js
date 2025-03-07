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
export const checkLinkForEmail = (link) => {
    if (link.includes('@') && !link.includes('mailto:')) {
        return `mailto:${link}`;
    }
    return link;
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
                weblink: checkLinkForEmail(section.ctaLink || ''),
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
                    weblink: checkLinkForEmail(section.ctaLink || ''),
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
                    weblink: checkLinkForEmail(section.ctaLink || ''),
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
                return checkLinkForEmail(headerButtonData.button1.link);
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
                link: headerButtonData?.button2?.link ? checkLinkForEmail(headerButtonData?.button2?.link) : ``,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZGluZy11dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvbGFuZGluZy11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0scUNBQXFDLENBQUE7QUFFOUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLEVBQUUsTUFBTSxZQUFZLENBQUE7QUFFN0UsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUFHLENBQUMsT0FBaUIsRUFBRSxFQUFFO0lBQ2pELElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQTtJQUNuQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ3RDLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDYixVQUFVLENBQUMsSUFBSSxDQUFDO2dCQUNaLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNmLElBQUksRUFBRSxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvQixJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQzthQUNuQixDQUFDLENBQUE7UUFDTixDQUFDO0lBQ0wsQ0FBQztJQUNELE9BQU8sVUFBVSxDQUFBO0FBQ3JCLENBQUMsQ0FBQTtBQUVELE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFHLENBQUMsSUFBWSxFQUFFLEVBQUU7SUFDOUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO1FBQ2xELE9BQU8sVUFBVSxJQUFJLEVBQUUsQ0FBQTtJQUMzQixDQUFDO0lBQ0QsT0FBTyxJQUFJLENBQUE7QUFDZixDQUFDLENBQUE7QUFFRCxNQUFNLENB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