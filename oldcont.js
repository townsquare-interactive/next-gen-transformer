require('dotenv').config()
const sass = require('sass')

const {
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
    createItemStyles,
    createBtnStyles,
    createImageSizes,
    isOneButton,
    createGallerySettings,
    modVariationType,
} = require('../utils')

const { addFileS3, getFileS3, getCssFile, addFileS3List, deleteFileS3 } = require('../s3Functions.js')

const transformPagesData = async (pageData, sitePageData, themeStyles, basePath) => {
    console.log('page transformer started')
    let newPages = []
    let newData = []

    for (const [key, value] of Object.entries(pageData)) {
        if (value.data.title) {
            console.log('name found', value.data.title)
            delete value.data.title
        }

        const { pageId, pageTitle, pageSlug, pageType, url, seo } = getPageData(sitePageData, key)

        value.seo = seo

        if (value.data.modules) {
            const columnStyles = getColumnsCssClass(value.data)

            //adding site data to pages
            value.data = { id: pageId, title: pageTitle, slug: pageSlug, pageType: pageType, url: url, ...value.data, columnStyles: columnStyles }

            createPageScss(value.data, pageSlug, basePath)

            //transforming page data
            if (value.data.modules) {
                value.data.modules = transformPageModules(value.data.modules, themeStyles)
                newPages.push(value)
            }

            newData = newPages
        } else if (value.seo) {
            const currentFile = await getFileS3(`${basePath}/pages/${pageSlug}.json`)
            const newSeoFile = { ...currentFile, seo: value.seo }
            newData.push(newSeoFile)
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

    pageData.pages = newData
    pageData = { ...pageData }
    return pageData
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

const deletePages = async (pages, basePath) => {
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
const updatePageList = async (page, basePath) => {
    console.log('page list updater started ------')
    const pageListUrl = `${basePath}/pages/page-list.json`
    let pageListFile = await getFileS3(`${basePath}/pages/page-list.json`)
    addPagesToList(pageListFile, page)
    //Can use add file when ready, instead of addpagelist logging
    await addFileS3List(pageListFile, pageListUrl)
    return pageListFile
}

//add page object to pagelist
const addPagesToList = (pageListFile, page) => {
    //console.log('old pagelist', pageListFile)
    for (let i = 0; i < page.length; i++) {
        pageData = page[i].data
        if (pageListFile.pages.filter((e) => e.name === pageData.title).length === 0) {
            pageListFile.pages.push({
                name: pageData.title,
                slug: pageData.slug,
                url: pageData.url,
                id: pageData.id,
                page_type: pageData.page_type,
            })
            console.log('new page added:', pageData.title)
        }
    }
}

//Create or edit layout file
const createOrEditLayout = async (file, basePath, themeStyles) => {
    console.log('layout edit')
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
                    }
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

const createGlobalStylesheet = async (themeStyles, fonts, code, currentPageList, basePath) => {
    console.log('global css changed --------')

    const { fontImportGroup, fontClasses } = createFontCss(fonts)

    const colorClasses = createColorClasses(themeStyles)

    let customCss = `
    /*---------------------Custom Code--------------------*/
    ${code.CSS}
    `

    const allPageStyles = await getAllCssPages(currentPageList, basePath)

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
const transformCMSData = function (data) {
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

const createPageList = (value) => {
    const pageData = {
        name: value.title,
        slug: value.slug,
        id: value.id,
        page_type: value.page_type,
    }

    return pageData
}

module.exports = {
    transformCMSData,
    updatePageList,
    transformPagesData,
    createOrEditLayout,
    deletePages,
    createGlobalStylesheet,
}