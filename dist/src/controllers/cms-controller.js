import { config } from 'dotenv';
config();
import sass from 'sass';
import { z } from 'zod';
import { socialConvert, btnIconConvert, getColumnsCssClass, transformcontact, transformNav, alternatePromoColors, createColorClasses, convertSpecialTokens, replaceKey, createFontCss, createLinkAndButtonVariables, determineModRenderType, createBtnStyles, createImageSizes, createGallerySettings, modVariationType, createItemStyles, createContactForm, convertDescText, transformPageSeo, removeFieldsFromObj, transformLinksInItem, transformCompositeItems, createTsiImageLink, isFeatureBtn, createFavLink, transformLogos, } from '../utils.js';
import { addFileS3, getFileS3, getCssFile, addFileS3List, deleteFileS3 } from '../s3Functions.js';
//import Module from 'module'
//import Module from 'module'
const toStringSchema = z.coerce.string();
export const transformPagesData = async (pageData, sitePageData, themeStyles, basePath, cmsUrl) => {
    console.log('page transformer started');
    let newData = [];
    //for each page
    for (const [key, value] of Object.entries(pageData)) {
        const { pageId, pageTitle, pageSlug, pageType, url, seo } = getPageData(sitePageData, key);
        //covering page name change
        if (Object.keys(value.data).length === 0 && value.attrs) {
            console.log('initiated page name change');
            const oldPageSlug = sitePageData[key].backup.attrs.slug;
            let oldPageFile = await getFileS3(`${basePath}/pages/${oldPageSlug}.json`);
            let oldSiteData = await getFileS3(`${basePath}/layout.json`);
            let oldNav = oldSiteData.cmsNav;
            const newSlug = value.attrs.slug;
            const newTitle = value.attrs.title;
            const newUrl = `/${newSlug}/`;
            oldPageFile.data = {
                ...oldPageFile.data,
                slug: newSlug,
                title: newTitle,
                url: newUrl,
                id: toStringSchema.parse(value.id),
            };
            newData.push(oldPageFile);
            //change nav to change new page
            //filter array to update nav spot with changed page name
            if (oldNav.findIndex((x) => x.slug === oldPageSlug) != -1) {
                var foundIndex = oldNav.findIndex((x) => x.slug === oldPageSlug);
                const newField = {
                    ...oldNav[foundIndex],
                    slug: newSlug,
                    title: newTitle,
                    url: newUrl,
                };
                oldNav[foundIndex] = newField;
                await addFileS3(oldSiteData, `${basePath}/layout`);
            }
        }
        //check here if data is found, if not its a page name change if (attrs)
        if (value.data) {
            if (value.data.title) {
                console.log('name found', value.data.title);
                delete value.data.title;
            }
            value.seo = seo;
            if (value.data.modules && value.data.modules.length != 0) {
                const columnStyles = getColumnsCssClass(value.data);
                //adding site data to pages
                value.data = { id: pageId, title: pageTitle, slug: pageSlug, pageType: pageType, url: url, ...value.data, columnStyles: columnStyles };
                createPageScss(value.data, pageSlug, basePath);
                //add all page modal titles into array field
                let pageModals = [];
                for (let i in value.data.modules) {
                    //console.log(value.data.modules[i])
                    if (Object.keys(value.data.modules[i]).length != 0) {
                        let modalNum = 0;
                        for (const [key, pageModule] of Object.entries(value.data.modules[i])) {
                            //for (const pageModule in value.data.modules[i]) {
                            if (pageModule && Object.entries(pageModule).length != 0) {
                                //console.log('type of check', typeof pageModule)
                                if (pageModule.type === 'modal_1') {
                                    let autoOpen = false;
                                    for (let m in pageModule.items) {
                                        if (pageModule.items[m].autoOpen === true) {
                                            autoOpen = true;
                                        }
                                    }
                                    pageModals.push({ modalNum: modalNum, modalTitle: pageModule.title || '', autoOpen: autoOpen, openEveryTime: true });
                                    pageModule.modalNum = modalNum;
                                    modalNum += 1;
                                }
                                value.data.pageModals = pageModals;
                                //console.log('page mod titles', pageModals)
                            }
                        }
                    }
                    //}
                }
                //transforming page data
                value.data.modules = transformPageModules(value.data.modules, themeStyles, cmsUrl, pageModals);
                // newData = newPages
            }
            newData.push(value);
            //seo change without page data
        }
        else if (Object.keys(value.seo).length === 0) {
            const currentFile = await getFileS3(`${basePath}/pages/${pageSlug}.json`);
            const newSeoFile = { ...currentFile, seo: value.seo };
            newData.push(newSeoFile);
        }
    }
    return { pages: newData };
};
const getPageData = (sitePageData, key) => {
    const pageId = key;
    const pageTitle = sitePageData[pageId].title;
    const pageSlug = sitePageData[pageId].slug;
    const pageType = sitePageData[pageId].page_type;
    const url = sitePageData[pageId].url;
    const seo = transformPageSeo(sitePageData[pageId].seo);
    return { pageId, pageTitle, pageSlug, pageType, url, seo };
};
//grab content between <style> tags and add scss page to s3
const createPageScss = async (pageData, pageSlug, basePath) => {
    let pageCss;
    if (pageData.JS || pageData.head_script) {
        const foot_script = pageData.JS || '';
        const head_script = pageData.head_script || '';
        const customPageCode = foot_script + head_script;
        let styleMatchReg = /<style[^>]*>([^<]+)<\/style>/gi;
        let nextMatch = styleMatchReg.exec(customPageCode);
        let cssStringArray = [];
        while (nextMatch != null) {
            cssStringArray.push(nextMatch[1]);
            nextMatch = styleMatchReg.exec(customPageCode);
        }
        const cssString = convertSpecialTokens(cssStringArray.join(' '));
        pageCss = `.page-${pageSlug} {
        ${cssString}
    }`;
    }
    else {
        pageCss = '';
    }
    await addFileS3(pageCss, `${basePath}/styles/${pageSlug}`, 'scss');
};
export const deletePages = async (pages, basePath) => {
    console.log('deleter started');
    const oldPageList = await getFileS3(`${basePath}/pages/page-list.json`);
    let newPageList = [];
    for (let i = 0; i < oldPageList.pages.length; i++) {
        if (!(oldPageList.pages[i].id in pages)) {
            newPageList.push(oldPageList.pages[i]);
        }
        else {
            await deleteFileS3(`${basePath}/pages/${oldPageList.pages[i].slug}.json`);
        }
    }
    return newPageList ? { pages: newPageList } : oldPageList;
};
//Update pagelist file in s3 or create if not already there
export const updatePageList = async (page, basePath) => {
    console.log('page list updater started ------');
    const pageListUrl = `${basePath}/pages/page-list.json`;
    let pageListFile = await getFileS3(`${basePath}/pages/page-list.json`);
    addPagesToList(pageListFile, page, basePath);
    //Can use add file when ready, instead of addpagelist logging
    console.log('new page list', pageListFile);
    await addFileS3List(pageListFile, pageListUrl);
    return pageListFile;
};
//add page object to pagelist
const addPagesToList = async (pageListFile, page, basePath) => {
    //console.log('old pagelist', pageListFile)
    for (let i = 0; i < page.length; i++) {
        let pageData = page[i].data;
        const newPageItem = {
            name: pageData.title,
            slug: pageData.slug,
            url: pageData.url || pageData.slug,
            id: pageData.id,
            page_type: pageData.page_type || '',
        };
        //check if page doesn't exist (need a version if it does)
        if (pageListFile.pages.filter((e) => e.slug === pageData.slug).length === 0) {
            pageListFile.pages.push(newPageItem);
            //await addNewPageToNav(pageData, basePath:string)
            //updating existing page data in pagelist
        }
        else if (pageListFile.pages.filter((e) => e.slug === pageData.slug).length >= 0) {
            const pageIdx = pageListFile.pages.findIndex((e) => e.slug === pageData.slug);
            pageListFile.pages[pageIdx] = newPageItem;
        }
    }
    //return pageListFile
};
//Adding a new page does not automatically add it to nav unless we do this
export const addNewPageToNav = async (pageData, basePath) => {
    //Get layout file to update nav
    let oldSiteData = await getFileS3(`${basePath}/layout.json`);
    const newPageData = {
        name: pageData.title,
        title: pageData.title,
        slug: pageData.slug,
        url: pageData.url,
        ID: pageData.id,
        menu_order: oldSiteData?.cmsNav ? oldSiteData.cmsNav.length : 1,
        menu_item_parent: 0,
    };
    if (oldSiteData?.cmsNav) {
        //add new page to nav
        oldSiteData.cmsNav.push(newPageData);
        //update global file with new nav
        await addFileS3(oldSiteData, `${basePath}/layout`);
    }
    else if (oldSiteData) {
        oldSiteData = { ...oldSiteData, cmsNav: [newPageData] };
        await addFileS3(oldSiteData, `${basePath}/layout`);
    }
};
//Create or edit layout file
export const createOrEditLayout = async (file, basePath, themeStyles, url) => {
    const currentLayout = await getFileS3(`${basePath}/layout.json`);
    const { fontImportGroup, fontClasses } = createFontCss(file.design.fonts);
    //adding socials from sitedata
    function transformSocial(file) {
        const social = [];
        for (let i = 0; i < file.settings.social.services.length; i++) {
            let item = file.settings.social.services[i];
            const basePath = item.format.replace(/\%.*/, '') + item.value;
            if (file.settings.social.services[i]) {
                if (item.value && item.enabled == 1) {
                    social.push({ ...item, url: basePath, icon: socialConvert(item.name) });
                }
            }
        }
        return social;
    }
    // transform contact link/data
    let contactInfo;
    if (file.settings && file.settings.contact.contact_list.wide.items[0]) {
        contactInfo = await transformcontact(file.settings.contact.contact_list.wide.items[0]);
    }
    else {
        contactInfo = currentLayout.contact || '';
    }
    const transformedLogos = transformLogos(file.logos, file.config.website.url);
    //Transform composite data/modal
    let modalData;
    let composites = file.composites;
    if (file.composites?.footer?.modules?.items) {
        const { newModalData, newCompositeItems } = transformCompositeItems(file.composites?.footer?.modules?.items);
        file.composites.footer.modules.items = newCompositeItems;
        modalData = newModalData;
        composites = file.composites;
    }
    const globalFile = {
        logos: transformedLogos,
        social: file.settings ? transformSocial(file) : currentLayout.social,
        contact: contactInfo,
        siteName: file.config.website.site_title || '',
        phoneNumber: file.settings ? file.settings.contact.contact_list.wide.items[0].selectedPrimaryPhoneNumber : currentLayout.phoneNumber || '',
        email: file.settings ? file.settings.contact.contact_list.wide.items[0].email[0].name : currentLayout.email || '',
        url: file.config.website.url,
        composites: composites,
        modalData: modalData,
        cmsNav: file.vars.navigation ? transformNav(file.vars.navigation.menuList, url) : currentLayout.cmsNav,
        navAlign: file.navigation ? file.navigation.menu_alignment : 'left',
        seo: file.seo.global_seo_options ? { global: file.seo.global_seo_options } : currentLayout.seo || {},
        cmsColors: themeStyles,
        theme: file.design.themes.selected || '',
        cmsUrl: file.config.website.url || '',
        s3Folder: basePath,
        favicon: file.config.website.favicon.src && file.config.website.favicon.src != null
            ? createFavLink('https://townsquareinteractive.s3.amazonaws.com/' + basePath + '/assets/', file.config.website.favicon.src)
            : '',
        //favicon: file.config.website.favicon.src && file.config.website.favicon.src != null ? file.config.website.favicon.src : '',
        fontImport: fontImportGroup,
        config: {
            /* mailChimp: {
                audId: 'd0b2dd1631',
                datacenter: 'us21',
                auth: process.env.MAILCHIMP_API_KEY,
            }, */
            zapierUrl: process.env.ZAPIER_URL,
            makeUrl: process.env.MAKE_URL,
        },
    };
    return globalFile;
};
const transformPageModules = (moduleList, themeStyles, cmsUrl, pageModals) => {
    let columnsData = [];
    for (let i = 0; i <= moduleList.length; ++i) {
        if (moduleList[i]) {
            let newData = [];
            let modCount = 0;
            //let imageCount = 0
            const isSingleColumn = moduleList.filter((e) => Object.keys(e).length != 0).length === 2;
            //each actual page module
            for (const [key, value] of Object.entries(moduleList[i])) {
                modCount += 1;
                let currentModule = value;
                //remove unneeeded fields
                currentModule = removeFieldsFromObj(currentModule, ['export']);
                const modRenderType = determineModRenderType(currentModule.type);
                currentModule.type = modVariationType(currentModule.type);
                //transform Photo Gallery Settings
                if ((modRenderType === 'PhotoGallery' || modRenderType === 'Testimonials') && currentModule.settings) {
                    currentModule.settings = createGallerySettings(currentModule.settings, currentModule.blockSwitch1, currentModule.type);
                }
                if (modRenderType === 'PhotoGrid' || modRenderType === 'Banner' || modRenderType === 'Parallax' || modRenderType === 'PhotoGallery') {
                    currentModule.items = alternatePromoColors(currentModule.items, themeStyles, currentModule.well);
                }
                if (modRenderType === 'Parallax' || modRenderType === 'Banner' || modRenderType === 'PhotoGallery') {
                    currentModule.items = createItemStyles(currentModule.items, currentModule.well, modRenderType, currentModule.type);
                }
                //imagesize transforms
                if (currentModule.imgsize === 'widescreen_2-4_1') {
                    console.log('imagesize change');
                    currentModule.imgsize = 'widescreen_2_4_1';
                    //maybe change to imageratio
                }
                //remove empty items
                currentModule.items = currentModule.items.filter((modItem) => Object.keys(modItem).length !== 0);
                const schemaNum = z.coerce.number();
                if (currentModule.columns) {
                    currentModule.columns = schemaNum.parse(currentModule.columns);
                }
                let itemCount = 1;
                //loop for each item
                for (let i = 0; i < currentModule.items.length; i++) {
                    let currentItem = currentModule.items[i];
                    currentModule.items[i] = transformModuleItem(currentModule, currentItem, itemCount, modCount, modRenderType, key, themeStyles, cmsUrl, pageModals);
                    itemCount += 1;
                }
                //replace class with customClassName
                let newModule;
                if (currentModule.class) {
                    newModule = replaceKey(currentModule, 'class', 'customClassName');
                }
                else {
                    newModule = { ...currentModule };
                }
                //add contactFormData in form object
                if (modRenderType === 'ContactFormRoutes') {
                    const contactFormData = createContactForm('', '');
                    newModule = {
                        ...newModule,
                        contactFormData: contactFormData,
                    };
                }
                const modData = { ...newModule, modId: key, modCount: modCount, columnLocation: i, isSingleColumn: isSingleColumn };
                const newItem = { attributes: modData, componentType: modRenderType };
                newData.push(newItem);
            }
            columnsData.push(newData);
        }
    }
    return columnsData;
};
const transformModuleItem = (currentModule, currentItem, itemCount, modCount, modRenderType, key, themeStyles, cmsUrl, pageModals) => {
    //currentModule.id = currentModule.uid || currentModule.id
    currentItem = removeFieldsFromObj(currentItem, ['id', 'uid']);
    //Change lazy loading to off for first module in photogallery
    currentModule.lazy = modCount === 1 && itemCount === 1 && modRenderType === 'PhotoGallery' ? 'off' : currentModule.lazy;
    let imagePriority = false;
    if (currentModule.lazy === 'off') {
        imagePriority = true;
    }
    //replace line breaks from cms
    if (currentItem.desc) {
        currentItem.desc = convertDescText(currentItem.desc);
    }
    //Create button and link vars
    const { linkNoBtn, btnCount, isWrapLink, visibleButton, buttonList } = createLinkAndButtonVariables(currentItem, modRenderType, currentModule.columns, pageModals);
    let isFeatureButton = isFeatureBtn(modRenderType, currentModule.well, btnCount, currentItem.isFeatured);
    /*     let isFeatureButton
    if (
        currentModule.well &&
        modRenderType != 'PhotoGrid' &&
        modRenderType != 'Parallax' &&
        modRenderType != 'PhotoGallery' &&
        currentItem.isFeatured === 'active' &&
        btnCount === 1 &&
        modRenderType != 'PhotoGallery'
    ) {
        isFeatureButton = true
    } */
    //create button styles
    const btnStyles = createBtnStyles(currentModule, modRenderType, key, themeStyles, currentItem, itemCount, isFeatureButton);
    const nextImageSizes = createImageSizes(modRenderType, currentModule.columns);
    //create links array and remove single link fields
    currentItem = transformLinksInItem(currentItem);
    //check if article is beach and hero
    const isBeaconHero = modRenderType === 'article' && currentItem.isFeatured === 'active' ? true : false;
    const imageIcon = btnIconConvert(currentItem.icon3 || '');
    //decide if image is to be cropped to a certain dimension
    if (currentItem.image) {
        currentItem.image = createTsiImageLink(cmsUrl, currentItem.image);
        const imageType = !['no_sizing', 'no_set_height'].includes(currentModule.imgsize)
            ? 'crop'
            : modRenderType === 'Banner'
                ? 'crop'
                : modRenderType === 'Parallax'
                    ? 'crop'
                    : 'nocrop';
        currentItem = {
            ...currentItem,
            imageType: imageType,
        };
    }
    //If modal has form plugin
    if (modRenderType === 'Modal' && currentItem.plugin === '[gravity]') {
        const contactFormData = createContactForm('', '');
        currentItem = {
            ...currentItem,
            contactFormData: contactFormData,
        };
    }
    //update each item's data
    currentItem = {
        ...currentItem,
        buttonList: buttonList,
        imageIcon: imageIcon,
        linkNoBtn: linkNoBtn,
        btnCount: btnCount,
        isWrapLink: isWrapLink,
        visibleButton: visibleButton,
        isBeaconHero: isBeaconHero,
        imagePriority: imagePriority,
        //hasGridCaption: hasGridCaption,
        itemCount: itemCount,
        btnStyles: btnStyles,
        nextImageSizes: nextImageSizes,
        isFeatureButton: isFeatureButton,
        //links: transformItemLinks(currentItem),
    };
    currentItem = removeFieldsFromObj(currentItem, ['editingIcon1', 'editingIcon2', 'editingIcon3', 'iconSelected']);
    return currentItem;
};
export const createGlobalStylesheet = async (themeStyles, fonts, code, currentPageList, basePath) => {
    console.log('global css changed --------');
    const { fontImportGroup, fontClasses } = createFontCss(fonts);
    const colorClasses = createColorClasses(themeStyles);
    let customCss = code.CSS
        ? `
    /*---------------------Custom Code--------------------*/
    ${code.CSS}
    `
        : '';
    let allPageStyles;
    if (currentPageList) {
        if (Object.keys(currentPageList).length != 0) {
            allPageStyles = await getAllCssPages(currentPageList, basePath);
        }
    }
    else {
        allPageStyles = '';
    }
    //let allStyles = fontImportGroup + fontClasses + colorClasses + customCss + allPageStyles
    let allStyles = fontClasses + colorClasses + customCss + allPageStyles;
    const allStylesConverted = convertSpecialTokens(allStyles);
    try {
        const convertedCss = sass.compileString(allStylesConverted);
        return convertedCss.css;
    }
    catch (e) {
        //error catch if code passed is not correct scss/css
        return `/* ${e.message.toString()} */` + allStyles;
    }
};
const getAllCssPages = async (currentPageList, basePath) => {
    const allPageCss = [];
    for (let i = 0; i < currentPageList.pages.length; i++) {
        const pageSlug = currentPageList.pages[i].slug;
        const cssFile = await getCssFile(pageSlug, basePath);
        allPageCss.push(cssFile);
    }
    return allPageCss.join(' ');
};
//used for migrate, probably delete later
/* export const transformCMSData = function (data:any) {
    let newData:any = []
    const pageListData:any = []

    for (const [key, value] of Object.entries(data.pages)) {
        //creating file for pagelist
        pageListData.push(createPageList(value))

        //transforming page data
        if (value.publisher.data.modules) {
            value.publisher.data.modules = transformPageModules(value.publisher.data.modules)
            newData.push(value)
        } else if (value.backup.data) {
            value.backup.data.modules = transformPageModules(value.backup.data.modules)
            newData.push(value)
        } else {
            newData.push(value)
        }
    }

    const pageList = { pages: pageListData }
    data.pages = newData

    //returned transformed whole page json and pagelist
    return { data: data, pageList: pageList }
} */
export const createPageList = (page) => {
    const pageData = {
        name: page.title,
        slug: page.slug,
        id: page.id,
        page_type: page.page_type,
    };
    return pageData;
};
/* export default {
    transformCMSData,
    updatePageList,
    transformPagesData,
    createOrEditLayout,
    deletePages,
    createGlobalStylesheet,
} */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY21zLWNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udHJvbGxlcnMvY21zLWNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUMvQixNQUFNLEVBQUUsQ0FBQTtBQUNSLE9BQU8sSUFBSSxNQUFNLE1BQU0sQ0FBQTtBQUN2QixPQUFPLEVBQUUsQ0FBQyxFQUFFLE1BQU0sS0FBSyxDQUFBO0FBRXZCLE9BQU8sRUFDSCxhQUFhLEVBQ2IsY0FBYyxFQUNkLGtCQUFrQixFQUNsQixnQkFBZ0IsRUFDaEIsWUFBWSxFQUNaLG9CQUFvQixFQUNwQixrQkFBa0IsRUFDbEIsb0JBQW9CLEVBQ3BCLFVBQVUsRUFDVixhQUFhLEVBQ2IsNEJBQTRCLEVBQzVCLHNCQUFzQixFQUN0QixlQUFlLEVBQ2YsZ0JBQWdCLEVBQ2hCLHFCQUFxQixFQUNyQixnQkFBZ0IsRUFDaEIsZ0JBQWdCLEVBQ2hCLGlCQUFpQixFQUNqQixlQUFlLEVBQ2YsZ0JBQWdCLEVBQ2hCLG1CQUFtQixFQUNuQixvQkFBb0IsRUFDcEIsdUJBQXVCLEVBQ3ZCLGtCQUFrQixFQUNsQixZQUFZLEVBQ1osYUFBYSxFQUNiLGNBQWMsR0FFakIsTUFBTSxhQUFhLENBQUE7QUFFcEIsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQTtBQUdqRyw2QkFBNkI7QUFDN0IsNkJBQTZCO0FBRTdCLE1BQU0sY0FBYyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUE7QUFFeEMsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUcsS0FBSyxFQUFFLFFBQWMsRUFBRSxZQUFpQixFQUFFLFdBQXdCLEVBQUUsUUFBZ0IsRUFBRSxNQUFjLEVBQUUsRUFBRTtJQUN0SSxPQUFPLENB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