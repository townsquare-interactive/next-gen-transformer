import { convertDescText, removeWhiteSpace, convertUrlToApexId } from '../utils.js';
import { createGlobalStylesheet } from './cms-controller.js';
import { createFontData, createLandingColors, createModulesWithSections, createReviewItems, customizeWidgets, transformDLText, transformSocial, } from '../landing-utils.js';
import { LandingInputSchema } from '../../schema/input-zod.js';
import { getFileS3 } from '../s3Functions.js';
import { v4 as uuidv4 } from 'uuid';
import { zodDataParse } from '../../schema/utils-zod.js';
export const validateLandingRequestData = (req, type = 'input') => {
    const siteData = zodDataParse(req.body, LandingInputSchema, type);
    const apexID = convertUrlToApexId(siteData.url);
    return { apexID, siteData };
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
    const widgetData = customizeWidgets(customComponents || [], themeColors, logo || '', siteName, phoneNumber, email, siteData.headerCtaButtons);
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
export const createPageFile = (siteData) => {
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
    let bannerCount = 1;
    for (let i = 0; i < modules.length; i++) {
        const currentMod = modules[i];
        let newMod;
        const modID = uuidv4(); //unique module ID
        const btnClassName = `${currentMod.type}-btn${currentMod.type === 'banner' ? '-' + bannerCount : ''}`;
        if (currentMod.type === 'dl') {
            const dlOverlayColor = 'rgb(0,0,0,0.5)';
            const dlBtnDataLayerEvent = currentMod.dataLayerEventBtn || 'dl_btn_click';
            const dlImgDataLayerEvent = currentMod.dataLayerEventWrap || 'dl_img_click';
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
                                dataLayerEventWrap: dlImgDataLayerEvent,
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
                                    cName: btnClassName,
                                    dataLayerEvent: dlBtnDataLayerEvent,
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
                        formTitle: currentMod.contactFormTitle || '',
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
            const bannerBtnDataLayerEvent = currentMod.dataLayerEventBtn || `banner_${bannerCount}_btn_click_`;
            const bannerImgDataLayerEvent = currentMod.dataLayerEventWrap || `banner_${bannerCount}_bar_click_`;
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
                                dataLayerEventWrap: bannerImgDataLayerEvent,
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
                                    cName: btnClassName,
                                    dataLayerEvent: bannerBtnDataLayerEvent,
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
            bannerCount += 1;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZGluZy1jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbnRyb2xsZXJzL2xhbmRpbmctY29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixFQUFFLGtCQUFrQixFQUFFLE1BQU0sYUFBYSxDQUFBO0FBQ25GLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHFCQUFxQixDQUFBO0FBQzVELE9BQU8sRUFDSCxjQUFjLEVBQ2QsbUJBQW1CLEVBQ25CLHlCQUF5QixFQUN6QixpQkFBaUIsRUFDakIsZ0JBQWdCLEVBQ2hCLGVBQWUsRUFDZixlQUFlLEdBQ2xCLE1BQU0scUJBQXFCLENBQUE7QUFDNUIsT0FBTyxFQUFFLGtCQUFrQixFQUEyRCxNQUFNLDJCQUEyQixDQUFBO0FBQ3ZILE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQTtBQUU3QyxPQUFPLEVBQUUsRUFBRSxJQUFJLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQTtBQUNuQyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMkJBQTJCLENBQUE7QUFFeEQsTUFBTSxDQUFDLE1BQU0sMEJBQTBCLEdBQUcsQ0FBQyxHQUF5QixFQUFFLElBQUksR0FBRyxPQUFPLEVBQUUsRUFBRTtJQUNwRixNQUFNLFFBQVEsR0FBRyxZQUFZLENBQXdDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDeEcsTUFBTSxNQUFNLEdBQUcsa0JBQWtCLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBRS9DLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLENBQUE7QUFDL0IsQ0FBQyxDQUFBO0FBRUQsTUFBTSxDQUFDLE1BQU0sZ0JBQWdCLEdBQUcsS0FBSyxFQUFFLFFBQWEsRUFBRSxNQUFjLEVBQUUsRUFBRTtJQUNwRSxNQUFNLElB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