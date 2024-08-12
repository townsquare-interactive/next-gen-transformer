import { fontList } from '../templates/layout-variables.js';
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
export const createModulesWithSections = (sections) => {
    let modules = [];
    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (section.headline && i === 0) {
            //add ...section before then replace the fields we want
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
export const customizeWidgets = (customComponents, themeColors, logo, siteName, phoneNumber, email, headerButtonData) => {
    let transformedComponents;
    let vcita;
    let hasEngage = false;
    let scheduleEngineWidgetActive = false;
    //assign logo/sitename to webchat widget
    if (customComponents?.length > 0) {
        const validatedComponents = removeEmptyApiComponents(customComponents);
        transformedComponents = changeBMPToEngage(validatedComponents);
        if (logo) {
            transformedComponents = addSiteInfoToWebchat(customComponents, logo, siteName);
        }
        scheduleEngineWidgetActive = checkComponentsForScheduleNowApi(customComponents);
        const engageArray = transformedComponents.filter((component) => component.type === 'Engage');
        hasEngage = engageArray.length > 0;
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
        if (scheduleEngineWidgetActive || hasEngage || headerButtonData?.button2?.link) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZGluZy11dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sYW5kaW5nLXV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQTtBQUUzRCxPQUFPLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxNQUFNLFlBQVksQ0FBQTtBQUU3RSxNQUFNLENBQUMsTUFBTSxlQUFlLEdBQUcsQ0FBQyxPQUFpQixFQUFFLEVBQUU7SUFDakQsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFBO0lBQ25CLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDdEMsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNiLFVBQVUsQ0FBQyxJQUFJLENBQUM7Z0JBQ1osR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ2YsSUFBSSxFQUFFLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9CLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQ25CLENBQUMsQ0FBQTtRQUNOLENBQUM7SUFDTCxDQUFDO0lBQ0QsT0FBTyxVQUFVLENBQUE7QUFDckIsQ0FBQyxDQUFBO0FBRUQsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLENBQUMsSUFBWSxFQUFFLEVBQUU7SUFDekMsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUNQLE9BQU8sMEJBQTBCLEdBQUcsSUFBSSxHQUFHLFNBQVMsQ0FBQTtJQUN4RCxDQUFDOztRQUFNLE9BQU8sRUFBRSxDQUFBO0FBQ3BCLENBQUMsQ0FBQTtBQUVELFNBQVMsYUFBYSxDQUFDLEtBQWE7SUFDaEMsK0NBQStDO0lBQy9DLE1BQU0sV0FBVyxHQUFHLGdCQUFnQixDQUFBO0lBQ3BDLE1B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