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
                icon: { iconPrefix: 'fas', iconModel: 'mobile-screen' },
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
                icon: {
                    iconPrefix: 'far',
                    iconModel: 'calendar',
                },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZGluZy11dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvbGFuZGluZy11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0scUNBQXFDLENBQUE7QUFFOUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLEVBQUUsTUFBTSxZQUFZLENBQUE7QUFFN0UsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUFHLENBQUMsT0FBaUIsRUFBRSxFQUFFO0lBQ2pELElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQTtJQUNuQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ3RDLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDYixVQUFVLENBQUMsSUFBSSxDQUFDO2dCQUNaLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNmLElBQUksRUFBRSxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvQixJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQzthQUNuQixDQUFDLENBQUE7UUFDTixDQUFDO0lBQ0wsQ0FBQztJQUNELE9BQU8sVUFBVSxDQUFBO0FBQ3JCLENBQUMsQ0FBQTtBQUVELE1BQU0sQ0FBQyxNQUFNLFlBQVksR0FBRyxDQUFDLElBQVksRUFBRSxFQUFFO0lBQ3pDLElBQUksSUFBSSxFQUFFLENBQUM7UUFDUCxPQUFPLDBCQUEwQixHQUFHLElBQUksR0FBRyxTQUFTLENBQUE7SUFDeEQsQ0FBQzs7UUFBTSxPQUFPLEVBQUUsQ0FBQTtBQUNwQixDQUFDLENBQUE7QUFFRCxTQUFTLGFBQWEsQ0FBQyxLQUFhO0lBQ2hDLCtDQUErQztJQUMvQyxNQUFNLFdBQVcsR0FBRyxnQkFBZ0Is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