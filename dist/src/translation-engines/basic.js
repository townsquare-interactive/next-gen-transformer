"use strict";
const basic = {
    translate: () => {
        return {
            siteIdentifier: 'csutest0216basic2',
            siteLayout: {
                logos: {
                    fonts: [],
                    footer: {
                        pct: null,
                        slots: [
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
                                markup: '',
                            },
                            {
                                markup: '',
                            },
                        ],
                        activeSlots: [],
                    },
                    header: {
                        pct: 100,
                        slots: [
                            {
                                show: 1,
                                type: 'text',
                                markup: '<p>Business Name</p>\n',
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
                        pct: null,
                        slots: [
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
                                markup: '',
                            },
                            {
                                markup: '',
                            },
                        ],
                        activeSlots: [],
                    },
                    list: {
                        429176: '/files/2020/02/tsi_logo2-dark.png',
                        429177: '/files/2020/02/tsi_logo2.png',
                    },
                },
                social: [],
                contact: {
                    email: [
                        {
                            name: '',
                            email: '',
                            disabled: '',
                            isPrimaryEmail: false,
                        },
                    ],
                    hours: {
                        friday: '9:00AM-5:00PM',
                        monday: '9:00AM-5:00PM',
                        sunday: '',
                        tuesday: '9:00AM-5:00PM',
                        saturday: '',
                        thursday: '9:00AM-5:00PM',
                        wednesday: '9:00AM-5:00PM',
                    },
                    phone: [
                        {
                            name: '',
                            number: '',
                            disabled: '',
                            isPrimaryPhone: false,
                        },
                    ],
                    address: {
                        zip: '',
                        city: '',
                        name: 'Test 22',
                        state: '',
                        street: '',
                        street2: '',
                    },
                    hideZip: false,
                    advanced: {
                        lat: '',
                        long: '',
                    },
                    disabled: '',
                    hideCity: false,
                    hideState: false,
                    isPrimary: true,
                    hideAddress: false,
                    displayInMap: true,
                    hideAddress2: false,
                    displayInFooter: false,
                    contactLinks: [
                        {
                            cName: 'phone',
                            link: 'tel:',
                            icon: ['fas', 'phone'],
                            content: '',
                            active: false,
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
                            link: 'https://www.google.com/maps/place/+',
                            icon: ['fas', 'location-pin'],
                            content: 'Test 22',
                            active: true,
                        },
                    ],
                    showContactBox: false,
                },
                siteName: 'TITLE',
                url: 'csutest0216.staging7.townsquareinteractive.com',
                composites: {
                    footer: {
                        type: 'composite',
                        layout: null,
                        columns: 2,
                        modules: {
                            type: 'composite',
                            items: [
                                {
                                    title: '',
                                    nav_menu: 5530,
                                    component: 'nav_menu',
                                },
                            ],
                        },
                        sections: null,
                    },
                },
                cmsColors: {
                    logoColor: '#2482cb',
                    headingColor: '#525252',
                    subHeadingColor: '#ff7600',
                    textColor: '#0f181f',
                    linkColor: '#0f181f',
                    linkHover: '#0f181f',
                    btnText: '#ffbe87',
                    btnBackground: '#0f181f',
                    textColorAccent: '#0f181f',
                    heroSubheadline: '#0d1d24',
                    heroText: '#8a6301',
                    heroBtnText: '#ff7700',
                    heroBtnBackground: '#ff7700',
                    heroLink: '#454545',
                    heroLinkHover: 'transparent',
                    captionText: 'rgba(255,159,76,1)',
                    captionBackground: '#ff7700',
                    NavText: 'rgba(247,247,247,1)',
                    navHover: '#ffda82',
                    navCurrent: 'rgba(11,18,23,1)',
                    backgroundMain: 'rgba(0,0,0,.2)',
                    bckdContent: 'rgba(65,121,135,1)',
                    headerBackground: 'rgba(16,37,46,1)',
                    BckdHeaderSocial: '#12343d',
                    accentBackgroundColor: '#5b97a6',
                    backgroundHero: '#ffc83d',
                    footerBackground: 'rgba(16,37,46,1)',
                    footerText: '#dbf8ff',
                    footerLink: '#dbf8ff',
                    promoText: '#ffffff',
                    promoColor: '#3eb183',
                    promoColor2: '#00a4fc',
                    promoColor3: '#c9b426',
                    promoColor4: '#e02aa0',
                    promoColor5: '#30829b',
                    promoColor6: '#10252e',
                },
                theme: 'beacon-theme_charlotte',
                cmsUrl: 'csutest0216.staging7.townsquareinteractive.com',
                s3Folder: 'csutest0216',
                favicon: '',
                fontImport: '@import url(https://fonts.googleapis.com/css?family=Oswald:400,700|PT+Sans+Narrow:400,700,400italic,700italic|Montserrat:300,300i,400,400i,700,700i,900,900i|Old+Standard+TT&display=swap);',
                config: {
                    mailChimp: {
                        audId: 'd0b2dd1631',
                        datacenter: 'us21',
                    },
                    zapierUrl: 'https://hooks.zapier.com/hooks/catch/15652200/3hr112q/',
                    makeUrl: 'https://hook.us1.make.com/5ag2mwfm3rynjgumcjgu76wseppexe3s',
                },
            },
            pages: [
                {
                    data: {
                        id: '61822',
                        title: 'Home',
                        slug: 'home',
                        pageType: 'homepage',
                        url: '/',
                        JS: '',
                        type: 'menu',
                        layout: 1,
                        columns: 2,
                        modules: [
                            [
                                {
                                    attributes: {
                                        title: '',
                                        class: '',
                                        align: '',
                                        imgsize: 'square_1_1',
                                        columns: '1',
                                        type: 'article_1',
                                        well: '',
                                        lightbox: '',
                                        lazy: '',
                                        blockSwitch1: 1,
                                        blockField1: '',
                                        blockField2: '',
                                        scale_to_fit: '',
                                        export: 1,
                                        items: [
                                            {
                                                id: '3a0c813a_88b7_4859_93d1_8ee7c98e0e5e',
                                                headline: 'Welcome To Our SIte',
                                                subheader: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tem',
                                                image: '',
                                                captionOn: '',
                                                icon: '',
                                                icon2: '',
                                                icon3: '',
                                                bkgrd_color: '',
                                                btnType: '',
                                                btnType2: '',
                                                btnSize: '',
                                                btnSize2: '',
                                                desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'",
                                                pagelink: '',
                                                weblink: '',
                                                actionlbl: '',
                                                newwindow: '',
                                                pagelink2: '',
                                                weblink2: '',
                                                actionlbl2: '',
                                                newwindow2: '',
                                                align: 'center',
                                                isFeatured: 'active',
                                                isPlugin: '',
                                                headerTag: '',
                                                plugin: '',
                                                disabled: '',
                                                pagelinkId: '',
                                                pagelink2Id: '',
                                                buttonList: [
                                                    {
                                                        name: 'btn1',
                                                        link: '',
                                                        window: '',
                                                        label: '',
                                                        active: false,
                                                        btnType: 'btn_1',
                                                        btnSize: 'btn_md',
                                                        linkType: 'ext',
                                                        blockBtn: false,
                                                    },
                                                    {
                                                        name: 'btn2',
                                                        link: '',
                                                        window: '',
                                                        label: '',
                                                        active: false,
                                                        btnType: 'btn_2',
                                                        btnSize: 'btn_md',
                                                        linkType: 'ext',
                                                        blockBtn: false,
                                                    },
                                                ],
                                                linkNoBtn: false,
                                                twoButtons: false,
                                                isWrapLink: false,
                                                visibleButton: false,
                                                isBeaconHero: false,
                                                imagePriority: false,
                                                itemCount: 1,
                                                btnStyles: ' #id_59782df4_0886_4a25_8a23_814620c0e7a5 .item_1 .btn2_override {color:#0f181f; background-color:transparent;} ',
                                                nextImageSizes: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 1200px',
                                            },
                                        ],
                                        id: '59782df4_0886_4a25_8a23_814620c0e7a5',
                                        modId: '59782df4_0886_4a25_8a23_814620c0e7a5',
                                        modCount: 1,
                                        columnLocation: 0,
                                        isSingleColumn: false,
                                    },
                                    componentType: 'Article',
                                },
                            ],
                            [],
                            [],
                            [],
                            [],
                        ],
                        sections: [
                            {
                                wide: '1060',
                            },
                            {
                                wide: '988',
                            },
                            {
                                wide: '316',
                            },
                            {
                                wide: '232',
                            },
                            {
                                wide: '232',
                            },
                        ],
                        hideTitle: true,
                        head_script: '',
                        columnStyles: 'full-column',
                    },
                    attrs: {},
                    seo: {
                        title: null,
                        descr: null,
                        selectedImages: null,
                        imageOverride: null,
                    },
                },
            ],
            assets: [],
            globalStyles: `body {
                font-family: PT Sans Narrow;
              }
              
              .hd-font {
                font-family: Oswald;
              }
              
              .txt-font {
                font-family: PT Sans Narrow;
              }
              
              .feat-font {
                font-family: Montserrat;
              }
              
              :root {
                --logo: #2482cb;
                --hd: #525252;
                --sh: #ff7600;
                --txt: #0f181f;
                --link: #0f181f;
                --link-hover: #0f181f;
                --btn-txt: #ffbe87;
                --btn-background: #0f181f;
                --txt-accent: #0f181f;
                --hero-sh: #0d1d24;
                --hero-txt: #8a6301;
                --hero-btn-txt: #ff7700;
                --hero-btn-background: #ff7700;
                --hero-link: #454545;
                --hero-link-hover: transparent;
                --caption-txt: rgba(255,159,76,1);
                --caption-background: #ff7700;
                --nav-txt: rgba(247,247,247,1);
                --nav-hover: #ffda82;
                --nav-current: rgba(11,18,23,1);
                --main-background: rgba(0,0,0,.2);
                --content-background: rgba(65,121,135,1);
                --header-background: rgba(16,37,46,1);
                --social-background: #12343d;
                --accent-background: #5b97a6;
                --hero-background: #ffc83d;
                --footer-background: rgba(16,37,46,1);
                --footer-txt: #dbf8ff;
                --footer-link: #dbf8ff;
                --promo-txt: #ffffff;
                --promo: #3eb183;
                --promo2: #00a4fc;
                --promo3: #c9b426;
                --promo4: #e02aa0;
                --promo5: #30829b;
                --promo6: #10252e;
              }
              
              body .txt-font .dsc a {
                color: var(--link);
              }
              
              .accent-txt {
                color: var(--txt-accent);
              }
              
              .txt-color {
                color: var(--txt);
              }
              
              .txt-color-hd {
                color: var(--hd);
              }
              
              .navLink:hover {
                color: var(--nav-hover);
              }
              
              .navLink {
                color: var(--nav-txt);
              }
              
              .social-icon {
                color: var(--nav-txt);
              }
              
              .social-icon:hover {
                background-color: var(--btn-background);
                color: var(--btn-txt);
              }
              
              .footer-icon:hover {
                background-color: var(--nav-hover);
              }
              
              .current-page {
                color: var(--nav-current);
              }
              
              .caption-txt {
                color: var(--caption-txt);
              }
              
              .box-links {
                color: var(--link);
              }
              
              .box-links:hover {
                color: var(--nav-hover);
              }
              
              .testimonial-txt-color {
                color: var(--btn-background);
              }
              
              .testimonials-mod.well .hero.item, .testimonials-mod.well .hero .desc, .card-mod .hero.item, .card-mod .hero .desc, .photogallery-mod.well .hero.item, .photogallery-mod.well .hero .desc {
                color: var(--hero-txt);
              }
              .testimonials-mod.well .hero .stars, .testimonials-mod.well .hero .quotes, .testimonials-mod.well .hero .hd, .testimonials-mod.well .hero .sh, .card-mod .hero .stars, .card-mod .hero .quotes, .card-mod .hero .hd, .card-mod .hero .sh, .photogallery-mod.well .hero .stars, .photogallery-mod.well .hero .quotes, .photogallery-mod.well .hero .hd, .photogallery-mod.well .hero .sh {
                color: var(--txt-accent);
              }
              
              .btn_1 {
                color: var(--btn-txt);
                background-color: var(--btn-background);
              }
              
              .btn_1:hover {
                color: var(--btn-background);
                background-color: var(--btn-txt);
              }
              
              .btn_2 {
                color: var(--link);
                border-color: var(--link);
              }
              
              .btn_2:hover {
                color: var(--link-hover);
                border-color: var(--link-hover);
              }
              
              .btn_alt {
                color: var(--promo);
                background-color: var(--btn-txt);
              }
              
              .btn_alt:hover {
                color: var(--btn-txt);
                background-color: var(--promo);
              }
              
              .close-toggle {
                color: var(--btn-txt);
                background-color: var(--btn-background);
              }
              
              .close-toggle:hover {
                color: var(--btn-background);
                background-color: var(--btn-txt);
              }
              
              .btn_p4.btn_1 {
                background-color: var(--promo4);
                color: var(--btn-txt);
              }
              
              .btn_p4.btn_1:hover {
                color: var(--promo4);
                background-color: var(--btn-txt);
              }
              
              .btn_p3.btn_1 {
                background-color: var(--promo3);
                color: var(--btn-txt);
              }
              
              .btn_p3.btn_1:hover {
                color: var(--promo3);
                background-color: var(--btn-txt);
              }
              
              .btn_p2.btn_1 {
                background-color: var(--promo2);
                color: var(--btn-txt);
              }
              
              .btn_p2.btn_1:hover {
                color: var(--promo2);
                background-color: var(--btn-txt);
              }
              
              .btn_p4.btn_2 {
                border-color: var(--promo4);
                color: var(--promo4);
              }
              
              .btn_p3.btn_2 {
                border-color: var(--promo3);
                color: var(--promo3);
              }
              
              .btn_p2.btn_2 {
                border-color: var(--promo2);
                color: var(--promo2);
              }
              
              .btn_p4.btn_2:hover, .btn_p3.btn_2:hover, .btn_p2.btn_2:hover {
                border-color: var(--link-hover);
                color: var(--link-hover);
              }
              
              .hero .one-btn-w .btn_1.btn_w {
                color: var(--btn-txt);
                background-color: var(--hero-btn-background);
              }
              
              .border-background {
                background-color: var(--accent-background);
              }
              
              .hero-background {
                background-color: var(--promo);
              }
              
              .content-background {
                background-color: var(--content-background);
              }
              
              .footer {
                background-color: var(--footer-background);
                color: var(--footer-txt);
              }
              
              .header-background {
                background-color: var(--header-background);
              }
              
              .social-bar-background {
                background-color: var(--social-background);
              }
              
              .promo-background {
                background-color: var(--promo);
              }
              
              .cta {
                background-color: var(--promo);
              }
              
              .cta:hover {
                background-color: var(--promo2);
              }
              
              .testimonials-mod .hero-background, .card-mod .hero-background {
                background-color: var(--hero-background);
              }
              
              .caption-background {
                background-color: var(--caption-background);
              }
              
              /*---------------------Custom Code--------------------*/`,
        };
    },
};
module.exports = {
    basic,
};
//# sourceMappingURL=basic.js.map