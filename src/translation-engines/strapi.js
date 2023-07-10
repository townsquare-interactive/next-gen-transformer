const { createGlobalStylesheet } = require('../controllers/cms-controller')
const { getFileS3 } = require('../s3Functions')
const { transformStrapiNav, determineModRenderType, transformTextSize, determineComponentType, convertColumns, createFonts } = require('../strapi-utils')
const {
    createItemStyles,
    createGallerySettings,
    alternatePromoColors,
    createLinkAndButtonVariables,
    createContactForm,
    transformcontact,
    socialConvert,
    createFontCss,
} = require('../utils')
const z = require('zod')

const schemaNum = z.coerce.number()

const transformStrapi = async (req) => {
    console.log('nav stuff', req.entry)
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

        //console.log('pages', strapiPages.data[0].attributes)
        const resLayout = await fetch('http://127.0.0.1:1337/api/site-data?populate=deep')
        //const resLayout = await fetch('https://shy-frost-8694.fly.dev/api/site-data?populate=deep')

        const resNav = await fetch('http://127.0.0.1:1337/api/navigation/render/1?locale=fr')
        const nav = await resNav.json()
        const layout = await resLayout.json()
        const siteIdentifier = layout.data.attributes.siteIdentifier
        let oldSiteData = await getFileS3(`${siteIdentifier}/layout.json`, '')
        let newNav
        const cmsColors = layout.data.attributes.colors
        const logo = layout.data?.attributes?.logo?.data?.attributes?.url || ''
        const favicon = layout.data?.attributes?.favicon?.data?.attributes?.url || ''

        console.log('this is the nav', nav.length)

        const pageSeo = req.entry.seo ? req.entry.seo[0] : ''
        //console.log('seo time', req.entry.seo)

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
        //console.log('ui nav', req.entry.page)
        if (req.entry.slug != null && req.entry.Body) {
            //const newMod1FirstItem = req.entry.Body[0].items[0]
            //console.log('attttttys ======================', currentItem)
            //console.log(req.entry)

            let modCount = 0
            //module loop
            for (i in req.entry.Body) {
                modCount += 1
                const currentModule = req.entry.Body[i]
                const componentType = determineComponentType(currentModule.__component, currentModule.useCarousel || false)

                //types
                //photo_gallery_1 testimonials_1 review_carousel thumbnail_gallery card_1

                //const modRenderType = currentModule.__component === 'module.article-module' ? 'Article' : 'Article'
                const modRenderType = determineModRenderType(currentModule.__component)
                console.log(currentModule.__component)
                const imgsize = currentModule.imgsize || 'square_1_1'
                //const disabled = currentModule.disabled === true ? 'disabled' : ''
                const imagePriority = currentModule.lazyload

                currentModule.columns = currentModule.columns === null ? 1 : currentModule.columns
                //const columns = schemaNum.parse(currentModule.columns || '1')
                const columns = convertColumns(currentModule.columns)

                console.log('cols', columns)

                /*------------------- Mod Transforms -------------------------*/

                const well = currentModule.border === true ? '1' : ''

                //create alternating promo colors
                if (
                    modRenderType === 'PhotoGrid' ||
                    modRenderType === 'Banner' ||
                    modRenderType === 'Parallax' ||
                    (modRenderType === 'PhotoGallery' && req.entry.Body[i].items)
                ) {
                    req.entry.Body[i].items = alternatePromoColors(currentModule.items, cmsColors, well)
                }

                //transform item styles

                //transform Photo Gallery Settings
                if ((modRenderType === 'PhotoGallery' || modRenderType === 'Testimonials') && currentModule.settings) {
                    req.entry.Body[i].settings = createGallerySettings(currentModule.settings, currentModule.blockSwitch1, currentModule.type)
                }

                //add contactFormData in form object
                if (modRenderType === 'ContactFormRoutes') {
                    const contactFormData = createContactForm(currentModule.formTitle || '', currentModule.email || ('' && req.entry.Body[i].items))
                    req.entry.Body[i] = {
                        ...req.entry.Body[i],
                        contactFormData: contactFormData,
                        items: [
                            {
                                plugin: '[gravity]',
                            },
                        ],
                    }
                }

                /*------------------- End Mod Transforms -------------------------*/

                //loop through items
                let itemCount = 0
                if (req.entry.Body[i].items) {
                    for (t in currentModule.items) {
                        const currentItem = currentModule.items[t]
                        itemCount += 1

                        //modSwitch1 = 1 when no parallax background is used
                        if (modRenderType === 'Parallax' || modRenderType === 'PhotoGallery') {
                            req.entry.Body[i].items[t] = { ...req.entry.Body[i].items[t], modSwitch1: 1 }
                        }

                        //move image url
                        if (currentItem.image) {
                            req.entry.Body[i].items[t] = {
                                ...req.entry.Body[i].items[t],
                                image: currentItem.image[0].url || '',
                                caption_tag: currentItem.image[0].caption || '',
                                img_alt_tag: currentItem.image[0].alternativeText || '',
                            }
                        }

                        if (currentItem.headSize) {
                            req.entry.Body[i].items[t].headSize = transformTextSize(req.entry.Body[i].items[t].headSize)
                        }

                        if (currentItem.descSize) {
                            req.entry.Body[i].items[t].descSize = transformTextSize(req.entry.Body[i].items[t].descSize)
                        }

                        //testimonials stars
                        if (currentItem.stars) {
                            req.entry.Body[i].items[t] = { ...req.entry.Body[i].items[t], actionlbl: convertColumns(currentItem.stars) }
                        }

                        if (currentItem.buttons.length != 0) {
                            //console.log('testttt', currentItem.buttons[0])
                            const btn1 = currentItem.buttons[0]
                            const btn2 = currentItem.buttons[1]

                            // console.log('btns', currentItem.buttons)

                            console.log(currentItem.buttons[0])

                            const btnData = {
                                pagelink: btn1?.pagelink ? btn1.pagelink.toLowerCase() : '',
                                weblink: btn1?.extlink ? btn1.extlink.toLowerCase() : '',
                                pagelink2: btn2?.pagelink ? btn2.pagelink.toLowerCase() : '',
                                weblink2: btn2?.extlink ? btn2.extlink.toLowerCase() : '',
                                actionlbl: btn1?.text || '',
                                actionlbl2: btn2?.text || '',
                                btnSize: '',
                                btnSize2: '',
                                newwindow: btn1?.ext === true ? 1 : '',
                                newwindow2: btn2?.ext === true ? 1 : '',
                            }

                            req.entry.Body[i].items[t] = { ...req.entry.Body[i].items[t], ...btnData }

                            const { linkNoBtn, twoButtons, isWrapLink, visibleButton, buttonList } = createLinkAndButtonVariables(
                                req.entry.Body[i].items[t],
                                modRenderType,
                                columns
                            )

                            req.entry.Body[i].items[t] = {
                                ...req.entry.Body[i].items[t],
                                linkNoBtn: linkNoBtn,
                                twoButtons: twoButtons,
                                isWrapLink: isWrapLink,
                                visibleButton: visibleButton,
                                buttonList: buttonList,
                            }
                        }
                        if (req.entry.Body[i].imageOverlay === true) {
                            const modColor1 = 'rgb(0,0,0)'
                            const modOpacity = 0.8
                            req.entry.Body[i].items[t] = { ...req.entry.Body[i].items[t], modColor1: modColor1, modOpacity: modOpacity }
                        }

                        const headerTag = currentItem.headerTagH1 === true ? 'h1' : ''
                        req.entry.Body[i].items[t] = {
                            ...req.entry.Body[i].items[t],
                            headerTag: headerTag,
                            itemCount: itemCount,
                        }
                    }

                    //creating item styles
                    if (modRenderType === 'Parallax' || modRenderType === 'Banner' || modRenderType === 'PhotoGallery') {
                        console.log(well, modRenderType, componentType)
                        req.entry.Body[i].items = createItemStyles(req.entry.Body[i].items, well, modRenderType, componentType)
                    }
                }

                //temp

                req.entry.Body[i] = {
                    attributes: {
                        ...req.entry.Body[i],
                        type: componentType,
                        imgsize: imgsize,
                        modId: currentModule.id,
                        //disabled: disabled,
                        imagePriority: imagePriority,
                        columns: columns,
                        well: well,
                        modCount: modCount,
                    },
                    componentType: modRenderType,
                }
            }

            const newPage = {
                data: {
                    id: req.entry.id,
                    title: req.entry.name,
                    slug: req.entry.slug,
                    page_type: req.entry.homePage === true ? 'homepage' : '',
                    url: `/${req.entry.slug}`,
                    JS: '',
                    type: 'menu',
                    layout: 1,
                    columns: 2,
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
                    title: pageSeo?.title || '',
                    descr: pageSeo?.descr || '',
                    selectedImages: null,
                    imageOverride: null,
                },
            }

            pagesList.push(newPage)
        }

        //maybe add check to see if nav option is saved then do this
        newNav = transformStrapiNav(nav)

        let contactInfo = {
            address: {
                city: layout.data?.attributes?.city || '',
                zip: layout.data?.attributes?.zip || '',
                name: siteIdentifier,
                state: layout.data?.attributes?.state || '',
                street: layout.data?.attributes?.streetAddress || '',
            },
            phone: layout.data.attributes.phone,
            email: [
                {
                    name: 'email',
                    email: layout.data?.attributes?.email || '',
                    isPrimaryEmail: true,
                },
            ],
        }

        contactInfo = transformcontact(contactInfo)

        console.log(layout.data?.attributes.socialMedia)

        //social media page
        let socialMediaItems = []
        if (layout.data?.attributes.socialMedia?.length != 0) {
            const inputtedSocials = layout.data?.attributes.socialMedia || []

            for (let m = 0; m < inputtedSocials.length; m++) {
                let url = inputtedSocials[m].url
                if (!url.includes('http')) {
                    url = 'http://' + url
                }

                socialMediaItems.push({ url: url, icon: socialConvert(inputtedSocials[m].url) })
            }
        }

        //----------------------global styles ---------------------------------
        const siteCustomCss = ''
        const currentPageList = {}

        //fonts
        const strapiFonts = createFonts({
            headlineFont: layout.data.attributes.headlineFont || 'Lato',
            bodyFont: layout.data.attributes.bodyFont || 'Lato',
            featFont: layout.data.attributes.featFont || 'Lato',
        })

        const { fontImportGroup, fontClasses } = createFontCss(strapiFonts)
        const globalStyles = await createGlobalStylesheet(cmsColors, strapiFonts, siteCustomCss, currentPageList, siteIdentifier)

        const strapi = {
            siteIdentifier: siteIdentifier,
            siteLayout: {
                cmsNav: newNav,
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
                social: socialMediaItems,
                /* {
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
                        zip: layout.data?.attributes?.zip || '',
                        city: layout.data?.attributes?.city || '',
                        name: siteIdentifier,
                        state: layout.data?.attributes?.state || '',
                        street: layout.data?.attributes?.streetAddress || '',
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
                }, */
                contact: contactInfo,
                siteName: siteIdentifier,
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
                favicon: favicon,
                fontImport: fontImportGroup,
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
