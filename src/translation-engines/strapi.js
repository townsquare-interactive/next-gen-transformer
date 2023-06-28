const { createGlobalStylesheet } = require('../controllers/cms-controller')
const { getFileS3 } = require('../s3Functions')
const { transformStrapiNav, determineModRenderType } = require('../strapi-utils')
const { createItemStyles, createGallerySettings, alternatePromoColors } = require('../utils')
const z = require('zod')

const schemaNum = z.coerce.number()

const transformStrapi = async (req) => {
    /*     
    //can use to generate random ID's
    const crypto = require('crypto')
    const id = crypto.randomBytes(16).toString('hex')
    console.log(id) // => f9b327e70bbcf42494ccb28b2d98e00e */

    let pagesList = []
    try {
        //need populate=deep to get all records, plugin for strapi
        //const resStrapiPages = await fetch('http://127.0.0.1:1337/api/pages?populate=deep')
        //const strapiPages = await resStrapiPages.json()
        const resLayout = await fetch('http://127.0.0.1:1337/api/site-data?populate=deep')
        const layout = await resLayout.json()
        const siteIdentifier = layout.data.attributes.siteIdentifier
        let oldSiteData = await getFileS3(`${siteIdentifier}/layout.json`, '')
        let newNav
        const cmsColors = layout.data.attributes.Colors[0]
        const logo = layout.data?.attributes?.logo?.data.attributes.url || ''

        //check if page is same page from get
        /*  if (firstPage.id === req.entry.id) {
            firstPage.attributes.Body[0] = req.entry.Body[0]
            console.log('new page transformed', firstPage.attributes.Body[0].items[0].image[0])
        } */

        //create a page for every page passes

        /*  for (x in strapiPages.data) {
            const thePage = strapiPages.data[x]
            //if type is page and page already exists
            if (thePage.id === req.entry.id && req.entry.slug != null) {
                //make the old modules = the new mods
                thePage.attributes.Body = req.entry.Body
                console.log('new page transformed(module)', thePage.attributes.Body[0].items[0]) 
            } */

        //if page is saved
        if (req.entry.slug != null) {
            const newMod1FirstItem = req.entry.Body[0].items[0]
            //console.log('attttttys ======================', currentItem)

            let modCount = 0
            //module loop
            for (i in req.entry.Body) {
                modCount += 1
                const currentModule = req.entry.Body[i]
                const componentType = currentModule.__component === 'module.article-module' ? 'article_3' : 'article_1'
                //const modRenderType = currentModule.__component === 'module.article-module' ? 'Article' : 'Article'
                const modRenderType = determineModRenderType(currentModule.__component)
                const imgsize = currentModule.imgsize || 'square_1_1'
                const disabled = currentModule.disabled === false ? 'disabled' : ''
                const imagePriority = currentModule.lazyload

                currentModule.columns = currentModule.columns === null ? 1 : currentModule.columns
                const columns = schemaNum.parse(currentModule.columns || '1')

                /*------------------- Mod Transforms -------------------------*/

                //transform item styles
                if (modRenderType === 'Parallax' || modRenderType === 'Banner' || modRenderType === 'PhotoGallery') {
                    req.entry.Body[i].items = createItemStyles(currentModule.items, well, modRenderType, componentType)
                }

                //transform Photo Gallery Settings
                if ((modRenderType === 'PhotoGallery' || modRenderType === 'Testimonials') && currentModule.settings) {
                    req.entry.Body[i].settings = createGallerySettings(currentModule.settings, currentModule.blockSwitch1, currentModule.type)
                }

                //create alternating promo colors
                if (modRenderType === 'PhotoGrid' || modRenderType === 'Banner' || modRenderType === 'Parallax' || modRenderType === 'PhotoGallery') {
                    req.entry.Body[i].items = alternatePromoColors(currentModule.items, cmsColors, currentModule.well)
                }

                /*------------------- End Mod Transforms -------------------------*/

                //loop through items
                let itemCount = 0
                for (t in currentModule.items) {
                    const currentItem = currentModule.items[t]
                    itemCount += 1

                    //move image url
                    if (currentItem.image) {
                        req.entry.Body[i].items[t] = { ...currentItem, image: currentItem.image[0].url || '', itemCount: itemCount }
                    }
                }

                //temp
                const well = currentModule.border === true ? '1' : ''

                req.entry.Body[i] = {
                    attributes: {
                        ...currentModule,
                        type: componentType,
                        imgsize: imgsize,
                        modId: currentModule.id,
                        disabled: disabled,
                        imagePriority: imagePriority,
                        columns: columns,
                        well: well,
                        modCount: modCount,
                    },
                    componentType: modRenderType,
                }
            }

            newNav = transformStrapiNav(req.entry, oldSiteData.cmsNav)

            const newPage = {
                data: {
                    id: '61822',
                    title: req.entry.name,
                    slug: req.entry.slug,
                    pageType: 'homepage',
                    url: `/${req.entry.slug}`,
                    JS: '',
                    type: 'menu',
                    layout: 1,
                    columns: 2,
                    /*                     modules: [
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
                                            headline: newMod1FirstItem.headline,
                                            subheader: newMod1FirstItem.subheadline,
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
                                            desc: newMod1FirstItem.desc,
                                            pagelink: '',
                                            weblink: '',
                                            actionlbl: '',
                                            newwindow: '',
                                            pagelink2: '',
                                            weblink2: '',
                                            actionlbl2: '',
                                            newwindow2: '',
                                            align: newMod1FirstItem.align,
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
                                            btnStyles:
                                                ' #id_59782df4_0886_4a25_8a23_814620c0e7a5 .item_1 .btn2_override {color:#0f181f; background-color:transparent;} ',
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
                    ], */
                    modules: [req.entry.Body, [], [], [], []],
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
            }

            pagesList.push(newPage)
        }

        //global styles
        const siteCustomCss = ''
        const currentPageList = {}
        const fonts = {}
        const globalStyles = await createGlobalStylesheet(cmsColors, fonts, siteCustomCss, currentPageList, siteIdentifier)

        const strapi = {
            siteIdentifier: siteIdentifier,
            siteLayout: {
                cmsNav: newNav || oldSiteData.cmsNav || '',
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
                        pct: null,
                        slots: [
                            {
                                show: 0,
                                type: 'text',
                                markup: '',
                                hasLinks: false,
                                alignment: 'left',
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
                cmsColors: cmsColors,
                theme: 'beacon-theme_charlotte',
                cmsUrl: 'csutest0216.staging7.townsquareinteractive.com',
                s3Folder: 'csutest0216',
                favicon: '',
                fontImport:
                    '@import url(https://fonts.googleapis.com/css?family=Oswald:400,700|PT+Sans+Narrow:400,700,400italic,700italic|Montserrat:300,300i,400,400i,700,700i,900,900i|Old+Standard+TT&display=swap);',
                config: {
                    mailChimp: {
                        audId: 'd0b2dd1631',
                        datacenter: 'us21',
                    },
                    zapierUrl: 'https://hooks.zapier.com/hooks/catch/15652200/3hr112q/',
                    makeUrl: 'https://hook.us1.make.com/5ag2mwfm3rynjgumcjgu76wseppexe3s',
                },
            },
            pages: pagesList,

            assets: [],
            globalStyles: globalStyles,
        }

        return strapi
    } catch (error) {
        console.log(error)
        return { error: 'Strapi fetch error' }
    }
}

module.exports = {
    transformStrapi,
}
