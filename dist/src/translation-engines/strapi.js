import { createGlobalStylesheet } from '../controllers/cms-controller.js';
import { transformStrapiNav, determineModRenderType, transformTextSize, determineComponentType, convertColumns, createFonts, createSocials, setupContactForm, createStrapiButtonVars, setDefaultColors, createContactInfo, addItemExtraSettings, manageAnchorLinks, } from '../strapi-utils.js';
import { createItemStyles, createGallerySettings, alternatePromoColors, transformcontact, createFontCss } from '../utils.js';
import { getFileS3 } from '../s3Functions.js';
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
const dbUrl = 'http://127.0.0.1:1337';
export const transformStrapi = async (req) => {
    let pagesList = [];
    //console.log('lets check the req', req, req.entry)
    //console.log('this will check for draft==========================', req.entry.publishedAt ? 'this is published' : 'this is draft', req)
    try {
        const [resLayout, resNav, resPages] = await Promise.all([
            fetch(`${dbUrl}/api/site-data?populate=deep`),
            fetch(`${dbUrl}/api/navigation/render/1?locale=fr`),
            fetch(`${dbUrl}/api/pages?populate=deep`),
        ]);
        const [layout, nav, pages] = await Promise.all([resLayout.json(), resNav.json(), resPages.json()]);
        //zod check these ^^ if you don't want them to be any
        const siteIdentifier = layout.data.attributes.siteIdentifier;
        let newNav;
        let cmsColors = layout.data.attributes.colors;
        const logo = layout.data?.attributes?.logo?.data?.attributes?.url || '';
        const favicon = layout.data?.attributes?.favicon?.data?.attributes?.url || '';
        const pageSeo = req.entry.seo || '';
        let contactInfo = await createContactInfo(layout.data.attributes, siteIdentifier);
        contactInfo = await transformcontact(contactInfo);
        const socialMediaItems = createSocials(layout.data?.attributes.socialMedia);
        const usingPreviewMode = layout.data.attributes.usePreviewMode === true ? true : false;
        //get layout object
        const currentLayoutS3 = await getFileS3(`${siteIdentifier}/layout.json`);
        if (!currentLayoutS3.cmsNav) {
            currentLayoutS3.cmsNav = [];
        }
        //maybe add check to see if nav option is saved then do this
        newNav = layout.data?.attributes.singlePageSite ? currentLayoutS3.cmsNav : transformStrapiNav(nav);
        let modAnchorLinks = [];
        let anchorTags = [];
        //Create anchor link nav
        if (layout.data?.attributes.singlePageSite === true) {
            const { moddedAnchorTags, moddedNewNav, moddedModAnchorLinks } = manageAnchorLinks(pages, anchorTags, newNav, modAnchorLinks);
            modAnchorLinks = moddedModAnchorLinks;
            anchorTags = moddedAnchorTags;
            newNav = moddedNewNav;
        }
        //if saved type is a page
        if (req.entry.slug != null && req.entry.Body) {
            let modCount = 0;
            let newPages = [];
            //module loop
            for (const i in req.entry.Body) {
                modCount += 1;
                let currentModule = req.entry.Body[i];
                const componentType = determineComponentType(currentModule.__component, currentModule.useCarousel || false);
                const modRenderType = determineModRenderType(currentModule.__component);
                const imgsize = currentModule.extraSettings?.imgsize || currentModule.imgsize || 'landscape_16_9';
                const imagePriority = currentModule.extraSettings?.lazyload != null
                    ? currentModule.extraSettings?.lazyload
                    : currentModule.lazyload != null
                        ? currentModule.lazyload
                        : true;
                currentModule.columns = currentModule.columns === null ? 1 : currentModule.columns;
                const columns = convertColumns(currentModule.columns);
                const border = currentModule.extraSettings?.border || currentModule.border || false;
                const well = border === true ? '1' : '';
                /*------------------- Mod Transforms -------------------------*/
                //create alternating promo colors
                if (modRenderType === 'PhotoGrid' ||
                    modRenderType === 'Banner' ||
                    modRenderType === 'Parallax' ||
                    (modRenderType === 'PhotoGallery' && currentModule.items)) {
                    currentModule.items = alternatePromoColors(currentModule.items, cmsColors, well);
                }
                //transform Photo Gallery Settings
                if ((modRenderType === 'PhotoGallery' || modRenderType === 'Testimonials') && currentModule.settings) {
                    currentModule.settings = createGallerySettings(currentModule.settings, currentModule.blockSwitch1 || '', currentModule.type || '');
                }
                //add contactFormData in form object
                if (modRenderType === 'ContactFormRoutes') {
                    currentModule = setupContactForm(currentModule);
                }
                //add contactFormData in form object
                if (modRenderType === 'Map') {
                    currentModule = { ...currentModule, address: contactInfo.address };
                }
                /*------------------- End Mod Transforms -------------------------*/
                //loop through items
                let itemCount = 0;
                if (currentModule.items) {
                    for (const t in currentModule.items) {
                        const currentItem = currentModule.items[t];
                        itemCount += 1;
                        //converting extra settings
                        if (currentModule.items[t].extraItemSettings) {
                            currentModule.items[t] = addItemExtraSettings(currentModule.items[t]);
                        }
                        if (modRenderType === 'Parallax' || modRenderType === 'PhotoGallery') {
                            currentModule.items[t] = { ...currentModule.items[t], modSwitch1: 1 };
                        }
                        //settings image data (uses first image)
                        if (currentItem.image) {
                            currentModule.items[t] = {
                                ...currentModule.items[t],
                                image: currentItem.image[0].url || '',
                                caption_tag: currentItem.image[0].caption || '',
                                img_alt_tag: currentItem.image[0].alternativeText || '',
                                imagePriority: imagePriority,
                            };
                        }
                        if (currentItem.headSize) {
                            currentModule.items[t].headSize = transformTextSize(currentModule.items[t].headSize);
                        }
                        if (currentItem.descSize) {
                            currentModule.items[t].descSize = transformTextSize(currentModule.items[t].descSize);
                        }
                        //testimonials stars
                        if (currentItem.stars) {
                            currentModule.items[t] = { ...currentModule.items[t], actionlbl: convertColumns(currentItem.stars) };
                        }
                        //convert button data
                        if (currentItem.buttons?.length != 0) {
                            currentModule.items[t] = createStrapiButtonVars(currentModule.items[t], modRenderType, columns);
                        }
                        //add image overlay for parallax/photogallery
                        if (currentModule.imageOverlay === true) {
                            const modColor1 = 'rgb(0,0,0)';
                            const modOpacity = 0.8;
                            currentModule.items[t] = { ...currentModule.items[t], modColor1: modColor1, modOpacity: modOpacity };
                        }
                        const headerTag = currentItem.headerTagH1 === true ? 'h1' : '';
                        currentModule.items[t] = {
                            ...currentModule.items[t],
                            headerTag: headerTag,
                            itemCount: itemCount,
                        };
                    }
                    //individ anchor links
                    if (modAnchorLinks.filter((e) => e.modId === currentModule.id).length > 0) {
                        const modAnchorLink = modAnchorLinks.filter((e) => e.modId === currentModule.id);
                        console.log('anchor links checking', currentModule.id, modAnchorLink);
                        currentModule.anchorLink = modAnchorLink[0].anchorLink;
                    }
                    //creating item styles
                    if (modRenderType === 'Parallax' || modRenderType === 'Banner' || modRenderType === 'PhotoGallery') {
                        currentModule.items = createItemStyles(currentModule.items, well, modRenderType, componentType);
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
                });
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
                    pageType: ''
                },
                attrs: {},
                seo: {
                    title: pageSeo?.title || '',
                    descr: pageSeo?.descr || '',
                    selectedImages: null,
                    imageOverride: null,
                },
            };
            pagesList.push(newPage);
        }
        //set default colors if none exist
        if (!cmsColors) {
            cmsColors = setDefaultColors();
        }
        //----------------------global styles ---------------------------------
        const siteCustomCss = { CSS: '' };
        let currentPageList = '';
        //fonts
        const strapiFonts = createFonts({
            headlineFont: layout.data.attributes.headlineFont || 'Josefin-Sans',
            bodyFont: layout.data.attributes.bodyFont || 'Lato',
            featFont: layout.data.attributes.featFont || 'Josefin-Sans',
        });
        const { fontImportGroup, fontClasses } = createFontCss(strapiFonts);
        const globalStyles = await createGlobalStylesheet(cmsColors, strapiFonts, siteCustomCss, currentPageList, siteIdentifier);
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
        };
        return strapi;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3RyYW5zbGF0aW9uLWVuZ2luZXMvc3RyYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLGtDQUFrQyxDQUFBO0FBQ3pFLE9BQU8sRUFDSCxrQkFBa0IsRUFDbEIsc0JBQXNCLEVBQ3RCLGlCQUFpQixFQUNqQixzQkFBc0IsRUFDdEIsY0FBYyxFQUNkLFdBQVcsRUFDWCxhQUFhLEVBQ2IsZ0JBQWdCLEVBQ2hCLHNCQUFzQixFQUN0QixnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ2pCLG9CQUFvQixFQUNwQixpQkFBaUIsR0FDcEIsTUFBTSxvQkFBb0IsQ0FBQTtBQUMzQixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUscUJBQXFCLEVBQUUsb0JBQW9CLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLE1BQU0sYUFBYSxDQUFBO0FBQzVILE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQTtBQUk3Qzs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0gscUNBQXFDO0FBQ3JDLE1BQU0sS0FBSyxHQUFHLHVCQUF1QixDQUFBO0FBRXJDLE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBRyxLQUFLLEVBQUUsR0FBWSxFQUFFLEVBQUU7SUFDbEQsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFBO0lBRWxCLG1EQUFtRDtJQUNuRCx3SUFBd0k7SUFFeEksSUFBSTtRQUNBLE1BQU0sQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUNwRCxLQUFLLENBQUMsR0FBRyxLQUFLLDhCQUE4QixDQUFDO1lBQzdDLEtBQUssQ0FBQyxHQUFHLEtBQUssb0NBQW9DLENBQUM7WUFDbkQsS0FBSyxDQUFDLEdBQUcsS0FBSywwQkFBMEIsQ0FBQztTQUM1QyxDQUFDLENBQUE7UUFDRixN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