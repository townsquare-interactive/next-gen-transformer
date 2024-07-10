import { convertDescText, removeWhiteSpace, convertUrlToApexId } from '../utils.js'
import { createGlobalStylesheet } from './cms-controller.js'
import {
    createFontData,
    createLandingColors,
    createModulesWithSections,
    createReviewItems,
    customizeWidgets,
    transformDLText,
    transformSocial,
} from '../landing-utils.js'
import { LandingInputSchema, type AiPageModules, type LandingReq, type LandingColors } from '../../schema/input-zod.js'
import { getFileS3 } from '../s3Functions.js'
import type { Layout } from '../../types.js'
import { TransformError } from '../errors.js'
import { zodDataParse } from '../../schema/output-zod.js'

export const validateRequestData = (req: { body: LandingReq }) => {
    //validate request data with zod
    const siteData = zodDataParse(req.body, LandingInputSchema, 'input', 'parse')

    return { apexID: convertUrlToApexId(req.body.url), siteData }
}

export const createLayoutFile = async (siteData: any, apexID: string) => {
    const logo = siteData.logo
    const socials = siteData.socials
    const address = siteData.address
    const siteName = siteData.siteName
    const phoneNumber = removeWhiteSpace(siteData.phoneNumber || '')
    const email = siteData.email
    const seo = siteData.seo
    const colors: LandingColors = siteData.colors
    const favicon = siteData.favicon
    const url = siteData.url
    let customComponents = siteData.customComponents
    const currentLayout: Layout = await getFileS3(`${apexID}/layout.json`, 'site not found in s3')

    const themeColors = createLandingColors(colors)

    const widgetData = customizeWidgets(customComponents || [], themeColors, logo || '', siteName, phoneNumber, email, siteData.headerButton)

    const fontData = createFontData(siteData.fonts)

    const newStyles = await createGlobalStylesheet(themeColors, fontData.fonts, { CSS: '' }, { pages: [] }, apexID)

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
    }

    return { siteLayout: layoutTemplate, siteIdentifier: apexID }
}

const createPageFile = (siteData: LandingReq) => {
    const title = 'landing'
    const slug = 'landing'

    const sectionModules = createModulesWithSections(siteData.page.sections)
    const modules = createModules(sectionModules, siteData.colors, removeWhiteSpace(siteData.phoneNumber || ''))

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
    }

    return page
}

const createModules = (modules: AiPageModules, colors: LandingColors, phoneNumber: string) => {
    let newModules = []
    let modCount = 1
    for (let i = 0; i < modules.length; i++) {
        const currentMod = modules[i]
        let newMod
        if (currentMod.type === 'dl') {
            console.log('headline test', currentMod.headline)
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
            }
        } else if (currentMod.type === 'coupon') {
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
            }
        } else if (currentMod.type === 'form') {
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
                    modId: '14d36b73_a89c_4cc0_fe84_3b8ca9724ad0',
                    modCount: modCount,
                    columnLocation: 0,
                    isSingleColumn: false,
                },
                componentType: 'ContactFormRoutes',
            }
        } else if (currentMod.type === 'banner') {
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
                            btnStyles:
                                ' #id_5cd0c223_3db2_439e_c02c_367a4bf641fa .item_1 .btn2_override {color:#ffffff; background-color:transparent;} #id_5cd0c223_3db2_439e_c02c_367a4bf641fa .item_1 .btn_promo {color: var(--promo); background-color: #ffffff;}\n            #id_5cd0c223_3db2_439e_c02c_367a4bf641fa .item_1 .btn_promo:hover{color: #ffffff; background-color: var(--promo3);}',
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
            }
        } else if (currentMod.type === 'text content') {
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
            }
        } else if (currentMod.type === 'video') {
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
            }
        } else if (currentMod.type === 'reviews' && currentMod.reviews) {
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
            }
        } else if (currentMod.type === 'headline') {
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
            }
        }
        if (newMod) {
            modCount += 1
            newModules.push(newMod)
        }
    }

    return newModules
}

export const createLandingPageFiles = async (siteData: LandingReq, apexID: string) => {
    try {
        const layoutContents = await createLayoutFile(siteData, apexID)
        const page = createPageFile(siteData)

        return { siteLayout: layoutContents.siteLayout, siteIdentifier: layoutContents.siteIdentifier, pages: [page] }
    } catch (err) {
        throw new TransformError({
            message: err.message,
            errorID: 'GEN-003',
            state: {
                siteStatus: 'Process stopped when creating site files',
            },
        })
    }
}
