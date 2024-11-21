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