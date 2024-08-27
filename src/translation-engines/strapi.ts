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
    addItemExtraSettings,
    manageAnchorLinks,
} from '../utilities/strapi-utils.js'
import { createGallerySettings, alternatePromoColors, transformcontact, createFontCss } from '../utilities/utils.js'
import { getFileS3 } from '../utilities/s3Functions.js'
//import z from 'zod'
import { Contact, Request, anchorTags } from '../../types.js'
import { createItemStyles } from '../utilities/style-utils.js'

/* import { exec } from 'child_process'

exec('npm run strapi import -- -f export_new.tar.gz.enc', (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`)
        return
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`)
        return
    }
    console.log(`stdout: ${stdout}`)
})
 */
//const schemaNum = z.coerce.number()
const dbUrl = 'http://127.0.0.1:1337'

export const transformStrapi = async (req: Request) => {
    let pagesList = []

    //console.log('lets check the req', req, req.entry)
    //console.log('this will check for draft==========================', req.entry.publishedAt ? 'this is published' : 'this is draft', req)

    try {
        const [resLayout, resNav, resPages] = await Promise.all([
            fetch(`${dbUrl}/api/site-data?populate=deep`),
            fetch(`${dbUrl}/api/navigation/render/1?locale=fr`),
            fetch(`${dbUrl}/api/pages?populate=deep`),
        ])
        const [layout, nav, pages]: any[] = await Promise.all([resLayout.json(), resNav.json(), resPages.json()])
        //zod check these ^^ if you don't want them to be any
        const siteIdentifier = layout.data.attributes.siteIdentifier
        let newNav
        let cmsColors = layout.data.attributes.colors
        const logo = layout.data?.attributes?.logo?.data?.attributes?.url || ''
        const favicon = layout.data?.attributes?.favicon?.data?.attributes?.url || ''
        const pageSeo = req.entry.seo || ''
        let contactInfo: any = await createContactInfo(layout.data.attributes, siteIdentifier)
        contactInfo = await transformcontact(contactInfo)
        const socialMediaItems = createSocials(layout.data?.attributes.socialMedia)

        const usingPreviewMode = layout.data.attributes.usePreviewMode === true ? true : false

        //get layout object
        const currentLayoutS3 = await getFileS3(`${siteIdentifier}/layout.json`)

        if (!currentLayoutS3.cmsNav) {
            currentLayoutS3.cmsNav = []
        }

        //maybe add check to see if nav option is saved then do this
        newNav = layout.data?.attributes.singlePageSite ? currentLayoutS3.cmsNav : transformStrapiNav(nav)

        let modAnchorLinks: { modId: number | string; anchorLink: string }[] = []
        let anchorTags: anchorTags = []
        //Create anchor link nav
        if (layout.data?.attributes.singlePageSite === true) {
            const { moddedAnchorTags, moddedNewNav, moddedModAnchorLinks } = manageAnchorLinks(pages, anchorTags, newNav, modAnchorLinks)
            modAnchorLinks = moddedModAnchorLinks
            anchorTags = moddedAnchorTags
            newNav = moddedNewNav
        }

        //if saved type is a page
        if (req.entry.slug != null && req.entry.Body) {
            let modCount = 0
            let newPages = []
            //module loop

            for (const i in req.entry.Body) {
                modCount += 1
                let currentModule = req.entry.Body[i]
                const componentType = determineComponentType(currentModule.__component, currentModule.useCarousel || false)
                const modRenderType = determineModRenderType(currentModule.__component)

                const imgsize = currentModule.extraSettings?.imgsize || currentModule.imgsize || 'landscape_16_9'

                const imagePriority =
                    currentModule.extraSettings?.lazyload != null
                        ? currentModule.extraSettings?.lazyload
                        : currentModule.lazyload != null
                        ? currentModule.lazyload
                        : true

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
                    (modRenderType === 'PhotoGallery' && currentModule.items)
                ) {
                    currentModule.items = alternatePromoColors(currentModule.items, cmsColors, well)
                }

                //transform Photo Gallery Settings
                if ((modRenderType === 'PhotoGallery' || modRenderType === 'Testimonials') && currentModule.settings) {
                    currentModule.settings = createGallerySettings(currentModule.settings, currentModule.blockSwitch1 || '', currentModule.type || '')
                }

                //add contactFormData in form object
                if (modRenderType === 'ContactFormRoutes') {
                    currentModule = setupContactForm(currentModule)
                }
                //add contactFormData in form object
                if (modRenderType === 'Map') {
                    currentModule = { ...currentModule, address: contactInfo.address }
                }

                /*------------------- End Mod Transforms -------------------------*/

                //loop through items
                let itemCount = 0
                if (currentModule.items) {
                    for (const t in currentModule.items) {
                        const currentItem = currentModule.items[t]
                        itemCount += 1

                        //converting extra settings
                        if (currentModule.items[t].extraItemSettings) {
                            currentModule.items[t] = addItemExtraSettings(currentModule.items[t])
                        }

                        if (modRenderType === 'Parallax' || modRenderType === 'PhotoGallery') {
                            currentModule.items[t] = { ...currentModule.items[t], modSwitch1: 1 }
                        }

                        //settings image data (uses first image)
                        if (currentItem.image) {
                            currentModule.items[t] = {
                                ...currentModule.items[t],
                                image: currentItem.image[0].url || '',
                                caption_tag: currentItem.image[0].caption || '',
                                img_alt_tag: currentItem.image[0].alternativeText || '',
                                imagePriority: imagePriority,
                            }
                        }

                        if (currentItem.headSize) {
                            currentModule.items[t].headSize = transformTextSize(currentModule.items[t].headSize)
                        }

                        if (currentItem.descSize) {
                            currentModule.items[t].descSize = transformTextSize(currentModule.items[t].descSize)
                        }

                        //testimonials stars
                        if (currentItem.stars) {
                            currentModule.items[t] = { ...currentModule.items[t], actionlbl: convertColumns(currentItem.stars) }
                        }

                        //convert button data
                        if (currentItem.buttons?.length != 0) {
                            currentModule.items[t] = createStrapiButtonVars(currentModule.items[t], modRenderType, columns)
                        }

                        //add image overlay for parallax/photogallery
                        if (currentModule.imageOverlay === true) {
                            const modColor1 = 'rgb(0,0,0)'
                            const modOpacity = 0.8
                            currentModule.items[t] = { ...currentModule.items[t], modColor1: modColor1, modOpacity: modOpacity }
                        }

                        const headerTag = currentItem.headerTagH1 === true ? 'h1' : ''
                        currentModule.items[t] = {
                            ...currentModule.items[t],
                            headerTag: headerTag,
                            itemCount: itemCount,
                        }
                    }

                    //individ anchor links
                    if (modAnchorLinks.filter((e) => e.modId === currentModule.id).length > 0) {
                        const modAnchorLink = modAnchorLinks.filter((e) => e.modId === currentModule.id)
                        console.log('anchor links checking', currentModule.id, modAnchorLink)
                        currentModule.anchorLink = modAnchorLink[0].anchorLink
                    }

                    //creating item styles
                    if (modRenderType === 'Parallax' || modRenderType === 'Banner' || modRenderType === 'PhotoGallery') {
                        currentModule.items = createItemStyles(currentModule.items, well, modRenderType, componentType)
                    }
                }

                //fully transformed page
                newPages.push({
                    attributes: {
                        ...currentModule,
                        type: componentType,
                        imgsize: imgsize,
                        modId: currentModule.id,
                        columns: columns,
                        well: well,
                        modCount: modCount,
                    },
                    componentType: modRenderType,
                })
            }

            const newPage = {
                data: {
                    id: String(req.entry.id),
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
                    pageType: '',
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
            usingPreviewMode: usingPreviewMode,
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
        throw error
    }
}
