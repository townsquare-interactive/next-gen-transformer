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
    isButton,
    isLink,
    isOneButton,
    isTwoButtons,
    linkAndBtn,
    isGridCaption,
    alternatePromoColors,
    isPromoButton,
    stripImageFolders,
    removeDuplicatesArray,
    createColorClasses,
    convertText,
    replaceKey,
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

const transformPagesData = async (pageData, sitePageData, themeStyles, newUrl) => {
    console.log('page transformer started')
    let newPages = []
    let newData = []

    for (const [key, value] of Object.entries(pageData)) {
        if (value.data.title) {
            console.log('name found', value.data.title)
            delete value.data.title
        }

        //getting page data from siteconfig
        const pageId = key
        const pageTitle = sitePageData[pageId].title
        const pageSlug = sitePageData[pageId].slug
        const pageType = sitePageData[pageId].page_type
        const url = sitePageData[pageId].url

        if (value.data.modules) {
            const columnStyles = getColumnsCssClass(value.data)

            //adding site data to pages
            value.data = { id: pageId, title: pageTitle, slug: pageSlug, pageType: pageType, url: url, ...value.data, columnStyles: columnStyles }

            //create scss file for page
            if (value.data.JS || value.data.head_script) {
                const foot_script = value.data.JS
                const head_script = value.data.head_script
                const allScripts = foot_script + head_script

                createPageCss(allScripts, pageSlug, newUrl)
            } else {
                const allScripts = ''
                createPageCss(allScripts, pageSlug, newUrl)
            }

            //transforming page data
            if (value.data.modules) {
                value.data.modules = transformCMSMods(value.data.modules, themeStyles)
                newPages.push(value)
            }
        } else if (value.seo) {
            const currentFile = await getFileS3(`${newUrl}/pages/${pageSlug}.json`)
            const newSeoFile = { ...currentFile, seo: value.seo }
            newData.push(newSeoFile)
        }
    }

    pageData.pages = newData
    return pageData
}

const createPageCss = async (allScripts, pageSlug, newUrl) => {
    //grab content between <script> tags
    let pageCss
    if (allScripts) {
        var styleMatchRegExp = /<style[^>]*>([^<]+)<\/style>/gi
        var match = styleMatchRegExp.exec(allScripts)
        var cssStringArray = []
        while (match != null) {
            cssStringArray.push(match[1])
            match = styleMatchRegExp.exec(allScripts)
        }

        const cssString = convertText(cssStringArray.join(' '))
        pageCss = `.page-${pageSlug} {
        ${cssString}
    }`
    } else {
        pageCss = ''
    }

    await addFileS3(pageCss, `${newUrl}/styles/${pageSlug}`, 'scss')
}

const deletePages = async (pages, newUrl) => {
    console.log('deleter started')
    const oldPageList = await getFileS3(`${newUrl}/pages/page-list.json`)
    let newPageList = []

    for (let i = 0; i < oldPageList.pages.length; i++) {
        if (!(oldPageList.pages[i].id in pages)) {
            newPageList.push(oldPageList.pages[i])
        } else {
            await deleteFileS3(`${newUrl}/pages/${oldPageList.pages[i].slug}.json`)
        }
    }

    return oldPageList
}

//Update pagelist file in s3 or create if not already there
const updatePageList = async (page, newUrl) => {
    console.log('page list updater started ------')
    const pageListUrl = `${newUrl}/pages/page-list.json`

    //add page object to pagelist
    const addPagesToList = (pageListFile) => {
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
            } else {
                //console.log('page already there', pageData.title)
            }
        }
    }

    let pageListFile = await getFileS3(`${newUrl}/pages/page-list.json`)
    addPagesToList(pageListFile)
    //Can use add file when ready, instead of addpagelist logging
    await addFileS3List(pageListFile, pageListUrl)
    return pageListFile
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

//Create or edit layout file
const createOrEditLayout = async (file, newUrl, themeStyles) => {
    console.log('layout edit')
    const currentLayout = await getFileS3(`${newUrl}/layout.json`)

    //adding socials from sitedata
    function transformSocial(file) {
        const social = []

        for (let i = 0; i < file.settings.social.services.length; i++) {
            let item = file.settings.social.services[i]
            const newUrl = item.format.replace(/\%.*/, '') + item.value

            if (file.settings.social.services[i]) {
                if (item.value && item.enabled == 1) {
                    social.push({ ...item, url: newUrl, icon: socialConvert(item.name) })
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
        s3Folder: newUrl,
        favicon: stripImageFolders(file.config.website.favicon.src) || '',
    }

    return globalFile
}

const transformCMSMods = (moduleList, themeStyles) => {
    let columnsData = []
    for (let i = 0; i <= moduleList.length; ++i) {
        if (moduleList[i]) {
            let newData = []

            let modCount = 0

            let imageCount = 0

            //each actual page module
            for (const [key, value] of Object.entries(moduleList[i])) {
                let modType
                modCount += 1

                if (value.type.includes('article')) {
                    modType = 'Article'
                } else if (value.type === 'photo_grid') {
                    modType = 'PhotoGrid'
                } else if (value.type === 'banner_1') {
                    modType = 'Banner'
                } else {
                    modType = value.type
                }

                if (modType === 'PhotoGrid' || modType === 'Banner') {
                    value.items = alternatePromoColors(value.items, themeStyles, modType)
                }

                let itemCount = 0

                //loop for each item
                for (let i = 0; i < value.items.length; i++) {
                    const currentItem = value.items[i]
                    itemCount += 1

                    if (currentItem.image) {
                        imageCount += 1
                    }

                    const imagePriority = modCount === 1 && itemCount <= 4 ? true : imageCount <= 2 ? true : false

                    //replace line breaks from cms
                    if (value.items[i].desc) {
                        value.items[i].desc = convertText(currentItem.desc)
                    }

                    //determining button/link logic
                    const linkNoBtn = isButton(currentItem) === false && isLink(currentItem) === true

                    const singleButton = isOneButton(currentItem)

                    const twoButtons = isTwoButtons(currentItem)

                    const isWrapLink = (singleButton || linkNoBtn) && modType != 'article'

                    const visibleButton = linkAndBtn(currentItem)
                    if (currentItem.itemCount === 22) {
                        console.log(visibleButton)
                    }

                    const buttonList = [
                        {
                            name: 'btn1',
                            link: currentItem.pagelink || currentItem.weblink,
                            window: currentItem.newwindow,
                            icon: btnIconConvert(currentItem.icon || ''),
                            label: currentItem.actionlbl,
                            active: currentItem.actionlbl && (currentItem.pagelink || currentItem.weblink) ? true : false,
                            btnType: currentItem.btnType ? currentItem.btnType : isPromoButton(currentItem, modType),
                            btnSize: currentItem.btnSize,
                            linkType: currentItem.pagelink ? 'local' : 'ext',
                        },
                        {
                            name: 'btn2',
                            link: currentItem.pagelink2 || currentItem.weblink2,
                            window: currentItem.newwindow2,
                            icon: btnIconConvert(currentItem.icon2 || ''),
                            label: currentItem.actionlbl2,
                            active: currentItem.actionlbl2 && (currentItem.pagelink2 || currentItem.weblink2) ? true : false,
                            btnType: currentItem.btnType2,
                            btnSize: currentItem.btnSize2,
                            linkType: currentItem.pagelink2 ? 'local' : 'ext',
                        },
                    ]

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

const getAllCssPages = async (currentPageList, newUrl) => {
    const allPageCss = []
    for (let i = 0; i < currentPageList.pages.length; i++) {
        const pageSlug = currentPageList.pages[i].slug
        const cssFile = await getCssFile(pageSlug, newUrl)
        allPageCss.push(cssFile)
    }

    return allPageCss.join(' ')
}
const getCssFile = async (pageSlug, newUrl) => {
    var options = {
        uri: `${bucketUrl}/${newUrl}/styles/${pageSlug}.scss`,
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

const createGlobalStylesheet = async (themeStyles, fonts, code, currentPageList, newUrl) => {
    console.log('colors changed --------')

    //creating font import
    const headlineFont = fonts.list[fonts.sections.hdrs.value]
    const bodyFont = fonts.list[fonts.sections.body.value]
    const featuredFont = fonts.list[fonts.sections.feat.value]
    const fontTypes = [headlineFont.google, bodyFont.google, featuredFont.google]
    const uniqueFontGroup = removeDuplicatesArray(fontTypes)
    const fontImportGroup = `@import url(https://fonts.googleapis.com/css?family=${uniqueFontGroup.join('|')}&display=swap);`
    const colorClasses = createColorClasses(themeStyles)
    const fontClasses = ` body {font-family:${bodyFont.label};}
    .hd-font{font-family:${headlineFont.label};} 
    .txt-font{font-family:${bodyFont.label};}
    .feat-font{font-family:${featuredFont.label};}
    `

    let customCss = `
    /*---------------------Custom Code--------------------*/
    ${code.CSS}
    `

    const allPageStyles = await getAllCssPages(currentPageList, newUrl)

    let allStyles = fontImportGroup + fontClasses + colorClasses + customCss + allPageStyles

    const allStylesConverted = convertText(allStyles)

    try {
        const convertedCss = sass.compileString(allStylesConverted)
        return convertedCss.css
    } catch (e) {
        console.log('custom css ' + e.name + ': ' + e.message)
        return allStyles
    }
}

//adding a page file for each page in cms data
const addMultipleS3 = async (data, pageList, newUrl) => {
    const pages = data.pages

    //adding page list file to s3
    addFileS3(pageList, `${newUrl}/pages/page-list`)

    //adding page files to s3
    for (let i = 0; i < data.pages.length; i++) {
        addFileS3(data.pages[i], `${newUrl}/pages/${pages[i].slug}`)
    }

    //add full site data to s3
    addFileS3(data, `${newUrl}/siteData`)
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
            value.publisher.data.modules = transformCMSMods(value.publisher.data.modules)
            newData.push(value)
        } else if (value.backup.data) {
            value.backup.data.modules = transformCMSMods(value.backup.data.modules)
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
