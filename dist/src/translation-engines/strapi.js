import { createGlobalStylesheet } from '../controllers/cms-controller.js';
import { transformStrapiNav, determineModRenderType, transformTextSize, determineComponentType, convertColumns, createFonts, createSocials, setupContactForm, createStrapiButtonVars, setDefaultColors, createContactInfo, } from '../strapi-utils.ts';
import { createItemStyles, createGallerySettings, alternatePromoColors, transformcontact, createFontCss } from '../utils.js';
import z from 'zod';
const schemaNum = z.coerce.number();
export const transformStrapi = async (req) => {
    let pagesList = [];
    try {
        const resLayout = await fetch('http://127.0.0.1:1337/api/site-data?populate=deep');
        const resNav = await fetch('http://127.0.0.1:1337/api/navigation/render/1?locale=fr');
        const nav = await resNav.json();
        const layout = await resLayout.json();
        const siteIdentifier = layout.data.attributes.siteIdentifier;
        let newNav;
        let cmsColors = layout.data.attributes.colors;
        const logo = layout.data?.attributes?.logo?.data?.attributes?.url || '';
        const favicon = layout.data?.attributes?.favicon?.data?.attributes?.url || '';
        const pageSeo = req.entry.seo || '';
        let anchorTags = [];
        //if saved type is a page
        if (req.entry.slug != null && req.entry.Body) {
            let modCount = 0;
            //module loop
            for (const i in req.entry.Body) {
                modCount += 1;
                const currentModule = req.entry.Body[i];
                console.log('currrrrrr mod', currentModule);
                const componentType = determineComponentType(currentModule.__component, currentModule.useCarousel || false);
                const modRenderType = determineModRenderType(currentModule.__component);
                const imgsize = currentModule.imgsize || 'square_1_1';
                const imagePriority = currentModule.lazyload;
                currentModule.columns = currentModule.columns === null ? 1 : currentModule.columns;
                const columns = convertColumns(currentModule.columns);
                /*------------------- Mod Transforms -------------------------*/
                const well = currentModule.border === true ? '1' : '';
                //create alternating promo colors
                if (modRenderType === 'PhotoGrid' ||
                    modRenderType === 'Banner' ||
                    modRenderType === 'Parallax' ||
                    (modRenderType === 'PhotoGallery' && req.entry.Body[i].items)) {
                    req.entry.Body[i].items = alternatePromoColors(currentModule.items, cmsColors, well);
                }
                //transform Photo Gallery Settings
                if ((modRenderType === 'PhotoGallery' || modRenderType === 'Testimonials') && currentModule.settings) {
                    req.entry.Body[i].settings = createGallerySettings(currentModule.settings, currentModule.blockSwitch1, currentModule.type);
                }
                //add contactFormData in form object
                if (modRenderType === 'ContactFormRoutes') {
                    req.entry.Body[i] = setupContactForm(req.entry.Body[i]);
                }
                //anchor tags
                if (req.entry.Body[i].title && req.entry.Body[i].useAnchor === true) {
                    anchorTags.push({
                        name: req.entry.Body[i].title,
                        link: `#id_${currentModule.id}`,
                    });
                }
                /*------------------- End Mod Transforms -------------------------*/
                //loop through items
                let itemCount = 0;
                if (req.entry.Body[i].items) {
                    for (const t in currentModule.items) {
                        const currentItem = currentModule.items[t];
                        console.log('coldo item', currentItem);
                        itemCount += 1;
                        if (modRenderType === 'Parallax' || modRenderType === 'PhotoGallery') {
                            req.entry.Body[i].items[t] = { ...req.entry.Body[i].items[t], modSwitch1: 1 };
                        }
                        //settings image data (uses first image)
                        if (currentItem.image) {
                            req.entry.Body[i].items[t] = {
                                ...req.entry.Body[i].items[t],
                                image: currentItem.image[0].url || '',
                                caption_tag: currentItem.image[0].caption || '',
                                img_alt_tag: currentItem.image[0].alternativeText || '',
                            };
                        }
                        if (currentItem.headSize) {
                            req.entry.Body[i].items[t].headSize = transformTextSize(req.entry.Body[i].items[t].headSize);
                        }
                        if (currentItem.descSize) {
                            req.entry.Body[i].items[t].descSize = transformTextSize(req.entry.Body[i].items[t].descSize);
                        }
                        //testimonials stars
                        if (currentItem.stars) {
                            req.entry.Body[i].items[t] = { ...req.entry.Body[i].items[t], actionlbl: convertColumns(currentItem.stars) };
                        }
                        //convert button data
                        if (currentItem.buttons.length != 0) {
                            req.entry.Body[i].items[t] = createStrapiButtonVars(req.entry.Body[i].items[t], modRenderType, columns);
                        }
                        //add image overlay for parallax/photogallery
                        if (req.entry.Body[i].imageOverlay === true) {
                            const modColor1 = 'rgb(0,0,0)';
                            const modOpacity = 0.8;
                            req.entry.Body[i].items[t] = { ...req.entry.Body[i].items[t], modColor1: modColor1, modOpacity: modOpacity };
                        }
                        const headerTag = currentItem.headerTagH1 === true ? 'h1' : '';
                        req.entry.Body[i].items[t] = {
                            ...req.entry.Body[i].items[t],
                            headerTag: headerTag,
                            itemCount: itemCount,
                        };
                    }
                    //creating item styles
                    if (modRenderType === 'Parallax' || modRenderType === 'Banner' || modRenderType === 'PhotoGallery') {
                        req.entry.Body[i].items = createItemStyles(req.entry.Body[i].items, well, modRenderType, componentType);
                    }
                }
                //set module style
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
                };
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
        //maybe add check to see if nav option is saved then do this
        newNav = transformStrapiNav(nav);
        //set default colors if none exist
        if (!cmsColors) {
            cmsColors = setDefaultColors();
        }
        let contactInfo = createContactInfo(layout.data.attributes, siteIdentifier);
        contactInfo = transformcontact(contactInfo);
        const socialMediaItems = createSocials(layout.data?.attributes.socialMedia);
        //----------------------global styles ---------------------------------
        const siteCustomCss = '';
        const currentPageList = {};
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
            siteLayout: {
                cmsNav: newNav,
                logos: {
                    //fonts: [],
                    footer: {
                        pct: null,
                        slots: [
                            {
                                //show: 0,
                                //type: 'text',
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
                        //activeSlots: [],
                    },
                    header: {
                        //pct: 100,
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
                    /* list: {
                        429176: '/files/2020/02/tsi_logo2-dark.png',
                        429177: '/files/2020/02/tsi_logo2.png',
                    }, */
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
                            items: [
                            //footer nav
                            /*  {
                                title: '',
                                nav_menu: 5530,
                                component: 'nav_menu',
                            }, */
                            ],
                        },
                        //sections: null,
                    },
                },
                cmsColors: cmsColors,
                theme: 'beacon-theme_charlotte',
                cmsUrl: '',
                s3Folder: siteIdentifier,
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
        };
        return strapi;
    }
    catch (error) {
        console.log(error);
        return { error: 'Strapi fetch error' };
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3RyYW5zbGF0aW9uLWVuZ2luZXMvc3RyYXBpLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLGtDQUFrQyxDQUFBO0FBQ3pFLE9BQU8sRUFDSCxrQkFBa0IsRUFDbEIsc0JBQXNCLEVBQ3RCLGlCQUFpQixFQUNqQixzQkFBc0IsRUFDdEIsY0FBYyxFQUNkLFdBQVcsRUFDWCxhQUFhLEVBQ2IsZ0JBQWdCLEVBQ2hCLHNCQUFzQixFQUN0QixnQkFBZ0IsRUFDaEIsaUJBQWlCLEdBQ3BCLE1BQU0sb0JBQW9CLENBQUE7QUFDM0IsT0FBTyxFQUFFLGdCQUFnQixFQUFFLHFCQUFxQixFQUFFLG9CQUFvQixFQUFFLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxNQUFNLGFBQWEsQ0FBQTtBQUM1SCxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUE7QUFFbkIsTUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQTtBQUVuQyxNQUFNLENBQUMsTUFBTSxlQUFlLEdBQUcsS0FBSyxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQ3pDLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQTtJQUNsQixJQUFJO1FBQ0EsTUFBTSxTQUFTLEdBQUcsTUFBTSxLQUFLLENBQUMsbURBQW1ELENBQUMsQ0FBQTtRQUNsRixNQUFNLE1BQU0sR0FBRyxNQUFNLEtBQUssQ0FBQyx5REFBeUQsQ0FBQyxDQUFBO1FBQ3JGLE1BQU0sR0FBRyxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksRUFBRSxDQUFBO1FBQy9CLE1BQU0sTUFBTSxHQUFHLE1BQU0sU0FBUyxDQUFDLElBQUksRUFBRSxDQUFBO1FBQ3JDLE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQTtRQUM1RCxJQUFJLE1BQU0sQ0FB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