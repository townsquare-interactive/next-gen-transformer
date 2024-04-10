import { config } from 'dotenv';
config();
import * as sass from 'sass';
import { z } from 'zod';
import { socialConvert, btnIconConvert, getColumnsCssClass, transformcontact, transformNav, alternatePromoColors, createColorClasses, convertSpecialTokens, replaceKey, createFontCss, createLinkAndButtonVariables, determineModRenderType, createBtnStyles, createImageSizes, createGallerySettings, modVariationType, createItemStyles, createContactForm, convertDescText, transformPageSeo, removeFieldsFromObj, transformLinksInItem, transformCompositeItems, createTsiImageLink, isFeatureBtn, createFavLink, transformLogos, createModalPageList, moduleRenderTypes, decidePrimaryPhoneOrEmail, filterPrimaryContact, seperateScriptCode, getlandingPageOptions, } from '../utils.js';
import { createCustomComponents, extractIframeSrc, transformVcita } from '../customComponentsUtils.js';
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
                    console.log('map time');
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
//b dynamoClient
//throughout the evening prewritten toast or topic
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY21zLWNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udHJvbGxlcnMvY21zLWNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUMvQixNQUFNLEVBQUUsQ0FBQTtBQUNSLE9BQU8sS0FBSyxJQUFJLE1BQU0sTUFBTSxDQUFBO0FBQzVCLE9BQU8sRUFBRSxDQUFDLEVBQUUsTUFBTSxLQUFLLENBQUE7QUFFdkIsT0FBTyxFQUNILGFBQWEsRUFDYixjQUFjLEVBQ2Qsa0JBQWtCLEVBQ2xCLGdCQUFnQixFQUNoQixZQUFZLEVBQ1osb0JBQW9CLEVBQ3BCLGtCQUFrQixFQUNsQixvQkFBb0IsRUFDcEIsVUFBVSxFQUNWLGFBQWEsRUFDYiw0QkFBNEIsRUFDNUIsc0JBQXNCLEVBQ3RCLGVBQWUsRUFDZixnQkFBZ0IsRUFDaEIscUJBQXFCLEVBQ3JCLGdCQUFnQixFQUNoQixnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ2pCLGVBQWUsRUFDZixnQkFBZ0IsRUFDaEIsbUJBQW1CLEVBQ25CLG9CQUFvQixFQUNwQix1QkFBdUIsRUFDdkIsa0JBQWtCLEVBQ2xCLFlBQVksRUFDWixhQUFhLEVBQ2IsY0FBYyxFQUNkLG1CQUFtQixFQUNuQixpQkFBaUIsRUFDakIseUJBQXlCLEVBQ3pCLG9CQUFvQixFQUNwQixrQkFBa0IsRUFDbEIscUJBQXFCLEdBQ3hCLE1BQU0sYUFBYSxDQUFBO0FBQ3BCLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxnQkFBZ0IsRUFBRSxjQUFjLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUN0RyxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxNQUFNLG1CQUFtQixDQUFBO0FBRWpHLE9BQU8sRUFBRSxjQUFjLEVBQUUsWUFBWSxFQUFFLE1BQU0sNEJBQTRC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