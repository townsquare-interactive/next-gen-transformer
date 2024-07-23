import { convertDescText, removeWhiteSpace, convertUrlToApexId } from '../utils.js';
import { createGlobalStylesheet } from './cms-controller.js';
import { createFontData, createLandingColors, createModulesWithSections, createReviewItems, customizeWidgets, transformDLText, transformSocial, } from '../landing-utils.js';
import { LandingInputSchema } from '../../schema/input-zod.js';
import { getFileS3 } from '../s3Functions.js';
import { TransformError } from '../errors.js';
import { zodDataParse } from '../../schema/utils-zod.js';
import { v4 as uuidv4 } from 'uuid';
export const validateRequestData = (req) => {
    //validate request data with zod
    const siteData = zodDataParse(req.body, LandingInputSchema, 'input', 'parse');
    return { apexID: convertUrlToApexId(siteData.url), siteData };
};
export const createLayoutFile = async (siteData, apexID) => {
    const logo = siteData.logo;
    const socials = siteData.socials;
    const address = siteData.address;
    const siteName = siteData.siteName;
    const phoneNumber = removeWhiteSpace(siteData.phoneNumber || '');
    const email = siteData.email;
    const seo = siteData.seo;
    const colors = siteData.colors;
    const favicon = siteData.favicon;
    const url = siteData.url;
    let customComponents = siteData.customComponents;
    const currentLayout = await getFileS3(`${apexID}/layout.json`, 'site not found in s3');
    const analytics = siteData.analytics;
    const themeColors = createLandingColors(colors);
    const widgetData = customizeWidgets(customComponents || [], themeColors, logo || '', siteName, phoneNumber, email, siteData.headerButton);
    const fontData = createFontData(siteData.fonts);
    const newStyles = await createGlobalStylesheet(themeColors, fontData.fonts, { CSS: '' }, { pages: [] }, apexID);
    //probably still need to create styles in case we edit those functions
    const layoutTemplate = {
        logos: {
            footer: {
                pct: 100,
                slots: [
                    {
                        show: 1,
                        type: 'image',
                        markup: '',
                        hasLinks: false,
                        alignment: 'center',
                        image_src: logo,
                        image_link: '/',
                    },
                    {
                        markup: '',
                    },
                    {
                        markup: '',
                    },
                ],
                activeSlots: [0],
            },
            header: {
                pct: 100,
                slots: [
                    {
                        show: 1,
                        type: 'image',
                        markup: '',
                        hasLinks: false,
                        alignment: 'center',
                        image_src: logo,
                        image_link: '/',
                    },
                    {
                        show: 0,
                        type: 'text',
                        markup: '',
                        hasLinks: false,
                        alignment: 'left',
                        image_src: '',
                        image_link: '/',
                    },
                    {
                        show: 0,
                        type: 'text',
                        markup: '',
                        hasLinks: false,
                        alignment: 'left',
                        image_src: '',
                        image_link: '/',
                    },
                ],
                activeSlots: [0],
            },
            mobile: {
                pct: 100,
                slots: [
                    {
                        show: 1,
                        type: 'image',
                        markup: '',
                        hasLinks: false,
                        alignment: 'center',
                        image_src: logo,
                        image_link: '/',
                    },
                    {
                        markup: '',
                    },
                    {
                        markup: '',
                    },
                ],
                activeSlots: [0],
            },
        },
        social: socials ? transformSocial(socials) : [],
        contact: {
            email: [
                {
                    name: '',
                    email: '',
                    disabled: '',
                    isPrimaryEmail: false,
                },
            ],
            phone: [
                {
                    name: 'Phone',
                    number: phoneNumber,
                    disabled: '',
                    isPrimaryPhone: true,
                },
            ],
            address: address,
            displayInFooter: true,
            selectedPrimaryEmailLabel: '',
            selectedPrimaryPhoneLabel: 'Phone',
            selectedPrimaryPhoneNumber: phoneNumber,
            selectedPrimaryEmailAddress: email,
            showContactBox: false,
        },
        siteName: siteName,
        phoneNumber: phoneNumber,
        email: email,
        url: url,
        cmsNav: [
            {
                ID: 862283,
                menu_list_id: 77555,
                title: 'Home',
                post_type: 'nav_menu_item',
                type: 'post_type',
                menu_item_parent: 0,
                object_id: 774341,
                object: 'page',
                target: '',
                classes: null,
                menu_order: 1,
                mi_url: null,
                url: '/',
                submenu: [],
                slug: 'home',
            },
        ],
        seo: seo,
        cmsColors: themeColors,
        theme: 'beacon-theme_charlotte',
        cmsUrl: url,
        s3Folder: apexID,
        favicon: favicon,
        fontImport: fontData.fontImport,
        publishedDomains: currentLayout.publishedDomains || [],
        config: {
            zapierUrl: '',
            makeUrl: process.env.MAKE_URL,
        },
        styles: { global: newStyles.global, custom: newStyles.custom },
        headerOptions: {
            ctaBtns: widgetData.headerButtons.desktopButtons,
            hideNav: true,
            hideSocial: true,
            mobileHeaderBtns: widgetData.headerButtons.mobileHeaderButtons,
        },
        scripts: {
            footer: siteData.code?.body || '',
            header: siteData.code?.header || '',
        },
        siteType: 'landing',
        customComponents: widgetData.customComponents,
        vcita: widgetData.vcita,
        analytics: analytics,
    };
    return { siteLayout: layoutTemplate, siteIdentifier: apexID };
};
const createPageFile = (siteData) => {
    const title = siteData.pageUri ? siteData.pageUri : 'landing';
    const slug = siteData.pageUri ? siteData.pageUri : 'landing';
    const sectionModules = createModulesWithSections(siteData.page.sections);
    const modules = createModules(sectionModules, removeWhiteSpace(siteData.phoneNumber || ''));
    const page = {
        data: {
            id: '737969',
            title: title,
            slug: slug,
            pageType: 'blank',
            url: '/',
            JS: '',
            type: 'menu',
            layout: 1,
            columns: 2,
            modules: [modules, [], [], [], []],
            sections: [
                {
                    wide: '1060',
                },
                {
                    wide: '988',
                },
            ],
            hideTitle: 1,
            head_script: '',
            columnStyles: 'full-column',
            scripts: '',
            pageModals: [],
            page_type: 'homepage',
        },
        attrs: {},
        seo: {
            title: siteData.title || siteData.seo?.global.aiosp_home_title || '',
            descr: siteData.description || siteData.seo?.global.aiosp_home_description || '',
            selectedImages: '',
            imageOverride: '',
        },
    };
    return page;
};
const createModules = (modules, phoneNumber) => {
    let newModules = [];
    let modCount = 1;
    for (let i = 0; i < modules.length; i++) {
        const currentMod = modules[i];
        let newMod;
        const modID = uuidv4();
        if (currentMod.type === 'dl') {
            const dlOverlayColor = 'rgb(0,0,0,0.5)';
            newMod = {
                attributes: {
                    id: modID,
                    uid: modID,
                    type: 'parallax_1',
                    align: 'left',
                    items: [
                        {
                            align: 'center',
                            image: currentMod.image,
                            modOne: '50vh',
                            btnType: 'btn_1 btn_p1',
                            headline: transformDLText(currentMod.headline || ''),
                            actionlbl: currentMod.actionlbl,
                            headerTag: '1',
                            imageSize: {
                                width: 1920,
                                height: 1080,
                                size: '261.61 kB',
                            },
                            modColor1: dlOverlayColor,
                            newwindow: '0',
                            subheader: currentMod.subheader,
                            isFeatured: '',
                            modOpacity: 0,
                            newwindow2: '1',
                            promoColor: 'var(--promo)',
                            links: {
                                weblink: currentMod.weblink || `tel:${phoneNumber}` || `tel:${phoneNumber}`,
                            },
                            imageType: 'crop',
                            buttonList: [
                                {
                                    name: 'btn1',
                                    link: currentMod.weblink || `tel:${phoneNumber}`,
                                    window: '0',
                                    label: currentMod.actionlbl,
                                    active: true,
                                    btnType: 'btn_1 btn_p1 btn_land-colors',
                                    btnSize: 'btn_md',
                                    linkType: 'ext',
                                    blockBtn: false,
                                    opensModal: -1,
                                    btnStyle: 'round',
                                },
                                {
                                    name: 'btn2',
                                    window: '1',
                                    active: false,
                                    btnType: 'btn2_override',
                                    btnSize: 'btn_md',
                                    linkType: 'ext',
                                    blockBtn: false,
                                    opensModal: -1,
                                },
                            ],
                            linkNoBtn: false,
                            btnCount: 1,
                            isWrapLink: true,
                            visibleButton: true,
                            isBeaconHero: false,
                            imagePriority: true,
                            itemCount: 1,
                            btnStyles: '',
                            nextImageSizes: '100vw',
                            isFeatureButton: false,
                        },
                    ],
                    title: '',
                    columns: 1,
                    imgsize: 'widescreen_2_4_1',
                    blockSwitch1: 1,
                    scale_to_fit: '',
                    customClassName: '',
                    modId: modID,
                    modCount: modCount,
                    columnLocation: 0,
                    isSingleColumn: false,
                },
                componentType: 'Parallax',
            };
        }
        else if (currentMod.type === 'coupon') {
            newMod = {
                attributes: {
                    id: modID,
                    uid: modID,
                    type: 'article_1',
                    items: [
                        {
                            align: 'center',
                            image: currentMod.image,
                            imageSize: {
                                src: '/files/2024/03/50_off_any_service_coupon.png',
                                width: 1080,
                                height: 1080,
                                size: '191.82 kB',
                            },
                            newwindow: '0',
                            imageType: 'nocrop',
                            itemCount: 1,
                        },
                    ],
                    columns: 1,
                    imgsize: 'no_sizing',
                    hideTitle: 0,
                    blockSwitch1: 1,
                    customClassName: '',
                    modId: modID,
                    modCount: modCount,
                    columnLocation: 0,
                    isSingleColumn: false,
                },
                componentType: 'Article',
            };
        }
        else if (currentMod.type === 'form') {
            newMod = {
                attributes: {
                    id: modID,
                    uid: modID,
                    type: 'plugin',
                    items: [
                        {
                            align: 'center',
                            plugin: '[gravity]',
                            gravity_id: 120853,
                            gravity_show_title: 'false',
                        },
                    ],
                    columns: 1,
                    imgsize: 'no_sizing',
                    blockSwitch1: 1,
                    customClassName: '',
                    contactFormData: {
                        formTitle: '',
                        formService: 'webhook',
                        formEmbed: currentMod.embed || '',
                        email: '',
                        formFields: [
                            {
                                name: 'fName',
                                placeholder: 'Enter Name',
                                type: 'text',
                                label: 'First Name',
                                isReq: true,
                                fieldType: 'input',
                                isVisible: true,
                                size: 'sm',
                            },
                            {
                                name: 'lName',
                                placeholder: 'Enter Name',
                                type: 'text',
                                label: 'Last Name',
                                isReq: true,
                                fieldType: 'input',
                                isVisible: true,
                                size: 'sm',
                            },
                            {
                                name: 'phone',
                                type: 'phone',
                                label: 'Phone',
                                isReq: false,
                                fieldType: 'input',
                                isVisible: true,
                                size: 'lg',
                            },
                            {
                                name: 'email',
                                type: 'email',
                                label: 'Email',
                                isReq: true,
                                fieldType: 'input',
                                isVisible: true,
                                size: 'lg',
                            },
                            {
                                label: 'Message',
                                name: 'messagebox',
                                isReq: true,
                                fieldType: 'textarea',
                                isVisible: true,
                                size: 'lg',
                            },
                        ],
                        btnStyles: {
                            btnStyle: 'round',
                            btnType: 'btn_1 btn_p1',
                        },
                    },
                    modId: modID,
                    modCount: modCount,
                    columnLocation: 0,
                    isSingleColumn: false,
                },
                componentType: 'ContactFormRoutes',
            };
        }
        else if (currentMod.type === 'banner') {
            newMod = {
                attributes: {
                    id: modID,
                    uid: modID,
                    type: 'banner_1',
                    items: [
                        {
                            headSize: 'lg',
                            align: 'left',
                            headline: currentMod.headline,
                            actionlbl: currentMod.actionlbl,
                            newwindow: '1',
                            promoColor: 'var(--promo)',
                            itemStyle: {
                                background: 'var(--promo)',
                            },
                            links: {
                                weblink: currentMod.weblink || `tel:${phoneNumber}`,
                            },
                            buttonList: [
                                {
                                    name: 'btn1',
                                    link: currentMod.weblink || `tel:${phoneNumber}`,
                                    window: '1',
                                    label: currentMod.actionlbl || 'CALL US NOW',
                                    active: true,
                                    btnType: 'btn_promo',
                                    btnSize: 'btn_xl-landing',
                                    linkType: 'ext',
                                    blockBtn: false,
                                    opensModal: -1,
                                    btnStyle: 'round',
                                },
                            ],
                            linkNoBtn: false,
                            btnCount: 1,
                            isWrapLink: true,
                            visibleButton: true,
                            isBeaconHero: false,
                            imagePriority: false,
                            itemCount: 1,
                            btnStyles: ` #id_${modID} .item_1 .btn2_override {color:#ffffff; background-color:transparent;} #id_${modID} .item_1 .btn_promo {color: var(--promo); background-color: #ffffff;}\n            #id_${modID} .item_1 .btn_promo:hover{color: #ffffff; background-color: var(--promo3);}`,
                            nextImageSizes: '100vw',
                            isFeatureButton: false,
                        },
                    ],
                    title: 'BANNER1',
                    columns: 1,
                    imgsize: 'widescreen_2_4_1',
                    hideTitle: 0,
                    blockSwitch1: 1,
                    customClassName: '',
                    modId: modID,
                    modCount: modCount,
                    columnLocation: 0,
                    isSingleColumn: false,
                },
                componentType: 'Banner',
            };
        }
        else if (currentMod.type === 'text content') {
            newMod = {
                attributes: {
                    id: modID,
                    uid: modID,
                    lazy: '',
                    type: 'article_1',
                    well: '',
                    align: '',
                    items: [
                        {
                            desc: convertDescText(currentMod.desc1 || ''),
                            align: 'center',
                            linkNoBtn: false,
                            btnCount: 0,
                            isWrapLink: false,
                            visibleButton: false,
                            isBeaconHero: false,
                            imagePriority: false,
                            itemCount: 1,
                            nextImageSizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 1200px',
                            isFeatureButton: false,
                        },
                        {
                            desc: convertDescText(currentMod.desc2 || ''),
                            descSize: 'font_lg',
                            align: 'center',
                            subheader: currentMod.headline,
                            linkNoBtn: false,
                            btnCount: 0,
                            isWrapLink: false,
                            visibleButton: false,
                            isBeaconHero: false,
                            imagePriority: false,
                            itemCount: 2,
                            nextImageSizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 1200px',
                            isFeatureButton: false,
                        },
                    ],
                    title: 'CONTENT',
                    columns: 1,
                    imgsize: 'square_1_1',
                    hideTitle: 0,
                    blockSwitch1: 1,
                    customClassName: '',
                    modId: modID,
                    modCount: modCount,
                    columnLocation: 0,
                    isSingleColumn: false,
                    thinSpacing: true,
                },
                componentType: 'Article',
            };
        }
        else if (currentMod.type === 'video') {
            newMod = {
                attributes: {
                    id: modID,
                    uid: modID,
                    type: 'article_1',
                    items: [
                        {
                            align: 'center',
                            video: {
                                src: currentMod.videoUrl,
                                method: 'ext',
                            },
                            linkNoBtn: false,
                            btnCount: 0,
                            isWrapLink: false,
                            visibleButton: false,
                            isBeaconHero: false,
                            imagePriority: false,
                            itemCount: 1,
                            btnStyles: '',
                            isFeatureButton: false,
                        },
                    ],
                    columns: 1,
                    imgsize: 'square_1_1',
                    blockSwitch1: 1,
                    modId: modID,
                    modCount: modCount,
                    columnLocation: 0,
                    isSingleColumn: false,
                    thinSpacing: true,
                },
                componentType: 'Article',
            };
        }
        else if (currentMod.type === 'reviews' && currentMod.reviews) {
            newMod = {
                attributes: {
                    id: modID,
                    uid: modID,
                    type: 'review_carousel',
                    columns: 1,
                    imgsize: 'square_1_1',
                    blockSwitch1: 1,
                    modId: modID,
                    modCount: modCount,
                    columnLocation: 0,
                    isSingleColumn: false,
                    items: createReviewItems(currentMod.reviews),
                },
                componentType: 'Testimonials',
            };
        }
        else if (currentMod.type === 'headline') {
            newMod = {
                attributes: {
                    id: modID,
                    uid: modID,
                    type: 'article_1',
                    items: [
                        {
                            align: 'center',
                            headline: currentMod.headline,
                            itemCount: 1,
                            btnStyles: ` #id_${modID} .item_1 .btn2_override {color:#ffffff; background-color:transparent;} `,
                            nextImageSizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 1200px',
                            isFeatureButton: false,
                            headSize: 'xl',
                            thinSpacing: true,
                        },
                    ],
                    columns: 1,
                    customClassName: 'satytext',
                    modId: modID,
                    modCount: modCount,
                    columnLocation: 0,
                    isSingleColumn: false,
                    thinSpacing: true,
                },
                componentType: 'Article',
            };
        }
        if (newMod) {
            modCount += 1;
            newModules.push(newMod);
        }
    }
    return newModules;
};
export const createLandingPageFiles = async (siteData, apexID) => {
    try {
        const layoutContents = await createLayoutFile(siteData, apexID);
        const page = createPageFile(siteData);
        let siteID = layoutContents.siteIdentifier;
        return { siteLayout: layoutContents.siteLayout, siteIdentifier: siteID, pages: [page] };
    }
    catch (err) {
        throw new TransformError({
            message: err.message,
            errorType: 'GEN-003',
            state: {
                siteStatus: 'Process stopped when creating site files',
            },
        });
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZGluZy1jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbnRyb2xsZXJzL2xhbmRpbmctY29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixFQUFFLGtCQUFrQixFQUFFLE1BQU0sYUFBYSxDQUFBO0FBQ25GLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHFCQUFxQixDQUFBO0FBQzVELE9BQU8sRUFDSCxjQUFjLEVBQ2QsbUJBQW1CLEVBQ25CLHlCQUF5QixFQUN6QixpQkFBaUIsRUFDakIsZ0JBQWdCLEVBQ2hCLGVBQWUsRUFDZixlQUFlLEdBQ2xCLE1BQU0scUJBQXFCLENBQUE7QUFDNUIsT0FBTyxFQUFFLGtCQUFrQixFQUEyRCxNQUFNLDJCQUEyQixDQUFBO0FBQ3ZILE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQTtBQUU3QyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sY0FBYyxDQUFBO0FBQzdDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQTtBQUN4RCxPQUFPLEVBQUUsRUFBRSxJQUFJLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQTtBQUVuQyxNQUFNLENBQUMsTUFBTSxtQkFBbUIsR0FBRyxDQUFDLEdBQXlCLEVBQUUsRUFBRTtJQUM3RCxnQ0FBZ0M7SUFDaEMsTUFBTSxRQUFRLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFBO0lBRTdFLE9BQU8sRUFBRSxNQUFNLEVBQUUsa0JBQWtCLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFBO0FBQ2pFLENBQUMsQ0FBQTtBQUVELE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHLEtBQUssRUFBRSxRQUFhLEVBQUUsTUFBYyxFQUFFLEVBQUU7SUFDcEUsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQTtJQUMxQixNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFBO0lBQ2hDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUE7SUFDaEMsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQTtJQUNsQyxNQUFNLFdBQVcsR0FBRyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQyxDQUFBO0lBQ2hFLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUE7SUFDNUIsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQTtJQUN4QixNQUFNLE1BQU0sR0FBa0IsUUFBUSxDQUFDLE1BQU0sQ0FBQTtJQUM3QyxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFBO0lBQ2hDLE1BQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUE7SUFDeEIsSUFBSSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsZ0JBQWdCLENBQUE7SUFDaEQsTUFBTSxhQUFhLEdBQVcsTUFBTSxTQUFTLENBQUMsR0FBRyxNQUFNLGNBQWMsRUFBRSxzQkFBc0IsQ0FBQyxDQUFBO0lBQzlGLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUE7SUFFcEMsTUFBTSxXQUFXLEdBQUcsbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUE7SUFFL0MsTUFBTSxVQUFVLEdBQUcsZ0JBQWdCLENBQUMsZ0JBQWdCLElBQUksRUFBRSxFQUFFLFdBQVcsRUFBRSxJQUFJLElBQUksRUFBRSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQTtJQUV6SSxNQUFNLFFBQVEsR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBRS9DLE1BQU0sU0FBUyxHQUFHLE1BQU0sc0JBQXNCLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUE7SUFFL0csc0VBQXNFO0lBQ3RFLE1BQU0sY0FBYyxHQUFHO1FBQ25CLEtBQUssRUFBRTtZQUNILE1BQU0sRUFBRTtnQkFDSixHQUFHLEVBQUUsR0FBRztnQkFDUixLQUFLLEVBQUU7b0JBQ0g7d0JBQ0ksSUFBSSxFQUFFLENBQUM7d0JBQ1AsSUFBSSxFQUFFLE9BQU87d0JBQ2IsTUFBTSxFQUFFLEVBQUU7d0JBQ1YsUUFBUSxFQUFFLEtBQUs7d0JBQ2YsU0FBUyxFQUFFLFFBQVE7d0JBQ25CLFNBQVMsRUFBRSxJQUFJO3dCQUNmLFVBQVUsRUFBRSxHQUFHO3FCQUNsQjtvQkFDRDt3QkFDSSxNQUFNLEVBQUUsRUFBRTtxQkFDYjtvQkFDRDt3QkFDSSxNQUFNLEVBQUUsRUFBRTtxQkFDYjtpQkFDSjtnQkFDRCxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDbkI7WUFDRCxNQUFNLEVBQUU7Z0JBQ0osR0FBRyxFQUFFLEdBQUc7Z0JBQ1IsS0FBSyxFQUFFO29CQUNIO3dCQUNJLElBQUksRUFBRSxDQUFDO3dCQUNQLElBQUksRUFBRSxPQUFPO3dCQUNiLE1BQU0sRUFBRSxFQUFFO3dCQUNWLFFBQVEsRUFBRSxLQUFLO3dCQUNmLFNBQVMsRUFBRSxRQUFRO3dCQUNuQixTQUFTLEVBQUUsSUFBSTt3QkFDZixVQUFVLEVBQUUsR0FBRztxQkFDbEI7b0JBQ0Q7d0JBQ0ksSUFBSSxFQUFFLENBQUM7d0JBQ1AsSUFBSSxFQUFFLE1BQU07d0JBQ1osTUFBTSxFQUFFLEVBQUU7d0JBQ1YsUUFBUSxFQUFFLEtBQUs7d0JBQ2YsU0FBUyxFQUFFLE1BQU07d0JBQ2pCLFNBQVMsRUFBRSxFQUFFO3dCQUNiLFVBQVUsRUFBRSxHQUFHO3FCQUNsQjtvQkFDRDt3QkFDSSxJQUFJLEVBQUUsQ0FBQzt3QkFDUCxJQUFJLEVBQUUsTUFBTTt3QkFDWixNQUFNLEVBQUUsRUFBRTt3QkFDVixRQUFRLEVBQUUsS0FBSzt3QkFDZixTQUFTLEVBQUUsTUFBTTt3QkFDakIsU0FBUyxFQUFFLEVBQUU7d0JBQ2IsVUFBVSxFQUFFLEdBQUc7cUJBQ2xCO2lCQUNKO2dCQUNELFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUNuQjtZQUNELE1BQU0sRUFBRTtnQkFDSixHQUFHLEVBQUUsR0FBRztnQkFDUixLQUFLLEVBQUU7b0JBQ0g7d0JBQ0ksSUFBSSxFQUFFLENBQUM7d0JBQ1AsSUFBSSxFQUFFLE9BQU87d0JBQ2IsTUFBTSxFQUFFLEVBQUU7d0JBQ1YsUUFBUSxFQUFFLEtBQUs7d0JBQ2YsU0FBUyxFQUFFLFFBQVE7d0JBQ25CLFNBQVMsRUFBRSxJQUFJO3dCQUNmLFVBQVUsRUFBRSxHQUFHO3FCQUNsQjtvQkFDRDt3QkFDSSxNQUFNLEVBQUUsRUFBRTtxQkFDYjtvQkFDRDt3QkFDSSxNQUFNLEVBQUUsRUFBRTtxQkFDYjtpQkFDSjtnQkFDRCxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDbkI7U0FDSjtRQUNELE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUMvQyxPQUFPLEVBQUU7WUFDTCxLQUFLLEVBQUU7Z0JBQ0g7b0JBQ0ksSUFBSSxFQUFFLEVBQUU7b0JBQ1IsS0FBSyxFQUFFLEVBQUU7b0JBQ1QsUUFBUSxFQUFFLEVBQUU7b0JBQ1osY0FBYyxFQUFFLEtBQUs7aUJBQ3hCO2FBQ0o7WUFDRCxLQUFLLEVBQUU7Z0JBQ0g7b0JBQ0ksSUFBSSxFQUFFLE9BQU87b0JBQ2IsTUFBTSxFQUFFLFdBQVc7b0JBQ25CLFFBQVEsRUFBRSxFQUFFO29CQUNaLGNBQWMsRUFBRSxJQUFJO2lCQUN2QjthQUNKO1lBQ0QsT0FBTyxFQUFFLE9BQU87WUFDaEIsZUFBZSxFQUFFLElBQUk7WUFDckIseUJBQXlCLEVBQUUsRUFBRTtZQUM3Qix5QkFBeUIsRUFBRSxPQUFPO1lBQ2xDLDBCQUEwQixFQUFFLFdBQVc7WUFDdkMsMkJBQTJCLEVBQUUsS0FBSztZQUNsQyxjQUFjLEVBQUUsS0FBSztTQUN4QjtRQUNELFFBQVEsRUFBRSxRQUFRO1FBQ2xCLFdBQVcsRUFBRSxXQUFXO1FBQ3hCLEtBQUssRUFBRSxLQUFLO1FBQ1osR0FBRyxFQUFFLEdBQUc7UUFDUixNQUFNLEVBQUU7WUFDSjtnQkFDSSxFQUFFLEVBQUUsTUFBTTtnQkFDVixZQUFZLEVBQUUsS0FBSztnQkFDbkIsS0FBSyxFQUFFLE1BQU07Z0JBQ2IsU0FBUyxFQUFFLGVBQWU7Z0JBQzFCLElBQUksRUFBRSxXQUFXO2dCQUNqQixnQkFBZ0IsRUFBRSxDQUFDO2dCQUNuQixTQUFTLEVBQUUsTUFBTTtnQkFDakIsTUFBTSxFQUFFLE1BQU07Z0JBQ2QsTUFBTSxFQUFFLEVBQUU7Z0JBQ1YsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsVUFBVSxFQUFFLENBQUM7Z0JBQ2IsTUFBTSxFQUFFLElBQUk7Z0JBQ1osR0FBRyxFQUFFLEdBQUc7Z0JBQ1IsT0FBTyxFQUFFLEVBQUU7Z0JBQ1gsSUFBSSxFQUFFLE1BQU07YUFDZjtTQUNKO1FBQ0QsR0FBRyxFQUFFLEdBQUc7UUFDUixTQUFTLEVBQUUsV0FBVztRQUN0QixLQUFLLEVBQUUsd0JBQXdCO1FBQy9CLE1BQU0sRUFBRSxHQUFHO1FBQ1gsUUFBUSxFQUFFLE1BQU07UUFDaEIsT0FBTyxFQUFFLE9BQU87UUFDaEIsVUFBVSxFQUFFLFFBQVEsQ0FBQyxVQUFVO1FBQy9CLGdCQUFnQixFQUFFLGFBQWEsQ0FBQyxnQkFBZ0IsSUFBSSxFQUFFO1FBQ3RELE1BQU0sRUFBRTtZQUNKLFNBQVMsRUFBRSxFQUFFO1lBQ2IsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUTtTQUNoQztRQUNELE1BQU0sRUFBRSxFQUFFLE1BQU0sRUFBRSxTQUFTLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxTQUFTLENBQUMsTUFBTSxFQUFFO1FBQzlELGFBQWEsRUFBRTtZQUNYLE9BQU8sRUFBRSxVQUFVLENBQUMsYUFBYSxDQUFDLGNBQWM7WUFDaEQsT0FBTyxFQUFFLElBQUk7WUFDYixVQUFVLEVBQUUsSUFBSTtZQUNoQixnQkFBZ0IsRUFBRSxVQUFVLENBQUMsYUFBYSxDQUFDLG1CQUFtQjtTQUNqRTtRQUNELE9BQU8sRUFBRTtZQUNMLE1BQU0sRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFFLElBQUksSUFBSSxFQUFFO1lBQ2pDLE1BQU0sRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sSUFBSSxFQUFFO1NBQ3RDO1FBQ0QsUUFBUSxFQUFFLFNBQVM7UUFDbkIsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLGdCQUFnQjtRQUM3QyxLQUFLLEVBQUUsVUFBVSxDQUFDLEtBQUs7UUFDdkIsU0FBUyxFQUFFLFNBQVM7S0FDdkIsQ0FBQTtJQUVELE9BQU8sRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsQ0FBQTtBQUNqRSxDQUFDLENBQUE7QUFFRCxNQUFNLGNBQWMsR0FBRyxDQUFDLFFBQW9CLEVBQUUsRUFBRTtJQUM1QyxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUE7SUFDN0QsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFBO0lBRTVELE1BQU0sY0FBYyxHQUFHLHlCQUF5QixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDeEUsTUFBTSxPQUFPLEdBQUcsYUFBYSxDQUFDLGNBQWMsRUFBRSxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFFM0YsTUFBTSxJQUFJLEdBQUc7UUFDVCxJQUFJLEVBQUU7WUFDRixFQUFFLEVBQUUsUUFBUTtZQUNaLEtBQUssRUFBRSxLQUFLO1lBQ1osSUFBSSxFQUFFLElBQUk7WUFDVixRQUFRLEVBQUUsT0FBTztZQUNqQixHQUFHLEVBQUUsR0FBRztZQUNSLEVBQUUsRUFBRSxFQUFFO1lBQ04sSUFBSSxFQUFFLE1BQU07WUFDWixNQUFNLEVBQUUsQ0FBQztZQUNULE9BQU8sRUFBRSxDQUFDO1lBQ1YsT0FBTyxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztZQUNsQyxRQUFRLEVBQUU7Z0JBQ047b0JBQ0ksSUFBSSxFQUFFLE1BQU07aUJBQ2Y7Z0JBQ0Q7b0JBQ0ksSUFBSSxFQUFFLEtBQUs7aUJBQ2Q7YUFDSjtZQUNELFNBQVMsRUFBRSxDQUFDO1lBQ1osV0FBVyxFQUFFLEVBQUU7WUFDZixZQUFZLEVBQUUsYUFBYTtZQUMzQixPQUFPLEVBQUUsRUFBRTtZQUNYLFVBQVUsRUFBRSxFQUFFO1lBQ2QsU0FBUyxFQUFFLFVBQVU7U0FDeEI7UUFDRCxLQUFLLEVBQUUsRUFBRTtRQUNULEdBQUcsRUFBRTtZQUNELEtBQUssRUFBRSxRQUFRLENBQUMsS0FBSyxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixJQUFJLEVBQUU7WUFDcEUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxXQUFXLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsc0JBQXNCLElBQUksRUFBRTtZQUNoRixjQUFjLEVBQUUsRUFBRTtZQUNsQixhQUFhLEVBQUUsRUFBRTtTQUNwQjtLQUNKLENBQUE7SUFFRCxPQUFPLElBQUksQ0FBQTtBQUNmLENBQUMsQ0FBQTtBQUVELE1BQU0sYUFBYSxHQUFHLENBQUMsT0FBc0IsRUFBRSxXQUFtQixFQUFFLEVBQUU7SUFDbEUsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFBO0lBQ25CLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQTtJQUNoQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ3RDLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM3QixJQUFJLE1BQU0sQ0FBQTtRQUVWLE1BQU0sS0FBSyxHQUFHLE1BQU0sRUFBRSxDQUFBO1FBQ3RCLElBQUksVUFBVSxDQUFDLElBQUksS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUMzQixNQUFNLGNBQWMsR0FBRyxnQkFBZ0IsQ0FBQTtZQUV2QyxNQUFNLEdBQUc7Z0JBQ0wsVUFBVSxFQUFFO29CQUNSLEVBQUUsRUFBRSxLQUFLO29CQUNULEdBQUcsRUFBRSxLQUFLO29CQUNWLElBQUksRUFBRSxZQUFZO29CQUNsQixLQUFLLEVBQUUsTUFBTTtvQkFDYixLQUFLLEVBQUU7d0JBQ0g7NEJBQ0ksS0FBSyxFQUFFLFFBQVE7NEJBQ2YsS0FBSyxFQUFFLFVBQVUsQ0FBQyxLQUFLOzRCQUN2QixNQUFNLEVBQUUsTUFBTTs0QkFDZCxPQUFPLEVBQUUsY0FBYzs0QkFDdkIsUUFBUSxFQUFFLGVBQWUsQ0FBQyxVQUFVLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQzs0QkFDcEQsU0FBUyxFQUFFLFVBQVUsQ0FBQyxTQUFTOzRCQUMvQixTQUFTLEVBQUUsR0FBRzs0QkFDZCxTQUFTLEVBQUU7Z0NBQ1AsS0FBSyxFQUFFLElBQUk7Z0NBQ1gsTUFBTSxFQUFFLElBQUk7Z0NBQ1osSUFBSSxFQUFFLFdBQVc7NkJBQ3BCOzRCQUNELFNBQVMsRUFBRSxjQUFjOzRCQUN6QixTQUFTLEVBQUUsR0FBRzs0QkFDZCxTQUFTLEVBQUUsVUFBVSxDQUFDLFNBQVM7NEJBQy9CLFVBQVUsRUFBRSxFQUFFOzRCQUNkLFVBQVUsRUFBRSxDQUFDOzRCQUNiLFVBQVUsRUFBRSxHQUFHOzRCQUNmLFVBQVUsRUFBRSxjQUFjOzRCQUMxQixLQUFLLEVBQUU7Z0NBQ0gsT0FBTyxFQUFFLFVBQVUsQ0FBQyxPQUFPLElBQUksT0FBTyxXQUFXLEVBQUUsSUFBSSxPQUFPLFdBQVcsRUFBRTs2QkFDOUU7NEJBQ0QsU0FBUyxFQUFFLE1BQU07NEJBQ2pCLFVBQVUsRUFBRTtnQ0FDUjtvQ0FDSSxJQUFJLEVBQUUsTUFBTTtvQ0FDWixJQUFJLEVBQUUsVUFBVSxDQUFDLE9BQU8sSUFBSSxPQUFPLFdBQVcsRUFBRTtvQ0FDaEQsTUFBTSxFQUFFLEdBQUc7b0NBQ1gsS0FBSyxFQUFFLFVBQVUsQ0FBQyxTQUFTO29DQUMzQixNQUFNLEVBQUUsSUFBSTtvQ0FDWixPQUFPLEVBQUUsOEJBQThCO29DQUN2QyxPQUFPLEVBQUUsUUFBUTtvQ0FDakIsUUFBUSxFQUFFLEtBQUs7b0NBQ2YsUUFBUSxFQUFFLEtBQUs7b0NBQ2YsVUFBVSxFQUFFLENBQUMsQ0FBQztvQ0FDZCxRQUFRLEVBQUUsT0FBTztpQ0FDcEI7Z0NBQ0Q7b0NBQ0ksSUFBSSxFQUFFLE1BQU07b0NBQ1osTUFBTSxFQUFFLEdBQUc7b0NBQ1gsTUFBTSxFQUFFLEtBQUs7b0NBQ2IsT0FBTyxFQUFFLGVBQWU7b0NBQ3hCLE9BQU8sRUFBRSxRQUFRO29DQUNqQixRQUFRLEVBQUUsS0FBSztvQ0FDZixRQUFRLEVBQUUsS0FBSztvQ0FDZixVQUFVLEVBQUUsQ0FBQyxDQUFDO2lDQUNqQjs2QkFDSjs0QkFDRCxTQUFTLEVBQUUsS0FBSzs0QkFDaEIsUUFBUSxFQUFFLENBQUM7NEJBQ1gsVUFBVSxFQUFFLElBQUk7NEJBQ2hCLGFBQWEsRUFBRSxJQUFJOzRCQUNuQixZQUFZLEVBQUUsS0FBSzs0QkFDbkIsYUFBYSxFQUFFLElBQUk7NEJBQ25CLFNBQVMsRUFBRSxDQUFDOzRCQUNaLFNBQVMsRUFBRSxFQUFFOzRCQUNiLGNBQWMsRUFBRSxPQUFPOzRCQUN2QixlQUFlLEVBQUUsS0FBSzt5QkFDekI7cUJBQ0o7b0JBQ0QsS0FBSyxFQUFFLEVBQUU7b0JBQ1QsT0FBTyxFQUFFLENBQUM7b0JBQ1YsT0FBTyxFQUFFLGtCQUFrQjtvQkFDM0IsWUFBWSxFQUFFLENBQUM7b0JBQ2YsWUFBWSxFQUFFLEVBQUU7b0JBQ2hCLGVBQWUsRUFBRSxFQUFFO29CQUNuQixLQUFLLEVBQUUsS0FBSztvQkFDWixRQUFRLEVBQUUsUUFBUTtvQkFDbEIsY0FBYyxFQUFFLENBQUM7b0JBQ2pCLGNBQWMsRUFBRSxLQUFLO2lCQUN4QjtnQkFDRCxhQUFhLEVBQUUsVUFBVTthQUM1QixDQUFBO1FBQ0wsQ0FBQzthQUFNLElBQUksVUFBVSxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUN0QyxNQUFNLEdBQUc7Z0JBQ0wsVUFBVSxFQUFFO29CQUNSLEVBQUUsRUFBRSxLQUFLO29CQUNULEdBQUcsRUFBRSxLQUFLO29CQUNWLElBQUksRUFBRSxXQUFXO29CQUNqQixLQUFLLEVBQUU7d0JBQ0g7NEJBQ0ksS0FBSyxFQUFFLFFBQVE7NEJBQ2YsS0FBSyxFQUFFLFVBQVUsQ0FBQyxLQUFLOzRCQUN2QixTQUFTLEVBQUU7Z0NBQ1AsR0FBRyxFQUFFLDhDQUE4QztnQ0FDbkQsS0FBSyxFQUFFLElBQUk7Z0NBQ1gsTUFBTSxFQUFFLElBQUk7Z0NBQ1osSUFBSSxFQUFFLFdBQVc7NkJBQ3BCOzRCQUNELFNBQVMsRUFBRSxHQUFHOzRCQUNkLFNBQVMsRUFBRSxRQUFROzRCQUNuQixTQUFTLEVBQUUsQ0FBQzt5QkFDZjtxQkFDSjtvQkFDRCxPQUFPLEVBQUUsQ0FBQztvQkFDVixPQUFPLEVBQUUsV0FBVztvQkFDcEIsU0FBUyxFQUFFLENBQUM7b0JBQ1osWUFBWSxFQUFFLENBQUM7b0JBQ2YsZUFBZSxFQUFFLEVBQUU7b0JBQ25CLEtBQUssRUFBRSxLQUFLO29CQUNaLFFBQVEsRUFBRSxRQUFRO29CQUNsQixjQUFjLEVBQUUsQ0FBQztvQkFDakIsY0FBYyxFQUFFLEtBQUs7aUJBQ3hCO2dCQUNELGFBQWEsRUFBRSxTQUFTO2FBQzNCLENBQUE7UUFDTCxDQUFDO2FBQU0sSUFBSSxVQUFVLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRSxDQUFDO1lBQ3BDLE1BQU0sR0FBRztnQkFDTCxVQUFVLEVBQUU7b0JBQ1IsRUFBRSxFQUFFLEtBQUs7b0JBQ1QsR0FBRyxFQUFFLEtBQUs7b0JBQ1YsSUFBSSxFQUFFLFFBQVE7b0JBQ2QsS0FBSyxFQUFFO3dCQUNIOzRCQUNJLEtBQUssRUFBRSxRQUFROzRCQUNmLE1BQU0sRUFBRSxXQUFXOzRCQUNuQixVQUFVLEVBQUUsTUFBTTs0QkFDbEIsa0JBQWtCLEVBQUUsT0FBTzt5QkFDOUI7cUJBQ0o7b0JBQ0QsT0FBTyxFQUFFLENBQUM7b0JBQ1YsT0FBTyxFQUFFLFdBQVc7b0JBQ3BCLFlBQVksRUFBRSxDQUFDO29CQUNmLGVBQWUsRUFBRSxFQUFFO29CQUNuQixlQUFlLEVBQUU7d0JBQ2IsU0FBUyxFQUFFLEVBQUU7d0JBQ2IsV0FBVyxFQUFFLFNBQVM7d0JBQ3RCLFNBQVMsRUFBRSxVQUFVLENBQUMsS0FBSyxJQUFJLEVBQUU7d0JBQ2pDLEtBQUssRUFBRSxFQUFFO3dCQUNULFVBQVUsRUFBRTs0QkFDUjtnQ0FDSSxJQUFJLEVBQUUsT0FBTztnQ0FDYixXQUFXLEVBQUUsWUFBWTtnQ0FDekIsSUFBSSxFQUFFLE1BQU07Z0NBQ1osS0FBSyxFQUFFLFlBQVk7Z0NBQ25CLEtBQUssRUFBRSxJQUFJO2dDQUNYLFNBQVMsRUFBRSxPQUFPO2dDQUNsQixTQUFTLEVBQUUsSUFBSTtnQ0FDZixJQUFJLEVBQUUsSUFBSTs2QkFDYjs0QkFDRDtnQ0FDSSxJQUFJLEVBQUUsT0FBTztnQ0FDYixXQUFXLEVBQUUsWUFBWTtnQ0FDekIsSUFBSSxFQUFFLE1BQU07Z0NBQ1osS0FBSyxFQUFFLFdBQVc7Z0NBQ2xCLEtBQUssRUFBRSxJQUFJO2dDQUNYLFNBQVMsRUFBRSxPQUFPO2dDQUNsQixTQUFTLEVBQUUsSUFBSTtnQ0FDZixJQUFJLEVBQUUsSUFBSTs2QkFDYjs0QkFDRDtnQ0FDSSxJQUFJLEVBQUUsT0FBTztnQ0FDYixJQUFJLEVBQUUsT0FBTztnQ0FDYixLQUFLLEVBQUUsT0FBTztnQ0FDZCxLQUFLLEVBQUUsS0FBSztnQ0FDWixTQUFTLEVBQUUsT0FBTztnQ0FDbEIsU0FBUyxFQUFFLElBQUk7Z0NBQ2YsSUFBSSxFQUFFLElBQUk7NkJBQ2I7NEJBQ0Q7Z0NBQ0ksSUFBSSxFQUFFLE9BQU87Z0NBQ2IsSUFBSSxFQUFFLE9BQU87Z0NBQ2IsS0FBSyxFQUFFLE9BQU87Z0NBQ2QsS0FBSyxFQUFFLElBQUk7Z0NBQ1gsU0FBUyxFQUFFLE9BQU87Z0NBQ2xCLFNBQVMsRUFBRSxJQUFJO2dDQUNmLElBQUksRUFBRSxJQUFJOzZCQUNiOzRCQUVEO2dDQUNJLEtBQUssRUFBRSxTQUFTO2dDQUNoQixJQUFJLEVBQUUsWUFBWTtnQ0FDbEIsS0FBSyxFQUFFLElBQUk7Z0NBQ1gsU0FBUyxFQUFFLFVBQVU7Z0NBQ3JCLFNBQVMsRUFBRSxJQUFJO2dDQUNmLElBQUksRUFBRSxJQUFJOzZCQUNiO3lCQUNKO3dCQUNELFNBQVMsRUFBRTs0QkFDUCxRQUFRLEVBQUUsT0FBTzs0QkFDakIsT0FBTyxFQUFFLGNBQWM7eUJBQzFCO3FCQUNKO29CQUNELEtBQUssRUFBRSxLQUFLO29CQUNaLFFBQVEsRUFBRSxRQUFRO29CQUNsQixjQUFjLEVBQUUsQ0FBQztvQkFDakIsY0FBYyxFQUFFLEtBQUs7aUJBQ3hCO2dCQUNELGFBQWEsRUFBRSxtQkFBbUI7YUFDckMsQ0FBQTtRQUNMLENBQUM7YUFBTSxJQUFJLFVBQVUsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDdEMsTUFBTSxHQUFHO2dCQUNMLFVBQVUsRUFBRTtvQkFDUixFQUFFLEVBQUUsS0FBSztvQkFDVCxHQUFHLEVBQUUsS0FBSztvQkFDVixJQUFJLEVBQUUsVUFBVTtvQkFDaEIsS0FBSyxFQUFFO3dCQUNIOzRCQUNJLFFBQVEsRUFBRSxJQUFJOzRCQUNkLEtBQUssRUFBRSxNQUFNOzRCQUNiLFFBQVEsRUFBRSxVQUFVLENBQUMsUUFBUTs0QkFDN0IsU0FBUyxFQUFFLFVBQVUsQ0FBQyxTQUFTOzRCQUMvQixTQUFTLEVBQUUsR0FBRzs0QkFDZCxVQUFVLEVBQUUsY0FBYzs0QkFDMUIsU0FBUyxFQUFFO2dDQUNQLFVBQVUsRUFBRSxjQUFjOzZCQUM3Qjs0QkFDRCxLQUFLLEVBQUU7Z0NBQ0gsT0FBTyxFQUFFLFVBQVUsQ0FBQyxPQUFPLElBQUksT0FBTyxXQUFXLEVBQUU7NkJBQ3REOzRCQUNELFVBQVUsRUFBRTtnQ0FDUjtvQ0FDSSxJQUFJLEVBQUUsTUFBTTtvQ0FDWixJQUFJLEVBQUUsVUFBVSxDQUFDLE9BQU8sSUFBSSxPQUFPLFdBQVcsRUFBRTtvQ0FDaEQsTUFBTSxFQUFFLEdBQUc7b0NBQ1gsS0FBSyxFQUFFLFVBQVUsQ0FBQyxTQUFTLElBQUksYUFBYTtvQ0FDNUMsTUFBTSxFQUFFLElBQUk7b0NBQ1osT0FBTyxFQUFFLFdBQVc7b0NBQ3BCLE9BQU8sRUFBRSxnQkFBZ0I7b0NBQ3pCLFFBQVEsRUFBRSxLQUFLO29DQUNmLFFBQVEsRUFBRSxLQUFLO29DQUNmLFVBQVUsRUFBRSxDQUFDLENBQUM7b0NBQ2QsUUFBUSxFQUFFLE9BQU87aUNBQ3BCOzZCQUNKOzRCQUNELFNBQVMsRUFBRSxLQUFLOzRCQUNoQixRQUFRLEVBQUUsQ0FBQzs0QkFDWCxVQUFVLEVBQUUsSUFBSTs0QkFDaEIsYUFBYSxFQUFFLElBQUk7NEJBQ25CLFlBQVksRUFBRSxLQUFLOzRCQUNuQixhQUFhLEVBQUUsS0FBSzs0QkFDcEIsU0FBUyxFQUFFLENBQUM7NEJBQ1osU0FBUyxFQUFFLFFBQVEsS0FBSyw4RUFBOEUsS0FBSywwRkFBMEYsS0FBSyw2RUFBNkU7NEJBQ3ZSLGNBQWMsRUFBRSxPQUFPOzRCQUN2QixlQUFlLEVBQUUsS0FBSzt5QkFDekI7cUJBQ0o7b0JBQ0QsS0FBSyxFQUFFLFNBQVM7b0JBQ2hCLE9BQU8sRUFBRSxDQUFDO29CQUNWLE9BQU8sRUFBRSxrQkFBa0I7b0JBQzNCLFNBQVMsRUFBRSxDQUFDO29CQUNaLFlBQVksRUFBRSxDQUFDO29CQUNmLGVBQWUsRUFBRSxFQUFFO29CQUNuQixLQUFLLEVBQUUsS0FBSztvQkFDWixRQUFRLEVBQUUsUUFBUTtvQkFDbEIsY0FBYyxFQUFFLENBQUM7b0JBQ2pCLGNBQWMsRUFBRSxLQUFLO2lCQUN4QjtnQkFDRCxhQUFhLEVBQUUsUUFBUTthQUMxQixDQUFBO1FBQ0wsQ0FBQzthQUFNLElBQUksVUFBVSxDQUFDLElBQUksS0FBSyxjQUFjLEVBQUUsQ0FBQztZQUM1QyxNQUFNLEdBQUc7Z0JBQ0wsVUFBVSxFQUFFO29CQUNSLEVBQUUsRUFBRSxLQUFLO29CQUNULEdBQUcsRUFBRSxLQUFLO29CQUNWLElBQUksRUFBRSxFQUFFO29CQUNSLElBQUksRUFBRSxXQUFXO29CQUNqQixJQUFJLEVBQUUsRUFBRTtvQkFDUixLQUFLLEVBQUUsRUFBRTtvQkFDVCxLQUFLLEVBQUU7d0JBQ0g7NEJBQ0ksSUFBSSxFQUFFLGVBQWUsQ0FBQyxVQUFVLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQzs0QkFDN0MsS0FBSyxFQUFFLFFBQVE7NEJBQ2YsU0FBUyxFQUFFLEtBQUs7NEJBQ2hCLFFBQVEsRUFBRSxDQUFDOzRCQUNYLFVBQVUsRUFBRSxLQUFLOzRCQUNqQixhQUFhLEVBQUUsS0FBSzs0QkFDcEIsWUFBWSxFQUFFLEtBQUs7NEJBQ25CLGFBQWEsRUFBRSxLQUFLOzRCQUNwQixTQUFTLEVBQUUsQ0FBQzs0QkFDWixjQUFjLEVBQUUsNERBQTREOzRCQUM1RSxlQUFlLEVBQUUsS0FBSzt5QkFDekI7d0JBQ0Q7NEJBQ0ksSUFBSSxFQUFFLGVBQWUsQ0FBQyxVQUFVLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQzs0QkFDN0MsUUFBUSxFQUFFLFNBQVM7NEJBQ25CLEtBQUssRUFBRSxRQUFROzRCQUNmLFNBQVMsRUFBRSxVQUFVLENBQUMsUUFBUTs0QkFDOUIsU0FBUyxFQUFFLEtBQUs7NEJBQ2hCLFFBQVEsRUFBRSxDQUFDOzRCQUNYLFVBQVUsRUFBRSxLQUFLOzRCQUNqQixhQUFhLEVBQUUsS0FBSzs0QkFDcEIsWUFBWSxFQUFFLEtBQUs7NEJBQ25CLGFBQWEsRUFBRSxLQUFLOzRCQUNwQixTQUFTLEVBQUUsQ0FBQzs0QkFDWixjQUFjLEVBQUUsNERBQTREOzRCQUM1RSxlQUFlLEVBQUUsS0FBSzt5QkFDekI7cUJBQ0o7b0JBQ0QsS0FBSyxFQUFFLFNBQVM7b0JBQ2hCLE9BQU8sRUFBRSxDQUFDO29CQUNWLE9BQU8sRUFBRSxZQUFZO29CQUNyQixTQUFTLEVBQUUsQ0FBQztvQkFDWixZQUFZLEVBQUUsQ0FBQztvQkFDZixlQUFlLEVBQUUsRUFBRTtvQkFDbkIsS0FBSyxFQUFFLEtBQUs7b0JBQ1osUUFBUSxFQUFFLFFBQVE7b0JBQ2xCLGNBQWMsRUFBRSxDQUFDO29CQUNqQixjQUFjLEVBQUUsS0FBSztvQkFDckIsV0FBVyxFQUFFLElBQUk7aUJBQ3BCO2dCQUNELGFBQWEsRUFBRSxTQUFTO2FBQzNCLENBQUE7UUFDTCxDQUFDO2FBQU0sSUFBSSxVQUFVLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRSxDQUFDO1lBQ3JDLE1BQU0sR0FBRztnQkFDTCxVQUFVLEVBQUU7b0JBQ1IsRUFBRSxFQUFFLEtBQUs7b0JBQ1QsR0FBRyxFQUFFLEtBQUs7b0JBQ1YsSUFBSSxFQUFFLFdBQVc7b0JBQ2pCLEtBQUssRUFBRTt3QkFDSDs0QkFDSSxLQUFLLEVBQUUsUUFBUTs0QkFDZixLQUFLLEVBQUU7Z0NBQ0gsR0FBRyxFQUFFLFVBQVUsQ0FBQyxRQUFRO2dDQUN4QixNQUFNLEVBQUUsS0FBSzs2QkFDaEI7NEJBQ0QsU0FBUyxFQUFFLEtBQUs7NEJBQ2hCLFFBQVEsRUFBRSxDQUFDOzRCQUNYLFVBQVUsRUFBRSxLQUFLOzRCQUNqQixhQUFhLEVBQUUsS0FBSzs0QkFDcEIsWUFBWSxFQUFFLEtBQUs7NEJBQ25CLGFBQWEsRUFBRSxLQUFLOzRCQUNwQixTQUFTLEVBQUUsQ0FBQzs0QkFDWixTQUFTLEVBQUUsRUFBRTs0QkFDYixlQUFlLEVBQUUsS0FBSzt5QkFDekI7cUJBQ0o7b0JBQ0QsT0FBTyxFQUFFLENBQUM7b0JBQ1YsT0FBTyxFQUFFLFlBQVk7b0JBQ3JCLFlBQVksRUFBRSxDQUFDO29CQUNmLEtBQUssRUFBRSxLQUFLO29CQUNaLFFBQVEsRUFBRSxRQUFRO29CQUNsQixjQUFjLEVBQUUsQ0FBQztvQkFDakIsY0FBYyxFQUFFLEtBQUs7b0JBQ3JCLFdBQVcsRUFBRSxJQUFJO2lCQUNwQjtnQkFDRCxhQUFhLEVBQUUsU0FBUzthQUMzQixDQUFBO1FBQ0wsQ0FBQzthQUFNLElBQUksVUFBVSxDQUFDLElBQUksS0FBSyxTQUFTLElBQUksVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzdELE1BQU0sR0FBRztnQkFDTCxVQUFVLEVBQUU7b0JBQ1IsRUFBRSxFQUFFLEtBQUs7b0JBQ1QsR0FBRyxFQUFFLEtBQUs7b0JBQ1YsSUFBSSxFQUFFLGlCQUFpQjtvQkFDdkIsT0FBTyxFQUFFLENBQUM7b0JBQ1YsT0FBTyxFQUFFLFlBQVk7b0JBQ3JCLFlBQVksRUFBRSxDQUFDO29CQUNmLEtBQUssRUFBRSxLQUFLO29CQUNaLFFBQVEsRUFBRSxRQUFRO29CQUNsQixjQUFjLEVBQUUsQ0FBQztvQkFDakIsY0FBYyxFQUFFLEtBQUs7b0JBQ3JCLEtBQUssRUFBRSxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDO2lCQUMvQztnQkFDRCxhQUFhLEVBQUUsY0FBYzthQUNoQyxDQUFBO1FBQ0wsQ0FBQzthQUFNLElBQUksVUFBVSxDQUFDLElBQUksS0FBSyxVQUFVLEVBQUUsQ0FBQztZQUN4QyxNQUFNLEdBQUc7Z0JBQ0wsVUFBVSxFQUFFO29CQUNSLEVBQUUsRUFBRSxLQUFLO29CQUNULEdBQUcsRUFBRSxLQUFLO29CQUNWLElBQUksRUFBRSxXQUFXO29CQUNqQixLQUFLLEVBQUU7d0JBQ0g7NEJBQ0ksS0FBSyxFQUFFLFFBQVE7NEJBQ2YsUUFBUSxFQUFFLFVBQVUsQ0FBQyxRQUFROzRCQUM3QixTQUFTLEVBQUUsQ0FBQzs0QkFDWixTQUFTLEVBQUUsUUFBUSxLQUFLLHlFQUF5RTs0QkFFakcsY0FBYyxFQUFFLDREQUE0RDs0QkFDNUUsZUFBZSxFQUFFLEtBQUs7NEJBQ3RCLFFBQVEsRUFBRSxJQUFJOzRCQUNkLFdBQVcsRUFBRSxJQUFJO3lCQUNwQjtxQkFDSjtvQkFDRCxPQUFPLEVBQUUsQ0FBQztvQkFDVixlQUFlLEVBQUUsVUFBVTtvQkFDM0IsS0FBSyxFQUFFLEtBQUs7b0JBQ1osUUFBUSxFQUFFLFFBQVE7b0JBQ2xCLGNBQWMsRUFBRSxDQUFDO29CQUNqQixjQUFjLEVBQUUsS0FBSztvQkFDckIsV0FBVyxFQUFFLElBQUk7aUJBQ3BCO2dCQUNELGFBQWEsRUFBRSxTQUFTO2FBQzNCLENBQUE7UUFDTCxDQUFDO1FBQ0QsSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUNULFFBQVEsSUFBSSxDQUFDLENBQUE7WUFDYixVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQzNCLENBQUM7SUFDTCxDQUFDO0lBRUQsT0FBTyxVQUFVLENBQUE7QUFDckIsQ0FBQyxDQUFBO0FBRUQsTUFBTSxDQUFDLE1BQU0sc0JBQXNCLEdBQUcsS0FBSyxFQUFFLFFBQW9CLEVBQUUsTUFBYyxFQUFFLEVBQUU7SUFDakYsSUFBSSxDQUFDO1FBQ0QsTUFBTSxjQUFjLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFDL0QsTUFBTSxJQUFJLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ3JDLElBQUksTUFBTSxHQUFHLGNBQWMsQ0FBQyxjQUFjLENBQUE7UUFFMUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxjQUFjLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQTtJQUMzRixDQUFDO0lBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNYLE1BQU0sSUFBSSxjQUFjLENBQUM7WUFDckIsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPO1lBQ3BCLFNBQVMsRUFBRSxTQUFTO1lBQ3BCLEtBQUssRUFBRTtnQkFDSCxVQUFVLEVBQUUsMENBQTBDO2FBQ3pEO1NBQ0osQ0FBQyxDQUFBO0lBQ04sQ0FBQztBQUNMLENBQUMsQ0FBQSJ9