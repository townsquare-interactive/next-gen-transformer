import { convertDescText, removeWhiteSpace, convertUrlToApexId } from '../utilities/utils.js';
import { createGlobalStylesheet } from './cms-controller.js';
import { checkModulesForBMP, createFontData, createLandingColors, createModulesWithSections, createReviewItems, customizeWidgets, transformDLText, transformSocial, } from '../utilities/landing-utils.js';
import { LandingInputSchema } from '../schema/input-zod.js';
import { getFileS3 } from '../utilities/s3Functions.js';
import { v4 as uuidv4 } from 'uuid';
import { zodDataParse } from '../schema/utils-zod.js';
export const validateLandingRequestData = (req, type = 'input') => {
    const siteData = zodDataParse(req.body, LandingInputSchema, type);
    const apexID = convertUrlToApexId(siteData.s3Folder || siteData.url);
    const domainOptions = {
        domain: siteData.productionDomain
            ? siteData.productionDomain
            : siteData.subdomainOverride
                ? convertUrlToApexId(siteData.subdomainOverride)
                : siteData.s3Folder
                    ? convertUrlToApexId(siteData.s3Folder)
                    : siteData.url
                        ? convertUrlToApexId(siteData.url)
                        : '',
        usingPreview: !siteData.productionDomain,
    };
    return { apexID, siteData, domainOptions };
};
export const createLayoutFile = async (siteData, apexID) => {
    const headerLogo = siteData.logos.header;
    const footerLogo = siteData.logos.footer || headerLogo;
    const socials = siteData.socials;
    const address = siteData.contactData.address;
    const siteName = siteData.siteName;
    const phoneNumber = removeWhiteSpace(siteData.contactData.phoneNumber || '');
    const email = siteData.contactData.email;
    const seo = siteData.seo;
    const colors = siteData.colors;
    const favicon = siteData.favicon;
    const url = siteData.url;
    let customComponents = siteData.customOptions.customComponents || [];
    const currentLayout = await getFileS3(`${apexID}/layout.json`, 'site not found in s3');
    const analytics = siteData.customOptions.analytics;
    const themeColors = createLandingColors(colors);
    const hasEngage = customComponents?.length > 0 ? checkModulesForBMP(customComponents) : false;
    const widgetData = customizeWidgets(customComponents, themeColors, headerLogo || '', siteName, phoneNumber, email, siteData.customOptions.headerCtaButtons, hasEngage);
    const fontData = createFontData(siteData.customOptions.fonts);
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
                        image_src: footerLogo,
                        image_link: '',
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
                        image_src: headerLogo,
                        image_link: '',
                    },
                    {
                        show: 0,
                        type: 'text',
                        markup: '',
                        hasLinks: false,
                        alignment: 'left',
                        image_src: '',
                        image_link: '',
                    },
                    {
                        show: 0,
                        type: 'text',
                        markup: '',
                        hasLinks: false,
                        alignment: 'left',
                        image_src: '',
                        image_link: '',
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
                        image_src: headerLogo,
                        image_link: '',
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
            footer: siteData.customOptions.code?.body || '',
            header: siteData.customOptions.code?.header || '',
        },
        siteType: 'landing',
        customComponents: widgetData.customComponents,
        vcita: widgetData.vcita,
        analytics: analytics,
        formService: hasEngage ? 'BMP' : 'webhook',
    };
    return { siteLayout: layoutTemplate, siteIdentifier: apexID };
};
export const createPageFile = (siteData, siteLayout) => {
    const title = siteData.pageUri ? siteData.pageUri : 'landing';
    const slug = siteData.pageUri ? siteData.pageUri : 'landing';
    const sectionModules = createModulesWithSections(siteData.page.sections);
    const modules = createModules(sectionModules, removeWhiteSpace(siteData.contactData.phoneNumber || ''));
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
        siteLayout: siteLayout,
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
                        formService: '',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZGluZy1jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbnRyb2xsZXJzL2xhbmRpbmctY29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixFQUFFLGtCQUFrQixFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFDN0YsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0scUJBQXFCLENBQUE7QUFDNUQsT0FBTyxFQUNILGtCQUFrQixFQUNsQixjQUFjLEVBQ2QsbUJBQW1CLEVBQ25CLHlCQUF5QixFQUN6QixpQkFBaUIsRUFDakIsZ0JBQWdCLEVBQ2hCLGVBQWUsRUFDZixlQUFlLEdBQ2xCLE1BQU0sK0JBQStCLENBQUE7QUFDdEMsT0FBTyxFQUFFLGtCQUFrQixFQUEyRCxNQUFNLHdCQUF3QixDQUFBO0FBQ3BILE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUV2RCxPQUFPLEVBQUUsRUFBRSxJQUFJLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQTtBQUNuQyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFHckQsTUFBTSxDQUFDLE1BQU0sMEJBQTBCLEdBQUcsQ0FBQyxHQUF5QixFQUFFLElBQUksR0FBRyxPQUFPLEVBQUUsRUFBRTtJQUNwRixNQUFNLFFBQVEsR0FBRyxZQUFZLENBQXdDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDeEcsTUFBTSxNQUFNLEdBQUcsa0JBQWtCLENBQUMsUUFBUSxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDcEUsTUFBTSxhQUFhLEdBQUc7UUFDbEIsTUFBTSxFQUFFLFFBQVEsQ0FBQyxnQkFBZ0I7WUFDN0IsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0I7WUFDM0IsQ0FBQyxDQUFD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