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
                    //const type = index === 0 ? 'bodyFont' : 'headlineFont'
                    //fontLabels.push({ font: fontList[key], type })
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
export const customizeWidgets = (customComponents, themeColors, logo, siteName, phoneNumber) => {
    let transformedComponents;
    let vcita;
    let hasEngage = false;
    let scheduleEngineWidgetActive = false;
    //assign logo/sitename to webchat widget
    if (customComponents?.length > 0) {
        transformedComponents = changeBMPToEngage(customComponents);
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
        };
        /*}  else {
                               {
                    name: 'call',
                    text: 'Click to give us a call',
                },
                    
                }*/
    };
    const headerButtons = createHeaderButtons(phoneNumber, scheduleEngineWidgetActive, hasEngage);
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
        captionBackground: 'rgba(0,0,0,0.4)',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZGluZy11dGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sYW5kaW5nLXV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQTtBQUUzRCxPQUFPLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxNQUFNLFlBQVksQ0FBQTtBQUU3RSxNQUFNLENBQUMsTUFBTSxlQUFlLEdBQUcsQ0FBQyxPQUFpQixFQUFFLEVBQUU7SUFDakQsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFBO0lBQ25CLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDdEMsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNiLFVBQVUsQ0FBQyxJQUFJLENBQUM7Z0JBQ1osR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ2YsSUFBSSxFQUFFLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9CLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQ25CLENBQUMsQ0FBQTtRQUNOLENBQUM7SUFDTCxDQUFDO0lBQ0QsT0FBTyxVQUFVLENBQUE7QUFDckIsQ0FBQyxDQUFBO0FBRUQsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLENBQUMsSUFBWSxFQUFFLEVBQUU7SUFDekMsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUNQLE9BQU8sMEJBQTBCLEdBQUcsSUFBSSxHQUFHLFNBQVMsQ0FBQTtJQUN4RCxDQUFDOztRQUFNLE9BQU8sRUFBRSxDQUFBO0FBQ3BCLENBQUMsQ0FBQTtBQUVELE1BQU0sQ0FBQyxNQUFNLHlCQUF5QixHQUFHLENBQUMsUUFBa0IsRUFBRSxFQUFFO0lBQzVELElBQUksT0FBTyxHQUFHLEVBQUUs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