import { config } from 'dotenv';
config();
import * as sass from 'sass';
import { z } from 'zod';
import { socialConvert, btnIconConvert, getColumnsCssClass, transformcontact, transformNav, alternatePromoColors, createColorClasses, convertSpecialTokens, replaceKey, createFontCss, createLinkAndButtonVariables, determineModRenderType, createBtnStyles, createImageSizes, createGallerySettings, modVariationType, createItemStyles, createContactForm, convertDescText, transformPageSeo, removeFieldsFromObj, transformLinksInItem, transformCompositeItems, createTsiImageLink, isFeatureBtn, createFavLink, transformLogos, createModalPageList, } from '../utils.js';
import { addFileS3, getFileS3, getCssFile, addFileS3List, deleteFileS3 } from '../s3Functions.js';
import { PageListSchema, zodDataParse } from '../../schema/output-zod.js';
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
export const getPageData = (sitePageData, key) => {
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
    zodDataParse(pageListFile, PageListSchema, 'Pages', 'parse');
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
        publishedDomains: currentLayout.publishedDomains || [],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY21zLWNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udHJvbGxlcnMvY21zLWNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUMvQixNQUFNLEVBQUUsQ0FBQTtBQUNSLE9BQU8sS0FBSyxJQUFJLE1BQU0sTUFBTSxDQUFBO0FBQzVCLE9BQU8sRUFBRSxDQUFDLEVBQUUsTUFBTSxLQUFLLENBQUE7QUFFdkIsT0FBTyxFQUNILGFBQWEsRUFDYixjQUFjLEVBQ2Qsa0JBQWtCLEVBQ2xCLGdCQUFnQixFQUNoQixZQUFZLEVBQ1osb0JBQW9CLEVBQ3BCLGtCQUFrQixFQUNsQixvQkFBb0IsRUFDcEIsVUFBVSxFQUNWLGFBQWEsRUFDYiw0QkFBNEIsRUFDNUIsc0JBQXNCLEVBQ3RCLGVBQWUsRUFDZixnQkFBZ0IsRUFDaEIscUJBQXFCLEVBQ3JCLGdCQUFnQixFQUNoQixnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ2pCLGVBQWUsRUFDZixnQkFBZ0IsRUFDaEIsbUJBQW1CLEVBQ25CLG9CQUFvQixFQUNwQix1QkFBdUIsRUFDdkIsa0JBQWtCLEVBQ2xCLFlBQVksRUFDWixhQUFhLEVBQ2IsY0FBYyxFQUNkLG1CQUFtQixHQUN0QixNQUFNLGFBQWEsQ0FBQTtBQUNwQixPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxNQUFNLG1CQUFtQixDQUFBO0FBRWpHLE9BQU8sRUFBRSxjQUFjLEVBQUUsWUFBWSxFQUFFLE1BQU0sNEJBQTRCLENBQUE7QUFFekUsTUFBTSxjQUFjLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQTtBQUV4QyxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxLQUFLLEVBQUUsUUFBYyxFQUFFLFlBQWlCLEVBQUUsV0FBd0Is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