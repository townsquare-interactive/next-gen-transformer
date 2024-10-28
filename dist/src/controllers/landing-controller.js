import { convertDescText, removeWhiteSpace, convertUrlToApexId, getPageNameFromDomain } from '../utilities/utils.js';
import { createGlobalStylesheet } from './cms-controller.js';
import { checkModulesForBMP, createFontData, createLandingColors, createModulesWithSections, createReviewItems, customizeWidgets, transformDLText, transformSocial, } from '../utilities/landing-utils.js';
import { LandingInputSchema } from '../schema/input-zod.js';
import { getFileS3 } from '../utilities/s3Functions.js';
import { v4 as uuidv4 } from 'uuid';
import { zodDataParse } from '../schema/utils-zod.js';
import { SiteDeploymentError } from '../utilities/errors.js';
import { getPageandLanding } from './create-site-controller.js';
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
    const { siteLayout, sitePage } = await getPageandLanding(apexID, siteData.pageUri || '', 'landing');
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
        publishedDomains: typeof siteLayout != 'string' && siteLayout?.publishedDomains ? siteLayout?.publishedDomains : [],
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
        requestData: siteData,
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
export const getRequestData = async (domain) => {
    const apexID = convertUrlToApexId(domain);
    const pageName = getPageNameFromDomain(domain);
    const s3File = `${apexID}/pages/${pageName}.json`;
    const pageData = await getFileS3(s3File, 'site not found in s3');
    console.log('filename', s3File);
    if (typeof pageData != 'string') {
        if (!pageData.requestData) {
            throw new SiteDeploymentError({
                message: `${domain} page file in S3 doest not contain requestData`,
                domain: domain,
                errorType: 'AMS-010',
                state: {
                    dataStatus: 'The request data was not able to be found in the current saved S3 page file. Likely an older site',
                },
            });
        }
        return pageData.requestData;
    }
    else {
        throw new SiteDeploymentError({
            message: `ApexID ${apexID} not found in list of created sites`,
            domain: domain,
            errorType: 'AMS-006',
            state: {
                dataStatus: 'The request data was not found because the site could not be found in Amazon S3',
            },
        });
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZGluZy1jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbnRyb2xsZXJzL2xhbmRpbmctY29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixFQUFFLGtCQUFrQixFQUFFLHFCQUFxQixFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFDcEgsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0scUJBQXFCLENBQUE7QUFDNUQsT0FBTyxFQUNILGtCQUFrQixFQUNsQixjQUFjLEVBQ2QsbUJBQW1CLEVBQ25CLHlCQUF5QixFQUN6QixpQkFBaUIsRUFDakIsZ0JBQWdCLEVBQ2hCLGVBQWUsRUFDZixlQUFlLEdBQ2xCLE1BQU0sK0JBQStCLENBQUE7QUFDdEMsT0FBTyxFQUFFLGtCQUFrQixFQUEyRCxNQUFNLHdCQUF3QixDQUFBO0FBQ3BILE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUV2RCxPQUFPLEVBQUUsRUFBRSxJQUFJLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQTtBQUNuQyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFFckQsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sd0JBQXdCLENBQUE7QUFDNUQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNkJBQTZCLENBQUE7QUFFL0QsTUFBTSxDQUFDLE1BQU0sMEJBQTBCLEdBQUcsQ0FBQyxHQUF5QixFQUFFLElBQUksR0FBRyxPQUFPLEVBQUUsRUFBRTtJQUNwRixNQUFNLFFBQVEsR0FBRyxZQUFZLENBQXdDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDeEcsTUFBTSxNQUFNLEdBQUcsa0JBQWtCLENBQUMsUUFBUSxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7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