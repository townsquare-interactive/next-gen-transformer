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
            modules.push({
                headline: section.headline,
                actionlbl: section.ctaText || 'GIVE US A CALL',
                image: section.image?.includes('[') ? '' : section.image,
                subheader: section.subheader,
                type: 'dl',
                weblink: section.ctaLink?.includes('[') ? '' : section.ctaLink,
            });
        }
        if (i === 1) {
            if (section.headline) {
                modules.push({
                    type: 'banner',
                    headline: section.headline,
                    actionlbl: section.ctaText || 'CALL US NOW',
                    weblink: section.ctaLink?.includes('[') ? '' : section.ctaLink,
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
                    weblink: section.ctaLink?.includes('[') ? '' : section.ctaLink,
                });
            }
        }
        if (section.components && section.components.length > 0) {
            for (let x = 0; x < section.components.length; x++) {
                let currentComponent = section.components[x];
                if (currentComponent.type === 'coupon') {
                    modules.push({
                        type: 'coupon',
                        image: currentComponent.image,
                    });
                }
                else if (currentComponent.type === 'form') {
                    modules.push({
                        type: 'form',
                        embed: currentComponent.embed ? convertIframe(currentComponent.embed) : '',
                    });
                }
                else if (currentComponent.type === 'video' && currentComponent.videoUrl != '[second_section_videoUrl]') {
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
export const customizeWidgets = (customComponents, themeColors, logo, siteName, phoneNumber, email, headerButton) => {
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
            if (headerButtonData?.label)
                return headerButtonData.label;
            if (hasEngage || headerButtonData?.type === 'email' || headerButtonData?.type === 'link')
                return 'CONTACT US';
            return phoneNumber ? phoneNumber : '';
        };
        const getButtonLink = (phoneNumber, email, headerButtonData) => {
            if (headerButtonData?.link)
                return headerButtonData.link;
            if (headerButtonData?.type === 'phone' && phoneNumber)
                return `tel:${phoneNumber}`;
            if (headerButtonData?.type === 'email' && email)
                return `mailto:${email}`;
            return phoneNumber ? `tel:${phoneNumber}` : '';
        };
        if (hasEngage || phoneNumber || headerButtonData?.link || headerButtonData?.type === 'email') {
            const label = getButtonLabel(hasEngage, phoneNumber, headerButtonData);
            const link = getButtonLink(phoneNumber, email, headerButtonData);
            const commonButtonProps = {
                label,
                link,
                active: true,
                opensModal: -1,
                window: headerButtonData?.link ? 1 : 0,
                btnType: 'btn_cta_landing',
                btnSize: 'btn_md',
                googleIcon: "<span class='material-symbols-outlined call cta-icon'>phone_android</span>",
                icon: { iconPrefix: 'fas', iconModel: 'mobile-screen' },
                action: hasEngage ? 'ls-contact' : '',
            };
            desktopButtons.push(commonButtonProps);
            mobileHeaderButtons.push({
                ...commonButtonProps,
                label: headerButtonData?.label ? headerButtonData.label : hasEngage ? 'CONTACT' : 'CALL NOW',
            });
        }
        //add schedule button if using widgets
        if (scheduleEngineWidgetActive || hasEngage) {
            const scheduleButton = {
                link: `tel:${phoneNumber}`,
                active: true,
                opensModal: -1,
                window: 1,
                btnType: 'btn_cta_landing',
                btnSize: 'btn_md',
                googleIcon: "<span class='material-symbols-outlined cta-icon'>calendar_clock</span>",
                action: scheduleEngineWidgetActive ? 'schedule' : hasEngage ? 'ls-schedule' : '',
                icon: {
                    iconPrefix: 'far',
                    iconModel: 'calendar',
                },
            };
            desktopButtons.push({ ...scheduleButton, label: 'Schedule NOW' });
            mobileHeaderButtons.push({ ...scheduleButton, label: 'Schedule' });
        }
        return {
            desktopButtons: desktopButtons,
            mobileHeaderButtons: mobileHeaderButtons,
        };
    };
    const headerButtons = createHeaderButtons(phoneNumber, email, scheduleEngineWidgetActive, hasEngage, headerButton);
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