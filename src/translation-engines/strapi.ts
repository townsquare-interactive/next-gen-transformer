import { createGlobalStylesheet } from '../controllers/cms-controller.js'
import {
    transformStrapiNav,
    determineModRenderType,
    transformTextSize,
    determineComponentType,
    convertColumns,
    createFonts,
    createSocials,
    setupContactForm,
    createStrapiButtonVars,
    setDefaultColors,
    createContactInfo,
} from '../strapi-utils.js'
import { createItemStyles, createGallerySettings, alternatePromoColors, transformcontact, createFontCss } from '../utils.js'
import { getFileS3 } from '../s3Functions.js'
import z from 'zod'
import { Contact, Request } from '../../types.js'

const schemaNum = z.coerce.number()
const dbUrl = 'http://127.0.0.1:1337'

export const transformStrapi = async (req: Request) => {
    let pagesList = []

    try {
        const [resLayout, resNav, resPages] = await Promise.all([
            fetch(`${dbUrl}/api/site-data?populate=deep`),
            fetch(`${dbUrl}/api/navigation/render/1?locale=fr`),
            fetch(`${dbUrl}/api/pages?populate=deep`),
        ])
        const [layout, nav, pages] = await Promise.all([resLayout.json(), resNav.json(), resPages.json()])

        const siteIdentifier = layout.data.attributes.siteIdentifier
        let newNav
        let cmsColors = layout.data.attributes.colors
        const logo = layout.data?.attributes?.logo?.data?.attributes?.url || ''
        const favicon = layout.data?.attributes?.favicon?.data?.attributes?.url || ''
        const pageSeo = req.entry.seo || ''
        let anchorTags = []

        let contactInfo: Contact = await createContactInfo(layout.data.attributes, siteIdentifier)
        contactInfo = transformcontact(contactInfo)
        const socialMediaItems = createSocials(layout.data?.attributes.socialMedia)

        //get nav object
        const currentLayoutS3 = await getFileS3(`${siteIdentifier}/layout.json`)

        if (currentLayoutS3.cmsNav) {
            console.log('we have a nav', currentLayoutS3.cmsNav)
        } else {
            currentLayoutS3.cmsNav = []
        }
        console.log('nav plugin', nav)
        console.log('is single page', layout.data?.attributes.singlePageSite)

        //maybe add check to see if nav option is saved then do this
        newNav = layout.data?.attributes.singlePageSite ? currentLayoutS3.cmsNav : transformStrapiNav(nav)
        console.log('transssss----- nav', newNav)

        // console.log('cms pages', pages.data[0].attributes)

        //if saved type is a page
        if (req.entry.slug != null && req.entry.Body) {
            let modCount = 0
            let newPages = []
            //module loop
            for (const i in req.entry.Body) {
                modCount += 1
                const currentModule = req.entry.Body[i]
                const componentType = determineComponentType(currentModule.__component, currentModule.useCarousel || false)
                const modRenderType = determineModRenderType(currentModule.__component)

                const imgsize = currentModule.extraSettings?.imgsize || currentModule.imgsize || 'landscape_16_9'
                const imagePriority = currentModule.extraSettings?.lazyload || currentModule.lazyload || true
                currentModule.columns = currentModule.columns === null ? 1 : currentModule.columns
                const columns = convertColumns(currentModule.columns)
                const border = currentModule.extraSettings?.border || currentModule.border || false

                const well = border === true ? '1' : ''

                /*------------------- Mod Transforms -------------------------*/

                //create alternating promo colors
                if (
                    modRenderType === 'PhotoGrid' ||
                    modRenderType === 'Banner' ||
                    modRenderType === 'Parallax' ||
                    (modRenderType === 'PhotoGallery' && req.entry.Body[i].items)
                ) {
                    req.entry.Body[i].items = alternatePromoColors(currentModule.items, cmsColors, well)
                }

                //transform Photo Gallery Settings
                if ((modRenderType === 'PhotoGallery' || modRenderType === 'Testimonials') && currentModule.settings) {
                    req.entry.Body[i].settings = createGallerySettings(currentModule.settings, currentModule.blockSwitch1 || '', currentModule.type || '')
                }

                //add contactFormData in form object
                if (modRenderType === 'ContactFormRoutes') {
                    req.entry.Body[i] = setupContactForm(req.entry.Body[i])
                }
                //add contactFormData in form object
                if (modRenderType === 'Map') {
                    req.entry.Body[i] = { ...req.entry.Body[i], address: contactInfo.address }
                }

                //anchor tags
                if (req.entry.Body[i].title && req.entry.Body[i].useAnchor === true) {
                    const anchorLink = req.entry.Body[i].title + `_${currentModule.id}`

                    anchorTags.push({
                        title: req.entry.Body[i].title,
                        url: '#' + anchorLink,
                        menu_item_parent: 0,
                    })
                    req.entry.Body[i].anchorLink = anchorLink

                    //need to also create cmsnav for this if OnePage?

                    if (layout.data?.attributes.singlePageSite === true) {
                        newNav = anchorTags
                    }
                }

                /*------------------- End Mod Transforms -------------------------*/

                //loop through items
                let itemCount = 0
                if (req.entry.Body[i].items) {
                    for (const t in currentModule.items) {
                        const currentItem = currentModule.items[t]
                        itemCount += 1

                        if (modRenderType === 'Parallax' || modRenderType === 'PhotoGallery') {
                            req.entry.Body[i].items[t] = { ...req.entry.Body[i].items[t], modSwitch1: 1 }
                        }

                        //settings image data (uses first image)
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

                        //convert button data
                        if (currentItem.buttons?.length != 0) {
                            req.entry.Body[i].items[t] = createStrapiButtonVars(req.entry.Body[i].items[t], modRenderType, columns)
                        }

                        //add image overlay for parallax/photogallery
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
                        req.entry.Body[i].items = createItemStyles(req.entry.Body[i].items, well, modRenderType, componentType)
                    }
                }

                //fully transformed page
                newPages.push({
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
                })
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
                    modules: [newPages, [], [], [], []],
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
                    anchorTags: anchorTags,
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

        //set default colors if none exist
        if (!cmsColors) {
            cmsColors = setDefaultColors()
        }

        //const coords = await getAddressCoords(addy)
        //console.log(coords)

        //----------------------global styles ---------------------------------
        const siteCustomCss = { CSS: '' }
        let currentPageList = ''

        //fonts
        const strapiFonts = createFonts({
            headlineFont: layout.data.attributes.headlineFont || 'Josefin-Sans',
            bodyFont: layout.data.attributes.bodyFont || 'Lato',
            featFont: layout.data.attributes.featFont || 'Josefin-Sans',
        })

        const { fontImportGroup, fontClasses } = createFontCss(strapiFonts)
        const globalStyles = await createGlobalStylesheet(cmsColors, strapiFonts, siteCustomCss, currentPageList, siteIdentifier)

        const strapi = {
            siteIdentifier: siteIdentifier,
            siteLayout: {
                cmsNav: newNav,
                logos: {
                    footer: {
                        slots: [
                            {
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
                    },
                    header: {
                        slots: [
                            {
                                show: 1,
                                type: 'text',
                                markup: '',
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
                },
                social: socialMediaItems,
                contact: contactInfo,
                siteName: siteIdentifier,
                url: '',
                composites: {
                    footer: {
                        type: 'composite',
                        layout: null,
                        columns: 2,
                        modules: {
                            type: 'composite',
                            items: [],
                        },
                    },
                },
                cmsColors: cmsColors,
                theme: 'beacon-theme_charlotte',
                cmsUrl: '',
                s3Folder: siteIdentifier,
                favicon: favicon,
                fontImport: fontImportGroup,
                //all used for forms right now
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
