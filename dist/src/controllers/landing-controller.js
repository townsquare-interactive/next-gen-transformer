import { convertDescText, removeWhiteSpace } from '../utils.js'
import { createGlobalStylesheet } from './cms-controller.js'
import {
    addSiteInfoToWebchat,
    createFontData,
    createModulesWithSections,
    createReviewItems,
    customizeWidgets,
    transformDLText,
    transformSocial,
} from '../landing-utils.js'
import { getFileS3 } from '../s3Functions.js'
import { TransformError } from '../errors.js'
const layoutReq = {
    logo: 'http://guaranteedservice.com/files/2023/02/guaranteedservice.png',
    socials: [
        'http://www.facebook.com/GuaranteedServiceNJ',
        'http://www.youtube.com/channel/UCTF0w4Gyxi34P3G3hRWguAA',
        'https://www.google.com/maps/place/Guaranteed+Service/@40.3801104,-74.571654,11z/data=!3m1!4b1!4m5!3m4!1s0x89c3c4c47750b5bb:0x1a7085e031fb3be7!8m2!3d40.3791538!4d-74.435907',
        'http://www.linkedin.com/guaranteed-service/',
        'http://instagram.com/guaranteedservicenj',
    ],
    address: {
        zip: '08736',
        city: 'Manasquan',
        name: 'Guaranteed Service',
        state: 'NJ',
        street: '',
        street2: '',
        coordinates: {
            lat: '40.126226',
            long: '-74.049304',
        },
        url: 'https://www.google.com/maps/place/+08736',
    },
    siteName: 'Guaranteed Service',
    phoneNumber: '(732) 351-2519',
    email: 'info@guaranteedservice.com',
    url: 'guaranteedservice.com',
    seo: {
        global: {
            aiosp_home_title: 'Heating, Cooling, Plumbing & Electric | Manasquan, NJ | Guaranteed Service',
            aiosp_google_verify: 'onyUq1G14_37dkL1WYEDgNjd-LEGiwY5KtNb-dxIWv0',
            aiosp_home_description: 'Guaranteed Service in Manasquan, NJ offers HVAC services and electrical services. Call today for an estimate!',
            aiosp_page_title_format: '%page_title% | %blog_title%',
            aiosp_description_format: '%description%',
            aiosp_404_title_format: 'Nothing found for %request_words%',
        },
    },
    colors: { primary: '#fc070a', accent: '#002253' },
    favicon: 'https://townsquareinteractive.s3.amazonaws.com/guaranteedservice/assets/guaranteedservice.png',
    customComponents: [
        { type: 'Webchat', apiKey: 'mf2k0sam3vr14qfd2x3dk7po8ob0141b' },
        { type: 'ScheduleEngine', apiKey: 'cl8d8jgjd00pv09pcdsyo89bc' },
    ],
}
export const createLayoutFile = async (req, apexID) => {
    const logo = req.logo
    const socials = req.socials
    const address = req.address
    const siteName = req.siteName
    const phoneNumber = removeWhiteSpace(req.phoneNumber)
    const email = req.email
    const seo = req.seo
    const colors = req.colors
    const favicon = req.favicon
    const url = req.url
    let customComponents = req.customComponents
    const currentLayout = await getFileS3(`${apexID}/layout.json`, 'site not found in s3')
    //assign logo/sitename to webchat widget
    if (customComponents?.length > 0 && logo) {
        customComponents = addSiteInfoToWebchat(customComponents, logo, siteName)
    }
    const themeColors = {
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
    }
    const widgetData = customizeWidgets(customComponents || [], themeColors, logo || '', siteName, phoneNumber)
    const scrapedFontsExample = [
        {
            key: '"Merriweather Sans", Helvetica, sans-serif',
            count: 1425,
            isFirstPlace: true,
        },
        {
            key: '"Open Sans", Helvetica, Arial, sans-serif',
            count: 77,
            isFirstPlace: false,
        },
        {
            key: '"Times New Roman"',
            count: 66,
            isFirstPlace: false,
        },
        {
            key: '"Glyphicons Halflings"',
            count: 8,
            isFirstPlace: false,
        },
        {
            key: '"Material Design Icons"',
            count: 1,
            isFirstPlace: false,
        },
    ]
    const fontData = createFontData(req.fonts)
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
        siteType: 'landing',
        customComponents: widgetData.customComponents,
        vcita: widgetData.vcita,
    }
    return { siteLayout: layoutTemplate, siteIdentifier: apexID }
}
const pageReq = {
    id: '737969',
    modules: [
        {
            headline: 'Heating Service & Repair GUARANTEED',
            actionlbl: 'GIVE US A CALL',
            image: 'http://guaranteedservice.com/files/2023/03/heatingserviceaddl.jpg',
            subheader: 'Top Notch Technicians<br>24/7 Service<br>No Money Down Financing',
            type: 'dl',
            weblink: 'tel:+17323512519',
        },
        {
            type: 'coupon',
            image: 'http://nextgenprototype.production.townsquareinteractive.com/files/2024/03/50_off_any_service_coupon.png',
        },
        {
            type: 'form',
        },
        {
            type: 'banner',
            headline: 'FAST LOCAL SERVICE. <br> Contact Our Team Today!',
            actionlbl: 'CALL US NOW',
            weblink: 'tel:+17323512519',
        },
        {
            type: 'text content',
            desc1: 'Because of how much use your heating unit gets during the cold months, it experiences wear and tear and eventually may require repairs. However, before you experience complete system failure, it&#39;s important that you&#39;re aware of the signs your system needs repairs so we can fix them before they evolve into more serious and costly problems.',
            desc2: '<i>It doesn&#39;t emit enough warmth<br>It cycles on and off too often<br>It provides uneven heating throughout your home<br>It will not turn on or shut off<br>It makes unusual or loud noises<br>You need to frequently adjust the thermostat<br>You smell burning<br>Your energy bills are unusually high</i><br><br>It&#39;s extremely important that you don&#39;t ignore any of these symptoms. The sooner you call our New Jersey heating repair experts, the quicker we can diagnose the issue and perform the necessary repairs.',
            headline: 'Common symptoms of a malfunctioning heater include:',
        },
        {
            type: 'video',
            videoUrl: 'https://www.youtube.com/embed/HxZmwV60Sg0',
        },
        {
            type: 'headline',
            headline: 'Here&#39;s what our satisfied customers are saying...',
        },
        {
            type: 'reviews',
            reviews: [
                {
                    text: 'Already Recommended to Neighbors[rn]Got an estimate in 1 day and install 2 days later. Everything was amazingly smooth and effortless and our new system is fantastic. Love our new thermostats too. We were very pleased, especially right now when people are having so many problems getting supplies and equipment. Already recommended to neighbors.',
                    name: 'Nancy Troskey',
                },
                {
                    text: 'Professional & Friendly[rn]Truly great service! He was professional & friendly. He is clearly experienced because he installed a water-pressure sub pump backup system for us which is a complicated job. He came back again a couple of days later to replace an old leaking toilet. He was considerate with cleaning up afterwards too. I highly recommend Guaranteed Services & especially Rob.',
                },
                {
                    text: 'I Could Not Be Happier with the Service[rn]I am so impressed! I had a water leak and the technician came out to fix my problem shortly afterwards. I could not of been happier with his service. Barry was polite, honest and extremely hard working. I truly appreciate all he did to help me on a bad situation.I highly recommend Guaranteed Services for all your needs. Thanks again!!',
                },
                {
                    text: 'Now we have a great system with a lifetime warranty.[rn]These guys are the BEST. They replaced my old heating and air conditioning with energy star system. I love it. Quick and efficient. AL is a lovely young representative and he explained in detail what we getting. Brian, Tommy and Greg the installers, they worked very clean and they are wonderful. Now we have a great system with a lifetime warranty. Thank you GUARANTEED SERVICE.',
                    name: 'Kay G.',
                },
                {
                    text: 'Already Recommended to Neighbors[rn]Got an estimate in 1 day and install 2 days later. Everything was amazingly smooth and effortless and our new system is fantastic. Love our new thermostats too. We were very pleased, especially right now when people are having so many problems getting supplies and equipment. Already recommended to neighbors.',
                    name: 'Nancy Troskey',
                },
                {
                    text: 'Already Recommended to Neighbors[rn]Got an estimate in 1 day and install 2 days later. Everything was amazingly smooth and effortless and our new system is fantastic. Love our new thermostats too. We were very pleased, especially right now when people are having so many problems getting supplies and equipment. Already recommended to neighbors.',
                    name: 'Nancy Troskey',
                },
                {
                    text: 'Already Recommended to Neighbors[rn]Got an estimate in 1 day and install 2 days later. Everything was amazingly smooth and effortless and our new system is fantastic. Love our new thermostats too. We were very pleased, especially right now when people are having so many problems getting supplies and equipment. Already recommended to neighbors.',
                    name: 'Nancy Troskey',
                },
                {
                    text: 'Already Recommended to Neighbors[rn]Got an estimate in 1 day and install 2 days later. Everything was amazingly smooth and effortless and our new system is fantastic. Love our new thermostats too. We were very pleased, especially right now when people are having so many problems getting supplies and equipment. Already recommended to neighbors.',
                    name: 'Nancy Troskey',
                },
            ],
        },
        {
            type: 'banner',
            headline: 'Our Name Says It All. <br> Get Guaranteed Service 24/7',
            actionlbl: 'CALL US NOW',
            weblink: 'tel:+17323512519',
        },
    ],
    sections: [
        {
            headline: 'Heating Service & Repair GUARANTEED',
            ctaText: '',
            image: 'http://guaranteedservice.com/files/2023/03/heatingserviceaddl.jpg',
            subheader: 'Top Notch Technicians<br>24/7 Service<br>No Money Down Financing',
            ctaLink: 'tel:+17323512519',
            components: [{ type: 'coupon' }, { type: 'form' }],
        },
        {
            headline: 'FAST LOCAL SERVICE. <br> Contact Our Team Today!',
            desc: `Because of how much use your heating unit gets during the cold months, it experiences wear and tear and eventually may require repairs. However, before you experience complete system failure, it's important that you're aware of the signs your system needs repairs so we can fix them before they evolve into more serious and costly problems.`,
            ctaText: '',
            subheader: `Common symptoms of a malfunctioning heater include:`,
            desc2: '<i>It doesn&#39;t emit enough warmth<br>It cycles on and off too often<br>It provides uneven heating throughout your home<br>It will not turn on or shut off<br>It makes unusual or loud noises<br>You need to frequently adjust the thermostat<br>You smell burning<br>Your energy bills are unusually high</i><br><br>It&#39;s extremely important that you don&#39;t ignore any of these symptoms. The sooner you call our New Jersey heating repair experts, the quicker we can diagnose the issue and perform the necessary repairs.',
            ctaLink: 'tel:+17323512519',
            components: [{ type: 'video', videoUrl: 'https://www.youtube.com/embed/HxZmwV60Sg0' }],
        },
        {
            reviewHeadline: 'Here&#39;s what our satisfied customers are saying...',
            reviews: [
                {
                    text: 'Already Recommended to Neighbors<br>Got an estimate in 1 day and install 2 days later. Everything was amazingly smooth and effortless and our new system is fantastic. Love our new thermostats too. We were very pleased, especially right now when people are having so many problems getting supplies and equipment. Already recommended to neighbors.',
                    name: 'Nancy Troskey',
                },
                {
                    text: 'Professional & Friendly<br>Truly great service! He was professional & friendly. He is clearly experienced because he installed a water-pressure sub pump backup system for us which is a complicated job. He came back again a couple of days later to replace an old leaking toilet. He was considerate with cleaning up afterwards too. I highly recommend Guaranteed Services & especially Rob.',
                },
                {
                    text: 'I Could Not Be Happier with the Service<br>I am so impressed! I had a water leak and the technician came out to fix my problem shortly afterwards. I could not of been happier with his service. Barry was polite, honest and extremely hard working. I truly appreciate all he did to help me on a bad situation.I highly recommend Guaranteed Services for all your needs. Thanks again!!',
                },
                {
                    text: 'Now we have a great system with a lifetime warranty.<br>These guys are the BEST. They replaced my old heating and air conditioning with energy star system. I love it. Quick and efficient. AL is a lovely young representative and he explained in detail what we getting. Brian, Tommy and Greg the installers, they worked very clean and they are wonderful. Now we have a great system with a lifetime warranty. Thank you GUARANTEED SERVICE.',
                    name: 'Kay G.',
                },
                {
                    text: 'Already Recommended to Neighbors<br>Got an estimate in 1 day and install 2 days later. Everything was amazingly smooth and effortless and our new system is fantastic. Love our new thermostats too. We were very pleased, especially right now when people are having so many problems getting supplies and equipment. Already recommended to neighbors.',
                    name: 'Nancy Troskey',
                },
                {
                    text: 'Already Recommended to Neighbors<br>Got an estimate in 1 day and install 2 days later. Everything was amazingly smooth and effortless and our new system is fantastic. Love our new thermostats too. We were very pleased, especially right now when people are having so many problems getting supplies and equipment. Already recommended to neighbors.',
                    name: 'Nancy Troskey',
                },
                {
                    text: 'Already Recommended to Neighbors<br>Got an estimate in 1 day and install 2 days later. Everything was amazingly smooth and effortless and our new system is fantastic. Love our new thermostats too. We were very pleased, especially right now when people are having so many problems getting supplies and equipment. Already recommended to neighbors.',
                    name: 'Nancy Troskey',
                },
                {
                    text: 'Already Recommended to Neighbors<br>Got an estimate in 1 day and install 2 days later. Everything was amazingly smooth and effortless and our new system is fantastic. Love our new thermostats too. We were very pleased, especially right now when people are having so many problems getting supplies and equipment. Already recommended to neighbors.',
                    name: 'Nancy Troskey',
                },
            ],
            headline: 'Our Name Says It All. <br> Get Guaranteed Service 24/7',
            ctaText: '',
            ctaLink: 'tel:+17323512519',
        },
    ],
}
const createPageFile = (req) => {
    const title = 'landing'
    const slug = 'landing'
    const sectionModules = createModulesWithSections(req.page.sections)
    const modules = createModules(sectionModules, req.colors, removeWhiteSpace(req.phoneNumber || ''))
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
            title: req.title || req.seo?.global.aiosp_home_title || '',
            descr: req.description || req.seo?.global.aiosp_home_description || '',
            selectedImages: '',
            imageOverride: '',
        },
    }
    return page
}
const createModules = (modules, colors, phoneNumber) => {
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
export const createLandingPageFiles = async (req, apexID) => {
    try {
        const layoutContents = await createLayoutFile(req, apexID)
        const page = createPageFile(req)
        return { siteLayout: layoutContents.siteLayout, siteIdentifier: layoutContents.siteIdentifier, pages: [page] }
    } catch (err) {
        throw new TransformError({ message: err.message, errorID: 'GEN-003' })
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZGluZy1jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbnRyb2xsZXJzL2xhbmRpbmctY29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixFQUFFLE1BQU0sYUFBYSxDQUFBO0FBQy9ELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHFCQUFxQixDQUFBO0FBQzVELE9BQU8sRUFDSCxvQkFBb0IsRUFDcEIsY0FBYyxFQUNkLHlCQUF5QixFQUN6QixpQkFBaUIsRUFDakIsZ0JBQWdCLEVBQ2hCLGVBQWUsRUFDZixlQUFlLEdBQ2xCLE1BQU0scUJBQXFCLENBQUE7QUFFNUIsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLG1CQUFtQixDQUFBO0FBRTdDLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxjQUFjLENBQUE7QUFFN0MsTUFBTSxTQUFTLEdBQUc7SUFDZCxJQUFJLEVBQUUsa0VBQWtFO0lBQ3hFLE9BQU8sRUFBRTtRQUNMLDZDQUE2QztRQUM3Qyx5REFBeUQ7UUFDekQsNktBQTZLO1FBQzdLLDZDQUE2QztRQUM3QywwQ0FBMEM7S0FDN0M7SUFDRCxPQUFPLEVBQUU7UUFDTCxHQUFHLEVBQUUsT0FBTztRQUNaLElBQUksRUFBRSxXQUFXO1FBQ2pCLElBQUksRUFBRSxvQkFBb0I7UUFDMUIsS0FBSyxFQUFFLElBQUk7UUFDWCxNQUFNLEVBQUUsRUFBRTtRQUNWLE9BQU8sRUFBRSxFQUFFO1FBQ1gsV0FBVyxFQUFFO1lBQ1QsR0FBRyxFQUFFLFdBQVc7WUFDaEIsSUFBSSxFQUFFLFlBQVk7U0FDckI7UUFDRCxHQUFHLEVBQUUsMENBQTBDO0tBQ2xEO0lBQ0QsUUFBUSxFQUFFLG9CQUFvQjtJQUM5QixXQUFXLEVBQUUsZ0JBQWdCO0lBQzdCLEtBQUssRUFBRSw0QkFBNEI7SUFDbkMsR0FBRyxFQUFFLHVCQUF1QjtJQUM1QixHQUFHLEVBQUU7UUFDRCxNQUFNLEVBQUU7WUFDSixnQkFBZ0IsRUFBRSw0RUFBNEU7WUFDOUYsbUJBQW1CLEVBQUUsNkNBQTZDO1lBQ2xFLHNCQUFzQixFQUFFLCtHQUErRztZQUN2SSx1QkFBdUIsRUFBRSw2QkFBNkI7WUFDdEQsd0JBQXdCLEVBQUUsZUFBZTtZQUN6QyxzQkFBc0IsRUFBRSxtQ0FBbUM7U0FDOUQ7S0FDSjtJQUNELE1BQU0sRUFBRSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRTtJQUNqRCxPQUFPLEVBQUUsK0ZBQStGO0lBQ3hHLGdCQUFnQixFQUFFO1FBQ2QsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxrQ0FBa0MsRUFBRTtRQUMvRCxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLEVBQUUsMkJBQTJCLEVBQUU7S0FDbEU7Q0FDSixDQUFBO0FBRUQsTUFBTSxDQUFDLE1BQU0sZ0JBQWdCLEdBQUcsS0FBSyxFQUFFLEdBQVEsRUFBRSxNQUFjLEVBQUUsRUFBRTtJQUMvRCxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFBO0lBQ3JCLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUE7SUFDM0IsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQTtJQUMzQixNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFBO0lBQzdCLE1BQU0sV0FBVyxHQUFHLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQTtJQUNyRCxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFBO0lBQ3ZCLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUE7SUFDbkIsTUFBTSxNQUFNLEdBQWtCLEdBQUcsQ0FBQyxNQUFNLENBQUE7SUFDeEMsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQTtJQUMzQixNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFBO0lBQ25CLElBQUksZ0JBQWdCLEdBQUcsR0FBRyxDQUFDLGdCQUFnQixDQUFBO0lBQzNDLE1BQU0sYUFBYSxHQUFXLE1BQU0sU0FBUyxDQUFDLEdBQUcsTUFBTSxjQUFjLEVBQUUsc0JBQXNCLENBQUMsQ0FBQTtJQUU5Rix3Q0FBd0M7SUFDeEMsSUFBSSxnQkFBZ0IsRUFBRSxNQUFNLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3ZDLGdCQUFnQixHQUFHLG9CQUFvQixDQUFDLGdCQUFnQixFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUM3RSxDQUFDO0lBRUQsTUFBTSxXQUFXLEdBQUc7UUFDaEIsU0FBUyxFQUFFLFNBQVM7UUFDcEIsWUFBWSxFQUFFLE1BQU0sQ0FBQyxNQUFNLElBQUksU0FBUztRQUN4QyxlQUFlLEVBQUUsTUFBTSxDQUFDLE1BQU0sSUFBSSxTQUFTO1FBQzNDLFNBQVMsRUFBRSxTQUFTO1FBQ3BCLFNBQVMsRUFBRSxNQUFNLENBQUMsT0FBTyxJQUFJLFNBQVM7UUFDdEMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxPQUFPLElBQUksU0FBUztRQUN0QyxPQUFPLEVBQUUsU0FBUztRQUNsQixhQUFhLEVBQUUsTUFBTSxDQUFDLE9BQU8sSUFBSSxTQUFTO1FBQzFDLGVBQWUsRUFBRSxTQUFTO1FBQzFCLGVBQWUsRUFBRSxTQUFTO1FBQzFCLFFBQVEsRUFBRSxTQUFTO1FBQ25CLFdBQVcsRUFBRSxTQUFTO1FBQ3RCLGlCQUFpQixFQUFFLFNBQVM7UUFDNUIsUUFBUSxFQUFFLFNBQVM7UUFDbkIsYUFBYSxFQUFFLFNBQVM7UUFDeEIsV0FBVyxFQUFFLFNBQVM7UUFDdEIsaUJBQWlCLEVBQUUsaUJBQWlCO1FBQ3BDLE9BQU8sRUFBRSxTQUFTO1FBQ2xCLFFBQVEsRUFBRSxNQUFNLENBQUMsT0FBTyxJQUFJLFNBQVM7UUFDckMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxPQUFPLElBQUksU0FBUztRQUN2QyxjQUFjLEVBQUUsU0FBUztRQUN6QixXQUFXLEVBQUUscUJBQXFCO1FBQ2xDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxxQkFBcUI7UUFDM0YsZ0JBQWdCLEVBQUUsU0FBUztRQUMzQixxQkFBcUIsRUFBRSxNQUFNLENBQUMsTUFBTSxJQUFJLFNBQVM7UUFDakQsY0FBYyxFQUFFLE1BQU0sQ0FBQyxNQUFNLElBQUksU0FBUztRQUMxQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxNQUFNO1FBQzdGLFVBQVUsRUFBRSxNQUFNLENBQUMsVUFBVSxJQUFJLE1BQU07UUFDdkMsa0JBQWtCLEVBQUUsTUFBTSxDQUFDLFVBQVUsSUFBSSxFQUFFO1FBQzNDLFVBQVUsRUFBRSxNQUFNLENBQUMsUUFBUSxJQUFJLFNBQVM7UUFDeEMsU0FBUyxFQUFFLFNBQVM7UUFDcEIsVUFBVSxFQUFFLE1BQU0sQ0FBQyxPQUFPLElBQUksU0FBUztRQUN2QyxXQUFXLEVBQUUsTUFBTSxDQUFDLE1BQU0sSUFBSSxTQUFTO1FBQ3ZDLFdBQVcsRUFBRSxNQUFNLENBQUMsUUFBUSxJQUFJLFNBQVM7UUFDekMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxNQUFNLElBQUksU0FBUztRQUN2QyxXQUFXLEVBQUUsTUFBTSxDQUFDLFFBQVEsSUFBSSxTQUFTO1FBQ3pDLFdBQVcsRUFBRSxNQUFNLENBQUMsTUFBTSxJQUFJLFNBQVM7S0FDMUMsQ0FBQTtJQUVELE1BQU0sVUFBVSxHQUFHLGdCQUFnQixDQUFDLGdCQUFnQixJQUFJLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxJQUFJLEVBQUUsRUFBRSxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUE7SUFFM0csTUFBTSxtQkFBbUIsR0FBRztRQUN4QjtZQUNJLEdBQUcsRUFBRSw0Q0FBNEM7WUFDakQsS0FBSyxFQUFFLElBQUk7WUFDWCxZQUFZLEVBQUUsSUFBSTtTQUNyQjtRQUNEO1lBQ0ksR0FBRyxFQUFFLDJDQUEyQztZQUNoRCxLQUFLLEVBQUUsRUFBRTtZQUNULFlBQVksRUFBRSxLQUFLO1NBQ3RCO1FBQ0Q7WUFDSSxHQUFHLEVBQUUsbUJBQW1CO1lBQ3hCLEtBQUssRUFBRSxFQUFFO1lBQ1QsWUFBWSxFQUFFLEtBQUs7U0FDdEI7UUFDRDtZQUNJLEdBQUcsRUFBRSx3QkFBd0I7WUFDN0IsS0FBSyxFQUFFLENBQUM7WUFDUixZQUFZLEVBQUUsS0FBSztTQUN0QjtRQUNEO1lBQ0ksR0FBRyxFQUFFLHlCQUF5QjtZQUM5QixLQUFLLEVBQUUsQ0FBQztZQUNSLFlBQVksRUFBRSxLQUFLO1NBQ3RCO0tBQ0osQ0FBQTtJQUVELE1BQU0sUUFBUSxHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUE7SUFFMUMsTUFBTSxTQUFTLEdBQUcsTUFBTSxzQkFBc0IsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQTtJQUUvRyxzRUFBc0U7SUFDdEUsTUFBTSxjQUFjLEdBQUc7UUFDbkIsS0FBSyxFQUFFO1lBQ0gsTUFBTSxFQUFFO2dCQUNKLEdBQUcsRUFBRSxHQUFHO2dCQUNSLEtBQUssRUFBRTtvQkFDSDt3QkFDSSxJQUFJLEVBQUUsQ0FBQzt3QkFDUCxJQUFJLEVBQUUsT0FBTzt3QkFDYixNQUFNLEVBQUUsRUFBRTt3QkFDVixRQUFRLEVBQUUsS0FBSzt3QkFDZixTQUFTLEVBQUUsUUFBUTt3QkFDbkIsU0FBUyxFQUFFLElBQUk7d0JBQ2YsVUFBVSxFQUFFLEdBQUc7cUJBQ2xCO29CQUNEO3dCQUNJLE1BQU0sRUFBRSxFQUFFO3FCQUNiO29CQUNEO3dCQUNJLE1BQU0sRUFBRSxFQUFFO3FCQUNiO2lCQUNKO2dCQUNELFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUNuQjtZQUNELE1BQU0sRUFBRTtnQkFDSixHQUFHLEVBQUUsR0FBRztnQkFDUixLQUFLLEVBQUU7b0JBQ0g7d0JBQ0ksSUFBSSxFQUFFLENBQUM7d0JBQ1AsSUFBSSxFQUFFLE9BQU87d0JBQ2IsTUFBTSxFQUFFLEVBQUU7d0JBQ1YsUUFBUSxFQUFFLEtBQUs7d0JBQ2YsU0FBUyxFQUFFLFFBQVE7d0JBQ25CLFNBQVMsRUFBRSxJQUFJO3dCQUNmLFVBQVUsRUFBRSxHQUFHO3FCQUNsQjtvQkFDRDt3QkFDSSxJQUFJLEVBQUUsQ0FBQzt3QkFDUCxJQUFJLEVBQUUsTUFBTTt3QkFDWixNQUFNLEVBQUUsRUFBRTt3QkFDVixRQUFRLEVBQUUsS0FBSzt3QkFDZixTQUFTLEVBQUUsTUFBTTt3QkFDakIsU0FBUyxFQUFFLEVBQUU7d0JBQ2IsVUFBVSxFQUFFLEdBQUc7cUJBQ2xCO29CQUNEO3dCQUNJLElBQUksRUFBRSxDQUFDO3dCQUNQLElBQUksRUFBRSxNQUFNO3dCQUNaLE1BQU0sRUFBRSxFQUFFO3dCQUNWLFFBQVEsRUFBRSxLQUFLO3dCQUNmLFNBQVMsRUFBRSxNQUFNO3dCQUNqQixTQUFTLEVBQUUsRUFBRTt3QkFDYixVQUFVLEVBQUUsR0FBRztxQkFDbEI7aUJBQ0o7Z0JBQ0QsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ25CO1lBQ0QsTUFBTSxFQUFFO2dCQUNKLEdBQUcsRUFBRSxHQUFHO2dCQUNSLEtBQUssRUFBRTtvQkFDSDt3QkFDSSxJQUFJLEVBQUUsQ0FBQzt3QkFDUCxJQUFJLEVBQUUsT0FBTzt3QkFDYixNQUFNLEVBQUUsRUFBRTt3QkFDVixRQUFRLEVBQUUsS0FBSzt3QkFDZixTQUFTLEVBQUUsUUFBUTt3QkFDbkIsU0FBUyxFQUFFLElBQUk7d0JBQ2YsVUFBVSxFQUFFLEdBQUc7cUJBQ2xCO29CQUNEO3dCQUNJLE1BQU0sRUFBRSxFQUFFO3FCQUNiO29CQUNEO3dCQUNJLE1BQU0sRUFBRSxFQUFFO3FCQUNiO2lCQUNKO2dCQUNELFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUNuQjtTQUNKO1FBQ0QsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQy9DLE9BQU8sRUFBRTtZQUNMLEtBQUssRUFBRTtnQkFDSDtvQkFDSSxJQUFJLEVBQUUsRUFBRTtvQkFDUixLQUFLLEVBQUUsRUFBRTtvQkFDVCxRQUFRLEVBQUUsRUFBRTtvQkFDWixjQUFjLEVBQUUsS0FBSztpQkFDeEI7YUFDSjtZQUNELEtBQUssRUFBRTtnQkFDSDtvQkFDSSxJQUFJLEVBQUUsT0FBTztvQkFDYixNQUFNLEVBQUUsV0FBVztvQkFDbkIsUUFBUSxFQUFFLEVBQUU7b0JBQ1osY0FBYyxFQUFFLElBQUk7aUJBQ3ZCO2FBQ0o7WUFDRCxPQUFPLEVBQUUsT0FBTztZQUNoQixlQUFlLEVBQUUsSUFBSTtZQUNyQix5QkFBeUIsRUFBRSxFQUFFO1lBQzdCLHlCQUF5QixFQUFFLE9BQU87WUFDbEMsMEJBQTBCLEVBQUUsV0FBVztZQUN2QywyQkFBMkIsRUFBRSxLQUFLO1lBQ2xDLGNBQWMsRUFBRSxLQUFLO1NBQ3hCO1FBQ0QsUUFBUSxFQUFFLFFBQVE7UUFDbEIsV0FBVyxFQUFFLFdBQVc7UUFDeEIsS0FBSyxFQUFFLEtBQUs7UUFDWixHQUFHLEVBQUUsR0FBRztRQUNSLE1BQU0sRUFBRTtZQUNKO2dCQUNJLEVBQUUsRUFBRSxNQUFNO2dCQUNWLFlBQVksRUFBRSxLQUFLO2dCQUNuQixLQUFLLEVBQUUsTUFBTTtnQkFDYixTQUFTLEVBQUUsZUFBZTtnQkFDMUIsSUFBSSxFQUFFLFdBQVc7Z0JBQ2pCLGdCQUFnQixFQUFFLENBQUM7Z0JBQ25CLFNBQVMsRUFBRSxNQUFNO2dCQUNqQixNQUFNLEVBQUUsTUFBTTtnQkFDZCxNQUFNLEVBQUUsRUFBRTtnQkFDVixPQUFPLEVBQUUsSUFBSTtnQkFDYixVQUFVLEVBQUUsQ0FBQztnQkFDYixNQUFNLEVBQUUsSUFBSTtnQkFDWixHQUFHLEVBQUUsR0FBRztnQkFDUixPQUFPLEVBQUUsRUFBRTtnQkFDWCxJQUFJLEVBQUUsTUFBTTthQUNmO1NBQ0o7UUFDRCxHQUFHLEVBQUUsR0FBRztRQUNSLFNBQVMsRUFBRSxXQUFXO1FBQ3RCLEtBQUssRUFBRSx3QkFBd0I7UUFDL0IsTUFBTSxFQUFFLEdBQUc7UUFDWCxRQUFRLEVBQUUsTUFBTTtRQUNoQixPQUFPLEVBQUUsT0FBTztRQUNoQixVQUFVLEVBQUUsUUFBUSxDQUFDLFVBQVU7UUFDL0IsZ0JBQWdCLEVBQUUsYUFBYSxDQUFDLGdCQUFnQixJQUFJLEVBQUU7UUFDdEQsTUFBTSxFQUFFO1lBQ0osU0FBUyxFQUFFLEVBQUU7WUFDYixPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRO1NBQ2hDO1FBQ0QsTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFLFNBQVMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLFNBQVMsQ0FBQyxNQUFNLEVBQUU7UUFDOUQsYUFBYSxFQUFFO1lBQ1gsT0FBTyxFQUFFLFVBQVUsQ0FBQyxhQUFhLENBQUMsY0FBYztZQUNoRCxPQUFPLEVBQUUsSUFBSTtZQUNiLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxhQUFhLENBQUMsbUJBQW1CO1NBQ2pFO1FBQ0QsUUFBUSxFQUFFLFNBQVM7UUFDbkIsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLGdCQUFnQjtRQUM3QyxLQUFLLEVBQUUsVUFBVSxDQUFDLEtBQUs7S0FDMUIsQ0FBQTtJQUVELE9BQU8sRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsQ0FBQTtBQUNqRSxDQUFDLENBQUE7QUFFRCxNQUFNLE9BQU8sR0FBRztJQUNaLEVBQUUsRUFBRSxRQUFRO0lBQ1osT0FBTyxFQUFFO1FBQ0w7WUFDSSxRQUFRLEVBQUUscUNBQXFDO1lBQy9DLFNBQVMsRUFBRSxnQkFBZ0I7WUFDM0IsS0FBSyxFQUFFLG1FQUFtRTtZQUMxRSxTQUFTLEVBQUUsa0VBQWtFO1lBQzdFLElBQUksRUFBRSxJQUFJO1lBQ1YsT0FBTyxFQUFFLGtCQUFrQjtTQUM5QjtRQUNEO1lBQ0ksSUFBSSxFQUFFLFFBQVE7WUFDZCxLQUFLLEVBQUUsMEdBQTBHO1NBQ3BIO1FBQ0Q7WUFDSSxJQUFJLEVBQUUsTUFBTTtTQUNmO1FBQ0Q7WUFDSSxJQUFJLEVBQUUsUUFBUTtZQUNkLFFBQVEsRUFBRSxrREFBa0Q7WUFDNUQsU0FBUyxFQUFFLGFBQWE7WUFDeEIsT0FBTyxFQUFFLGtCQUFrQjtTQUM5QjtRQUNEO1lBQ0ksSUFBSSxFQUFFLGNBQWM7WUFDcEIsS0FBSyxFQUFFLDhWQUE4VjtZQUNyVyxLQUFLLEVBQUUsMmdCQUEyZ0I7WUFDbGhCLFFBQVEsRUFBRSxxREFBcUQ7U0FDbEU7UUFDRDtZQUNJLElBQUksRUFBRSxPQUFPO1lBQ2IsUUFBUSxFQUFFLDJDQUEyQztTQUN4RDtRQUNEO1lBQ0ksSUFBSSxFQUFFLFVBQVU7WUFDaEIsUUFBUSxFQUFFLHVEQUF1RDtTQUNwRTtRQUNEO1lBQ0ksSUFBSSxFQUFFLFNBQVM7WUFDZixPQUFPLEVBQUU7Z0JBQ0w7b0JBQ0ksSUFBSSxFQUFFLDJWQUEyVjtvQkFDalcsSUFBSSxFQUFFLGVBQWU7aUJBQ3hCO2dCQUNEO29CQUNJLElBQUksRUFBRSxvWUFBb1k7aUJBQzdZO2dCQUNEO29CQUNJLElBQUksRUFBRSw2WEFBNlg7aUJBQ3RZO2dCQUNEO29CQUNJLElBQUksRUFBRSxxYkFBcWI7b0JBQzNiLElBQUksRUFBRSxRQUFRO2lCQUNqQjtnQkFDRDtvQkFDSSxJQUFJLEVBQUUsMlZBQTJWO29CQUNqVyxJQUFJLEVBQUUsZUFBZTtpQkFDeEI7Z0JBQ0Q7b0JBQ0ksSUFBSSxFQUFFLDJWQUEyVjtvQkFDalcsSUFBSSxFQUFFLGVBQWU7aUJBQ3hCO2dCQUNEO29CQUNJLElBQUksRUFBRSwyVkFBMlY7b0JBQ2pXLElBQUksRUFBRSxlQUFlO2lCQUN4QjtnQkFDRDtvQkFDSSxJQUFJLEVBQUUsMlZBQTJWO29CQUNqVyxJQUFJLEVBQUUsZUFBZTtpQkFDeEI7YUFDSjtTQUNKO1FBQ0Q7WUFDSSxJQUFJLEVBQUUsUUFBUTtZQUNkLFFBQVEsRUFBRSx3REFBd0Q7WUFDbEUsU0FBUyxFQUFFLGFBQWE7WUFDeEIsT0FBTyxFQUFFLGtCQUFrQjtTQUM5QjtLQUNKO0lBQ0QsUUFBUSxFQUFFO1FBQ047WUFDSSxRQUFRLEVBQUUscUNBQXFDO1lBQy9DLE9BQU8sRUFBRSxFQUFFO1lBQ1gsS0FBSyxFQUFFLG1FQUFtRTtZQUMxRSxTQUFTLEVBQUUsa0VBQWtFO1lBQzdFLE9BQU8sRUFBRSxrQkFBa0I7WUFDM0IsVUFBVSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUM7U0FDckQ7UUFDRDtZQUNJLFFBQVEsRUFBRSxrREFBa0Q7WUFDNUQsSUFBSSxFQUFFLHNWQUFzVjtZQUM1VixPQUFPLEVBQUUsRUFBRTtZQUNYLFNBQVMsRUFBRSxxREFBcUQ7WUFDaEUsS0FBSyxFQUFFLDJnQkFBMmdCO1lBQ2xoQixPQUFPLEVBQUUsa0JBQWtCO1lBQzNCLFVBQVUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsMkNBQTJDLEVBQUUsQ0FBQztTQUN6RjtRQUNEO1lBQ0ksY0FBYyxFQUFFLHVEQUF1RDtZQUN2RSxPQUFPLEVBQUU7Z0JBQ0w7b0JBQ0ksSUFBSSxFQUFFLDJWQUEyVjtvQkFDalcsSUFBSSxFQUFFLGVBQWU7aUJBQ3hCO2dCQUNEO29CQUNJLElBQUksRUFBRSxvWUFBb1k7aUJBQzdZO2dCQUNEO29CQUNJLElBQUksRUFBRSw2WEFBNlg7aUJBQ3RZO2dCQUNEO29CQUNJLElBQUksRUFBRSxxYkFBcWI7b0JBQzNiLElBQUksRUFBRSxRQUFRO2lCQUNqQjtnQkFDRDtvQkFDSSxJQUFJLEVBQUUsMlZBQTJWO29CQUNqVyxJQUFJLEVBQUUsZUFBZTtpQkFDeEI7Z0JBQ0Q7b0JBQ0ksSUFBSSxFQUFFLDJWQUEyVjtvQkFDalcsSUFBSSxFQUFFLGVBQWU7aUJBQ3hCO2dCQUNEO29CQUNJLElBQUksRUFBRSwyVkFBMlY7b0JBQ2pXLElBQUksRUFBRSxlQUFlO2lCQUN4QjtnQkFDRDtvQkFDSSxJQUFJLEVBQUUsMlZBQTJWO29CQUNqVyxJQUFJLEVBQUUsZUFBZTtpQkFDeEI7YUFDSjtZQUNELFFBQVEsRUFBRSx3REFBd0Q7WUFDbEUsT0FBTyxFQUFFLEVBQUU7WUFDWCxPQUFPLEVBQUUsa0JBQWtCO1NBQzlCO0tBQ0o7Q0FDSixDQUFBO0FBRUQsTUFBTSxjQUFjLEdBQUcsQ0FBQyxHQUFVLEVBQUUsRUFBRTtJQUNsQyxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUE7SUFDdkIsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFBO0lBRXRCLE1BQU0sY0FBYyxHQUFHLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDbkUsTUFBTSxPQUFPLEdBQUcsYUFBYSxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsTUFBTSxFQUFFLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxXQUFXLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUVsRyxNQUFNLElBQUksR0FBRztRQUNULElBQUksRUFBRTtZQUNGLEVBQUUsRUFBRSxRQUFRO1lBQ1osS0FBSyxFQUFFLEtBQUs7WUFDWixJQUFJLEVBQUUsSUFBSTtZQUNWLFFBQVEsRUFBRSxPQUFPO1lBQ2pCLEdBQUcsRUFBRSxHQUFHO1lBQ1IsRUFBRSxFQUFFLEVBQUU7WUFDTixJQUFJLEVBQUUsTUFBTTtZQUNaLE1BQU0sRUFBRSxDQUFDO1lBQ1QsT0FBTyxFQUFFLENBQUM7WUFDVixPQUFPLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO1lBQ2xDLFFBQVEsRUFBRTtnQkFDTjtvQkFDSSxJQUFJLEVBQUUsTUFBTTtpQkFDZjtnQkFDRDtvQkFDSSxJQUFJLEVBQUUsS0FBSztpQkFDZDthQUNKO1lBQ0QsU0FBUyxFQUFFLENBQUM7WUFDWixXQUFXLEVBQUUsRUFBRTtZQUNmLFlBQVksRUFBRSxhQUFhO1lBQzNCLE9BQU8sRUFBRSxFQUFFO1lBQ1gsVUFBVSxFQUFFLEVBQUU7U0FDakI7UUFDRCxLQUFLLEVBQUUsRUFBRTtRQUNULEdBQUcsRUFBRTtZQUNELEtBQUssRUFBRSxHQUFHLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixJQUFJLEVBQUU7WUFDMUQsS0FBSyxFQUFFLEdBQUcsQ0FBQyxXQUFXLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsc0JBQXNCLElBQUksRUFBRTtZQUN0RSxjQUFjLEVBQUUsRUFBRTtZQUNsQixhQUFhLEVBQUUsRUFBRTtTQUNwQjtLQUNKLENBQUE7SUFFRCxPQUFPLElBQUksQ0FBQTtBQUNmLENBQUMsQ0FBQTtBQUVELE1BQU0sYUFBYSxHQUFHLENBQUMsT0FBc0IsRUFBRSxNQUFxQixFQUFFLFdBQW1CLEVBQUUsRUFBRTtJQUN6RixJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUE7SUFDbkIsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFBO0lBQ2hCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDdEMsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzdCLElBQUksTUFBTSxDQUFBO1FBQ1YsSUFBSSxVQUFVLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRSxDQUFDO1lBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQTtZQUNqRCxNQUFNLEdBQUc7Z0JBQ0wsVUFBVSxFQUFFO29CQUNSLEVBQUUsRUFBRSxzQ0FBc0M7b0JBQzFDLEdBQUcsRUFBRSxzQ0FBc0M7b0JBQzNDLElBQUksRUFBRSxZQUFZO29CQUNsQixLQUFLLEVBQUUsTUFBTTtvQkFDYixLQUFLLEVBQUU7d0JBQ0g7NEJBQ0ksS0FBSyxFQUFFLFFBQVE7NEJBQ2YsS0FBSyxFQUFFLFVBQVUsQ0FBQyxLQUFLOzRCQUN2QixNQUFNLEVBQUUsTUFBTTs0QkFDZCxPQUFPLEVBQUUsY0FBYzs0QkFDdkIsUUFBUSxFQUFFLGVBQWUsQ0FBQyxVQUFVLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQzs0QkFDcEQsU0FBUyxFQUFFLFVBQVUsQ0FBQyxTQUFTOzRCQUMvQixTQUFTLEVBQUUsR0FBRzs0QkFDZCxTQUFTLEVBQUU7Z0NBQ1AsS0FBSyxFQUFFLElBQUk7Z0NBQ1gsTUFBTSxFQUFFLElBQUk7Z0NBQ1osSUFBSSxFQUFFLFdBQVc7NkJBQ3BCOzRCQUNELFNBQVMsRUFBRSxNQUFNLENBQUMsTUFBTTs0QkFDeEIsU0FBUyxFQUFFLEdBQUc7NEJBQ2QsU0FBUyxFQUFFLFVBQVUsQ0FBQyxTQUFTOzRCQUMvQixVQUFVLEVBQUUsRUFBRTs0QkFDZCxVQUFVLEVBQUUsSUFBSTs0QkFDaEIsVUFBVSxFQUFFLEdBQUc7NEJBQ2YsVUFBVSxFQUFFLGNBQWM7NEJBQzFCLFNBQVMsRUFBRTtnQ0FDUCxVQUFVLEVBQUUsTUFBTSxDQUFDLE1BQU07NkJBQzVCOzRCQUNELEtBQUssRUFBRTtnQ0FDSCxPQUFPLEVBQUUsVUFBVSxDQUFDLE9BQU8sSUFBSSxPQUFPLFdBQVcsRUFBRSxJQUFJLE9BQU8sV0FBVyxFQUFFOzZCQUM5RTs0QkFDRCxTQUFTLEVBQUUsTUFBTTs0QkFDakIsVUFBVSxFQUFFO2dDQUNSO29DQUNJLElBQUksRUFBRSxNQUFNO29DQUNaLElBQUksRUFBRSxVQUFVLENBQUMsT0FBTyxJQUFJLE9BQU8sV0FBVyxFQUFFO29DQUNoRCxNQUFNLEVBQUUsR0FBRztvQ0FDWCxLQUFLLEVBQUUsVUFBVSxDQUFDLFNBQVM7b0NBQzNCLE1BQU0sRUFBRSxJQUFJO29DQUNaLE9BQU8sRUFBRSw4QkFBOEI7b0NBQ3ZDLE9BQU8sRUFBRSxRQUFRO29DQUNqQixRQUFRLEVBQUUsS0FBSztvQ0FDZixRQUFRLEVBQUUsS0FBSztvQ0FDZixVQUFVLEVBQUUsQ0FBQyxDQUFDO29DQUNkLFFBQVEsRUFBRSxPQUFPO2lDQUNwQjtnQ0FDRDtvQ0FDSSxJQUFJLEVBQUUsTUFBTTtvQ0FDWixNQUFNLEVBQUUsR0FBRztvQ0FDWCxNQUFNLEVBQUUsS0FBSztvQ0FDYixPQUFPLEVBQUUsZUFBZTtvQ0FDeEIsT0FBTyxFQUFFLFFBQVE7b0NBQ2pCLFFBQVEsRUFBRSxLQUFLO29DQUNmLFFBQVEsRUFBRSxLQUFLO29DQUNmLFVBQVUsRUFBRSxDQUFDLENBQUM7aUNBQ2pCOzZCQUNKOzRCQUNELFNBQVMsRUFBRSxLQUFLOzRCQUNoQixRQUFRLEVBQUUsQ0FBQzs0QkFDWCxVQUFVLEVBQUUsSUFBSTs0QkFDaEIsYUFBYSxFQUFFLElBQUk7NEJBQ25CLFlBQVksRUFBRSxLQUFLOzRCQUNuQixhQUFhLEVBQUUsSUFBSTs0QkFDbkIsU0FBUyxFQUFFLENBQUM7NEJBQ1osU0FBUyxFQUFFLEVBQUU7NEJBQ2IsY0FBYyxFQUFFLE9BQU87NEJBQ3ZCLGVBQWUsRUFBRSxLQUFLO3lCQUN6QjtxQkFDSjtvQkFDRCxLQUFLLEVBQUUsRUFBRTtvQkFDVCxPQUFPLEVBQUUsQ0FBQztvQkFDVixPQUFPLEVBQUUsa0JBQWtCO29CQUMzQixZQUFZLEVBQUUsQ0FBQztvQkFDZixZQUFZLEVBQUUsRUFBRTtvQkFDaEIsZUFBZSxFQUFFLHdCQUF3QjtvQkFDekMsS0FBSyxFQUFFLHNDQUFzQztvQkFDN0MsUUFBUSxFQUFFLFFBQVE7b0JBQ2xCLGNBQWMsRUFBRSxDQUFDO29CQUNqQixjQUFjLEVBQUUsS0FBSztpQkFDeEI7Z0JBQ0QsYUFBYSxFQUFFLFVBQVU7YUFDNUIsQ0FBQTtRQUNMLENBQUM7YUFBTSxJQUFJLFVBQVUsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDdEMsNEdBQTRHO1lBQzVHLE1BQU0sR0FBRztnQkFDTCxVQUFVLEVBQUU7b0JBQ1IsRUFBRSxFQUFFLHNDQUFzQztvQkFDMUMsR0FBRyxFQUFFLHNDQUFzQztvQkFDM0MsSUFBSSxFQUFFLFdBQVc7b0JBQ2pCLEtBQUssRUFBRTt3QkFDSDs0QkFDSSxLQUFLLEVBQUUsUUFBUTs0QkFDZixLQUFLLEVBQUUsVUFBVSxDQUFDLEtBQUs7NEJBQ3ZCLFNBQVMsRUFBRTtnQ0FDUCxHQUFHLEVBQUUsOENBQThDO2dDQUNuRCxLQUFLLEVBQUUsSUFBSTtnQ0FDWCxNQUFNLEVBQUUsSUFBSTtnQ0FDWixJQUFJLEVBQUUsV0FBVzs2QkFDcEI7NEJBQ0QsU0FBUyxFQUFFLEdBQUc7NEJBQ2QsU0FBUyxFQUFFLFFBQVE7NEJBQ25CLFNBQVMsRUFBRSxDQUFDO3lCQUNmO3FCQUNKO29CQUNELE9BQU8sRUFBRSxDQUFDO29CQUNWLE9BQU8sRUFBRSxXQUFXO29CQUNwQixTQUFTLEVBQUUsQ0FBQztvQkFDWixZQUFZLEVBQUUsQ0FBQztvQkFDZixlQUFlLEVBQUUscUJBQXFCO29CQUN0QyxLQUFLLEVBQUUsc0NBQXNDO29CQUM3QyxRQUFRLEVBQUUsUUFBUTtvQkFDbEIsY0FBYyxFQUFFLENBQUM7b0JBQ2pCLGNBQWMsRUFBRSxLQUFLO2lCQUN4QjtnQkFDRCxhQUFhLEVBQUUsU0FBUzthQUMzQixDQUFBO1FBQ0wsQ0FBQzthQUFNLElBQUksVUFBVSxDQUFDLElBQUksS0FBSyxNQUFNLEVBQUUsQ0FBQztZQUNwQyxNQUFNLEdBQUc7Z0JBQ0wsVUFBVSxFQUFFO29CQUNSLEVBQUUsRUFBRSxzQ0FBc0M7b0JBQzFDLEdBQUcsRUFBRSxzQ0FBc0M7b0JBQzNDLElBQUksRUFBRSxRQUFRO29CQUNkLEtBQUssRUFBRTt3QkFDSDs0QkFDSSxLQUFLLEVBQUUsUUFBUTs0QkFDZixNQUFNLEVBQUUsV0FBVzs0QkFDbkIsVUFBVSxFQUFFLE1BQU07NEJBQ2xCLGtCQUFrQixFQUFFLE9BQU87eUJBQzlCO3FCQUNKO29CQUNELE9BQU8sRUFBRSxDQUFDO29CQUNWLE9BQU8sRUFBRSxXQUFXO29CQUNwQixZQUFZLEVBQUUsQ0FBQztvQkFDZixlQUFlLEVBQUUsb0NBQW9DO29CQUNyRCxlQUFlLEVBQUU7d0JBQ2IsU0FBUyxFQUFFLEVBQUU7d0JBQ2IsV0FBVyxFQUFFLFNBQVM7d0JBQ3RCLEtBQUssRUFBRSxFQUFFO3dCQUNULFVBQVUsRUFBRTs0QkFDUjtnQ0FDSSxJQUFJLEVBQUUsT0FBTztnQ0FDYixXQUFXLEVBQUUsWUFBWTtnQ0FDekIsSUFBSSxFQUFFLE1BQU07Z0NBQ1osS0FBSyxFQUFFLFlBQVk7Z0NBQ25CLEtBQUssRUFBRSxJQUFJO2dDQUNYLFNBQVMsRUFBRSxPQUFPO2dDQUNsQixTQUFTLEVBQUUsSUFBSTtnQ0FDZixJQUFJLEVBQUUsSUFBSTs2QkFDYjs0QkFDRDtnQ0FDSSxJQUFJLEVBQUUsT0FBTztnQ0FDYixXQUFXLEVBQUUsWUFBWTtnQ0FDekIsSUFBSSxFQUFFLE1BQU07Z0NBQ1osS0FBSyxFQUFFLFdBQVc7Z0NBQ2xCLEtBQUssRUFBRSxJQUFJO2dDQUNYLFNBQVMsRUFBRSxPQUFPO2dDQUNsQixTQUFTLEVBQUUsSUFBSTtnQ0FDZixJQUFJLEVBQUUsSUFBSTs2QkFDYjs0QkFDRDtnQ0FDSSxJQUFJLEVBQUUsT0FBTztnQ0FDYixJQUFJLEVBQUUsT0FBTztnQ0FDYixLQUFLLEVBQUUsT0FBTztnQ0FDZCxLQUFLLEVBQUUsS0FBSztnQ0FDWixTQUFTLEVBQUUsT0FBTztnQ0FDbEIsU0FBUyxFQUFFLElBQUk7Z0NBQ2YsSUFBSSxFQUFFLElBQUk7NkJBQ2I7NEJBQ0Q7Z0NBQ0ksSUFBSSxFQUFFLE9BQU87Z0NBQ2IsSUFBSSxFQUFFLE9BQU87Z0NBQ2IsS0FBSyxFQUFFLE9BQU87Z0NBQ2QsS0FBSyxFQUFFLElBQUk7Z0NBQ1gsU0FBUyxFQUFFLE9BQU87Z0NBQ2xCLFNBQVMsRUFBRSxJQUFJO2dDQUNmLElBQUksRUFBRSxJQUFJOzZCQUNiOzRCQUVEO2dDQUNJLEtBQUssRUFBRSxTQUFTO2dDQUNoQixJQUFJLEVBQUUsWUFBWTtnQ0FDbEIsS0FBSyxFQUFFLElBQUk7Z0NBQ1gsU0FBUyxFQUFFLFVBQVU7Z0NBQ3JCLFNBQVMsRUFBRSxJQUFJO2dDQUNmLElBQUksRUFBRSxJQUFJOzZCQUNiO3lCQUNKO3dCQUNELFNBQVMsRUFBRTs0QkFDUCxRQUFRLEVBQUUsT0FBTzs0QkFDakIsT0FBTyxFQUFFLGNBQWM7eUJBQzFCO3FCQUNKO29CQUNELEtBQUssRUFBRSxzQ0FBc0M7b0JBQzdDLFFBQVEsRUFBRSxRQUFRO29CQUNsQixjQUFjLEVBQUUsQ0FBQztvQkFDakIsY0FBYyxFQUFFLEtBQUs7aUJBQ3hCO2dCQUNELGFBQWEsRUFBRSxtQkFBbUI7YUFDckMsQ0FBQTtRQUNMLENBQUM7YUFBTSxJQUFJLFVBQVUsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDdEMsTUFBTSxHQUFHO2dCQUNMLFVBQVUsRUFBRTtvQkFDUixFQUFFLEVBQUUsc0NBQXNDO29CQUMxQyxHQUFHLEVBQUUsc0NBQXNDO29CQUMzQyxJQUFJLEVBQUUsVUFBVTtvQkFDaEIsS0FBSyxFQUFFO3dCQUNIOzRCQUNJLFFBQVEsRUFBRSxJQUFJOzRCQUNkLEtBQUssRUFBRSxNQUFNOzRCQUNiLFFBQVEsRUFBRSxVQUFVLENBQUMsUUFBUTs0QkFDN0IsU0FBUyxFQUFFLFVBQVUsQ0FBQyxTQUFTOzRCQUMvQixTQUFTLEVBQUUsR0FBRzs0QkFDZCxVQUFVLEVBQUUsY0FBYzs0QkFDMUIsU0FBUyxFQUFFO2dDQUNQLFVBQVUsRUFBRSxjQUFjOzZCQUM3Qjs0QkFDRCxLQUFLLEVBQUU7Z0NBQ0gsT0FBTyxFQUFFLFVBQVUsQ0FBQyxPQUFPLElBQUksT0FBTyxXQUFXLEVBQUU7NkJBQ3REOzRCQUNELFVBQVUsRUFBRTtnQ0FDUjtvQ0FDSSxJQUFJLEVBQUUsTUFBTTtvQ0FDWixJQUFJLEVBQUUsVUFBVSxDQUFDLE9BQU8sSUFBSSxPQUFPLFdBQVcsRUFBRTtvQ0FDaEQsTUFBTSxFQUFFLEdBQUc7b0NBQ1gsS0FBSyxFQUFFLFVBQVUsQ0FBQyxTQUFTLElBQUksYUFBYTtvQ0FDNUMsTUFBTSxFQUFFLElBQUk7b0NBQ1osT0FBTyxFQUFFLFdBQVc7b0NBQ3BCLE9BQU8sRUFBRSxnQkFBZ0I7b0NBQ3pCLFFBQVEsRUFBRSxLQUFLO29DQUNmLFFBQVEsRUFBRSxLQUFLO29DQUNmLFVBQVUsRUFBRSxDQUFDLENBQUM7b0NBQ2QsUUFBUSxFQUFFLE9BQU87aUNBQ3BCOzZCQUNKOzRCQUNELFNBQVMsRUFBRSxLQUFLOzRCQUNoQixRQUFRLEVBQUUsQ0FBQzs0QkFDWCxVQUFVLEVBQUUsSUFBSTs0QkFDaEIsYUFBYSxFQUFFLElBQUk7NEJBQ25CLFlBQVksRUFBRSxLQUFLOzRCQUNuQixhQUFhLEVBQUUsS0FBSzs0QkFDcEIsU0FBUyxFQUFFLENBQUM7NEJBQ1osU0FBUyxFQUNMLGdXQUFnVzs0QkFDcFcsY0FBYyxFQUFFLE9BQU87NEJBQ3ZCLGVBQWUsRUFBRSxLQUFLO3lCQUN6QjtxQkFDSjtvQkFDRCxLQUFLLEVBQUUsU0FBUztvQkFDaEIsT0FBTyxFQUFFLENBQUM7b0JBQ1YsT0FBTyxFQUFFLGtCQUFrQjtvQkFDM0IsU0FBUyxFQUFFLENBQUM7b0JBQ1osWUFBWSxFQUFFLENBQUM7b0JBQ2YsZUFBZSxFQUFFLFVBQVU7b0JBQzNCLEtBQUssRUFBRSxzQ0FBc0M7b0JBQzdDLFFBQVEsRUFBRSxRQUFRO29CQUNsQixjQUFjLEVBQUUsQ0FBQztvQkFDakIsY0FBYyxFQUFFLEtBQUs7aUJBQ3hCO2dCQUNELGFBQWEsRUFBRSxRQUFRO2FBQzFCLENBQUE7UUFDTCxDQUFDO2FBQU0sSUFBSSxVQUFVLENBQUMsSUFBSSxLQUFLLGNBQWMsRUFBRSxDQUFDO1lBQzVDLE1BQU0sR0FBRztnQkFDTCxVQUFVLEVBQUU7b0JBQ1IsRUFBRSxFQUFFLHNDQUFzQztvQkFDMUMsR0FBRyxFQUFFLHNDQUFzQztvQkFDM0MsSUFBSSxFQUFFLEVBQUU7b0JBQ1IsSUFBSSxFQUFFLFdBQVc7b0JBQ2pCLElBQUksRUFBRSxFQUFFO29CQUNSLEtBQUssRUFBRSxFQUFFO29CQUNULEtBQUssRUFBRTt3QkFDSDs0QkFDSSxJQUFJLEVBQUUsZUFBZSxDQUFDLFVBQVUsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDOzRCQUM3QyxLQUFLLEVBQUUsUUFBUTs0QkFDZixTQUFTLEVBQUUsS0FBSzs0QkFDaEIsUUFBUSxFQUFFLENBQUM7NEJBQ1gsVUFBVSxFQUFFLEtBQUs7NEJBQ2pCLGFBQWEsRUFBRSxLQUFLOzRCQUNwQixZQUFZLEVBQUUsS0FBSzs0QkFDbkIsYUFBYSxFQUFFLEtBQUs7NEJBQ3BCLFNBQVMsRUFBRSxDQUFDOzRCQUNaLGNBQWMsRUFBRSw0REFBNEQ7NEJBQzVFLGVBQWUsRUFBRSxLQUFLO3lCQUN6Qjt3QkFDRDs0QkFDSSxJQUFJLEVBQUUsZUFBZSxDQUFDLFVBQVUsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDOzRCQUM3QyxRQUFRLEVBQUUsU0FBUzs0QkFDbkIsS0FBSyxFQUFFLFFBQVE7NEJBQ2YsU0FBUyxFQUFFLFVBQVUsQ0FBQyxRQUFROzRCQUM5QixTQUFTLEVBQUUsS0FBSzs0QkFDaEIsUUFBUSxFQUFFLENBQUM7NEJBQ1gsVUFBVSxFQUFFLEtBQUs7NEJBQ2pCLGFBQWEsRUFBRSxLQUFLOzRCQUNwQixZQUFZLEVBQUUsS0FBSzs0QkFDbkIsYUFBYSxFQUFFLEtBQUs7NEJBQ3BCLFNBQVMsRUFBRSxDQUFDOzRCQUNaLGNBQWMsRUFBRSw0REFBNEQ7NEJBQzVFLGVBQWUsRUFBRSxLQUFLO3lCQUN6QjtxQkFDSjtvQkFDRCxLQUFLLEVBQUUsU0FBUztvQkFDaEIsT0FBTyxFQUFFLENBQUM7b0JBQ1YsT0FBTyxFQUFFLFlBQVk7b0JBQ3JCLFNBQVMsRUFBRSxDQUFDO29CQUNaLFlBQVksRUFBRSxDQUFDO29CQUNmLGVBQWUsRUFBRSxZQUFZO29CQUM3QixLQUFLLEVBQUUsc0NBQXNDO29CQUM3QyxRQUFRLEVBQUUsUUFBUTtvQkFDbEIsY0FBYyxFQUFFLENBQUM7b0JBQ2pCLGNBQWMsRUFBRSxLQUFLO29CQUNyQixXQUFXLEVBQUUsSUFBSTtpQkFDcEI7Z0JBQ0QsYUFBYSxFQUFFLFNBQVM7YUFDM0IsQ0FBQTtRQUNMLENBQUM7YUFBTSxJQUFJLFVBQVUsQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFFLENBQUM7WUFDckMsTUFBTSxHQUFHO2dCQUNMLFVBQVUsRUFBRTtvQkFDUixFQUFFLEVBQUUsc0NBQXNDO29CQUMxQyxHQUFHLEVBQUUsc0NBQXNDO29CQUMzQyxJQUFJLEVBQUUsV0FBVztvQkFDakIsS0FBSyxFQUFFO3dCQUNIOzRCQUNJLEtBQUssRUFBRSxRQUFROzRCQUNmLEtBQUssRUFBRTtnQ0FDSCxHQUFHLEVBQUUsVUFBVSxDQUFDLFFBQVE7Z0NBQ3hCLE1BQU0sRUFBRSxLQUFLOzZCQUNoQjs0QkFDRCxTQUFTLEVBQUUsS0FBSzs0QkFDaEIsUUFBUSxFQUFFLENBQUM7NEJBQ1gsVUFBVSxFQUFFLEtBQUs7NEJBQ2pCLGFBQWEsRUFBRSxLQUFLOzRCQUNwQixZQUFZLEVBQUUsS0FBSzs0QkFDbkIsYUFBYSxFQUFFLEtBQUs7NEJBQ3BCLFNBQVMsRUFBRSxDQUFDOzRCQUNaLFNBQVMsRUFBRSxFQUFFOzRCQUNiLGVBQWUsRUFBRSxLQUFLO3lCQUN6QjtxQkFDSjtvQkFDRCxPQUFPLEVBQUUsQ0FBQztvQkFDVixPQUFPLEVBQUUsWUFBWTtvQkFDckIsWUFBWSxFQUFFLENBQUM7b0JBQ2YsS0FBSyxFQUFFLHNDQUFzQztvQkFDN0MsUUFBUSxFQUFFLFFBQVE7b0JBQ2xCLGNBQWMsRUFBRSxDQUFDO29CQUNqQixjQUFjLEVBQUUsS0FBSztvQkFDckIsV0FBVyxFQUFFLElBQUk7aUJBQ3BCO2dCQUNELGFBQWEsRUFBRSxTQUFTO2FBQzNCLENBQUE7UUFDTCxDQUFDO2FBQU0sSUFBSSxVQUFVLENBQUMsSUFBSSxLQUFLLFNBQVMsSUFBSSxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDN0QsTUFBTSxHQUFHO2dCQUNMLFVBQVUsRUFBRTtvQkFDUixFQUFFLEVBQUUsc0NBQXNDO29CQUMxQyxHQUFHLEVBQUUsc0NBQXNDO29CQUMzQyxJQUFJLEVBQUUsaUJBQWlCO29CQUN2QixPQUFPLEVBQUUsQ0FBQztvQkFDVixPQUFPLEVBQUUsWUFBWTtvQkFDckIsWUFBWSxFQUFFLENBQUM7b0JBQ2YsS0FBSyxFQUFFLHNDQUFzQztvQkFDN0MsUUFBUSxFQUFFLFFBQVE7b0JBQ2xCLGNBQWMsRUFBRSxDQUFDO29CQUNqQixjQUFjLEVBQUUsS0FBSztvQkFDckIsS0FBSyxFQUFFLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUM7aUJBQy9DO2dCQUNELGFBQWEsRUFBRSxjQUFjO2FBQ2hDLENBQUE7UUFDTCxDQUFDO2FBQU0sSUFBSSxVQUFVLENBQUMsSUFBSSxLQUFLLFVBQVUsRUFBRSxDQUFDO1lBQ3hDLE1BQU0sR0FBRztnQkFDTCxVQUFVLEVBQUU7b0JBQ1IsRUFBRSxFQUFFLHNDQUFzQztvQkFDMUMsR0FBRyxFQUFFLHNDQUFzQztvQkFDM0MsSUFBSSxFQUFFLFdBQVc7b0JBQ2pCLEtBQUssRUFBRTt3QkFDSDs0QkFDSSxLQUFLLEVBQUUsUUFBUTs0QkFDZixRQUFRLEVBQUUsVUFBVSxDQUFDLFFBQVE7NEJBQzdCLFNBQVMsRUFBRSxDQUFDOzRCQUNaLFNBQVMsRUFBRSxrSEFBa0g7NEJBQzdILGNBQWMsRUFBRSw0REFBNEQ7NEJBQzVFLGVBQWUsRUFBRSxLQUFLOzRCQUN0QixRQUFRLEVBQUUsSUFBSTs0QkFDZCxXQUFXLEVBQUUsSUFBSTt5QkFDcEI7cUJBQ0o7b0JBQ0QsT0FBTyxFQUFFLENBQUM7b0JBQ1YsZUFBZSxFQUFFLFVBQVU7b0JBQzNCLEtBQUssRUFBRSxzQ0FBc0M7b0JBQzdDLFFBQVEsRUFBRSxRQUFRO29CQUNsQixjQUFjLEVBQUUsQ0FBQztvQkFDakIsY0FBYyxFQUFFLEtBQUs7b0JBQ3JCLFdBQVcsRUFBRSxJQUFJO2lCQUNwQjtnQkFDRCxhQUFhLEVBQUUsU0FBUzthQUMzQixDQUFBO1FBQ0wsQ0FBQztRQUNELElBQUksTUFBTSxFQUFFLENBQUM7WUFDVCxRQUFRLElBQUksQ0FBQyxDQUFBO1lBQ2IsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUMzQixDQUFDO0lBQ0wsQ0FBQztJQUVELE9BQU8sVUFBVSxDQUFBO0FBQ3JCLENBQUMsQ0FBQTtBQUVELE1BQU0sQ0FBQyxNQUFNLHNCQUFzQixHQUFHLEtBQUssRUFBRSxHQUFRLEVBQUUsTUFBYyxFQUFFLEVBQUU7SUFDckUsSUFBSSxDQUFDO1FBQ0QsTUFBTSxjQUFjLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFDMUQsTUFBTSxJQUFJLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBRWhDLE9BQU8sRUFBRSxVQUFVLEVBQUUsY0FBYyxDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsY0FBYyxDQUFDLGNBQWMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFBO0lBQ2xILENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ1gsTUFBTSxJQUFJLGNBQWMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFBO0lBQzFFLENBQUM7QUFDTCxDQUFDLENBQUEifQ==
