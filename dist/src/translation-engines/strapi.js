import { createGlobalStylesheet } from '../controllers/cms-controller.js';
import { transformStrapiNav, determineModRenderType, transformTextSize, determineComponentType, convertColumns, createFonts, createSocials, setupContactForm, createStrapiButtonVars, setDefaultColors, createContactInfo, addItemExtraSettings, manageAnchorLinks, } from '../utilities/strapi-utils.js';
import { createGallerySettings, alternatePromoColors, transformcontact, createFontCss } from '../utilities/utils.js';
import { getFileS3 } from '../utilities/s3Functions.js';
import { createItemStyles } from '../utilities/style-utils.js';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3RyYW5zbGF0aW9uLWVuZ2luZXMvc3RyYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLGtDQUFrQyxDQUFBO0FBQ3pFLE9BQU8sRUFDSCxrQkFBa0IsRUFDbEIsc0JBQXNCLEVBQ3RCLGlCQUFpQixFQUNqQixzQkFBc0IsRUFDdEIsY0FBYyxFQUNkLFdBQVcsRUFDWCxhQUFhLEVBQ2IsZ0JBQWdCLEVBQ2hCLHNCQUFzQixFQUN0QixnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ2pCLG9CQUFvQixFQUNwQixpQkFBaUIsR0FDcEIsTUFBTSw4QkFBOEIsQ0FBQTtBQUNyQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsb0JBQW9CLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFDcEgsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDZCQUE2QixDQUFBO0FBR3ZELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDZCQUE2QixDQUFBO0FBRTlEOzs7Ozs7Ozs7Ozs7O0dBYUc7QUFDSCxxQ0FBcUM7QUFDckMsTUFBTSxLQUFLLEdBQUcsdUJBQXVCLENBQUE7QUFFckMsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUFHLEtBQUssRUFBRSxHQUFZLEVBQUUsRUFBRTtJQUNsRCxJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUE7SUFFbEIsbURBQW1EO0lBQ25ELHdJQUF3STtJQUV4SSxJQUFJLENBQUM7UUFDRCxNQUFNLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUM7WUFDcEQsS0FBSyxDQUFDLEdBQUcsS0FBSyw4QkFBOEIsQ0FBQztZQUM3QyxLQUFLLENBQUMsR0FBRyxLQUFLLG9DQUFvQyxDQUFDO1lBQ25ELEtBQUssQ0FBQyxHQUFHLEtBQUssMEJBQTBCLENBQUM7U0FDNUMsQ0FBQyxDQUFBO1FBQ0YsTUFBTSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQVUsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQ3pHLHFEQUFxRDtRQUNyRCxNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUE7UUFDNUQsSUFBSSxNQUFNLENBQUE7UUFDVixJQUFJLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUE7UUFDN0MsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsR0FBRyxJQUFJLEVBQUUsQ0FBQTtRQUN2RSxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxHQUFHLElBQUksRUFBRSxDQUFBO1FBQzdFLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQTtRQUNuQyxJQUFJLFdBQVcsR0FBUSxNQUFNLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLGNBQWMsQ0FBQyxDQUFBO1FBQ3RGLFdBQVcsR0FBRyxNQUFNLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFBO1FBQ2pELE1BQU0sZ0JBQWdCLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFBO1FBRTNFLE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUE7UUFFdEYsbUJBQW1CO1FBQ25CLE1BQU0sZUFBZSxHQUFHLE1BQU0sU0FBUyxDQUFDLEdBQUcsY0FBYyxjQUFjLENBQUMsQ0FBQTtRQUV4RSxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQzFCLGVBQWUsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFBO1FBQy9CLENBQUM7UUFFRCw0REFBNEQ7UUFDNUQsTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUE7UUFFbEcsSUFBSSxjQUFjLEdBQXFELEVBQUUsQ0FBQTtRQUN6RSxJQUFJLFVBQVUsR0FBZSxFQUFFLENBQUE7UUFDL0Isd0JBQXdCO1FBQ3hCLElBQUksTUFBTSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsY0FBYyxLQUFLLElBQUksRUFBRSxDQUFDO1lBQ2xELE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsb0JBQW9CLEVBQUUsR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxjQUFjLENBQUMsQ0FBQTtZQUM3SCxjQUFjLEdBQUcsb0JBQW9CLENBQUE7WUFDckMsVUFBVSxHQUFHLGdCQUFnQixDQUFBO1lBQzdCLE1BQU0sR0FBRyxZQUFZLENBQUE7UUFDekIsQ0FBQztRQUVELHlCQUF5QjtRQUN6QixJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzNDLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQTtZQUNoQixJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUE7WUFDakIsYUFBYTtZQUViLEtBQUssTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDN0IsUUFBUSxJQUFJLENBQUMsQ0FBQTtnQkFDYixJQUFJLGFBQWEsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtnQkFDckMsTUFBTSxhQUFhLEdBQUcsc0JBQXNCLENBQUMsYUFBYSxDQUFDLFdBQVcsRUFBRSxhQUFhLENBQUMsV0FBVyxJQUFJLEtBQUssQ0FBQyxDQUFBO2dCQUMzRyxNQUFNLGFBQWEsR0FBRyxzQkFBc0IsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUE7Z0JBRXZFLE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxhQUFhLEVBQUUsT0FBTyxJQUFJLGFBQWEsQ0FBQyxPQUFPLElBQUksZ0JBQWdCLENBQUE7Z0JBRWpHLE1BQU0sYUFBYSxHQUNmLGFBQWEsQ0FBQyxhQUFhLEVBQUUsUUFBUSxJQUFJLElBQUk7b0JBQ3pDLENBQUMsQ0FBQyxhQUFhLENBQUMsYUFBYSxFQUFFLFFBQVE7b0JBQ3ZDLENBQUMsQ0FBQyxhQUFhLENBQUMsUUFBUSxJQUFJLElBQUk7d0JBQ2hDLENBQUMsQ0FBQyxhQUFhLENBQUMsUUFBUTt3QkFDeEIsQ0FBQyxDQUFDLElBQUksQ0FBQTtnQkFFZCxhQUFhLENBQUMsT0FBTyxHQUFHLGFBQWEsQ0FBQyxPQUFPLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUE7Z0JBQ2xGLE1BQU0sT0FBTyxHQUFHLGNBQWMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUE7Z0JBQ3JELE1BQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxhQUFhLEVBQUUsTUFBTSxJQUFJLGFBQWEsQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFBO2dCQUVuRixNQUFNLElBQUksR0FBRyxNQUFNLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtnQkFFdkMsZ0VBQWdFO2dCQUVoRSxpQ0FBaUM7Z0JBQ2pDLElBQ0ksYUFBYSxLQUFLLFdBQVc7b0JBQzdCLGFBQWEsS0FBSyxRQUFRO29CQUMxQixhQUFhLEtBQUssVUFBVTtvQkFDNUIsQ0FBQyxhQUFhLEtBQUssY0FBYyxJQUFJLGFBQWEsQ0FBQyxLQUFLLENBQUMsRUFDM0QsQ0FBQztvQkFDQyxhQUFhLENBQUMsS0FBSyxHQUFHLG9CQUFvQixDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFBO2dCQUNwRixDQUFDO2dCQUVELGtDQUFrQztnQkFDbEMsSUFBSSxDQUFDLGFBQWEsS0FBSyxjQUFjLElBQUksYUFBYSxLQUFLLGNBQWMsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztvQkFDbkcsYUFBYSxDQUFDLFFBQVEsR0FBRyxxQkFBcUIsQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxZQUFZLElBQUksRUFBRSxFQUFFLGFBQWEsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUE7Z0JBQ3RJLENBQUM7Z0JBRUQsb0NBQW9DO2dCQUNwQyxJQUFJLGFBQWEsS0FBSyxtQkFBbUIsRUFBRSxDQUFDO29CQUN4QyxhQUFhLEdBQUcsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUE7Z0JBQ25ELENBQUM7Z0JBQ0Qsb0NBQW9DO2dCQUNwQyxJQUFJLGFBQWEsS0FBSyxLQUFLLEVBQUUsQ0FBQztvQkFDMUIsYUFBYSxHQUFHLEVBQUUsR0FBRyxhQUFhLEVBQUUsT0FBTyxFQUFFLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtnQkFDdEUsQ0FBQztnQkFFRCxvRUFBb0U7Z0JBRXBFLG9CQUFvQjtnQkFDcEIsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFBO2dCQUNqQixJQUFJLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDdEIsS0FBSyxNQUFNLENBQUMsSUFBSSxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7d0JBQ2xDLE1BQU0sV0FBVyxHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7d0JBQzFDLFNBQVMsSUFBSSxDQUFDLENBQUE7d0JBRWQsMkJBQTJCO3dCQUMzQixJQUFJLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLEVBQUUsQ0FBQzs0QkFDM0MsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxvQkFBb0IsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7d0JBQ3pFLENBQUM7d0JBRUQsSUFBSSxhQUFhLEtBQUssVUFBVSxJQUFJLGFBQWEsS0FBSyxjQUFjLEVBQUUsQ0FBQzs0QkFDbkUsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUE7d0JBQ3pFLENBQUM7d0JBRUQsd0NBQXdDO3dCQUN4QyxJQUFJLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQzs0QkFDcEIsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRztnQ0FDckIsR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQ0FDekIsS0FBSyxFQUFFLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUU7Z0NBQ3JDLFdBQVcsRUFBRSxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxFQUFFO2dDQUMvQyxXQUFXLEVBQUUsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLElBQUksRUFBRTtnQ0FDdkQsYUFBYSxFQUFFLGFBQWE7NkJBQy9CLENBQUE7d0JBQ0wsQ0FBQzt3QkFFRCxJQUFJLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQzs0QkFDdkIsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsaUJBQWlCLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQTt3QkFDeEYsQ0FBQzt3QkFFRCxJQUFJLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQzs0QkFDdkIsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsaUJBQWlCLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQTt3QkFDeEYsQ0FBQzt3QkFFRCxvQkFBb0I7d0JBQ3BCLElBQUksV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDOzRCQUNwQixhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUE7d0JBQ3hHLENBQUM7d0JBRUQscUJBQXFCO3dCQUNyQixJQUFJLFdBQVcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDOzRCQUNuQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLHNCQUFzQixDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFBO3dCQUNuRyxDQUFDO3dCQUVELDZDQUE2Qzt3QkFDN0MsSUFBSSxhQUFhLENBQUMsWUFBWSxLQUFLLElBQUksRUFBRSxDQUFDOzRCQUN0QyxNQUFNLFNBQVMsR0FBRyxZQUFZLENBQUE7NEJBQzlCLE1BQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQTs0QkFDdEIsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsQ0FBQTt3QkFDeEcsQ0FBQzt3QkFFRCxNQUFNLFNBQVMsR0FBRyxXQUFXLENBQUMsV0FBVyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUE7d0JBQzlELGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUc7NEJBQ3JCLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7NEJBQ3pCLFNBQVMsRUFBRSxTQUFTOzRCQUNwQixTQUFTLEVBQUUsU0FBUzt5QkFDdkIsQ0FBQTtvQkFDTCxDQUFDO29CQUVELHNCQUFzQjtvQkFDdEIsSUFBSSxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7d0JBQ3hFLE1BQU0sYUFBYSxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFBO3dCQUNoRixPQUFPLENBQUMsR0FBRyxDQUFDLHVCQUF1QixFQUFFLGFBQWEsQ0FBQyxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUE7d0JBQ3JFLGFBQWEsQ0FBQyxVQUFVLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQTtvQkFDMUQsQ0FBQztvQkFFRCxzQkFBc0I7b0JBQ3RCLElBQUksYUFBYSxLQUFLLFVBQVUsSUFBSSxhQUFhLEtBQUssUUFBUSxJQUFJLGFBQWEsS0FBSyxjQUFjLEVBQUUsQ0FBQzt3QkFDakcsYUFBYSxDQUFDLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsYUFBYSxDQUFDLENBQUE7b0JBQ25HLENBQUM7Z0JBQ0wsQ0FBQztnQkFFRCx3QkFBd0I7Z0JBQ3hCLFFBQVEsQ0FBQyxJQUFJLENBQUM7b0JBQ1YsVUFBVSxFQUFFO3dCQUNSLEdBQUcsYUFBYTt3QkFDaEIsSUFBSSxFQUFFLGFBQWE7d0JBQ25CLE9BQU8sRUFBRSxPQUFPO3dCQUNoQixLQUFLLEVBQUUsYUFBYSxDQUFDLEVBQUU7d0JBQ3ZCLE9BQU8sRUFBRSxPQUFPO3dCQUNoQixJQUFJLEVBQUUsSUFBSTt3QkFDVixRQUFRLEVBQUUsUUFBUTtxQkFDckI7b0JBQ0QsYUFBYSxFQUFFLGFBQWE7aUJBQy9CLENBQUMsQ0FBQTtZQUNOLENBQUM7WUFFRCxNQUFNLE9BQU8sR0FBRztnQkFDWixJQUFJLEVBQUU7b0JBQ0YsRUFBRSxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztvQkFDeEIsS0FBSyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSTtvQkFDckIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSTtvQkFDcEIsU0FBUyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUN4RCxHQUFHLEVBQUUsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRTtvQkFDekIsRUFBRSxFQUFFLEVBQUU7b0JBQ04sSUFBSSxFQUFFLE1BQU07b0JBQ1osTUFBTSxFQUFFLENBQUM7b0JBQ1QsT0FBTyxFQUFFLENBQUM7b0JBQ1YsT0FBTyxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztvQkFDbkMsUUFBUSxFQUFFO3dCQUNOOzRCQUNJLElBQUksRUFBRSxNQUFNO3lCQUNmO3dCQUNEOzRCQUNJLElBQUksRUFBRSxLQUFLO3lCQUNkO3dCQUNEOzRCQUNJLElBQUksRUFBRSxLQUFLO3lCQUNkO3dCQUNEOzRCQUNJLElBQUksRUFBRSxLQUFLO3lCQUNkO3dCQUNEOzRCQUNJLElBQUksRUFBRSxLQUFLO3lCQUNkO3FCQUNKO29CQUNELFNBQVMsRUFBRSxJQUFJO29CQUNmLFdBQVcsRUFBRSxFQUFFO29CQUNmLFlBQVksRUFBRSxhQUFhO29CQUMzQixVQUFVLEVBQUUsVUFBVTtvQkFDdEIsUUFBUSxFQUFFLEVBQUU7aUJBQ2Y7Z0JBQ0QsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsR0FBRyxFQUFFO29CQUNELEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxJQUFJLEVBQUU7b0JBQzNCLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxJQUFJLEVBQUU7b0JBQzNCLGNBQWMsRUFBRSxJQUFJO29CQUNwQixhQUFhLEVBQUUsSUFBSTtpQkFDdEI7YUFDSixDQUFBO1lBRUQsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUMzQixDQUFDO1FBRUQsa0NBQWtDO1FBQ2xDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNiLFNBQVMsR0FBRyxnQkFBZ0IsRUFBRSxDQUFBO1FBQ2xDLENBQUM7UUFFRCx1RUFBdUU7UUFDdkUsTUFBTSxhQUFhLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUE7UUFDakMsSUFBSSxlQUFlLEdBQUcsRUFBRSxDQUFBO1FBRXhCLE9BQU87UUFDUCxNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUM7WUFDNUIsWUFBWSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksSUFBSSxjQUFjO1lBQ25FLFFBQVEsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLElBQUksTUFBTTtZQUNuRCxRQUFRLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxJQUFJLGNBQWM7U0FDOUQsQ0FBQyxDQUFBO1FBRUYsTUFBTSxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsR0FBRyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUE7UUFDbkUsTUFBTSxZQUFZLEdBQUcsTUFBTSxzQkFBc0IsQ0FBQyxTQUFTLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSxlQUFlLEVBQUUsY0FBYyxDQUFDLENBQUE7UUFFekgsTUFBTSxNQUFNLEdBQUc7WUFDWCxjQUFjLEVBQUUsY0FBYztZQUM5QixnQkFBZ0IsRUFBRSxnQkFBZ0I7WUFDbEMsVUFBVSxFQUFFO2dCQUNSLE1BQU0sRUFBRSxNQUFNO2dCQUNkLEtBQUssRUFBRTtvQkFDSCxNQUFNLEVBQUU7d0JBQ0osS0FBSyxFQUFFOzRCQUNIO2dDQUNJLE1BQU0sRUFBRSxFQUFFO2dDQUNWLFFBQVEsRUFBRSxLQUFLO2dDQUNmLFNBQVMsRUFBRSxNQUFNO2dDQUNqQixTQUFTLEVBQUUsRUFBRTtnQ0FDYixVQUFVLEVBQUUsR0FBRzs2QkFDbEI7NEJBQ0Q7Z0NBQ0ksTUFBTSxFQUFFLEVBQUU7NkJBQ2I7NEJBQ0Q7Z0NBQ0ksTUFBTSxFQUFFLEVBQUU7NkJBQ2I7eUJBQ0o7cUJBQ0o7b0JBQ0QsTUFBTSxFQUFFO3dCQUNKLEtBQUssRUFBRTs0QkFDSDtnQ0FDSSxJQUFJLEVBQUUsQ0FBQztnQ0FDUCxJQUFJLEVBQUUsTUFBTTtnQ0FDWixNQUFNLEVBQUUsRUFBRTtnQ0FDVixRQUFRLEVBQUUsS0FBSztnQ0FDZixTQUFTLEVBQUUsTUFBTTtnQ0FDakIsU0FBUyxFQUFFLElBQUk7Z0NBQ2YsVUFBVSxFQUFFLEdBQUc7NkJBQ2xCOzRCQUNEO2dDQUNJLElBQUksRUFBRSxDQUFDO2dDQUNQLElBQUksRUFBRSxNQUFNO2dDQUNaLE1BQU0sRUFBRSxFQUFFO2dDQUNWLFFBQVEsRUFBRSxLQUFLO2dDQUNmLFNBQVMsRUFBRSxNQUFNO2dDQUNqQixTQUFTLEVBQUUsRUFBRTtnQ0FDYixVQUFVLEVBQUUsR0FBRzs2QkFDbEI7NEJBQ0Q7Z0NBQ0ksSUFBSSxFQUFFLENBQUM7Z0NBQ1AsSUFBSSxFQUFFLE1BQU07Z0NBQ1osTUFBTSxFQUFFLEVBQUU7Z0NBQ1YsUUFBUSxFQUFFLEtBQUs7Z0NBQ2YsU0FBUyxFQUFFLE1BQU07Z0NBQ2pCLFNBQVMsRUFBRSxFQUFFO2dDQUNiLFVBQVUsRUFBRSxHQUFHOzZCQUNsQjt5QkFDSjt3QkFDRCxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7cUJBQ25CO29CQUNELE1BQU0sRUFBRTt3QkFDSixLQUFLLEVBQUU7NEJBQ0g7Z0NBQ0ksSUFBSSxFQUFFLENBQUM7Z0NBQ1AsSUFBSSxFQUFFLE1BQU07Z0NBQ1osTUFBTSxFQUFFLEVBQUU7Z0NBQ1YsUUFBUSxFQUFFLEtBQUs7Z0NBQ2YsU0FBUyxFQUFFLE1BQU07Z0NBQ2pCLFNBQVMsRUFBRSxJQUFJO2dDQUNmLFVBQVUsRUFBRSxHQUFHOzZCQUNsQjs0QkFDRDtnQ0FDSSxNQUFNLEVBQUUsRUFBRTs2QkFDYjs0QkFDRDtnQ0FDSSxNQUFNLEVBQUUsRUFBRTs2QkFDYjt5QkFDSjt3QkFDRCxXQUFXLEVBQUUsRUFBRTtxQkFDbEI7aUJBQ0o7Z0JBQ0QsTUFBTSxFQUFFLGdCQUFnQjtnQkFDeEIsT0FBTyxFQUFFLFdBQVc7Z0JBQ3BCLFFBQVEsRUFBRSxjQUFjO2dCQUN4QixHQUFHLEVBQUUsRUFBRTtnQkFDUCxVQUFVLEVBQUU7b0JBQ1IsTUFBTSxFQUFFO3dCQUNKLElBQUksRUFBRSxXQUFXO3dCQUNqQixNQUFNLEVBQUUsSUFBSTt3QkFDWixPQUFPLEVBQUUsQ0FBQzt3QkFDVixPQUFPLEVBQUU7NEJBQ0wsSUFBSSxFQUFFLFdBQVc7NEJBQ2pCLEtBQUssRUFBRSxFQUFFO3lCQUNaO3FCQUNKO2lCQUNKO2dCQUNELFNBQVMsRUFBRSxTQUFTO2dCQUNwQixLQUFLLEVBQUUsd0JBQXdCO2dCQUMvQixNQUFNLEVBQUUsRUFBRTtnQkFDVixRQUFRLEVBQUUsY0FBYztnQkFDeEIsT0FBTyxFQUFFLE9BQU87Z0JBQ2hCLFVBQVUsRUFBRSxlQUFlO2dCQUMzQiw4QkFBOEI7Z0JBQzlCLE1BQU0sRUFBRTtvQkFDSixTQUFTLEVBQUU7d0JBQ1AsS0FBSyxFQUFFLFlBQVk7d0JBQ25CLFVBQVUsRUFBRSxNQUFNO3FCQUNyQjtvQkFDRCxTQUFTLEVBQUUsd0RBQXdEO29CQUNuRSxPQUFPLEVBQUUsNERBQTREO2lCQUN4RTthQUNKO1lBQ0QsS0FBSyxFQUFFLFNBQVM7WUFFaEIsTUFBTSxFQUFFLEVBQUU7WUFDVixZQUFZLEVBQUUsWUFBWTtTQUM3QixDQUFBO1FBRUQsT0FBTyxNQUFNLENBQUE7SUFDakIsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDYixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQ2xCLE1BQU0sS0FBSyxDQUFBO0lBQ2YsQ0FBQztBQUNMLENBQUMsQ0FBQSJ9