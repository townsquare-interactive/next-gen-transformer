require('dotenv').config()
const AWS = require('aws-sdk')
const TsiBucket = 'townsquareinteractive'

const {
    socialConvert,
    btnIconConvert,
    getColumnsCssClass,
    transformcontact,
    determineNavParent,
    isButton,
    isLink,
    isOneButton,
    isTwoButtons,
    linkAndBtn,
    isGridCaption,
    alternatePromoColors,
    isPromoButton,
} = require('../utils')

AWS.config.update({
    region: process.env.CMS_DEFAULT_REGION,
    accessKeyId: process.env.CMS_ACCESS_KEY_ID,
    secretAccessKey: process.env.CMS_SECRET_ACCESS_KEY_ID,
    //logger: console,
})

const s3 = new AWS.S3()

const transformPagesData = function (pageData, sitePageData, themeStyles) {
    console.log('page transformer started')
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
        const page_type = sitePageData[pageId].page_type
        const url = sitePageData[pageId].url
        const columnStyles = getColumnsCssClass(value.data)

        //adding site data to pages
        value.data = { id: pageId, title: pageTitle, slug: pageSlug, page_type: page_type, url: url, ...value.data, columnStyles: columnStyles }

        //transforming page data
        if (value.data.modules) {
            value.data.modules = transformCMSMods(value.data.modules, themeStyles)
            newData.push(value)
        }
    }

    pageData.pages = newData

    //returned transformed whole page json and pagelist
    return pageData
}

const deletePages = async (pages, newUrl) => {
    console.log('deleter started')
    const oldPageList = await getFileS3(TsiBucket, `${newUrl}/pages/page-list.json`)
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
        console.log('old pagelist', pageListFile)
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
            } else {
                console.log('page already there', pageData.title)
            }
        }
    }

    let pageListFile = await getFileS3(TsiBucket, `${newUrl}/pages/page-list.json`)
    addPagesToList(pageListFile)
    //Can use add file when ready, instead of addpagelist logging
    await addFileS3List(pageListFile, pageListUrl)
    return pageListFile
}

//Get S3 object and return, if not found return passed object
const getFileS3 = async (bucket, key, rtnObj = { pages: [] }) => {
    try {
        const data = await s3.getObject({ Bucket: bucket, Key: key }).promise()
        return JSON.parse(data.Body.toString('utf-8'))
    } catch (err) {
        console.log('file  not found in S3, creating new file')
        return rtnObj
    }
}

//add file to s3 bucket
const addFileS3 = async (file, key) => {
    await s3
        .putObject({
            Body: JSON.stringify(file),
            Bucket: TsiBucket,
            Key: key,
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
    const currentLayout = await getFileS3(TsiBucket, `${newUrl}/layout.json`)

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
        contact: file.settings ? transformcontact(file.settings.contact.contact_list.wide.items[0]) : currentLayout.contact || '',
        siteName: file.config.website.site_title || '',
        phoneNumber: file.settings ? file.settings.contact.contact_list.wide.items[0].selectedPrimaryPhoneNumber : currentLayout.phoneNumber || '',
        email: file.settings ? file.settings.contact.contact_list.wide.items[0].selectedPrimaryEmailAddress : currentLayout.email || '',
        url: file.config.website.url,
        composites: file.composites,
        cmsNav: file.vars.navigation ? determineNavParent(file.vars.navigation.menuList) : currentLayout.cmsNav,
        cmsColors: themeStyles,
        theme: file.design.themes.selected || '',
        cmsUrl: file.config.website.url || '',
        favicon: file.config.website.favicon.src || '',
    }
    return globalFile
}

const transformCMSMods = (moduleList, themeStyles) => {
    let columnsData = []
    for (let i = 0; i <= moduleList.length; ++i) {
        if (moduleList[i]) {
            let newData = []

            let modCount = 0

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

                    const imagePriority = modCount === 1 && itemCount <= 4 ? true : false

                    //replace line breaks from cms
                    if (value.items[i].desc) {
                        value.items[i].desc = value.items[i].desc.replaceAll('[rn]', '<br>')
                    }

                    //determining button/link logic
                    const linkNoBtn = isButton(currentItem) === false && isLink(currentItem) === true

                    const singleButton = isOneButton(currentItem)

                    const twoButtons = isTwoButtons(currentItem)

                    const isWrapLink = (singleButton || linkNoBtn) && modType != 'article'

                    const visibleButton = linkAndBtn(currentItem)

                    /* const gridButtonNoImage = modType === 'PhotoGrid' && !value.items[i].image ? true : false

                    const bannerButton = modType === 'Banner' ? true : false

                    const firstButtonAlt = gridButtonNoImage ? true : bannerButton ? true : false  
 */

                    const buttonList = [
                        {
                            name: 'btn1',
                            link: value.items[i].pagelink || value.items[i].weblink,
                            window: value.items[i].newwindow,
                            icon: btnIconConvert(value.items[i].icon || ''),
                            label: value.items[i].actionlbl,
                            active: value.items[i].actionlbl && (value.items[i].pagelink || value.items[i].weblink) ? true : false,
                            btnType: value.items[i].btnType || isPromoButton(value.items[i], modType) ? 'btn_promo' : 'btn_1',
                            btnSize: value.items[i].btnSize,
                            linkType: value.items[i].pagelink ? 'local' : 'ext',
                        },
                        {
                            name: 'btn2',
                            link: value.items[i].pagelink2 || value.items[i].weblink2,
                            window: value.items[i].newwindow2,
                            icon: btnIconConvert(value.items[i].icon2 || ''),
                            label: value.items[i].actionlbl2,
                            active: value.items[i].actionlbl2 && (value.items[i].pagelink2 || value.items[i].weblink2) ? true : false,
                            btnType: value.items[i].btnType2,
                            btnSize: value.items[i].btnSize2,
                            linkType: value.items[i].pagelink2 ? 'local' : 'ext',
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

                const modData = { ...value, modId: key, modCount: modCount }

                const newItem = { attributes: modData, componentType: modType }
                newData.push(newItem)
            }
            columnsData.push(newData)
        }
    }
    return columnsData
}

//adding a page file for each page in cms data
const addMultipleS3 = async (data, pageList, newUrl) => {
    const pages = data.pages

    //adding page list file to s3
    addFileS3(pageList, `${newUrl}/pages/page-list.json`)

    //adding page files to s3
    for (let i = 0; i < data.pages.length; i++) {
        addFileS3(data.pages[i], `${newUrl}/pages/${pages[i].slug}.json`)
    }

    //add full site data to s3
    addFileS3(data, `${newUrl}/siteData.json`)
}

//add any file, pass it the file and key for filename
const addFileS3List = async (file, key) => {
    console.log('File to be added', file)

    await s3
        .putObject({
            Body: JSON.stringify(file),
            Bucket: TsiBucket,
            Key: key,
        })
        .promise()

    console.log('S3 File Added')
}

const deleteFileS3 = async (key) => {
    console.log('File to be deleted', key)

    await s3
        .deleteObject({
            Bucket: TsiBucket,
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
}
