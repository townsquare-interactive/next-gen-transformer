require('dotenv').config()
const AWS = require('aws-sdk')
const sass = require('sass')

const request = require('request-promise')

const {
    socialConvert,
    btnIconConvert,
    getColumnsCssClass,
    transformcontact,
    transformNav,
    isGridCaption,
    alternatePromoColors,
    stripImageFolders,
    createColorClasses,
    convertSpecialTokens,
    replaceKey,
    createFontCss,
    createLinkAndButtonVariables,
    determineModType,
} = require('../utils')

const tsiBucket = 'townsquareinteractive'
const bucketUrl = 'https://townsquareinteractive.s3.amazonaws.com'

AWS.config.update({
    region: process.env.CMS_DEFAULT_REGION,
    accessKeyId: process.env.CMS_ACCESS_KEY_ID,
    secretAccessKey: process.env.CMS_SECRET_ACCESS_KEY_ID,
    //logger: console,
})

const s3 = new AWS.S3()

const transformPagesData = async (pageData, sitePageData, themeStyles, basePath) => {
    console.log('page transformer started')
    let newPages = []
    let newData = []

    for (const [key, value] of Object.entries(pageData)) {
        if (value.data.title) {
            console.log('name found', value.data.title)
            delete value.data.title
        }

        const { pageId, pageTitle, pageSlug, pageType, url } = getPageData(sitePageData, key)

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
    }

    pageData.pages = newData
    return pageData
}

const getPageData = (sitePageData, key) => {
    const pageId = key
    const pageTitle = sitePageData[pageId].title
    const pageSlug = sitePageData[pageId].slug
    const pageType = sitePageData[pageId].page_type
    const url = sitePageData[pageId].url

    return { pageId, pageTitle, pageSlug, pageType, url }
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

    return oldPageList
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
            //console.log('new page added:', pageData.title)
        }
    }
}

//Create or edit layout file
const createOrEditLayout = async (file, basePath, themeStyles) => {
    console.log('layout edit')
    const currentLayout = await getFileS3(`${basePath}/layout.json`)

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
        logos: file.logos.header.slots[0] || file.logos.header.slots[1] || file.logos.header.slots[2] || '',
        mobileLogos: file.logos.mobile.slots[0] || file.logos.mobile.slots[1] || file.logos.mobile.slots[2] || '',
        footerLogos: file.logos.footer.slots[0] || '',
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
        favicon: stripImageFolders(file.config.website.favicon.src) || '',
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

            //each actual page module
            for (const [key, value] of Object.entries(moduleList[i])) {
                modCount += 1

                const modType = determineModType(value.type)

                if (modType === 'PhotoGrid' || modType === 'Banner') {
                    value.items = alternatePromoColors(value.items, themeStyles, value.well)
                }

                let itemCount = 0
                //loop for each item
                for (let i = 0; i < value.items.length; i++) {
                    const currentItem = value.items[i]
                    itemCount += 1

                    /*                     if (currentItem.image) {
                        imageCount += 1
                    } */

                    let imagePriority = false
                    if (value.lazy === 'off') {
                        imagePriority = true
                    } /*   else if ((modCount === 1 && itemCount <= 4) || imageCount <= 2) {
                        imagePriority = true
                    } else {
                        imagePriority = false
                    } */

                    //replace line breaks from cms
                    if (value.items[i].desc) {
                        value.items[i].desc = convertSpecialTokens(currentItem.desc)
                    }

                    const { linkNoBtn, twoButtons, isWrapLink, visibleButton, buttonList } = createLinkAndButtonVariables(currentItem, modType)

                    const isBeaconHero = modType === 'article' && currentItem.isFeatured === 'active' ? true : false

                    const imageIcon = btnIconConvert(value.items[i].icon3 || '')

                    const hasGridCaption = modType === 'PhotoGrid' ? isGridCaption(currentItem) : false

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
                        hasGridCaption: hasGridCaption,
                        itemCount: itemCount,
                    }
                }

                let newModule
                if (value.class) {
                    newModule = replaceKey(value, 'class', 'customClassName')
                } else {
                    newModule = { ...value }
                }

                const modData = { ...newModule, modId: key, modCount: modCount }
                const newItem = { attributes: modData, componentType: modType }

                newData.push(newItem)
            }
            columnsData.push(newData)
        }
    }
    return columnsData
}

const addAssetFromSiteToS3 = async (file, key) => {
    var options = {
        uri: 'http://' + file,
        encoding: null,
    }
    request(options, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            console.log('failed to get image')
            console.log(error)
        } else {
            s3.putObject(
                {
                    Body: body,
                    Key: key,
                    Bucket: tsiBucket,
                },
                function (error, data) {
                    if (error) {
                        console.log('error downloading image to s3')
                    } else {
                        console.log('success uploading to s3')
                    }
                }
            )
        }
    })
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

    let allStyles = fontImportGroup + fontClasses + colorClasses + customCss + allPageStyles

    const allStylesConverted = convertSpecialTokens(allStyles)

    try {
        const convertedCss = sass.compileString(allStylesConverted)
        return convertedCss.css
    } catch (e) {
        //error catch if code passed is not correct scss/css
        console.log('custom css ' + e.name + ': ' + e.message)
        return `/* ${e.message.toString()} */` + allStyles

        //return
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

//Get S3 object and return, if not found return passed object
const getFileS3 = async (key, rtnObj = { pages: [] }, type = 'json') => {
    if (type === 'json') {
        try {
            const data = await s3.getObject({ Bucket: tsiBucket, Key: key }).promise()
            return type === 'json' ? JSON.parse(data.Body.toString('utf-8')) : data.Body.toString('utf-8')
        } catch (err) {
            console.log('file  not found in S3, creating new file')
            return rtnObj
        }
    } else {
        try {
            const data = await s3.getObject({ Bucket: tsiBucket, Key: key })
            console.log(key)
            return data.Body.toString('utf-8')
        } catch (err) {
            console.log('css file not in s3')
            return rtnObj
        }
    }
}

const getCssFile = async (pageSlug, basePath) => {
    var options = {
        uri: `${bucketUrl}/${basePath}/styles/${pageSlug}.scss`,
        encoding: null,
    }

    let cssFile
    await request(options, function (error, response, body) {
        if (error || response.statusCode !== 200) {
            console.log('failed to get file')
            cssFile = ''
        } else {
            cssFile = body.toString('utf-8')
        }
    })
    return cssFile
}

//add file to s3 bucket
const addFileS3 = async (file, key, fileType = 'json') => {
    const s3ContentType = fileType.includes('css') ? 'text/css' : 'application/json'
    const body = fileType === 'json' ? JSON.stringify(file) : file

    await s3
        .putObject({
            Body: body,
            Bucket: tsiBucket,
            Key: key + `.${fileType}`,
            ContentType: s3ContentType,
        })
        .promise()
        .catch((error) => {
            console.error(error)
        })

    console.log('File Placed')
}

//adding a page file for each page in cms data
const addMultipleS3 = async (data, pageList, basePath) => {
    const pages = data.pages

    //adding page list file to s3
    addFileS3(pageList, `${basePath}/pages/page-list`)

    //adding page files to s3
    for (let i = 0; i < data.pages.length; i++) {
        addFileS3(data.pages[i], `${basePath}/pages/${pages[i].slug}`)
    }

    //add full site data to s3
    addFileS3(data, `${basePath}/siteData`)
}

//add any file, pass it the file and key for filename
const addFileS3List = async (file, key) => {
    //console.log('File to be added', file)

    await s3
        .putObject({
            Body: JSON.stringify(file),
            Bucket: tsiBucket,
            Key: key,
        })
        .promise()

    console.log('S3 File Added')
}

const deleteFileS3 = async (key) => {
    console.log('File to be deleted', key)

    await s3
        .deleteObject({
            Bucket: tsiBucket,
            Key: key,
        })
        .promise()

    console.log('S3 File Deleted')
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
    addMultipleS3,
    transformCMSData,
    updatePageList,
    addFileS3,
    transformPagesData,
    createOrEditLayout,
    deletePages,
    addAssetFromSiteToS3,
    getFileS3,
    createGlobalStylesheet,
}
