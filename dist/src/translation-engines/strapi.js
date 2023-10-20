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
        contactInfo = transformcontact(contactInfo);
        const socialMediaItems = createSocials(layout.data?.attributes.socialMedia);
        const usingPreviewMode = layout.data.attributes.usePreviewMode === true ? true : false;
        //get nav object
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
        return { error: 'Strapi fetch error' };
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3RyYW5zbGF0aW9uLWVuZ2luZXMvc3RyYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLGtDQUFrQyxDQUFBO0FBQ3pFLE9BQU8sRUFDSCxrQkFBa0IsRUFDbEIsc0JBQXNCLEVBQ3RCLGlCQUFpQixFQUNqQixzQkFBc0IsRUFDdEIsY0FBYyxFQUNkLFdBQVcsRUFDWCxhQUFhLEVBQ2IsZ0JBQWdCLEVBQ2hCLHNCQUFzQixFQUN0QixnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ2pCLG9CQUFvQixFQUNwQixpQkFBaUIsR0FDcEIsTUFBTSxvQkFBb0IsQ0FBQTtBQUMzQixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUscUJBQXFCLEVBQUUsb0JBQW9CLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLE1BQU0sYUFBYSxDQUFBO0FBQzVILE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQTtBQUk3Qzs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0gscUNBQXFDO0FBQ3JDLE1BQU0sS0FBSyxHQUFHLHVCQUF1QixDQUFBO0FBRXJDLE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBRyxLQUFLLEVBQUUsR0FBWSxFQUFFLEVBQUU7SUFDbEQsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFBO0lBRWxCLG1EQUFtRDtJQUNuRCx3SUFBd0k7SUFFeEksSUFBSTtRQUNBLE1BQU0sQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUNwRCxLQUFLLENBQUMsR0FBRyxLQUFLLDhCQUE4QixDQUFDO1lBQzdDLEtBQUssQ0FBQyxHQUFHLEtBQUssb0NBQW9DLENBQUM7WUFDbkQsS0FBSyxDQUFDLEdBQUcsS0FBSywwQkFBMEIsQ0FBQztTQUM1QyxDQUFDLENBQUE7UUFDRixN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