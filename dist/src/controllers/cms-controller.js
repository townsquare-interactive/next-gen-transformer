import { config } from 'dotenv'
config()
import sass from 'sass'
import z from 'zod'
import {
    socialConvert,
    btnIconConvert,
    getColumnsCssClass,
    transformcontact,
    transformNav,
    //isGridCaption,
    alternatePromoColors,
    stripImageFolders,
    createColorClasses,
    convertSpecialTokens,
    replaceKey,
    createFontCss,
    createLinkAndButtonVariables,
    determineModRenderType,
    createBtnStyles,
    createImageSizes,
    isOneButton,
    createGallerySettings,
    modVariationType,
    createItemStyles,
    createContactForm,
} from '../utils.js'
import { addFileS3, getFileS3, getCssFile, addFileS3List, deleteFileS3 } from '../s3Functions.js'
export const transformPagesData = async (pageData, sitePageData, themeStyles, basePath) => {
    console.log('page transformer started')
    console.log(pageData)
    //let newPages = []
    let newData = []
    //for each page
    for (const [key, value] of Object.entries(pageData)) {
        const { pageId, pageTitle, pageSlug, pageType, url, seo } = getPageData(sitePageData, key)
        //covering page name change
        if (Object.keys(value.data).length === 0 && value.attrs) {
            console.log('initiated page name change')
            const oldPageSlug = sitePageData[key].backup.attrs.slug
            let oldPageFile = await getFileS3(`${basePath}/pages/${oldPageSlug}.json`)
            let oldSiteData = await getFileS3(`${basePath}/layout.json`)
            let oldNav = oldSiteData.cmsNav
            const newSlug = value.attrs.slug
            const newTitle = value.attrs.title
            const newUrl = `/${newSlug}/`
            oldPageFile.data = {
                ...oldPageFile.data,
                slug: newSlug,
                title: newTitle,
                url: newUrl,
            }
            newData.push(oldPageFile)
            //change nav to change new page
            //filter array to update nav spot with changed page name
            if (oldNav.findIndex((x) => x.slug === oldPageSlug) != -1) {
                var foundIndex = oldNav.findIndex((x) => x.slug === oldPageSlug)
                const newField = {
                    ...oldNav[foundIndex],
                    slug: newSlug,
                    title: newTitle,
                    url: newUrl,
                }
                oldNav[foundIndex] = newField
                await addFileS3(oldSiteData, `${basePath}/layout`)
            }
        }
        //check here if data is found, if not its a page name change if (attrs)
        if (value.data) {
            if (value.data.title) {
                console.log('name found', value.data.title)
                delete value.data.title
            }
            value.seo = seo
            if (value.data.modules) {
                const columnStyles = getColumnsCssClass(value.data)
                //adding site data to pages
                value.data = { id: pageId, title: pageTitle, slug: pageSlug, pageType: pageType, url: url, ...value.data, columnStyles: columnStyles }
                createPageScss(value.data, pageSlug, basePath)
                //transforming page data
                value.data.modules = transformPageModules(value.data.modules, themeStyles)
                // newData = newPages
            }
            newData.push(value)
            //seo change without page data
        } else if (Object.keys(value.seo).length === 0) {
            const currentFile = await getFileS3(`${basePath}/pages/${pageSlug}.json`)
            const newSeoFile = { ...currentFile, seo: value.seo }
            newData.push(newSeoFile)
        }
    }
    return { pages: newData }
}
const getPageData = (sitePageData, key) => {
    const pageId = key
    const pageTitle = sitePageData[pageId].title
    const pageSlug = sitePageData[pageId].slug
    const pageType = sitePageData[pageId].page_type
    const url = sitePageData[pageId].url
    const seo = sitePageData[pageId].seo
    return { pageId, pageTitle, pageSlug, pageType, url, seo }
}
//grab content between <style> tags and add scss page to s3
const createPageScss = async (pageData, pageSlug, basePath) => {
    let pageCss
    if (pageData.JS || pageData.head_script) {
        const foot_script = pageData.JS || ''
        const head_script = pageData.head_script || ''
        const customPageCode = foot_script + head_script
        let styleMatchReg = /<style[^>]*>([^<]+)<\/style>/gi
        let nextMatch = styleMatchReg.exec(customPageCode)
        let cssStringArray = []
        while (nextMatch != null) {
            cssStringArray.push(nextMatch[1])
            nextMatch = styleMatchReg.exec(customPageCode)
        }
        const cssString = convertSpecialTokens(cssStringArray.join(' '))
        pageCss = `.page-${pageSlug} {
        ${cssString}
    }`
    } else {
        pageCss = ''
    }
    await addFileS3(pageCss, `${basePath}/styles/${pageSlug}`, 'scss')
}
export const deletePages = async (pages, basePath) => {
    console.log('deleter started')
    const oldPageList = await getFileS3(`${basePath}/pages/page-list.json`)
    let newPageList = []
    for (let i = 0; i < oldPageList.pages.length; i++) {
        if (!(oldPageList.pages[i].id in pages)) {
            newPageList.push(oldPageList.pages[i])
        } else {
            await deleteFileS3(`${basePath}/pages/${oldPageList.pages[i].slug}.json`)
        }
    }
    return newPageList ? { pages: newPageList } : oldPageList
}
//Update pagelist file in s3 or create if not already there
export const updatePageList = async (page, basePath) => {
    console.log('page list updater started ------')
    const pageListUrl = `${basePath}/pages/page-list.json`
    let pageListFile = await getFileS3(`${basePath}/pages/page-list.json`)
    addPagesToList(pageListFile, page, basePath)
    //Can use add file when ready, instead of addpagelist logging
    console.log('new page list', pageListFile)
    await addFileS3List(pageListFile, pageListUrl)
    return pageListFile
}
//add page object to pagelist
const addPagesToList = async (pageListFile, page, basePath) => {
    //console.log('old pagelist', pageListFile)
    for (let i = 0; i < page.length; i++) {
        let pageData = page[i].data
        const newPageItem = {
            name: pageData.title,
            slug: pageData.slug,
            url: pageData.url || pageData.slug,
            id: Number(pageData.id),
            page_type: pageData.page_type || '',
        }
        //check if page doesn't exist (need a version if it does)
        if (pageListFile.pages.filter((e) => e.slug === pageData.slug).length === 0) {
            pageListFile.pages.push(newPageItem)
            //await addNewPageToNav(pageData, basePath)
            //updating existing page data in pagelist
        } else if (pageListFile.pages.filter((e) => e.slug === pageData.slug).length >= 0) {
            const pageIdx = pageListFile.pages.findIndex((e) => e.slug === pageData.slug)
            pageListFile.pages[pageIdx] = newPageItem
        }
    }
    //return pageListFile
}
//Adding a new page does not automatically add it to nav unless we do this
export const addNewPageToNav = async (pageData, basePath) => {
    //Get layout file to update nav
    let oldSiteData = await getFileS3(`${basePath}/layout.json`)
    const newPageData = {
        name: pageData.title,
        title: pageData.title,
        slug: pageData.slug,
        url: pageData.url,
        ID: pageData.id,
        menu_order: oldSiteData?.cmsNav ? oldSiteData.cmsNav.length : 1,
        menu_item_parent: 0,
    }
    if (oldSiteData?.cmsNav) {
        //add new page to nav
        oldSiteData.cmsNav.push(newPageData)
        //update global file with new nav
        await addFileS3(oldSiteData, `${basePath}/layout`)
    } else if (oldSiteData) {
        oldSiteData = { ...oldSiteData, cmsNav: [newPageData] }
        await addFileS3(oldSiteData, `${basePath}/layout`)
    }
}
//Create or edit layout file
export const createOrEditLayout = async (file, basePath, themeStyles, url) => {
    const currentLayout = await getFileS3(`${basePath}/layout.json`)
    const { fontImportGroup, fontClasses } = createFontCss(file.design.fonts)
    //adding socials from sitedata
    function transformSocial(file) {
        const social = []
        for (let i = 0; i < file.settings.social.services.length; i++) {
            let item = file.settings.social.services[i]
            const basePath = item.format.replace(/\%.*/, '') + item.value
            if (file.settings.social.services[i]) {
                if (item.value && item.enabled == 1) {
                    social.push({ ...item, url: basePath, icon: socialConvert(item.name) })
                }
            }
        }
        return social
    }
    // transform contact link/data
    let contactInfo
    if (file.settings && file.settings.contact.contact_list.wide.items[0]) {
        contactInfo = transformcontact(file.settings.contact.contact_list.wide.items[0])
    } else {
        contactInfo = currentLayout.contact || ''
    }
    const globalFile = {
        logos: file.logos,
        social: file.settings ? transformSocial(file) : currentLayout.social,
        contact: contactInfo,
        siteName: file.config.website.site_title || '',
        phoneNumber: file.settings ? file.settings.contact.contact_list.wide.items[0].selectedPrimaryPhoneNumber : currentLayout.phoneNumber || '',
        email: file.settings ? file.settings.contact.contact_list.wide.items[0].selectedPrimaryEmailAddress : currentLayout.email || '',
        url: file.config.website.url,
        composites: file.composites,
        cmsNav: file.vars.navigation ? transformNav(file.vars.navigation.menuList, url) : currentLayout.cmsNav,
        seo: file.seo.global_seo_options ? { global: file.seo.global_seo_options } : currentLayout.seo || {},
        cmsColors: themeStyles,
        theme: file.design.themes.selected || '',
        cmsUrl: file.config.website.url || '',
        s3Folder: basePath,
        favicon: file.config.website.favicon.src && file.config.website.favicon.src != null ? stripImageFolders(file.config.website.favicon.src) : '',
        fontImport: fontImportGroup,
        config: {
            mailChimp: {
                audId: 'd0b2dd1631',
                datacenter: 'us21',
                auth: process.env.MAILCHIMP_API_KEY,
            },
            zapierUrl: process.env.ZAPIER_URL,
            makeUrl: process.env.MAKE_URL,
        },
    }
    return globalFile
}
const transformPageModules = (moduleList, themeStyles) => {
    let columnsData = []
    for (let i = 0; i <= moduleList.length; ++i) {
        if (moduleList[i]) {
            let newData = []
            let modCount = 0
            //let imageCount = 0
            const isSingleColumn = moduleList.filter((e) => Object.keys(e).length != 0).length === 2
            //each actual page module
            for (const [key, value] of Object.entries(moduleList[i])) {
                modCount += 1
                const modRenderType = determineModRenderType(value.type)
                value.type = modVariationType(value.type)
                //transform Photo Gallery Settings
                if ((modRenderType === 'PhotoGallery' || modRenderType === 'Testimonials') && value.settings) {
                    value.settings = createGallerySettings(value.settings, value.blockSwitch1, value.type)
                }
                if (modRenderType === 'PhotoGrid' || modRenderType === 'Banner' || modRenderType === 'Parallax' || modRenderType === 'PhotoGallery') {
                    value.items = alternatePromoColors(value.items, themeStyles, value.well)
                }
                if (modRenderType === 'Parallax' || modRenderType === 'Banner' || modRenderType === 'PhotoGallery') {
                    value.items = createItemStyles(value.items, value.well, modRenderType, value.type)
                }
                let itemCount = 0
                //loop for each item
                for (let i = 0; i < value.items.length; i++) {
                    const currentItem = value.items[i]
                    itemCount += 1
                    //zod type coercian
                    const schemaNum = z.coerce.number()
                    if (currentItem.columns) {
                        value.items[i].columns = schemaNum.parse(value.items[i].columns)
                    }
                    //Change lazy loading to off for first module in photogallery
                    value.lazy = modCount === 1 && itemCount === 1 && modRenderType === 'PhotoGallery' ? 'off' : value.lazy
                    let imagePriority = false
                    if (value.lazy === 'off') {
                        imagePriority = true
                    }
                    //replace line breaks from cms
                    if (value.items[i].desc) {
                        value.items[i].desc = convertSpecialTokens(currentItem.desc)
                    }
                    let isFeatureButton
                    if (
                        value.well &&
                        modRenderType != 'PhotoGrid' &&
                        modRenderType != 'Parallax' &&
                        modRenderType != 'PhotoGallery' &&
                        currentItem.isFeatured === 'active' &&
                        isOneButton(currentItem) &&
                        modRenderType != 'PhotoGallery'
                    ) {
                        isFeatureButton = true
                    }
                    //create button styles
                    const btnStyles = createBtnStyles(value, modRenderType, key, themeStyles, currentItem, itemCount, isFeatureButton)
                    const nextImageSizes = createImageSizes(modRenderType, value.columns)
                    const { linkNoBtn, twoButtons, isWrapLink, visibleButton, buttonList } = createLinkAndButtonVariables(
                        currentItem,
                        modRenderType,
                        value.columns
                    )
                    //check if article is beach and hero
                    const isBeaconHero = modRenderType === 'article' && currentItem.isFeatured === 'active' ? true : false
                    const imageIcon = btnIconConvert(value.items[i].icon3 || '')
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
                    }
                    //decide if image is to be cropped to a certain dimension
                    if (currentItem.image) {
                        const imageType = !['no_sizing', 'no_set_height'].includes(value.imgsize)
                            ? 'crop'
                            : modRenderType === 'Banner'
                            ? 'crop'
                            : modRenderType === 'Parallax'
                            ? 'crop'
                            : 'nocrop'
                        value.items[i] = {
                            ...value.items[i],
                            imageType: imageType,
                        }
                    }
                }
                //replace class with customClassName
                let newModule
                if (value.class) {
                    newModule = replaceKey(value, 'class', 'customClassName')
                } else {
                    newModule = { ...value }
                }
                //add contactFormData in form object
                if (modRenderType === 'ContactFormRoutes') {
                    const contactFormData = createContactForm('', '')
                    newModule = {
                        ...newModule,
                        contactFormData: contactFormData,
                    }
                }
                const modData = { ...newModule, modId: key, modCount: modCount, columnLocation: i, isSingleColumn: isSingleColumn }
                const newItem = { attributes: modData, componentType: modRenderType }
                newData.push(newItem)
            }
            columnsData.push(newData)
        }
    }
    return columnsData
}
export const createGlobalStylesheet = async (themeStyles, fonts, code, currentPageList, basePath) => {
    console.log('global css changed --------')
    const { fontImportGroup, fontClasses } = createFontCss(fonts)
    const colorClasses = createColorClasses(themeStyles)
    let customCss = code.CSS
        ? `
    /*---------------------Custom Code--------------------*/
    ${code.CSS}
    `
        : ''
    let allPageStyles
    if (currentPageList && Object.keys(currentPageList).length != 0) {
        allPageStyles = await getAllCssPages(currentPageList, basePath)
    } else {
        allPageStyles = ''
    }
    //let allStyles = fontImportGroup + fontClasses + colorClasses + customCss + allPageStyles
    let allStyles = fontClasses + colorClasses + customCss + allPageStyles
    const allStylesConverted = convertSpecialTokens(allStyles)
    try {
        const convertedCss = sass.compileString(allStylesConverted)
        return convertedCss.css
    } catch (e) {
        //error catch if code passed is not correct scss/css
        console.log('custom css ' + e.name + ': ' + e.message)
        return `/* ${e.message.toString()} */` + allStyles
    }
}
const getAllCssPages = async (currentPageList, basePath) => {
    const allPageCss = []
    for (let i = 0; i < currentPageList.pages.length; i++) {
        const pageSlug = currentPageList.pages[i].slug
        const cssFile = await getCssFile(pageSlug, basePath)
        allPageCss.push(cssFile)
    }
    return allPageCss.join(' ')
}
//used for migrate, probably delete later
export const transformCMSData = function (data) {
    let newData = []
    const pageListData = []
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
}
export const createPageList = (value) => {
    const pageData = {
        name: value.title,
        slug: value.slug,
        id: value.id,
        page_type: value.page_type,
    }
    return pageData
}
/* export default {
    transformCMSData,
    updatePageList,
    transformPagesData,
    createOrEditLayout,
    deletePages,
    createGlobalStylesheet,
} */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY21zLWNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29udHJvbGxlcnMvY21zLWNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUMvQixNQUFNLEVBQUUsQ0FBQTtBQUNSLE9BQU8sSUFBSSxNQUFNLE1BQU0sQ0FBQTtBQUN2QixPQUFPLENBQUMsTUFBTSxLQUFLLENBQUE7QUFFbkIsT0FBTyxFQUNILGFBQWEsRUFDYixjQUFjLEVBQ2Qsa0JBQWtCLEVBQ2xCLGdCQUFnQixFQUNoQixZQUFZO0FBQ1osZ0JBQWdCO0FBQ2hCLG9CQUFvQixFQUNwQixpQkFBaUIsRUFDakIsa0JBQWtCLEVBQ2xCLG9CQUFvQixFQUNwQixVQUFVLEVBQ1YsYUFBYSxFQUNiLDRCQUE0QixFQUM1QixzQkFBc0IsRUFDdEIsZUFBZSxFQUNmLGdCQUFnQixFQUNoQixXQUFXLEVBQ1gscUJBQXFCLEVBQ3JCLGdCQUFnQixFQUNoQixnQkFBZ0IsRUFDaEIsaUJBQWlCLEdBQ3BCLE1BQU0sYUFBYSxDQUFBO0FBRXBCLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLE1BQU0sbUJBQW1CLENBQUE7QUFFakcsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUcsS0FBSyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxFQUFFO0lBQ3RGLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQTtJQUN2QyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQ3JCLG1CQUFtQjtJQUNuQixJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUE7SUFFaEIsZUFBZTtJQUNmLEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxNQUFN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
