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
    const headerLogo = siteData.logos?.header || '';
    const footerLogo = siteData.logos?.footer || headerLogo;
    const mobileLogo = siteData.logos?.mobile || headerLogo;
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
    const createLandingLogoSlot = (imageSrc) => {
        return {
            slots: [
                {
                    alignment: 'center',
                    image_src: imageSrc,
                    image_link: '',
                },
            ],
        };
    };
    const layoutTemplate = {
        logos: {
            footer: createLandingLogoSlot(footerLogo),
            header: createLandingLogoSlot(headerLogo),
            mobile: createLandingLogoSlot(mobileLogo),
        },
        social: socials ? transformSocial(socials) : [],
        contact: {
            phone: [
                {
                    name: 'Phone',
                    number: phoneNumber,
                    isPrimaryPhone: true,
                },
            ],
            address: address,
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
        //create each specific landing page module
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
                            modColor1: dlOverlayColor,
                            newwindow: '0',
                            subheader: currentMod.subheader,
                            isFeatured: '',
                            modOpacity: 0,
                            newwindow2: '1',
                            promoColor: 'var(--promo)',
                            links: {
                                weblink: currentMod.weblink || `tel:${phoneNumber}`,
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