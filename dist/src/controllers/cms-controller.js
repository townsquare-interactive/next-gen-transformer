import { config } from 'dotenv';
config();
import * as sass from 'sass';
import { z } from 'zod';
import { socialConvert, btnIconConvert, getColumnsCssClass, transformcontact, transformNav, alternatePromoColors, convertSpecialTokens, replaceKey, createFontCss, createLinkAndButtonVariables, determineModRenderType, createImageSizes, createGallerySettings, modVariationType, createContactForm, convertDescText, transformPageSeo, removeFieldsFromObj, transformLinksInItem, transformCompositeItems, createTsiImageLink, isFeatureBtn, createFavLink, transformLogos, createModalPageList, moduleRenderTypes, decidePrimaryPhoneOrEmail, filterPrimaryContact, seperateScriptCode, getlandingPageOptions, } from '../utils.js';
import { createCustomComponents, extractIframeSrc, transformVcita } from '../customComponentsUtils.js';
import { addFileS3, getFileS3, getCssFile, deleteFileS3 } from '../s3Functions.js';
import { PageListSchema } from '../../schema/output-zod.js';
import { zodDataParse } from '../../schema/utils-zod.js';
import { createColorClasses, createBtnStyles, createItemStyles } from '../style-utils.js';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY21zLWNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udHJvbGxlcnMvY21zLWNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUMvQixNQUFNLEVBQUUsQ0FBQTtBQUNSLE9BQU8sS0FBSyxJQUFJLE1BQU0sTUFBTSxDQUFBO0FBQzVCLE9BQU8sRUFBRSxDQUFDLEVBQUUsTUFBTSxLQUFLLENBQUE7QUFFdkIsT0FBTyxFQUNILGFBQWEsRUFDYixjQUFjLEVBQ2Qsa0JBQWtCLEVBQ2xCLGdCQUFnQixFQUNoQixZQUFZLEVBQ1osb0JBQW9CLEVBQ3BCLG9CQUFvQixFQUNwQixVQUFVLEVBQ1YsYUFBYSxFQUNiLDRCQUE0QixFQUM1QixzQkFBc0IsRUFDdEIsZ0JBQWdCLEVBQ2hCLHFCQUFxQixFQUNyQixnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ2pCLGVBQWUsRUFDZixnQkFBZ0IsRUFDaEIsbUJBQW1CLEVBQ25CLG9CQUFvQixFQUNwQix1QkFBdUIsRUFDdkIsa0JBQWtCLEVBQ2xCLFlBQVksRUFDWixhQUFhLEVBQ2IsY0FBYyxFQUNkLG1CQUFtQixFQUNuQixpQkFBaUIsRUFDakIseUJBQXlCLEVBQ3pCLG9CQUFvQixFQUNwQixrQkFBa0IsRUFDbEIscUJBQXFCLEdBQ3hCLE1BQU0sYUFBYSxDQUFBO0FBQ3BCLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxnQkFBZ0IsRUFBRSxjQUFjLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUN0RyxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLE1BQU0sbUJBQW1CLENBQUE7QUFFbEYsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDRCQUE0QixDQUFBO0FBQzNELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQTtBQUN4RCxP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