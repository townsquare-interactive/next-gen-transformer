import { createGlobalStylesheet } from '../controllers/cms-controller.js';
import { transformStrapiNav, determineModRenderType, transformTextSize, determineComponentType, convertColumns, createFonts, createSocials, setupContactForm, createStrapiButtonVars, setDefaultColors, createContactInfo, addItemExtraSettings, manageAnchorLinks, } from '../strapi-utils.js';
import { createGallerySettings, alternatePromoColors, transformcontact, createFontCss } from '../utils.js';
import { getFileS3 } from '../s3Functions.js';
import { createItemStyles } from '../style-utils.js';
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
                    pageType: '',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3RyYW5zbGF0aW9uLWVuZ2luZXMvc3RyYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLGtDQUFrQyxDQUFBO0FBQ3pFLE9BQU8sRUFDSCxrQkFBa0IsRUFDbEIsc0JBQXNCLEVBQ3RCLGlCQUFpQixFQUNqQixzQkFBc0IsRUFDdEIsY0FBYyxFQUNkLFdBQVcsRUFDWCxhQUFhLEVBQ2IsZ0JBQWdCLEVBQ2hCLHNCQUFzQixFQUN0QixnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ2pCLG9CQUFvQixFQUNwQixpQkFBaUIsR0FDcEIsTUFBTSxvQkFBb0IsQ0FBQTtBQUMzQixPQUFPLEVBQUUscUJBQXFCLEVBQUUsb0JBQW9CLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLE1BQU0sYUFBYSxDQUFBO0FBQzFHLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQTtBQUc3QyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQTtBQUVwRDs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0gscUNBQXFDO0FBQ3JDLE1BQU0sS0FBSyxHQUFHLHVCQUF1QixDQUFBO0FBRXJDLE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBRyxLQUFLLEVBQUUsR0FBWSxFQUFFLEVBQUU7SUFDbEQsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFBO0lBRWxCLG1EQUFtRDtJQUNuRCx3SUFBd0k7SUFFeEksSUFBSSxDQUFDO1FBQ0QsTUFBTSxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDO1lBQ3BELEtBQUssQ0FBQyxHQUFHLEtBQUssOEJBQThCLENBQUM7WUFDN0MsS0FBSyxDQUFDLEdBQUcsS0FBSyxvQ0FBb0MsQ0FBQztZQUNuRCxLQUFLLENBQUMsR0FBRyxL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