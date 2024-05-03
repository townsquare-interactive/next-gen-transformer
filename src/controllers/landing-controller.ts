import { fontList } from '../../templates/layout-variables.js'
import { convertDescText } from '../utils.js'
import { createGlobalStylesheet } from './cms-controller.js'
import { createModulesWithSections, createReviewItems, transformSocial } from '../landing-utils.js'
import { AiPageModules, AiReq } from '../../schema/input-zod.js'
import { getFileS3 } from '../s3Functions.js'
import { Layout } from '../../types.js'

type Colors = { primary: string; accent: string }

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

export const createLayoutFile = async (req: any, apexID: string) => {
    const logo = req.logo
    const socials = req.socials
    const address = req.address
    const siteName = req.siteName
    const phoneNumber = req.phoneNumber
    const email = req.email
    const seo = req.seo
    const colors: { primary: string; accent: string; footerBackground?: string; footerText?: string; buttonHover?: string } = req.colors
    const favicon = req.favicon
    //const fonts = req.fonts
    const url = req.url
    const customComponents = req.customComponents

    const currentLayout: Layout = await getFileS3(`${apexID}/layout.json`, 'site not found in s3')

    //const darkenColor = sass.compileString(`$newColor:darken(${colors.primary}, 30%); --newColor:$newColor;`)
    //console.log(darkenColor)

    const themeStyles = {
        logoColor: '#444444',
        headingColor: colors.accent,
        subHeadingColor: colors.accent,
        textColor: '#444444',
        linkColor: colors.primary,
        linkHover: colors.primary,
        btnText: '#ffffff',
        btnBackground: colors.primary,
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
        navHover: colors.primary,
        navCurrent: colors.primary,
        backgroundMain: '#ffffff',
        bckdContent: 'rgba(255,255,255,1)',
        headerBackground: 'rgba(255,255,255,1)',
        BckdHeaderSocial: '#ffffff',
        accentBackgroundColor: colors.accent,
        backgroundHero: colors.accent,
        footerBackground: colors.footerBackground ? colors.footerBackground : colors.accent || '#fff',
        footerText: colors.footerText || '#fff',
        footerLink: colors.buttonHover || '#7fa7b8',
        promoText: '#ffffff',
        promoColor: colors.primary,
        promoColor2: colors.accent,
        promoColor3: colors.buttonHover || '#7fa7b8',
        promoColor4: colors.accent,
        promoColor5: colors.buttonHover || '#f2f6fc',
        promoColor6: colors.accent,
    }

    const fonts = {
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
        list: fontList,
        googleFonts:
            'Abril+Fatface|Alegreya+Sans:400,700,400italic,700italic|Alegreya+SC:400,700,400italic,700italic|Amatic+SC:400,700|Anton|Artifika|Arvo:400,700,400italic,700italic|Autour+One|Barlow:400,700,400italic,700italic|Barlow+Condensed:400,700,400italic,700italic|BenchNine:400,700|Bevan|Bree+Serif|Cantarell:400,400italic,700,700italic|Changa+One|Cormorant+Garamond:300,300i,400,400i,700,700i|Dosis:400,700|Droid+Sans:400,700,400italic,700italic|Droid+Serif:400,700,400italic,700italic|Eater|Fjalla+One|Fredoka+One|Germania+One|Gorditas:700|Goudy+Bookletter+1911|Sorts+Mill+Goudy:400,400italic|Great+Vibes|Indie+Flower|Italiana|Josefin+Sans:400,700,400italic,700italic|Josefin+Slab:400,700,400italic,700italic|Keania+One|Lato:300,400,700,900,300italic,400italic,700italic,900italic|Lora:400,700,400italic,700italic|Lobster+Two:400,700,400italic,700italic|Merriweather+Sans:400,700,400italic,700italic|Montserrat:300,300i,400,400i,700,700i,900,900i|Old+Standard+TT|Muli:300,300italic,400,400italic|Nixie+One|Old+Standard+TT:400,400i,700|Open+Sans:400,700,400italic,700italic|Open+Sans+Condensed:300,300i,700|Oswald:400,700|Overlock:400,700,400italic,700italic|Pacifico|Parisienne|Playfair+Display:400,700,400italic,700italic|Poiret+One:400,700,400italic,700italic|Poppins:400,700,400italic,700italic|Prociono|PT+Sans+Narrow:400,700,400italic,700italic|Quicksand:700|Quattrocento:400,700|Racing+Sans+One|Raleway:400,700|Roboto:400,700,400italic,700italic|Rokkitt:400,700|Satisfy|Signika:400,700|Taviraj:300,300i,400,400i,700,700i,900,900i|Ubuntu:400,700,400italic,700italic|Work+Sans:400,700,400italic,700italic|Yellowtail',
    }

    const code = { CSS: '' }

    const newStyles = await createGlobalStylesheet(themeStyles, fonts, code, { pages: [] }, apexID)

    //to create
    // apexID, siteName, publishedDomains, fill out widget array, fill out social array
    //probably still need to create styles in case we create those functions

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
        url: 'guaranteedservice.com',
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
        //seo: seo,
        seo: {
            global: {
                aiosp_home_title: req.title || '',
                aiosp_home_description: req.description || '',
            },
        },
        cmsColors: {
            logoColor: '#444444',
            headingColor: colors.accent,
            subHeadingColor: colors.accent,
            textColor: '#444444',
            linkColor: colors.primary,
            linkHover: colors.primary,
            btnText: '#ffffff',
            btnBackground: colors.primary,
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
            navHover: colors.primary,
            navCurrent: colors.primary,
            backgroundMain: '#ffffff',
            bckdContent: 'rgba(255,255,255,1)',
            headerBackground: 'rgba(255,255,255,1)',
            BckdHeaderSocial: '#ffffff',
            accentBackgroundColor: colors.accent,
            backgroundHero: colors.accent,
            footerBackground: colors.accent,
            footerText: '#ffffff',
            footerLink: '#7fa7b8',
            promoText: '#ffffff',
            promoColor: colors.primary,
            promoColor2: colors.accent,
            promoColor3: '#7fa7b8',
            promoColor4: colors.accent,
            promoColor5: '#f2f6fc',
            promoColor6: colors.accent,
        },
        theme: 'beacon-theme_charlotte',
        cmsUrl: url,
        s3Folder: apexID,
        favicon: favicon,
        fontImport:
            '@import url(https://fonts.googleapis.com/css?family=Oswald:400,700|Open+Sans:400,700,400italic,700italic|Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap);',
        publishedDomains: currentLayout.publishedDomains || [],
        config: {
            zapierUrl: 'https://hooks.zapier.com/hooks/catch/15652200/3hr112q/',
            makeUrl: 'https://hook.us1.make.com/5ag2mwfm3rynjgumcjgu76wseppexe3s',
        },
        styles: { global: newStyles.global, custom: newStyles.custom },
        headerOptions: {
            ctaBtns: [
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
                    action: 'schedule',
                    icon: {
                        iconPrefix: 'far',
                        iconModel: 'calendar',
                    },
                },
            ],
            hideNav: true,
            hideSocial: true,
            mobileHeaderBtns: [
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
                    action: 'schedule',
                    icon: {
                        iconPrefix: 'far',
                        iconModel: 'calendar',
                    },
                },
            ],
        },
        siteType: 'landing',
        customComponents: customComponents,
    }

    return { siteLayout: layoutTemplate, siteIdentifier: apexID }
}
//"<span class = 'mobiletext'>Heating Service & Repair</span> <br><span class = 'guarn'>GUARANTEED</span>"

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

const createPageFile = (req: AiReq) => {
    const title = 'landing'
    const slug = 'landing'

    let sectionModules
    if (req.page.sections) {
        sectionModules = createModulesWithSections(req.page.sections)
    } else {
        sectionModules = req.page.modules
    }
    const modules = createModules(sectionModules, req.colors)

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
            title: req.title || '',
            descr: req.description || '',
            selectedImages: '',
            imageOverride: '',
        },
    }

    return page
}

function transformDLText(inputText: string): string {
    // Split the input text into words
    const words = inputText.split(' ')

    // Get the last word
    const lastWord = words.pop() || ''

    // Join the remaining words with spaces
    const remainingText = words.join(' ')

    // Create the output text with span tags
    const outputText = `
        <span class='mobiletext'>${remainingText}</span>
        <br>
        <span class='guarn'>${lastWord}</span>
    `

    return inputText ? outputText : ''
}

const createModules = (modules: AiPageModules, colors: Colors) => {
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
                                weblink: currentMod.weblink,
                            },
                            imageType: 'crop',
                            buttonList: [
                                {
                                    name: 'btn1',
                                    link: currentMod.weblink,
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
                                weblink: currentMod.weblink,
                            },
                            buttonList: [
                                {
                                    name: 'btn1',
                                    link: currentMod.weblink,
                                    window: '1',
                                    label: 'CALL US NOW',
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

export const createLandingPageFiles = async (req: any, apexID: string) => {
    const layoutContents = await createLayoutFile(req, apexID)
    const page = createPageFile(req)

    return { siteLayout: layoutContents.siteLayout, siteIdentifier: layoutContents.siteIdentifier, pages: [page] }
}
