import { config } from 'dotenv';
config();
import * as sass from 'sass';
import { z } from 'zod';
import { socialConvert, btnIconConvert, getColumnsCssClass, transformcontact, transformNav, alternatePromoColors, convertSpecialTokens, replaceKey, createFontCss, createLinkAndButtonVariables, determineModRenderType, createImageSizes, createGallerySettings, modVariationType, createContactForm, convertDescText, transformPageSeo, removeFieldsFromObj, transformLinksInItem, transformCompositeItems, createTsiImageLink, isFeatureBtn, createFavLink, transformLogos, createModalPageList, moduleRenderTypes, decidePrimaryPhoneOrEmail, filterPrimaryContact, seperateScriptCode, getlandingPageOptions, } from '../utilities/utils.js';
import { createCustomComponents, extractIframeSrc, transformVcita } from '../utilities/customComponentsUtils.js';
import { addFileS3, getFileS3, getCssFile, deleteFileS3 } from '../utilities/s3Functions.js';
import { PageListSchema } from '../schema/output-zod.js';
import { zodDataParse } from '../schema/utils-zod.js';
import { createColorClasses, createBtnStyles, createItemStyles } from '../utilities/style-utils.js';
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
                //screate page scripts
                const foot_script = value.data.JS || '';
                const head_script = value.data.head_script || '';
                const customPageCode = foot_script + head_script;
                const seperatedCode = seperateScriptCode(customPageCode);
                value.data.scripts = seperatedCode.scripts;
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
        const allPageCode = seperateScriptCode(customPageCode, pageSlug);
        pageCss = allPageCode.css;
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
    const pageListUrl = `${basePath}/pages/page-list`;
    let pageListFile = await getFileS3(`${basePath}/pages/page-list.json`);
    addPagesToList(pageListFile, page, basePath);
    //Can use add file when ready, instead of addpagelist logging
    console.log('new page list', pageListFile);
    zodDataParse(pageListFile, PageListSchema, 'Pages');
    await addFileS3(pageListFile, pageListUrl);
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
export const createOrEditLayout = async (file, basePath, themeStyles, url, globalStyles) => {
    const currentLayout = await getFileS3(`${basePath}/layout.json`);
    //setting siteType to landing
    let siteType = file.config.website.siteType || 'website';
    if (file.config.website.url.includes('nextgenprototype') || file.config.website.url.includes('guaranteedservice')) {
        siteType = 'landing';
    }
    const { fontImportGroup, fontClasses } = createFontCss(file.design.fonts, siteType);
    //adding socials from sitedata
    function transformSocial(socials) {
        const social = [];
        for (let i = 0; i < socials.length; i++) {
            let item = socials[i];
            const url = item.format.replace(/\%.*/, '') + item.value;
            if (socials[i]) {
                if (item.value && item.enabled == 1) {
                    social.push({ ...item, url: url, icon: socialConvert(url) });
                }
            }
        }
        return social;
    }
    // transform contact link/data
    let contactInfo;
    let phoneNumber;
    let email;
    if (file.settings && file.settings.contact.contact_list.wide.items.length > 0) {
        const primaryContact = filterPrimaryContact(file.settings);
        contactInfo = await transformcontact(primaryContact);
        phoneNumber = decidePrimaryPhoneOrEmail(primaryContact, currentLayout, 'phone');
        email = decidePrimaryPhoneOrEmail(primaryContact, currentLayout, 'email');
    }
    else {
        contactInfo = currentLayout.contact || '';
        phoneNumber = currentLayout.phoneNumber || '';
        email = currentLayout.email || '';
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
    //custom code components
    const customComponents = createCustomComponents(file.design.code || '');
    console.log(customComponents);
    //global script evaluation
    const globalHeaderCode = seperateScriptCode(file.design.code.header || '', '');
    const globalFooterCode = seperateScriptCode(file.design.code.footer || '', '');
    //engage
    //if not in settings need to keep currentFile
    let vcita = currentLayout.vcita ? currentLayout.vcita : null;
    if (file.engage?.hasEngage && file.settings.vcita) {
        vcita = transformVcita(file.settings.vcita, file.engage, file.settings['vcita_business_info'] || null);
        console.log('vcita test', vcita);
    }
    const globalFile = {
        logos: transformedLogos,
        social: file.settings ? transformSocial(file.settings.social.services) : currentLayout.social,
        contact: contactInfo,
        siteName: file.config.website.site_title || '',
        phoneNumber: phoneNumber,
        email: email,
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
        styles: { global: globalStyles.global, custom: globalStyles.custom },
        customComponents: customComponents,
        scripts: {
            header: globalHeaderCode.scripts,
            footer: globalFooterCode.scripts,
        },
        vcita: vcita,
        headerOptions: {},
        siteType: siteType,
    };
    //not added to this in luna yet, adding manually "file.config.website.siteType"
    if (siteType === 'landing') {
        globalFile.headerOptions = getlandingPageOptions();
        const socials = [
            {
                url: 'http://www.facebook.com/GuaranteedServiceNJ',
                icon: socialConvert('facebook'),
                name: 'facebook',
            },
            {
                url: 'http://www.youtube.com/channel/UCTF0w4Gyxi34P3G3hRWguAA',
                icon: socialConvert('youtube'),
                name: 'youtube',
            },
            {
                url: 'https://www.google.com/maps/place/Guaranteed+Service/@40.3801104,-74.571654,11z/data=!3m1!4b1!4m5!3m4!1s0x89c3c4c47750b5bb:0x1a7085e031fb3be7!8m2!3d40.3791538!4d-74.435907',
                icon: socialConvert('https://www.google.com/maps/place/Guaranteed+Service/@40.3801104,-74.571654,11z/data=!3m1!4b1!4m5!3m4!1s0x89c3c4c47750b5bb:0x1a7085e031fb3be7!8m2!3d40.3791538!4d-74.435907'),
                name: 'directions',
            },
            {
                url: 'http://www.twitter.com/GSNewJersey',
                icon: socialConvert('http://www.twitter.com/GSNewJersey'),
                name: 'twitter',
            },
            {
                url: 'http://www.linkedin.com/guaranteed-service/',
                icon: socialConvert('http://www.linkedin.com/guaranteed-service/'),
                name: 'linkedin',
            },
            {
                url: 'http://instagram.com/guaranteedservicenj',
                icon: socialConvert('http://instagram.com/guaranteedservicenj'),
                name: 'instagram',
            },
        ];
        globalFile.social = socials;
    }
    return globalFile;
};
const transformPageModules = (moduleList, themeStyles, cmsUrl, pageModals) => {
    let columnsData = [];
    for (let i = 0; i <= moduleList.length; ++i) {
        if (moduleList[i]) {
            let newData = [];
            let modCount = 0;
            const isSingleColumn = moduleList.filter((e) => Object.keys(e).length != 0).length === 2;
            let imageCount = 0;
            //each actual page module
            for (const [key, value] of Object.entries(moduleList[i])) {
                let currentModule = value;
                //remove unneeeded fields
                currentModule = removeFieldsFromObj(currentModule, ['export']);
                let modRenderType = '';
                if (currentModule.type === 'plugin' && currentModule.items[0]?.plugin === '[map]') {
                    modRenderType = 'Map';
                }
                else {
                    modRenderType = determineModRenderType(currentModule.type);
                }
                //Dont count modules that are not being rendered
                if (moduleRenderTypes.includes(modRenderType)) {
                    modCount += 1;
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
                    currentModule.items[i] = transformModuleItem(currentModule, currentItem, itemCount, modCount, modRenderType, key, themeStyles, cmsUrl, pageModals, imageCount);
                    itemCount += 1;
                    if (currentModule.items[i].image) {
                        imageCount += 1;
                    }
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
const determineLazyLoad = (modLazy, modCount, itemCount, imageCount) => {
    //initiate lazy load off for top module items
    if (modCount === 1 && itemCount <= 2) {
        modLazy = 'off';
    }
    if (imageCount === 0) {
        modLazy = 'off';
    }
    else {
        modLazy = modLazy;
    }
    if (modLazy === 'off') {
        return true;
    }
    else {
        return false;
    }
};
const transformModuleItem = (currentModule, currentItem, itemCount, modCount, modRenderType, key, themeStyles, cmsUrl, pageModals, imageCount) => {
    currentItem = removeFieldsFromObj(currentItem, ['id', 'uid']);
    const imagePriority = determineLazyLoad(currentModule.lazy, modCount, itemCount, imageCount);
    //replace line breaks from cms
    if (currentItem.desc) {
        let newDesc = convertDescText(currentItem.desc);
        const videoDesc = extractIframeSrc(newDesc);
        newDesc = videoDesc ? videoDesc.newDesc : newDesc;
        currentItem.desc = newDesc;
        //add video object if exists in desc
        if (videoDesc?.srcValue) {
            currentItem.video = {
                src: videoDesc.srcValue,
                method: 'ext',
            };
        }
    }
    if (currentItem.headline) {
        currentItem.headline = convertSpecialTokens(currentItem.headline);
    }
    if (currentItem.subheader) {
        currentItem.subheader = convertSpecialTokens(currentItem.subheader);
    }
    //Create button and link vars
    const { linkNoBtn, btnCount, isWrapLink, visibleButton, buttonList } = createLinkAndButtonVariables(currentItem, modRenderType, currentModule.columns, pageModals);
    const isFeatureButton = isFeatureBtn(modRenderType, currentModule.well, btnCount, currentItem.isFeatured);
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
/* function removeLunaCss(inputString: string) {
    // Use a regular expression to match the patterns ".tsH", ".tsD", or ".tsI" followed by anything until the next "}" or the end of the string
    const regex = /\.ts[HDI][^}]*?(}|$)/g

    // Replace the matched patterns with an empty string
    const result = inputString.replace(regex, '').replace(/\n\s*\n/g, '\n')

    return result
} */
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
    let globalStyles = colorClasses;
    const globalConverted = convertSpecialTokens(globalStyles, 'code');
    const customConverted = convertSpecialTokens(fontClasses + customCss + allPageStyles, 'code');
    const convertedGlobal = sass.compileString(globalConverted);
    try {
        const convertedCustom = sass.compileString(customConverted);
        return { global: convertedGlobal.css, custom: convertedCustom.css };
    }
    catch (e) {
        //error catch if code passed is not correct scss/css
        console.log(`error in styling compression ${e.message.toString()}`);
        return { global: convertedGlobal.css, custom: `/* ${e.message.toString()} */` + customConverted };
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
export const createPageList = (page) => {
    const pageData = {
        name: page.title,
        slug: page.slug,
        id: page.id,
        page_type: page.page_type,
    };
    return pageData;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY21zLWNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udHJvbGxlcnMvY21zLWNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUMvQixNQUFNLEVBQUUsQ0FBQTtBQUNSLE9BQU8sS0FBSyxJQUFJLE1BQU0sTUFBTSxDQUFBO0FBQzVCLE9BQU8sRUFBRSxDQUFDLEVBQUUsTUFBTSxLQUFLLENBQUE7QUFFdkIsT0FBTyxFQUNILGFBQWEsRUFDYixjQUFjLEVBQ2Qsa0JBQWtCLEVBQ2xCLGdCQUFnQixFQUNoQixZQUFZLEVBQ1osb0JBQW9CLEVBQ3BCLG9CQUFvQixFQUNwQixVQUFVLEVBQ1YsYUFBYSxFQUNiLDRCQUE0QixFQUM1QixzQkFBc0IsRUFDdEIsZ0JBQWdCLEVBQ2hCLHFCQUFxQixFQUNyQixnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ2pCLGVBQWUsRUFDZixnQkFBZ0IsRUFDaEIsbUJBQW1CLEVBQ25CLG9CQUFvQixFQUNwQix1QkFBdUIsRUFDdkIsa0JBQWtCLEVBQ2xCLFlBQVksRUFDWixhQUFhLEVBQ2IsY0FBYyxFQUNkLG1CQUFtQixFQUNuQixpQkFBaUIsRUFDakIseUJBQXlCLEVBQ3pCLG9CQUFvQixFQUNwQixrQkFBa0IsRUFDbEIscUJBQXFCLEdBQ3hCLE1BQU0sdUJBQXVCLENBQUE7QUFDOUIsT0FBTyxFQUFFLHNCQUFzQixFQUFFLGdCQUFnQixFQUFFLGNBQWMsRUFBRSxNQUFNLHVDQUF1QyxDQUFBO0FBQ2hILE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUU1RixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0seUJBQXlCLENBQUE7QUFDeEQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQ3JE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