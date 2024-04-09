import { config } from 'dotenv'
config()
import * as sass from 'sass'
import { z } from 'zod'

import {
    socialConvert,
    btnIconConvert,
    getColumnsCssClass,
    transformcontact,
    transformNav,
    alternatePromoColors,
    createColorClasses,
    convertSpecialTokens,
    replaceKey,
    createFontCss,
    createLinkAndButtonVariables,
    determineModRenderType,
    createBtnStyles,
    createImageSizes,
    createGallerySettings,
    modVariationType,
    createItemStyles,
    createContactForm,
    convertDescText,
    transformPageSeo,
    removeFieldsFromObj,
    transformLinksInItem,
    transformCompositeItems,
    createTsiImageLink,
    isFeatureBtn,
    createFavLink,
    transformLogos,
    createModalPageList,
    moduleRenderTypes,
    decidePrimaryPhoneOrEmail,
    filterPrimaryContact,
    seperateScriptCode,
    getlandingPageOptions,
} from '../utils.js'
import { createCustomComponents, extractIframeSrc, transformVcita } from '../customComponentsUtils.js'
import { addFileS3, getFileS3, getCssFile, addFileS3List, deleteFileS3 } from '../s3Functions.js'
import { CMSPage, ThemeStyles, Layout, Page, LunaModule, ModuleItem, GlobalStyles } from '../../types.js'
import { PageListSchema, zodDataParse } from '../../schema/output-zod.js'
import { dynamoClient } from './dynamo-controller.js'

const toStringSchema = z.coerce.string()

export const transformPagesData = async (pageData: Page, sitePageData: any, themeStyles: ThemeStyles, basePath: string, cmsUrl: string) => {
    console.log('page transformer started')
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
                id: toStringSchema.parse(value.id),
            }
            newData.push(oldPageFile)

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

            if (value.data.modules && value.data.modules.length != 0) {
                const columnStyles = getColumnsCssClass(value.data)

                //adding site data to pages
                value.data = { id: pageId, title: pageTitle, slug: pageSlug, pageType: pageType, url: url, ...value.data, columnStyles: columnStyles }

                createPageScss(value.data, pageSlug, basePath)

                //screate page scripts
                const foot_script = value.data.JS || ''
                const head_script = value.data.head_script || ''
                const customPageCode = foot_script + head_script
                const seperatedCode = seperateScriptCode(customPageCode)
                value.data.scripts = seperatedCode.scripts

                //create list of page modals
                let pageModals: { modalNum: number; modalTitle: string; openEveryTime: boolean; autoOpen: boolean }[] = createModalPageList(value.data.modules)
                value.data.pageModals = pageModals

                //transforming page data
                value.data.modules = transformPageModules(value.data.modules, themeStyles, cmsUrl, pageModals)
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

export const getPageData = (sitePageData: any, key: any) => {
    const pageId: any = key
    const pageTitle = sitePageData[pageId].title
    const pageSlug = sitePageData[pageId].slug
    const pageType = sitePageData[pageId].page_type
    const url = sitePageData[pageId].url
    const seo = transformPageSeo(sitePageData[pageId].seo)

    return { pageId, pageTitle, pageSlug, pageType, url, seo }
}

//grab content between <style> tags and add scss page to s3
const createPageScss = async (pageData: CMSPage, pageSlug: string, basePath: string) => {
    let pageCss

    if (pageData.JS || pageData.head_script) {
        const foot_script = pageData.JS || ''
        const head_script = pageData.head_script || ''
        const customPageCode = foot_script + head_script
        const allPageCode = seperateScriptCode(customPageCode, pageSlug)
        pageCss = allPageCode.css
    } else {
        pageCss = ''
    }

    await addFileS3(pageCss, `${basePath}/styles/${pageSlug}`, 'scss')
}

//delete pages from s3
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

    zodDataParse(pageListFile, PageListSchema, 'Pages', 'parse')
    await addFileS3List(pageListFile, pageListUrl)
    return pageListFile
}

//add page object to pagelist
const addPagesToList = async (pageListFile: { pages: [{ slug: string }] }, page: CMSPage[] | Page[], basePath: string) => {
    for (let i = 0; i < page.length; i++) {
        let pageData = page[i].data

        const newPageItem = {
            name: pageData.title,
            slug: pageData.slug,
            url: pageData.url || pageData.slug,
            id: pageData.id,
            page_type: pageData.page_type || '',
        }
        //check if page doesn't exist (need a version if it does)
        if (pageListFile.pages.filter((e) => e.slug === pageData.slug).length === 0) {
            pageListFile.pages.push(newPageItem)

            //updating existing page data in pagelist
        } else if (pageListFile.pages.filter((e) => e.slug === pageData.slug).length >= 0) {
            const pageIdx = pageListFile.pages.findIndex((e) => e.slug === pageData.slug)
            pageListFile.pages[pageIdx] = newPageItem
        }
    }
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
export const createOrEditLayout = async (file: any, basePath: string, themeStyles: ThemeStyles, url: string, globalStyles: GlobalStyles) => {
    const currentLayout = await getFileS3(`${basePath}/layout.json`)

    //setting siteType to landing
    let siteType = file.config.website.siteType || 'website'
    if (file.config.website.url.includes('nextgenprototype') || file.config.website.url.includes('guaranteedservice')) {
        siteType = 'landing'
    }

    const { fontImportGroup, fontClasses } = createFontCss(file.design.fonts, siteType)

    //adding socials from sitedata
    function transformSocial(socials: any) {
        const social = []

        for (let i = 0; i < socials.length; i++) {
            let item = socials[i]
            const url = item.format.replace(/\%.*/, '') + item.value

            if (socials[i]) {
                if (item.value && item.enabled == 1) {
                    social.push({ ...item, url: url, icon: socialConvert(url) })
                }
            }
        }

        return social
    }

    // transform contact link/data
    let contactInfo
    let phoneNumber
    let email
    if (file.settings && file.settings.contact.contact_list.wide.items.length > 0) {
        const primaryContact = filterPrimaryContact(file.settings)
        contactInfo = await transformcontact(primaryContact)
        phoneNumber = decidePrimaryPhoneOrEmail(primaryContact, currentLayout, 'phone')
        email = decidePrimaryPhoneOrEmail(primaryContact, currentLayout, 'email')
    } else {
        contactInfo = currentLayout.contact || ''
        phoneNumber = currentLayout.phoneNumber || ''
        email = currentLayout.email || ''
    }

    const transformedLogos = transformLogos(file.logos, file.config.website.url)

    //Transform composite data/modal
    let modalData
    let composites = file.composites

    if (file.composites?.footer?.modules?.items) {
        const { newModalData, newCompositeItems } = transformCompositeItems(file.composites?.footer?.modules?.items)
        file.composites.footer.modules.items = newCompositeItems
        modalData = newModalData
        composites = file.composites
    }

    //custom code components
    const customComponents = createCustomComponents(file.design.code || '')
    console.log(customComponents)

    //global script evaluation
    const globalHeaderCode = seperateScriptCode(file.design.code.header || '', '')
    const globalFooterCode = seperateScriptCode(file.design.code.footer || '', '')

    //engage
    //if not in settings need to keep currentFile
    let vcita = currentLayout.vcita ? currentLayout.vcita : null
    if (file.engage?.hasEngage && file.settings.vcita) {
        vcita = transformVcita(file.settings.vcita, file.engage, file.settings['vcita_business_info'] || null)
        console.log('vcita test', vcita)
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
        favicon:
            file.config.website.favicon.src && file.config.website.favicon.src != null
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
    }

    //not added to this in luna yet, adding manually "file.config.website.siteType"

    if (siteType === 'landing') {
        globalFile.headerOptions = getlandingPageOptions()
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
                icon: socialConvert(
                    'https://www.google.com/maps/place/Guaranteed+Service/@40.3801104,-74.571654,11z/data=!3m1!4b1!4m5!3m4!1s0x89c3c4c47750b5bb:0x1a7085e031fb3be7!8m2!3d40.3791538!4d-74.435907'
                ),
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
        ]

        globalFile.social = socials
    }

    return globalFile
}

const transformPageModules = (
    moduleList: LunaModule[],
    themeStyles: ThemeStyles,
    cmsUrl: string,
    pageModals: { modalNum: number; modalTitle: any; openEveryTime: boolean; autoOpen: boolean }[]
) => {
    let columnsData = []

    for (let i = 0; i <= moduleList.length; ++i) {
        if (moduleList[i]) {
            let newData = []
            let modCount = 0

            const isSingleColumn = moduleList.filter((e: any) => Object.keys(e).length != 0).length === 2

            let imageCount = 0

            //each actual page module
            for (const [key, value] of Object.entries(moduleList[i])) {
                let currentModule = value

                //remove unneeeded fields
                currentModule = removeFieldsFromObj(currentModule, ['export'])

                let modRenderType = ''
                if (currentModule.type === 'plugin' && currentModule.items[0]?.plugin === '[map]') {
                    console.log('map time')
                    modRenderType = 'Map'
                } else {
                    modRenderType = determineModRenderType(currentModule.type)
                }

                //Dont count modules that are not being rendered
                if (moduleRenderTypes.includes(modRenderType)) {
                    modCount += 1
                }

                currentModule.type = modVariationType(currentModule.type)

                //transform Photo Gallery Settings
                if ((modRenderType === 'PhotoGallery' || modRenderType === 'Testimonials') && currentModule.settings) {
                    currentModule.settings = createGallerySettings(currentModule.settings, currentModule.blockSwitch1, currentModule.type)
                }

                if (modRenderType === 'PhotoGrid' || modRenderType === 'Banner' || modRenderType === 'Parallax' || modRenderType === 'PhotoGallery') {
                    currentModule.items = alternatePromoColors(currentModule.items, themeStyles, currentModule.well)
                }

                if (modRenderType === 'Parallax' || modRenderType === 'Banner' || modRenderType === 'PhotoGallery') {
                    currentModule.items = createItemStyles(currentModule.items, currentModule.well, modRenderType, currentModule.type)
                }

                //imagesize transforms
                if (currentModule.imgsize === 'widescreen_2-4_1') {
                    currentModule.imgsize = 'widescreen_2_4_1'
                }

                //remove empty items
                currentModule.items = currentModule.items.filter((modItem: {}) => Object.keys(modItem).length !== 0)

                const schemaNum = z.coerce.number()
                if (currentModule.columns) {
                    currentModule.columns = schemaNum.parse(currentModule.columns)
                }

                let itemCount = 1
                //loop for each item inside of module
                for (let i = 0; i < currentModule.items.length; i++) {
                    let currentItem = currentModule.items[i]
                    currentModule.items[i] = transformModuleItem(
                        currentModule,
                        currentItem,
                        itemCount,
                        modCount,
                        modRenderType,
                        key,
                        themeStyles,
                        cmsUrl,
                        pageModals,
                        imageCount
                    )

                    itemCount += 1

                    if (currentModule.items[i].image) {
                        imageCount += 1
                    }
                }

                //replace class with customClassName
                let newModule
                if (currentModule.class) {
                    newModule = replaceKey(currentModule, 'class', 'customClassName')
                } else {
                    newModule = { ...currentModule }
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

const determineLazyLoad = (modLazy: string, modCount: number, itemCount: number, imageCount: number) => {
    //initiate lazy load off for top module items
    if (modCount === 1 && itemCount <= 2) {
        modLazy = 'off'
    }
    if (imageCount === 0) {
        modLazy = 'off'
    } else {
        modLazy = modLazy
    }

    if (modLazy === 'off') {
        return true
    } else {
        return false
    }
}

const transformModuleItem = (
    currentModule: LunaModule,
    currentItem: ModuleItem,
    itemCount: number,
    modCount: number,
    modRenderType: string,
    key: string,
    themeStyles: ThemeStyles,
    cmsUrl: string,
    pageModals: { modalNum: number; modalTitle: any }[],
    imageCount: number
) => {
    currentItem = removeFieldsFromObj(currentItem, ['id', 'uid'])

    const imagePriority = determineLazyLoad(currentModule.lazy, modCount, itemCount, imageCount)

    //replace line breaks from cms
    if (currentItem.desc) {
        let newDesc = convertDescText(currentItem.desc)
        const videoDesc = extractIframeSrc(newDesc)
        newDesc = videoDesc ? videoDesc.newDesc : newDesc
        currentItem.desc = newDesc

        //add video object if exists in desc
        if (videoDesc?.srcValue) {
            currentItem.video = {
                src: videoDesc.srcValue,
                method: 'ext',
            }
        }
    }

    if (currentItem.headline) {
        currentItem.headline = convertSpecialTokens(currentItem.headline)
    }
    if (currentItem.subheader) {
        currentItem.subheader = convertSpecialTokens(currentItem.subheader)
    }

    //Create button and link vars
    const { linkNoBtn, btnCount, isWrapLink, visibleButton, buttonList } = createLinkAndButtonVariables(
        currentItem,
        modRenderType,
        currentModule.columns,
        pageModals
    )

    const isFeatureButton = isFeatureBtn(modRenderType, currentModule.well, btnCount, currentItem.isFeatured)

    //create button styles
    const btnStyles = createBtnStyles(currentModule, modRenderType, key, themeStyles, currentItem, itemCount, isFeatureButton)

    const nextImageSizes = createImageSizes(modRenderType, currentModule.columns)

    //create links array and remove single link fields
    currentItem = transformLinksInItem(currentItem)

    //check if article is beach and hero
    const isBeaconHero = modRenderType === 'article' && currentItem.isFeatured === 'active' ? true : false

    const imageIcon = btnIconConvert(currentItem.icon3 || '')

    //decide if image is to be cropped to a certain dimension
    if (currentItem.image) {
        currentItem.image = createTsiImageLink(cmsUrl, currentItem.image)
        const imageType = !['no_sizing', 'no_set_height'].includes(currentModule.imgsize)
            ? 'crop'
            : modRenderType === 'Banner'
            ? 'crop'
            : modRenderType === 'Parallax'
            ? 'crop'
            : 'nocrop'

        currentItem = {
            ...currentItem,
            imageType: imageType,
        }
    }

    //If modal has form plugin
    if (modRenderType === 'Modal' && currentItem.plugin === '[gravity]') {
        const contactFormData = createContactForm('', '')
        currentItem = {
            ...currentItem,
            contactFormData: contactFormData,
        }
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
    }
    //fields not being used currently
    currentItem = removeFieldsFromObj(currentItem, ['editingIcon1', 'editingIcon2', 'editingIcon3', 'iconSelected'])

    return currentItem
}

/* function removeLunaCss(inputString: string) {
    // Use a regular expression to match the patterns ".tsH", ".tsD", or ".tsI" followed by anything until the next "}" or the end of the string
    const regex = /\.ts[HDI][^}]*?(}|$)/g

    // Replace the matched patterns with an empty string
    const result = inputString.replace(regex, '').replace(/\n\s*\n/g, '\n')

    return result
} */

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

    let globalStyles = colorClasses
    const globalConverted = convertSpecialTokens(globalStyles, 'code')
    const customConverted = convertSpecialTokens(fontClasses + customCss + allPageStyles, 'code')
    const convertedGlobal = sass.compileString(globalConverted)
    try {
        const convertedCustom = sass.compileString(customConverted)
        return { global: convertedGlobal.css, custom: convertedCustom.css }
    } catch (e) {
        //error catch if code passed is not correct scss/css
        console.log(`error in styling compression ${e.message.toString()}`)
        return { global: convertedGlobal.css, custom: `/* ${e.message.toString()} */` + customConverted }
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

export const createPageList = (page: { title: string; slug: string; id: string; page_type: string }) => {
    const pageData = {
        name: page.title,
        slug: page.slug,
        id: page.id,
        page_type: page.page_type,
    }

    return pageData
}

//b dynamoClient
//throughout the evening prewritten toast or topic
