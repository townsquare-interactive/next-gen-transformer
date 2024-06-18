import { convertDescText, removeWhiteSpace, stripUrl } from '../utils.js';
import { createGlobalStylesheet } from './cms-controller.js';
import { createFontData, createLandingColors, createModulesWithSections, createReviewItems, customizeWidgets, transformDLText, transformSocial, } from '../landing-utils.js';
import { LandingInputSchema } from '../../schema/input-zod.js';
import { getFileS3 } from '../s3Functions.js';
import { TransformError } from '../errors.js';
import { zodDataParse } from '../../schema/output-zod.js';
export const validateRequestData = (req) => {
    //validate request data with zod
    const siteData = zodDataParse(req.body, LandingInputSchema, 'input', 'parse');
    return { apexID: stripUrl(req.body.url), siteData };
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
    const themeColors = createLandingColors(colors);
    const widgetData = customizeWidgets(customComponents || [], themeColors, logo || '', siteName, phoneNumber);
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
        siteType: 'landing',
        customComponents: widgetData.customComponents,
        vcita: widgetData.vcita,
    };
    return { siteLayout: layoutTemplate, siteIdentifier: apexID };
};
const createPageFile = (siteData) => {
    const title = 'landing';
    const slug = 'landing';
    const sectionModules = createModulesWithSections(siteData.page.sections);
    const modules = createModules(sectionModules, siteData.colors, removeWhiteSpace(siteData.phoneNumber || ''));
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
const createModules = (modules, colors, phoneNumber) => {
    let newModules = [];
    let modCount = 1;
    for (let i = 0; i < modules.length; i++) {
        const currentMod = modules[i];
        let newMod;
        if (currentMod.type === 'dl') {
            console.log('headline test', currentMod.headline);
            newMod = {
                attributes: {
                    id: '5cf59c97_e330_4565_97d0_9c166550903d',
                    uid: '5cf59c97_e330_4565_97d0_9c166550903d',
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
                            modColor1: colors.accent,
                            newwindow: '0',
                            subheader: currentMod.subheader,
                            isFeatured: '',
                            modOpacity: 0.42,
                            newwindow2: '1',
                            promoColor: 'var(--promo)',
                            itemStyle: {
                                background: colors.accent,
                            },
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
                    customClassName: 'acdl white deskadstart',
                    modId: '5cf59c97_e330_4565_97d0_9c166550903d',
                    modCount: modCount,
                    columnLocation: 0,
                    isSingleColumn: false,
                },
                componentType: 'Parallax',
            };
        }
        else if (currentMod.type === 'coupon') {
            //'http://nextgenprototype.production.townsquareinteractive.com/files/2024/03/50_off_any_service_coupon.png'
            newMod = {
                attributes: {
                    id: '9e6df334_a8d8_465f_fb68_989f2e4fd5b1',
                    uid: '9e6df334_a8d8_465f_fb68_989f2e4fd5b1',
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
                    customClassName: 'adcoupons couponAdd',
                    modId: '9e6df334_a8d8_465f_fb68_989f2e4fd5b1',
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
                    id: '14d36b73_a89c_4cc0_fe84_3b8ca9724ad0',
                    uid: '14d36b73_a89c_4cc0_fe84_3b8ca9724ad0',
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
                    customClassName: 'formsplitformv2 sign_up deskadform',
                    contactFormData: {
                        formTitle: '',
                        formService: 'webhook',
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
                    modId: '14d36b73_a89c_4cc0_fe84_3b8ca9724ad0',
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
                    id: '5cd0c223_3db2_439e_c02c_367a4bf641fa',
                    uid: '5cd0c223_3db2_439e_c02c_367a4bf641fa',
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
                            btnStyles: ' #id_5cd0c223_3db2_439e_c02c_367a4bf641fa .item_1 .btn2_override {color:#ffffff; background-color:transparent;} #id_5cd0c223_3db2_439e_c02c_367a4bf641fa .item_1 .btn_promo {color: var(--promo); background-color: #ffffff;}\n            #id_5cd0c223_3db2_439e_c02c_367a4bf641fa .item_1 .btn_promo:hover{color: #ffffff; background-color: var(--promo3);}',
                            nextImageSizes: '100vw',
                            isFeatureButton: false,
                        },
                    ],
                    title: 'BANNER1',
                    columns: 1,
                    imgsize: 'widescreen_2_4_1',
                    hideTitle: 0,
                    blockSwitch1: 1,
                    customClassName: 'adbanner',
                    modId: '5cd0c223_3db2_439e_c02c_367a4bf641fa',
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
                    id: 'a8480c39_b0ed_44aa_eaea_ce9f091296bb',
                    uid: 'a8480c39_b0ed_44aa_eaea_ce9f091296bb',
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
                    customClassName: 'largertext',
                    modId: 'a8480c39_b0ed_44aa_eaea_ce9f091296bb',
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
                    id: '911fddb4_52f2_44ae_ab6e_e85ee20db52f',
                    uid: '911fddb4_52f2_44ae_ab6e_e85ee20db52f',
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
                    modId: '911fddb4_52f2_44ae_ab6e_e85ee20db52f',
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
                    id: '491801eb_6a65_41c5_ad06_9c37849163ca',
                    uid: '491801eb_6a65_41c5_ad06_9c37849163ca',
                    type: 'review_carousel',
                    columns: 1,
                    imgsize: 'square_1_1',
                    blockSwitch1: 1,
                    modId: '491801eb_6a65_41c5_ad06_9c37849163ca',
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
                    id: 'f051be2e_23a6_4425_e1e4_891f5c31b18c',
                    uid: 'f051be2e_23a6_4425_e1e4_891f5c31b18c',
                    type: 'article_1',
                    items: [
                        {
                            align: 'center',
                            headline: currentMod.headline,
                            itemCount: 1,
                            btnStyles: ' #id_f051be2e_23a6_4425_e1e4_891f5c31b18c .item_1 .btn2_override {color:#ffffff; background-color:transparent;} ',
                            nextImageSizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 1200px',
                            isFeatureButton: false,
                            headSize: 'xl',
                            thinSpacing: true,
                        },
                    ],
                    columns: 1,
                    customClassName: 'satytext',
                    modId: 'f051be2e_23a6_4425_e1e4_891f5c31b18c',
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
        return { siteLayout: layoutContents.siteLayout, siteIdentifier: layoutContents.siteIdentifier, pages: [page] };
    }
    catch (err) {
        throw new TransformError({ message: err.message, errorID: 'GEN-003' });
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZGluZy1jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbnRyb2xsZXJzL2xhbmRpbmctY29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsRUFBRSxNQUFNLGFBQWEsQ0FBQTtBQUN6RSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQTtBQUM1RCxPQUFPLEVBQ0gsY0FBYyxFQUNkLG1CQUFtQixFQUNuQix5QkFBeUIsRUFDekIsaUJBQWlCLEVBQ2pCLGdCQUFnQixFQUNoQixlQUFlLEVBQ2YsZUFBZSxHQUNsQixNQUFNLHFCQUFxQixDQUFBO0FBQzVCLE9BQU8sRUFBRSxrQkFBa0IsRUFBMkQsTUFBTSwyQkFBMkIsQ0FBQTtBQUN2SCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sbUJBQW1CLENBQUE7QUFFN0MsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGNBQWMsQ0FBQTtBQUM3QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNEJBQTRCLENBQUE7QUFFekQsTUFBTSxDQUFDLE1BQU0sbUJBQW1CLEdBQUcsQ0FBQyxHQUF5QixFQUFFLEVBQUU7SUFDN0QsZ0NBQWdDO0lBQ2hDLE1BQU0sUUFBUSxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQTtJQUU3RSxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFBO0FBQ3ZELENBQUMsQ0FBQTtBQUVELE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHLEtBQUssRUFBRSxRQUFhLEVBQUUsTUFBYyxFQUFFLEVBQUU7SUFDcEUsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUks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