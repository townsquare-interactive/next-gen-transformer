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
    convertDescText,
} from '../utils.js'

import { addFileS3, getFileS3, getCssFile, addFileS3List, deleteFileS3 } from '../s3Functions.js'

import { CMSPage, ThemeStyles, Layout, Page, LunaModule } from '../../types.js'

export const transformPagesData = async (pageData: CMSPage, sitePageData: any, themeStyles: ThemeStyles, basePath: string) => {
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
            let oldSiteData: Layout = await getFileS3(`${basePath}/layout.json`)
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

const getPageData = (sitePageData: CMSPage[], key: string) => {
    const pageId: any = key
    const pageTitle = sitePageData[pageId].title
    const pageSlug = sitePageData[pageId].slug
    const pageType = sitePageData[pageId].page_type
    const url = sitePageData[pageId].url
    const seo = sitePageData[pageId].seo

    return { pageId, pageTitle, pageSlug, pageType, url, seo }
}

//grab content between <style> tags and add scss page to s3
const createPageScss = async (pageData: CMSPage, pageSlug: string, basePath: string) => {
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

export const deletePages = async (pages: CMSPage[], basePath: string) => {
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
export const updatePageList = async (page: CMSPage[] | Page[], basePath: string) => {
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
const addPagesToList = async (pageListFile: { pages: [{ slug: string }] }, page: CMSPage[] | Page[], basePath: string) => {
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

            //await addNewPageToNav(pageData, basePath:string)

            //updating existing page data in pagelist
        } else if (pageListFile.pages.filter((e) => e.slug === pageData.slug).length >= 0) {
            const pageIdx = pageListFile.pages.findIndex((e) => e.slug === pageData.slug)
            pageListFile.pages[pageIdx] = newPageItem
        }
    }
    //return pageListFile
}

//Adding a new page does not automatically add it to nav unless we do this
export const addNewPageToNav = async (pageData: CMSPage, basePath: string) => {
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
export const createOrEditLayout = async (file: any, basePath: string, themeStyles: ThemeStyles, url: string) => {
    const currentLayout = await getFileS3(`${basePath}/layout.json`)

    const { fontImportGroup, fontClasses } = createFontCss(file.design.fonts)

    //adding socials from sitedata
    function transformSocial(file: any) {
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
        navAlign: file.navigation ? file.navigation.menu_alignment : 'left',
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

const transformPageModules = (moduleList: LunaModule[], themeStyles: ThemeStyles) => {
    let columnsData = []
    for (let i = 0; i <= moduleList.length; ++i) {
        if (moduleList[i]) {
            let newData = []
            let modCount = 0

            //let imageCount = 0
            const isSingleColumn = moduleList.filter((e: any) => Object.keys(e).length != 0).length === 2

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
                        value.items[i].desc = convertDescText(currentItem.desc)
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

export const createGlobalStylesheet = async (themeStyles: ThemeStyles, fonts: any, code: { CSS: string }, currentPageList: any, basePath: string) => {
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
    if (currentPageList) {
        if (Object.keys(currentPageList).length != 0) {
            allPageStyles = await getAllCssPages(currentPageList, basePath)
        }
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

        return `/* ${e.message.toString()} */` + allStyles
    }
}

const getAllCssPages = async (currentPageList: { pages: [{ slug: string }] }, basePath: string) => {
    const allPageCss = []
    for (let i = 0; i < currentPageList.pages.length; i++) {
        const pageSlug = currentPageList.pages[i].slug
        const cssFile = await getCssFile(pageSlug, basePath)
        allPageCss.push(cssFile)
    }

    return allPageCss.join(' ')
}

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

export const createPageList = (value: { title: string; slug: string; id: String; page_type: string }) => {
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