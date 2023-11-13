import { config } from 'dotenv';
config();
import * as sass from 'sass';
import { z } from 'zod';
import { socialConvert, btnIconConvert, getColumnsCssClass, transformcontact, transformNav, alternatePromoColors, createColorClasses, convertSpecialTokens, replaceKey, createFontCss, createLinkAndButtonVariables, determineModRenderType, createBtnStyles, createImageSizes, createGallerySettings, modVariationType, createItemStyles, createContactForm, convertDescText, transformPageSeo, removeFieldsFromObj, transformLinksInItem, transformCompositeItems, createTsiImageLink, isFeatureBtn, createFavLink, transformLogos, createModalPageList, } from '../utils.js';
import { addFileS3, getFileS3, getCssFile, addFileS3List, deleteFileS3 } from '../s3Functions.js';
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
                //create list of page modals
                let pageModals = createModalPageList(value.data.modules);
                value.data.pageModals = pageModals;
                //transforming page data
                value.data.modules = transformPageModules(value.data.modules, themeStyles, cmsUrl, pageModals);
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
//delete pages from s3
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
            //updating existing page data in pagelist
        }
        else if (pageListFile.pages.filter((e) => e.slug === pageData.slug).length >= 0) {
            const pageIdx = pageListFile.pages.findIndex((e) => e.slug === pageData.slug);
            pageListFile.pages[pageIdx] = newPageItem;
        }
    }
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
            const isSingleColumn = moduleList.filter((e) => Object.keys(e).length != 0).length === 2;
            //each actual page module
            for (const [key, value] of Object.entries(moduleList[i])) {
                modCount += 1;
                let currentModule = value;
                //remove unneeeded fields
                currentModule = removeFieldsFromObj(currentModule, ['export']);
                let modRenderType = '';
                if (currentModule.type === 'plugin' && currentModule.items[0]?.plugin === '[map]') {
                    console.log('map time');
                    modRenderType = 'Map';
                }
                else {
                    modRenderType = determineModRenderType(currentModule.type);
                }
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
                    currentModule.imgsize = 'widescreen_2_4_1';
                }
                //remove empty items
                currentModule.items = currentModule.items.filter((modItem) => Object.keys(modItem).length !== 0);
                const schemaNum = z.coerce.number();
                if (currentModule.columns) {
                    currentModule.columns = schemaNum.parse(currentModule.columns);
                }
                let itemCount = 1;
                //loop for each item inside of module
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
    currentItem = removeFieldsFromObj(currentItem, ['id', 'uid']);
    //Change lazy loading to off for first module that is a photogallery
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
    //fields not being used currently
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
//used for migrating whole site
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY21zLWNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udHJvbGxlcnMvY21zLWNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUMvQixNQUFNLEVBQUUsQ0FBQTtBQUNSLE9BQU8sS0FBSyxJQUFJLE1BQU0sTUFBTSxDQUFBO0FBQzVCLE9BQU8sRUFBRSxDQUFDLEVBQUUsTUFBTSxLQUFLLENBQUE7QUFFdkIsT0FBTyxFQUNILGFBQWEsRUFDYixjQUFjLEVBQ2Qsa0JBQWtCLEVBQ2xCLGdCQUFnQixFQUNoQixZQUFZLEVBQ1osb0JBQW9CLEVBQ3BCLGtCQUFrQixFQUNsQixvQkFBb0IsRUFDcEIsVUFBVSxFQUNWLGFBQWEsRUFDYiw0QkFBNEIsRUFDNUIsc0JBQXNCLEVBQ3RCLGVBQWUsRUFDZixnQkFBZ0IsRUFDaEIscUJBQXFCLEVBQ3JCLGdCQUFnQixFQUNoQixnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ2pCLGVBQWUsRUFDZixnQkFBZ0IsRUFDaEIsbUJBQW1CLEVBQ25CLG9CQUFvQixFQUNwQix1QkFBdUIsRUFDdkIsa0JBQWtCLEVBQ2xCLFlBQVksRUFDWixhQUFhLEVBQ2IsY0FBYyxFQUNkLG1CQUFtQixHQUN0QixNQUFNLGFBQWEsQ0FBQTtBQUVwQixPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxNQUFNLG1CQUFtQixDQUFBO0FBSWpHLE1BQU0sY0FBYyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUE7QUFFeEMsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUcsS0FBSyxFQUFFLFFBQWMsRUFBRSxZQUFpQixFQUFFLFdBQXdCLEVBQUUsUUFBZ0IsRUFBRSxNQUFjLEVBQUUsRUFBRTtJQUN0SSxPQUFPLENBQUMsR0FBRyxD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