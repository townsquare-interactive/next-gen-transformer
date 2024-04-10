import { fontList } from '../../templates/layout-variables.js';
import { convertDescText, stripUrl } from '../utils.js';
import { createGlobalStylesheet } from './cms-controller.js';
import { createModulesWithSections, createReviewItems, transformSocial } from '../ai-utils.js';
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
};
export const createLayoutFile = async (req) => {
    const logo = req.logo;
    const socials = req.socials;
    const address = req.address;
    const siteName = req.siteName;
    const phoneNumber = req.phoneNumber;
    const email = req.email;
    const seo = req.seo;
    const colors = req.colors;
    const favicon = req.favicon;
    //const fonts = req.fonts
    const url = req.url;
    const s3Folder = stripUrl(url);
    const customComponents = req.customComponents;
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
    };
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
        googleFonts: 'Abril+Fatface|Alegreya+Sans:400,700,400italic,700italic|Alegreya+SC:400,700,400italic,700italic|Amatic+SC:400,700|Anton|Artifika|Arvo:400,700,400italic,700italic|Autour+One|Barlow:400,700,400italic,700italic|Barlow+Condensed:400,700,400italic,700italic|BenchNine:400,700|Bevan|Bree+Serif|Cantarell:400,400italic,700,700italic|Changa+One|Cormorant+Garamond:300,300i,400,400i,700,700i|Dosis:400,700|Droid+Sans:400,700,400italic,700italic|Droid+Serif:400,700,400italic,700italic|Eater|Fjalla+One|Fredoka+One|Germania+One|Gorditas:700|Goudy+Bookletter+1911|Sorts+Mill+Goudy:400,400italic|Great+Vibes|Indie+Flower|Italiana|Josefin+Sans:400,700,400italic,700italic|Josefin+Slab:400,700,400italic,700italic|Keania+One|Lato:300,400,700,900,300italic,400italic,700italic,900italic|Lora:400,700,400italic,700italic|Lobster+Two:400,700,400italic,700italic|Merriweather+Sans:400,700,400italic,700italic|Montserrat:300,300i,400,400i,700,700i,900,900i|Old+Standard+TT|Muli:300,300italic,400,400italic|Nixie+One|Old+Standard+TT:400,400i,700|Open+Sans:400,700,400italic,700italic|Open+Sans+Condensed:300,300i,700|Oswald:400,700|Overlock:400,700,400italic,700italic|Pacifico|Parisienne|Playfair+Display:400,700,400italic,700italic|Poiret+One:400,700,400italic,700italic|Poppins:400,700,400italic,700italic|Prociono|PT+Sans+Narrow:400,700,400italic,700italic|Quicksand:700|Quattrocento:400,700|Racing+Sans+One|Raleway:400,700|Roboto:400,700,400italic,700italic|Rokkitt:400,700|Satisfy|Signika:400,700|Taviraj:300,300i,400,400i,700,700i,900,900i|Ubuntu:400,700,400italic,700italic|Work+Sans:400,700,400italic,700italic|Yellowtail',
    };
    const code = { CSS: '' };
    const newStyles = await createGlobalStylesheet(themeStyles, fonts, code, { pages: [] }, s3Folder);
    //to create
    // s3Folder, siteName, publishedDomains, fill out widget array, fill out social array
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
        social: transformSocial(socials),
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
            /* contactLinks: [
                {
                    cName: 'phone',
                    link: 'tel:(732) 351-2519',
                    icon: ['fas', 'phone'],
                    content: '(732) 351-2519',
                    active: true,
                },
                {
                    cName: 'email',
                    link: 'mailto:',
                    icon: ['fas', 'envelope'],
                    content: ': ',
                    active: false,
                },
                {
                    cName: 'map',
                    link: 'https://www.google.com/maps/place/+08736',
                    icon: ['fas', 'location-pin'],
                    content: 'Guaranteed Service',
                    active: false,
                },
            ], */
            showContactBox: false,
        },
        siteName: siteName,
        phoneNumber: phoneNumber,
        //email: '',
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
        seo: seo,
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
        s3Folder: s3Folder,
        favicon: favicon,
        fontImport: '@import url(https://fonts.googleapis.com/css?family=Oswald:400,700|Open+Sans:400,700,400italic,700italic|Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap);',
        publishedDomains: ['guaranteedservice.vercel.app'],
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
                    icon: {
                        iconPrefix: 'far',
                        iconModel: 'calendar',
                    },
                },
            ],
        },
        siteType: 'landing',
        customComponents: customComponents,
    };
    return { siteLayout: layoutTemplate, siteIdentifier: s3Folder };
};
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
};
const createPageFile = (req) => {
    const title = req.page.title;
    const slug = 'landing';
    const seo = req.page.seo;
    let sectionModules;
    if (req.page.sections) {
        sectionModules = createModulesWithSections(req.page.sections);
    }
    else {
        sectionModules = req.page.modules;
    }
    const modules = createModules(sectionModules, req.colors);
    const page = {
        data: {
            id: '737969',
            title: 'landing',
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
            title: '',
            descr: '',
            selectedImages: '',
            imageOverride: '',
        },
    };
    return page;
};
function transformString(inputText) {
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
const createModules = (modules, colors) => {
    let newModules = [];
    let modCount = 1;
    for (let i = 0; i < modules.length; i++) {
        const currentMod = modules[i];
        let newMod;
        if (currentMod.type === 'dl') {
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
                            headline: transformString(currentMod.headline || ''),
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
export const createAiFiles = async (req) => {
    const layoutContents = await createLayoutFile(req);
    const page = createPageFile(req);
    return { siteLayout: layoutContents.siteLayout, siteIdentifier: layoutContents.siteIdentifier, pages: [page] };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWktY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cm9sbGVycy9haS1jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQTtBQUM5RCxPQUFPLEVBQUUsZUFBZSxFQUFFLFFBQVEsRUFBRSxNQUFNLGFBQWEsQ0FBQTtBQUN2RCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQTtBQUM1RCxPQUFPLEVBQUUseUJBQXlCLEVBQUUsaUJBQWlCLEVBQUUsZUFBZSxFQUFFLE1BQU0sZ0JBQWdCLENBQUE7QUFLOUYsTUFBTSxTQUFTLEdBQUc7SUFDZCxJQUFJLEVBQUUsa0VBQWtFO0lBQ3hFLE9BQU8sRUFBRTtRQUNMLDZDQUE2QztRQUM3Qyx5REFBeUQ7UUFDekQsNktBQTZLO1FBQzdLLDZDQUE2QztRQUM3QywwQ0FBMEM7S0FDN0M7SUFDRCxPQUFPLEVBQUU7UUFDTCxHQUFHLEVBQUUsT0FBTztRQUNaLElBQUksRUFBRSxXQUFXO1FBQ2pCLElBQUksRUFBRSxvQkFBb0I7UUFDMUIsS0FBSyxFQUFFLElBQUk7UUFDWCxNQUFNLEVBQUUsRUFBRTtRQUNWLE9BQU8sRUFBRSxFQUFFO1FBQ1gsV0FBVyxFQUFFO1lBQ1QsR0FBRyxFQUFFLFdBQVc7WUFDaEIsSUFBSSxFQUFFLFlBQVk7U0FDckI7UUFDRCxHQUFHLEVBQUUsMENBQTBDO0tBQ2xEO0lBQ0QsUUFBUSxFQUFFLG9CQUFvQjtJQUM5QixXQUFXLEVBQUUsZ0JBQWdCO0lBQzdCLEtBQUssRUFBRSw0QkFBNEI7SUFDbkMsR0FBRyxFQUFFLHVCQUF1QjtJQUM1QixHQUFHLEVBQUU7UUFDRCxNQUFNLEVBQUU7WUFDSixnQkFBZ0IsRUFBRSw0RUFBNEU7WUFDOUYsbUJBQW1CLEVBQUUsNkNBQTZDO1lBQ2xFLHNCQUFzQixFQUFFLCtHQUErRztZQUN2SSx1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