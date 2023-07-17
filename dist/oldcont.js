"use strict";
require('dotenv').config();
const sass = require('sass');
const { socialConvert, btnIconConvert, getColumnsCssClass, transformcontact, transformNav, 
//isGridCaption,
alternatePromoColors, stripImageFolders, createColorClasses, convertSpecialTokens, replaceKey, createFontCss, createLinkAndButtonVariables, determineModRenderType, createItemStyles, createBtnStyles, createImageSizes, isOneButton, createGallerySettings, modVariationType, } = require('../utils');
const { addFileS3, getFileS3, getCssFile, addFileS3List, deleteFileS3 } = require('../s3Functions.js');
const transformPagesData = async (pageData, sitePageData, themeStyles, basePath) => {
    console.log('page transformer started');
    let newPages = [];
    let newData = [];
    for (const [key, value] of Object.entries(pageData)) {
        if (value.data.title) {
            console.log('name found', value.data.title);
            delete value.data.title;
        }
        const { pageId, pageTitle, pageSlug, pageType, url, seo } = getPageData(sitePageData, key);
        value.seo = seo;
        if (value.data.modules) {
            const columnStyles = getColumnsCssClass(value.data);
            //adding site data to pages
            value.data = { id: pageId, title: pageTitle, slug: pageSlug, pageType: pageType, url: url, ...value.data, columnStyles: columnStyles };
            createPageScss(value.data, pageSlug, basePath);
            //transforming page data
            if (value.data.modules) {
                value.data.modules = transformPageModules(value.data.modules, themeStyles);
                newPages.push(value);
            }
            newData = newPages;
        }
        else if (value.seo) {
            const currentFile = await getFileS3(`${basePath}/pages/${pageSlug}.json`);
            const newSeoFile = { ...currentFile, seo: value.seo };
            newData.push(newSeoFile);
        }
        /* let preloadImage = ''

        for (let i = 0; i <= value.data.modules.length; ++i) {
            //modules
            if (value.data.modules[i]) {
                for (const [key, mod] of Object.entries(value.data.modules[i])) {
                    //items

                    for (let x = 0; x < mod.attributes.items.length; x++) {
                        if (mod.lazy === 'off') {
                            imagePriority = true
                            preloadImage = mod.items[0].image
                            console.log('pre', preloadImage)
                        }
                    }
                }
            }
        }
        newData.push({ preloadImage: preloadImage }) */
    }
    pageData.pages = newData;
    pageData = { ...pageData };
    return pageData;
};
const getPageData = (sitePageData, key) => {
    const pageId = key;
    const pageTitle = sitePageData[pageId].title;
    const pageSlug = sitePageData[pageId].slug;
    const pageType = sitePageData[pageId].page_type;
    const url = sitePageData[pageId].url;
    const seo = sitePageData[pageId].seo;
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
const deletePages = async (pages, basePath) => {
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
const updatePageList = async (page, basePath) => {
    console.log('page list updater started ------');
    const pageListUrl = `${basePath}/pages/page-list.json`;
    let pageListFile = await getFileS3(`${basePath}/pages/page-list.json`);
    addPagesToList(pageListFile, page);
    //Can use add file when ready, instead of addpagelist logging
    await addFileS3List(pageListFile, pageListUrl);
    return pageListFile;
};
//add page object to pagelist
const addPagesToList = (pageListFile, page) => {
    //console.log('old pagelist', pageListFile)
    for (let i = 0; i < page.length; i++) {
        pageData = page[i].data;
        if (pageListFile.pages.filter((e) => e.name === pageData.title).length === 0) {
            pageListFile.pages.push({
                name: pageData.title,
                slug: pageData.slug,
                url: pageData.url,
                id: pageData.id,
                page_type: pageData.page_type,
            });
            console.log('new page added:', pageData.title);
        }
    }
};
//Create or edit layout file
const createOrEditLayout = async (file, basePath, themeStyles) => {
    console.log('layout edit');
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
    const globalFile = {
        logos: file.logos,
        social: file.settings ? transformSocial(file) : currentLayout.social,
        contact: file.settings
            ? transformcontact(file.settings.contact.contact_list.wide.items[0], file.config.website.site_title)
            : currentLayout.contact || '',
        siteName: file.config.website.site_title || '',
        phoneNumber: file.settings ? file.settings.contact.contact_list.wide.items[0].selectedPrimaryPhoneNumber : currentLayout.phoneNumber || '',
        email: file.settings ? file.settings.contact.contact_list.wide.items[0].selectedPrimaryEmailAddress : currentLayout.email || '',
        url: file.config.website.url,
        composites: file.composites,
        cmsNav: file.vars.navigation ? transformNav(file.vars.navigation.menuList) : currentLayout.cmsNav,
        cmsColors: themeStyles,
        theme: file.design.themes.selected || '',
        cmsUrl: file.config.website.url || '',
        s3Folder: basePath,
        favicon: file.config.website.favicon.src && file.config.website.favicon.src != null ? stripImageFolders(file.config.website.favicon.src) : '',
        fontImport: fontImportGroup,
        //contactFormData: contactFormData,
        config: {
            mailChimp: {
                audId: 'd0b2dd1631',
                datacenter: 'us21',
                auth: process.env.MAILCHIMP_API_KEY,
            },
            zapierUrl: process.env.ZAPIER_URL,
            makeUrl: process.env.MAKE_URL,
        },
    };
    return globalFile;
};
const transformPageModules = (moduleList, themeStyles) => {
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
                const modRenderType = determineModRenderType(value.type);
                value.type = modVariationType(value.type);
                //transform Photo Gallery Settings
                if ((modRenderType === 'PhotoGallery' || modRenderType === 'Testimonials') && value.settings) {
                    value.settings = createGallerySettings(value.settings, value.blockSwitch1, value.type);
                }
                if (modRenderType === 'PhotoGrid' || modRenderType === 'Banner' || modRenderType === 'Parallax' || modRenderType === 'PhotoGallery') {
                    value.items = alternatePromoColors(value.items, themeStyles, value.well);
                }
                if (modRenderType === 'Parallax' || modRenderType === 'Banner' || modRenderType === 'PhotoGallery') {
                    value.items = createItemStyles(value.items, value.well, modRenderType, value.type);
                }
                let itemCount = 0;
                //loop for each item
                for (let i = 0; i < value.items.length; i++) {
                    const currentItem = value.items[i];
                    itemCount += 1;
                    //Change lazy loading to off for first module in photogallery
                    value.lazy = modCount === 1 && itemCount === 1 && modRenderType === 'PhotoGallery' ? 'off' : value.lazy;
                    let imagePriority = false;
                    if (value.lazy === 'off') {
                        imagePriority = true;
                    }
                    //replace line breaks from cms
                    if (value.items[i].desc) {
                        value.items[i].desc = convertSpecialTokens(currentItem.desc);
                    }
                    let isFeatureButton;
                    if (value.well &&
                        modRenderType != 'PhotoGrid' &&
                        modRenderType != 'Parallax' &&
                        modRenderType != 'PhotoGallery' &&
                        currentItem.isFeatured === 'active' &&
                        isOneButton(currentItem) &&
                        modRenderType != 'PhotoGallery') {
                        isFeatureButton = true;
                    }
                    //create button styles
                    const btnStyles = createBtnStyles(value, modRenderType, key, themeStyles, currentItem, itemCount, isFeatureButton);
                    const nextImageSizes = createImageSizes(modRenderType, value.columns);
                    const { linkNoBtn, twoButtons, isWrapLink, visibleButton, buttonList } = createLinkAndButtonVariables(currentItem, modRenderType, value.columns);
                    //check if article is beach and hero
                    const isBeaconHero = modRenderType === 'article' && currentItem.isFeatured === 'active' ? true : false;
                    const imageIcon = btnIconConvert(value.items[i].icon3 || '');
                    //update each item's data
                    value.items[i] = {
                        ...value.items[i],
                        buttonList: buttonList,
                        imageIcon: imageIcon,
                        linkNoBtn: linkNoBtn,
                        twoButtons: twoButtons,
                        isWrapLink: isWrapLink,
                        visibleButton: visibleButton,
                        isBeaconHero: isBeaconHero,
                        imagePriority: imagePriority,
                        //hasGridCaption: hasGridCaption,
                        itemCount: itemCount,
                        btnStyles: btnStyles,
                        nextImageSizes: nextImageSizes,
                        isFeatureButton: isFeatureButton,
                    };
                    //decide if image is to be cropped to a certain dimension
                    if (currentItem.image) {
                        const imageType = !['no_sizing', 'no_set_height'].includes(value.imgsize)
                            ? 'crop'
                            : modRenderType === 'Banner'
                                ? 'crop'
                                : modRenderType === 'Parallax'
                                    ? 'crop'
                                    : 'nocrop';
                        value.items[i] = {
                            ...value.items[i],
                            imageType: imageType,
                        };
                    }
                }
                //replace class with customClassName
                let newModule;
                if (value.class) {
                    newModule = replaceKey(value, 'class', 'customClassName');
                }
                else {
                    newModule = { ...value };
                }
                //add contactFormData in form object
                if (modRenderType === 'ContactFormRoutes') {
                    const contactFormData = {
                        formTitle: 'Contact Us',
                        formFields: [
                            {
                                name: 'fName',
                                placeholder: 'Enter Name',
                                type: 'text',
                                label: 'First Name',
                                isReq: true,
                                fieldType: 'input',
                                isVisible: true,
                                size: 'sm',
                            },
                            {
                                name: 'lName',
                                placeholder: 'Enter Name',
                                type: 'text',
                                label: 'Last Name',
                                isReq: true,
                                fieldType: 'input',
                                isVisible: true,
                                size: 'sm',
                            },
                            {
                                name: 'email',
                                // placeholder:'Enter Name',
                                type: 'email',
                                label: 'Email',
                                isReq: true,
                                fieldType: 'input',
                                isVisible: true,
                                size: 'md',
                            },
                            {
                                name: 'phone',
                                // placeholder:'Enter Name',
                                type: 'phone',
                                label: 'Phone',
                                isReq: false,
                                fieldType: 'input',
                                isVisible: true,
                                size: 'md',
                            },
                            {
                                label: 'Message',
                                name: 'messagebox',
                                isReq: true,
                                fieldType: 'textarea',
                                isVisible: true,
                                size: 'md',
                            },
                            {
                                label: 'Address',
                                subLabel: 'Street Address',
                                name: 'street',
                                isReq: false,
                                fieldType: 'input',
                                isVisible: true,
                                size: 'md',
                            },
                            {
                                label: 'Zip Code',
                                name: 'zip',
                                isReq: false,
                                fieldType: 'input',
                                isVisible: true,
                                size: 'md',
                            },
                            {
                                label: 'City',
                                name: 'city',
                                isReq: false,
                                fieldType: 'input',
                                isVisible: true,
                                size: 'md',
                            },
                            {
                                label: 'State',
                                name: 'state',
                                isReq: false,
                                fieldType: 'input',
                                isVisible: true,
                                size: 'md',
                            },
                        ],
                    };
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
const createGlobalStylesheet = async (themeStyles, fonts, code, currentPageList, basePath) => {
    console.log('global css changed --------');
    const { fontImportGroup, fontClasses } = createFontCss(fonts);
    const colorClasses = createColorClasses(themeStyles);
    let customCss = `
    /*---------------------Custom Code--------------------*/
    ${code.CSS}
    `;
    const allPageStyles = await getAllCssPages(currentPageList, basePath);
    //let allStyles = fontImportGroup + fontClasses + colorClasses + customCss + allPageStyles
    let allStyles = fontClasses + colorClasses + customCss + allPageStyles;
    const allStylesConverted = convertSpecialTokens(allStyles);
    try {
        const convertedCss = sass.compileString(allStylesConverted);
        return convertedCss.css;
    }
    catch (e) {
        //error catch if code passed is not correct scss/css
        console.log('custom css ' + e.name + ': ' + e.message);
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
const transformCMSData = function (data) {
    let newData = [];
    const pageListData = [];
    for (const [key, value] of Object.entries(data.pages)) {
        //creating file for pagelist
        pageListData.push(createPageList(value));
        //transforming page data
        if (value.publisher.data.modules) {
            value.publisher.data.modules = transformPageModules(value.publisher.data.modules);
            newData.push(value);
        }
        else if (value.backup.data) {
            value.backup.data.modules = transformPageModules(value.backup.data.modules);
            newData.push(value);
        }
        else {
            newData.push(value);
        }
    }
    const pageList = { pages: pageListData };
    data.pages = newData;
    //returned transformed whole page json and pagelist
    return { data: data, pageList: pageList };
};
const createPageList = (value) => {
    const pageData = {
        name: value.title,
        slug: value.slug,
        id: value.id,
        page_type: value.page_type,
    };
    return pageData;
};
module.exports = {
    transformCMSData,
    updatePageList,
    transformPagesData,
    createOrEditLayout,
    deletePages,
    createGlobalStylesheet,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2xkY29udC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL29sZGNvbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtBQUMxQixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7QUFFNUIsTUFBTSxFQUNGLGFBQWEsRUFDYixjQUFjLEVBQ2Qsa0JBQWtCLEVBQ2xCLGdCQUFnQixFQUNoQixZQUFZO0FBQ1osZ0JBQWdCO0FBQ2hCLG9CQUFvQixFQUNwQixpQkFBaUIsRUFDakIsa0JBQWtCLEVBQ2xCLG9CQUFvQixFQUNwQixVQUFVLEVBQ1YsYUFBYSxFQUNiLDRCQUE0QixFQUM1QixzQkFBc0IsRUFDdEIsZ0JBQWdCLEVBQ2hCLGVBQWUsRUFDZixnQkFBZ0IsRUFDaEIsV0FBVyxFQUNYLHFCQUFxQixFQUNyQixnQkFBZ0IsR0FDbkIsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUE7QUFFdkIsTUFBTSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtBQUV0RyxNQUFNLGtCQUFrQixHQUFHLEtBQUssRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsRUFBRTtJQUMvRSxPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUE7SUFDdkMsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFBO0lBQ2pCLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQTtJQUVoQixLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtRQUNqRCxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ2xCLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDM0MsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQTtTQUMxQjtRQUVELE1BQU0sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLFdBQVcsQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLENBQUE7UUFFMUYsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUE7UUFFZixJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ3BCLE1BQU0sWUFBWSxHQUFHLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQTtZQUVuRCwyQkFBMkI7WUFDM0IsS0FBSyxDQUFDLElBQUksR0FBRyxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxDQUFBO1lBRXRJLGNBQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQTtZQUU5Qyx3QkFBd0I7WUFDeEIsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDcEIsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsb0JBQW9CLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUE7Z0JBQzFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7YUFDdkI7WUFFRCxPQUFPLEdBQUcsUUFBUSxDQUFBO1NBQ3JCO2FBQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ2xCLE1BQU0sV0FBVyxHQUFHLE1BQU0sU0FBUyxDQUFDLEdBQUcsUUFBUSxVQUFVLFFBQVEsT0FBTyxDQUFDLENBQUE7WUFDekUsTUFBTSxVQUFVLEdBQUcsRUFBRSxHQUFHLFdBQVcsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFBO1lBQ3JELE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7U0FDM0I7UUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7O3VEQWtCK0M7S0FDbEQ7SUFFRCxRQUFRLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQTtJQUN4QixRQUFRLEdBQUcsRUFBRSxHQUFHLFFBQVEsRUFBRSxDQUFBO0lBQzFCLE9BQU8sUUFBUSxDQUFBO0FBQ25CLENBQUMsQ0FBQTtBQUVELE1BQU0sV0FBVyxHQUFHLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQ3RDLE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQTtJQUNsQixNQUFNLFNBQVMsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFBO0lBQzVDLE1BQU0sUUFBUSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUE7SUFDMUMsTUFBTSxRQUFRLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQTtJQUMvQyxNQUFNLEdBQUcsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFBO0lBQ3BDLE1BQU0sR0FBRyxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUE7SUFFcEMsT0FBTyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUE7QUFDOUQsQ0FBQyxDQUFBO0FBRUQsMkRBQTJEO0FBQzNELE1BQU0sY0FBYyxHQUFHLEtBQUssRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxFQUFFO0lBQzFELElBQUksT0FBTyxDQUFBO0lBRVgsSUFBSSxRQUFRLENBQUMsRUFBRSxJQUFJLFFBQVEsQ0FBQyxXQUFXLEVBQUU7UUFDckMsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUE7UUFDckMsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLFdBQVcsSUFBSSxFQUFFLENBQUE7UUFDOUMsTUFBTSxjQUFjLEdBQUcsV0FBVyxHQUFHLFdBQVcsQ0FBQTtRQUVoRCxJQUFJLGFBQWEsR0FBRyxnQ0FBZ0MsQ0FBQTtRQUNwRCxJQUFJLFNBQVMsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFBO1FBQ2xELElBQUksY0FBYyxHQUFHLEVBQUUsQ0FBQTtRQUN2QixPQUFPLFNBQVMsSUFBSSxJQUFJLEVBQUU7WUFDdEIsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNqQyxTQUFTLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQTtTQUNqRDtRQUVELE1BQU0sU0FBUyxHQUFHLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtRQUNoRSxPQUFPLEdBQUcsU0FBUyxRQUFRO1VBQ3pCLFNBQVM7TUFDYixDQUFBO0tBQ0Q7U0FBTTtRQUNILE9BQU8sR0FBRyxFQUFFLENBQUE7S0FDZjtJQUVELE1BQU0sU0FBUyxDQUFDLE9BQU8sRUFBRSxHQUFHLFFBQVEsV0FBVyxRQUFRLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQTtBQUN0RSxDQUFDLENBQUE7QUFFRCxNQUFNLFdBQVcsR0FBRyxLQUFLLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxFQUFFO0lBQzFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtJQUM5QixNQUFNLFdBQVcsR0FBRyxNQUFNLFNBQVMsQ0FBQyxHQUFHLFFBQVEsdUJBQXVCLENBQUMsQ0FBQTtJQUN2RSxJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUE7SUFFcEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQy9DLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEtBQUssQ0FBQyxFQUFFO1lBQ3JDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1NBQ3pDO2FBQU07WUFDSCxNQUFNLFlBQVksQ0FBQyxHQUFHLFFBQVEsVUFBVSxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDLENBQUE7U0FDNUU7S0FDSjtJQUVELE9BQU8sV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFBO0FBQzdELENBQUMsQ0FBQTtBQUVELDJEQUEyRDtBQUMzRCxNQUFNLGNBQWMsR0FBRyxLQUFLLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxFQUFFO0lBQzVDLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLENBQUMsQ0FBQTtJQUMvQyxNQUFNLFdBQVcsR0FBRyxHQUFHLFFBQVEsdUJBQXVCLENBQUE7SUFDdEQsSUFBSSxZQUFZLEdBQUcsTUFBTSxTQUFTLENBQUMsR0FBRyxRQUFRLHVCQUF1QixDQUFDLENBQUE7SUFDdEUsY0FBYyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQTtJQUNsQyw2REFBNkQ7SUFDN0QsTUFBTSxhQUFhLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFBO0lBQzlDLE9BQU8sWUFBWSxDQUFBO0FBQ3ZCLENBQUMsQ0FBQTtBQUVELDZCQUE2QjtBQUM3QixNQUFNLGNBQWMsR0FBRyxDQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsRUFBRTtJQUMxQywyQ0FBMkM7SUFDM0MsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDbEMsUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUE7UUFDdkIsSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUMxRSxZQUFZLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztnQkFDcEIsSUFBSSxFQUFFLFFBQVEsQ0FBQyxLQUFLO2dCQUNwQixJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUk7Z0JBQ25CLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRztnQkFDakIsRUFBRSxFQUFFLFFBQVEsQ0FBQyxFQUFFO2dCQUNmLFNBQVMsRUFBRSxRQUFRLENBQUMsU0FBUzthQUNoQyxDQUFDLENBQUE7WUFDRixPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtTQUNqRDtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBRUQsNEJBQTRCO0FBQzVCLE1BQU0sa0JBQWtCLEdBQUcsS0FBSyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLEVBQUU7SUFDN0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQTtJQUMxQixNQUFNLGFBQWEsR0FBRyxNQUFNLFNBQVMsQ0FBQyxHQUFHLFFBQVEsY0FBYyxDQUFDLENBQUE7SUFFaEUsTUFBTSxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUV6RSw4QkFBOEI7SUFDOUIsU0FBUyxlQUFlLENBQUMsSUFBSTtRQUN6QixNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUE7UUFFakIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDM0QsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQzNDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFBO1lBRTdELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNsQyxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLEVBQUU7b0JBQ2pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtpQkFDMUU7YUFDSjtTQUNKO1FBRUQsT0FBTyxNQUFNLENBQUE7SUFDakIsQ0FBQztJQUVELE1BQU0sVUFBVSxHQUFHO1FBQ2YsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1FBQ2pCLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxNQUFNO1FBQ3BFLE9BQU8sRUFBRSxJQUFJLENBQUMsUUFBUTtZQUNsQixDQUFDLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDO1lBQ3BHLENBQUMsQ0FBQyxhQUFhLENBQUMsT0FBTyxJQUFJLEVBQUU7UUFDakMsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsSUFBSSxFQUFFO1FBQzlDLFdBQVcsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLFdBQVcsSUFBSSxFQUFFO1FBQzFJLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEtBQUssSUFBSSxFQUFFO1FBQy9ILEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHO1FBQzVCLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVTtRQUMzQixNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLE1BQU07UUFDakcsU0FBUyxFQUFFLFdBQVc7UUFDdEIsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsSUFBSSxFQUFFO1FBQ3hDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksRUFBRTtRQUNyQyxRQUFRLEVBQUUsUUFBUTtRQUNsQixPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQzdJLFVBQVUsRUFBRSxlQUFlO1FBQzNCLG1DQUFtQztRQUNuQyxNQUFNLEVBQUU7WUFDSixTQUFTLEVBQUU7Z0JBQ1AsS0FBSyxFQUFFLFlBQVk7Z0JBQ25CLFVBQVUsRUFBRSxNQUFNO2dCQUNsQixJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUI7YUFDdEM7WUFDRCxTQUFTLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVO1lBQ2pDLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVE7U0FDaEM7S0FDSixDQUFBO0lBRUQsT0FBTyxVQUFVLENBQUE7QUFDckIsQ0FBQyxDQUFBO0FBRUQsTUFBTSxvQkFBb0IsR0FBRyxDQUFDLFVBQVUsRUFBRSxXQUFXLEVBQUUsRUFBRTtJQUNyRCxJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUE7SUFDcEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUU7UUFDekMsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDZixJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUE7WUFDaEIsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFBO1lBRWhCLG9CQUFvQjtZQUNwQixNQUFNLGNBQWMsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFBO1lBRXhGLHlCQUF5QjtZQUN6QixLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtnQkFDdEQsUUFBUSxJQUFJLENBQUMsQ0FBQTtnQkFFYixNQUFNLGFBQWEsR0FBRyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7Z0JBQ3hELEtBQUssQ0FBQyxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUV6QyxrQ0FBa0M7Z0JBQ2xDLElBQUksQ0FBQyxhQUFhLEtBQUssY0FBYyxJQUFJLGFBQWEsS0FBSyxjQUFjLENBQUMsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFO29CQUMxRixLQUFLLENBQUMsUUFBUSxHQUFHLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7aUJBQ3pGO2dCQUVELElBQUksYUFBYSxLQUFLLFdBQVcsSUFBSSxhQUFhLEtBQUssUUFBUSxJQUFJLGFBQWEsS0FBSyxVQUFVLElBQUksYUFBYSxLQUFLLGNBQWMsRUFBRTtvQkFDakksS0FBSyxDQUFDLEtBQUssR0FBRyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7aUJBQzNFO2dCQUVELElBQUksYUFBYSxLQUFLLFVBQVUsSUFBSSxhQUFhLEtBQUssUUFBUSxJQUFJLGFBQWEsS0FBSyxjQUFjLEVBQUU7b0JBQ2hHLEtBQUssQ0FBQyxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7aUJBQ3JGO2dCQUVELElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQTtnQkFDakIsb0JBQW9CO2dCQUNwQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3pDLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7b0JBQ2xDLFNBQVMsSUFBSSxDQUFDLENBQUE7b0JBRWQsNkRBQTZEO29CQUM3RCxLQUFLLENBQUMsSUFBSSxHQUFHLFFBQVEsS0FBSyxDQUFDLElBQUksU0FBUyxLQUFLLENBQUMsSUFBSSxhQUFhLEtBQUssY0FBYyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUE7b0JBRXZHLElBQUksYUFBYSxHQUFHLEtBQUssQ0FBQTtvQkFDekIsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLEtBQUssRUFBRTt3QkFDdEIsYUFBYSxHQUFHLElBQUksQ0FBQTtxQkFDdkI7b0JBQ0QsOEJBQThCO29CQUM5QixJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFO3dCQUNyQixLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUE7cUJBQy9EO29CQUVELElBQUksZUFBZSxDQUFBO29CQUNuQixJQUNJLEtBQUssQ0FBQyxJQUFJO3dCQUNWLGFBQWEsSUFBSSxXQUFXO3dCQUM1QixhQUFhLElBQUksVUFBVTt3QkFDM0IsYUFBYSxJQUFJLGNBQWM7d0JBQy9CLFdBQVcsQ0FBQyxVQUFVLEtBQUssUUFBUTt3QkFDbkMsV0FBVyxDQUFDLFdBQVcsQ0FBQzt3QkFDeEIsYUFBYSxJQUFJLGNBQWMsRUFDakM7d0JBQ0UsZUFBZSxHQUFHLElBQUksQ0FBQTtxQkFDekI7b0JBRUQsc0JBQXNCO29CQUN0QixNQUFNLFNBQVMsR0FBRyxlQUFlLENBQUMsS0FBSyxFQUFFLGFBQWEsRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsZUFBZSxDQUFDLENBQUE7b0JBRWxILE1BQU0sY0FBYyxHQUFHLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7b0JBRXJFLE1BQU0sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsVUFBVSxFQUFFLEdBQUcsNEJBQTRCLENBQ2pHLFdBQVcsRUFDWCxhQUFhLEVBQ2IsS0FBSyxDQUFDLE9BQU8sQ0FDaEIsQ0FBQTtvQkFFRCxvQ0FBb0M7b0JBQ3BDLE1BQU0sWUFBWSxHQUFHLGFBQWEsS0FBSyxTQUFTLElBQUksV0FBVyxDQUFDLFVBQVUsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFBO29CQUV0RyxNQUFNLFNBQVMsR0FBRyxjQUFjLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLENBQUE7b0JBRTVELHlCQUF5QjtvQkFDekIsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRzt3QkFDYixHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO3dCQUNqQixVQUFVLEVBQUUsVUFBVTt3QkFDdEIsU0FBUyxFQUFFLFNBQVM7d0JBQ3BCLFNBQVMsRUFBRSxTQUFTO3dCQUNwQixVQUFVLEVBQUUsVUFBVTt3QkFDdEIsVUFBVSxFQUFFLFVBQVU7d0JBQ3RCLGFBQWEsRUFBRSxhQUFhO3dCQUM1QixZQUFZLEVBQUUsWUFBWTt3QkFDMUIsYUFBYSxFQUFFLGFBQWE7d0JBQzVCLGlDQUFpQzt3QkFDakMsU0FBUyxFQUFFLFNBQVM7d0JBQ3BCLFNBQVMsRUFBRSxTQUFTO3dCQUNwQixjQUFjLEVBQUUsY0FBYzt3QkFDOUIsZUFBZSxFQUFFLGVBQWU7cUJBQ25DLENBQUE7b0JBRUQseURBQXlEO29CQUN6RCxJQUFJLFdBQVcsQ0FBQyxLQUFLLEVBQUU7d0JBQ25CLE1BQU0sU0FBUyxHQUFHLENBQUMsQ0FBQyxXQUFXLEVBQUUsZUFBZSxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7NEJBQ3JFLENBQUMsQ0FBQyxNQUFNOzRCQUNSLENBQUMsQ0FBQyxhQUFhLEtBQUssUUFBUTtnQ0FDNUIsQ0FBQyxDQUFDLE1BQU07Z0NBQ1IsQ0FBQyxDQUFDLGFBQWEsS0FBSyxVQUFVO29DQUM5QixDQUFDLENBQUMsTUFBTTtvQ0FDUixDQUFDLENBQUMsUUFBUSxDQUFBO3dCQUVkLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUc7NEJBQ2IsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzs0QkFDakIsU0FBUyxFQUFFLFNBQVM7eUJBQ3ZCLENBQUE7cUJBQ0o7aUJBQ0o7Z0JBRUQsb0NBQW9DO2dCQUNwQyxJQUFJLFNBQVMsQ0FBQTtnQkFDYixJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUU7b0JBQ2IsU0FBUyxHQUFHLFVBQVUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixDQUFDLENBQUE7aUJBQzVEO3FCQUFNO29CQUNILFNBQVMsR0FBRyxFQUFFLEdBQUcsS0FBSyxFQUFFLENBQUE7aUJBQzNCO2dCQUVELG9DQUFvQztnQkFDcEMsSUFBSSxhQUFhLEtBQUssbUJBQW1CLEVBQUU7b0JBQ3ZDLE1BQU0sZUFBZSxHQUFHO3dCQUNwQixTQUFTLEVBQUUsWUFBWTt3QkFDdkIsVUFBVSxFQUFFOzRCQUNSO2dDQUNJLElBQUksRUFBRSxPQUFPO2dDQUNiLFdBQVcsRUFBRSxZQUFZO2dDQUN6QixJQUFJLEVBQUUsTUFBTTtnQ0FDWixLQUFLLEVBQUUsWUFBWTtnQ0FDbkIsS0FBSyxFQUFFLElBQUk7Z0NBQ1gsU0FBUyxFQUFFLE9BQU87Z0NBQ2xCLFNBQVMsRUFBRSxJQUFJO2dDQUNmLElBQUksRUFBRSxJQUFJOzZCQUNiOzRCQUNEO2dDQUNJLElBQUksRUFBRSxPQUFPO2dDQUNiLFdBQVcsRUFBRSxZQUFZO2dDQUN6QixJQUFJLEVBQUUsTUFBTTtnQ0FDWixLQUFLLEVBQUUsV0FBVztnQ0FDbEIsS0FBSyxFQUFFLElBQUk7Z0NBQ1gsU0FBUyxFQUFFLE9BQU87Z0NBQ2xCLFNBQVMsRUFBRSxJQUFJO2dDQUNmLElBQUksRUFBRSxJQUFJOzZCQUNiOzRCQUVEO2dDQUNJLElBQUksRUFBRSxPQUFPO2dDQUNiLDRCQUE0QjtnQ0FDNUIsSUFBSSxFQUFFLE9BQU87Z0NBQ2IsS0FBSyxFQUFFLE9BQU87Z0NBQ2QsS0FBSyxFQUFFLElBQUk7Z0NBQ1gsU0FBUyxFQUFFLE9BQU87Z0NBQ2xCLFNBQVMsRUFBRSxJQUFJO2dDQUNmLElBQUksRUFBRSxJQUFJOzZCQUNiOzRCQUNEO2dDQUNJLElBQUksRUFBRSxPQUFPO2dDQUNiLDRCQUE0QjtnQ0FDNUIsSUFBSSxFQUFFLE9BQU87Z0NBQ2IsS0FBSyxFQUFFLE9BQU87Z0NBQ2QsS0FBSyxFQUFFLEtBQUs7Z0NBQ1osU0FBUyxFQUFFLE9BQU87Z0NBQ2xCLFNBQVMsRUFBRSxJQUFJO2dDQUNmLElBQUksRUFBRSxJQUFJOzZCQUNiOzRCQUNEO2dDQUNJLEtBQUssRUFBRSxTQUFTO2dDQUNoQixJQUFJLEVBQUUsWUFBWTtnQ0FDbEIsS0FBSyxFQUFFLElBQUk7Z0NBQ1gsU0FBUyxFQUFFLFVBQVU7Z0NBQ3JCLFNBQVMsRUFBRSxJQUFJO2dDQUNmLElBQUksRUFBRSxJQUFJOzZCQUNiOzRCQUNEO2dDQUNJLEtBQUssRUFBRSxTQUFTO2dDQUNoQixRQUFRLEVBQUUsZ0JBQWdCO2dDQUMxQixJQUFJLEVBQUUsUUFBUTtnQ0FDZCxLQUFLLEVBQUUsS0FBSztnQ0FDWixTQUFTLEVBQUUsT0FBTztnQ0FDbEIsU0FBUyxFQUFFLElBQUk7Z0NBQ2YsSUFBSSxFQUFFLElBQUk7NkJBQ2I7NEJBQ0Q7Z0NBQ0ksS0FBSyxFQUFFLFVBQVU7Z0NBQ2pCLElBQUksRUFBRSxLQUFLO2dDQUNYLEtBQUssRUFBRSxLQUFLO2dDQUNaLFNBQVMsRUFBRSxPQUFPO2dDQUNsQixTQUFTLEVBQUUsSUFBSTtnQ0FDZixJQUFJLEVBQUUsSUFBSTs2QkFDYjs0QkFDRDtnQ0FDSSxLQUFLLEVBQUUsTUFBTTtnQ0FDYixJQUFJLEVBQUUsTUFBTTtnQ0FDWixLQUFLLEVBQUUsS0FBSztnQ0FDWixTQUFTLEVBQUUsT0FBTztnQ0FDbEIsU0FBUyxFQUFFLElBQUk7Z0NBQ2YsSUFBSSxFQUFFLElBQUk7NkJBQ2I7NEJBQ0Q7Z0NBQ0ksS0FBSyxFQUFFLE9BQU87Z0NBQ2QsSUFBSSxFQUFFLE9BQU87Z0NBQ2IsS0FBSyxFQUFFLEtBQUs7Z0NBQ1osU0FBUyxFQUFFLE9BQU87Z0NBQ2xCLFNBQVMsRUFBRSxJQUFJO2dDQUNmLElBQUksRUFBRSxJQUFJOzZCQUNiO3lCQUNKO3FCQUNKLENBQUE7b0JBQ0QsU0FBUyxHQUFHO3dCQUNSLEdBQUcsU0FBUzt3QkFDWixlQUFlLEVBQUUsZUFBZTtxQkFDbkMsQ0FBQTtpQkFDSjtnQkFFRCxNQUFNLE9BQU8sR0FBRyxFQUFFLEdBQUcsU0FBUyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsQ0FBQyxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsQ0FBQTtnQkFDbkgsTUFBTSxPQUFPLEdBQUcsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsQ0FBQTtnQkFFckUsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTthQUN4QjtZQUNELFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7U0FDNUI7S0FDSjtJQUNELE9BQU8sV0FBVyxDQUFBO0FBQ3RCLENBQUMsQ0FBQTtBQUVELE1BQU0sc0JBQXNCLEdBQUcsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUsRUFBRTtJQUN6RixPQUFPLENBQUMsR0FBRyxDQUFDLDZCQUE2QixDQUFDLENBQUE7SUFFMUMsTUFBTSxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7SUFFN0QsTUFBTSxZQUFZLEdBQUcsa0JBQWtCLENBQUMsV0FBVyxDQUFDLENBQUE7SUFFcEQsSUFBSSxTQUFTLEdBQUc7O01BRWQsSUFBSSxDQUFDLEdBQUc7S0FDVCxDQUFBO0lBRUQsTUFBTSxhQUFhLEdBQUcsTUFBTSxjQUFjLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0lBRXJFLDBGQUEwRjtJQUMxRixJQUFJLFNBQVMsR0FBRyxXQUFXLEdBQUcsWUFBWSxHQUFHLFNBQVMsR0FBRyxhQUFhLENBQUE7SUFFdEUsTUFBTSxrQkFBa0IsR0FBRyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUUxRCxJQUFJO1FBQ0EsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO1FBQzNELE9BQU8sWUFBWSxDQUFDLEdBQUcsQ0FBQTtLQUMxQjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1Isb0RBQW9EO1FBQ3BELE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUN0RCxPQUFPLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsS0FBSyxHQUFHLFNBQVMsQ0FBQTtLQUNyRDtBQUNMLENBQUMsQ0FBQTtBQUVELE1BQU0sY0FBYyxHQUFHLEtBQUssRUFBRSxlQUFlLEVBQUUsUUFBUSxFQUFFLEVBQUU7SUFDdkQsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFBO0lBQ3JCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNuRCxNQUFNLFFBQVEsR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQTtRQUM5QyxNQUFNLE9BQU8sR0FBRyxNQUFNLFVBQVUsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFDcEQsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtLQUMzQjtJQUVELE9BQU8sVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUMvQixDQUFDLENBQUE7QUFFRCx5Q0FBeUM7QUFDekMsTUFBTSxnQkFBZ0IsR0FBRyxVQUFVLElBQUk7SUFDbkMsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFBO0lBQ2hCLE1BQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQTtJQUV2QixLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDbkQsNEJBQTRCO1FBQzVCLFlBQVksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7UUFFeEMsd0JBQXdCO1FBQ3hCLElBQUksS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQzlCLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtZQUNqRixPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO1NBQ3RCO2FBQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTtZQUMxQixLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsb0JBQW9CLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7WUFDM0UsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtTQUN0QjthQUFNO1lBQ0gsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtTQUN0QjtLQUNKO0lBRUQsTUFBTSxRQUFRLEdBQUcsRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLENBQUE7SUFDeEMsSUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUE7SUFFcEIsbURBQW1EO0lBQ25ELE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsQ0FBQTtBQUM3QyxDQUFDLENBQUE7QUFFRCxNQUFNLGNBQWMsR0FBRyxDQUFDLEtBQUssRUFBRSxFQUFFO0lBQzdCLE1BQU0sUUFBUSxHQUFHO1FBQ2IsSUFBSSxFQUFFLEtBQUssQ0FBQyxLQUFLO1FBQ2pCLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtRQUNoQixFQUFFLEVBQUUsS0FBSyxDQUFDLEVBQUU7UUFDWixTQUFTLEVBQUUsS0FBSyxDQUFDLFNBQVM7S0FDN0IsQ0FBQTtJQUVELE9BQU8sUUFBUSxDQUFBO0FBQ25CLENBQUMsQ0FBQTtBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUc7SUFDYixnQkFBZ0I7SUFDaEIsY0FBYztJQUNkLGtCQUFrQjtJQUNsQixrQkFBa0I7SUFDbEIsV0FBVztJQUNYLHNCQUFzQjtDQUN6QixDQUFBIn0=