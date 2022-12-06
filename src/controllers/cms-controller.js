require('dotenv').config()
const AWS = require('aws-sdk')
const TsiBucket = 'townsquareinteractive'

AWS.config.update({
    region: process.env.CMS_DEFAULT_REGION,
    accessKeyId: process.env.CMS_ACCESS_KEY_ID,
    secretAccessKey: process.env.CMS_SECRET_ACCESS_KEY_ID,
    //logger: console,
})

const s3 = new AWS.S3()

const transformPagesData = function (pageData, siteData) {
    console.log('page transformer started')
    let newData = []
    for (const [key, value] of Object.entries(pageData)) {
        if (value.data.title) {
            console.log('name found', value.data.title)
            delete value.data.title
        }

        //getting page data from siteconfig
        const pageId = key
        const pageTitle = siteData[pageId].title
        const pageSlug = siteData[pageId].slug
        const page_type = siteData[pageId].page_type
        const url = siteData[pageId].url
        const columnStyles = getColumnsCssClass(value.data)

        //adding site data to pages
        value.data = { id: pageId, title: pageTitle, slug: pageSlug, page_type: page_type, url: url, ...value.data, columnStyles: columnStyles }

        //transforming page data
        if (value.data.modules) {
            value.data.modules = transformCMSMods(value.data.modules)
            newData.push(value)
        }
    }

    pageData.pages = newData

    //returned transformed whole page json and pagelist
    return pageData
}

//Strip url of protocol and .production / .com
const stripUrl = (url) => {
    const removeProtocol = url.replace(/(^\w+:|^)\/\//, '')
    return removeProtocol.replace(/\..*/, '')
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
                /*   console.log('page already there', pageData.title) */
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
const createOrEditLayout = async (file, newUrl, newPageList) => {
    console.log('layout edit')
    /*    let pageListFile = newPageList ? newPageList : await getFileS3(TsiBucket, `${newUrl}/pages/page-list.json`) */
    const currentLayout = await getFileS3(TsiBucket, `${newUrl}/layout.json`)

    //adding socials from sitedata
    const social = []

    if (file.settings) {
        for (let i = 0; i < file.settings.social.services.length; i++) {
            let item = file.settings.social.services[i]
            const newUrl = item.format.replace(/\%.*/, '') + item.value

            if (file.settings.social.services[i]) {
                if (item.value && item.enabled == 1) {
                    social.push({ ...item, url: newUrl, icon: socialConvert(item.name) })
                }
            }
        }
        console.log(social)
    }

    const globalFile = {
        logos: file.logos.header.slots[0] || file.logos.header.slots[1] || file.logos.header.slots[2] || '',
        mobileLogos: file.logos.mobile.slots[0] || file.logos.mobile.slots[1] || file.logos.mobile.slots[2] || '',
        footerLogos: file.logos.footer.slots[0] || '',
        social: file.settings ? social : currentLayout.social,
        contact: file.settings ? file.settings.contact.contact_list.wide.items[0] : currentLayout.contact || '',
        siteName: file.config.website.site_title || '',
        phoneNumber: file.settings ? file.settings.contact.contact_list.wide.items[0].selectedPrimaryPhoneNumber : currentLayout.phoneNumber || '',
        email: file.settings ? file.settings.contact.contact_list.wide.items[0].selectedPrimaryEmailAddress : currentLayout.email || '',
        url: file.config.website.url,
        composites: file.composites,
        cmsNav: file.vars.navigation ? determineParent(file.vars.navigation.menuList) : currentLayout.cmsNav,
        cmsColors: setColors(file.design.colors, file.design.themes.selected),
        theme: file.design.themes.selected || '',
        cmsUrl: file.config.website.url || '',
        favicon: file.config.website.favicon.src || '',
    }
    return globalFile
}

const determineParent = (menu) => {
    let editTable = []
    for (let i = 0; i < menu.length; i++) {
        //create table of items that have parent
        if (menu[i].menu_item_parent == 0) {
            //Sometimes submenu is not passed but we can use menu_item_parent
            if (!menu[i].submenu) {
                let submenu = menu.filter((value) => menu[i].ID == value.menu_item_parent)
                let newTable = submenu.length != 0 ? { ...menu[i], submenu } : menu[i]
                editTable.push(newTable)
            }
        }
    }

    return editTable.length != 0 ? editTable : menu
}

const transformCMSMods = (pageData) => {
    let columnsData = []
    for (let i = 0; i <= pageData.length; ++i) {
        if (pageData[i]) {
            let newData = []

            for (const [key, value] of Object.entries(pageData[i])) {
                let modType

                if (value.type.includes('article')) {
                    modType = 'MyArticle'
                } else if (value.type === 'photo_grid') {
                    modType = 'PhotoGrid'
                } else {
                    modType = value.type
                }

                //replace line breaks from cms
                for (let i = 0; i < value.items.length; i++) {
                    if (value.items[i].desc) {
                        value.items[i].desc = value.items[i].desc.replaceAll('[rn]', '<br>')
                    }

                    let buttonList = [
                        {
                            name: 'btn1',
                            link: value.items[i].pagelink || value.items[i].weblink,
                            window: value.items[i].newwindow,
                            icon: btnIconConvert(value.items[i].icon || ''),
                            label: value.items[i].actionlbl,
                            active: value.items[i].actionlbl && (value.items[i].pagelink || value.items[i].weblink) ? true : false,
                            btnType: value.items[i].btnType,
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

                    const imageIcon = btnIconConvert(value.items[i].icon3 || '')

                    console.log(buttonList)
                    value.items[i] = { ...value.items[i], buttonList: buttonList, imageIcon: imageIcon }
                }

                const modData = { ...value, modId: key }

                const newItem = { attributes: modData, componentType: modType }
                newData.push(newItem)
            }
            columnsData.push(newData)
        }
    }
    return columnsData
}

function btnIconConvert(icon) {
    if (icon) {
        //replaces fas fa-rocket with faRocket
        const stripIcon = icon.replace('fas', '')
        const iconPrefix = icon.includes('fas') ? 'fas' : icon.includes('far') ? 'far' : icon.includes('fab') ? 'fab' : ''
        const iconModel = stripIcon.replace(/^(.*?)-/, '')

        return { iconPrefix: iconPrefix, iconModel: iconModel }
    }
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

const setColors = (cmsColors, cmsTheme) => {
    if (cmsTheme === 'beacon-theme_charlotte') {
        return {
            promoColor: cmsColors.color_31.value,
            textColor: cmsColors.color_4.value,
            headingColor: cmsColors.color_2.value,
            subHeadingColor: cmsColors?.color_3.value,
            textColorAccent: cmsColors.color_9.value,
            btnBackground: cmsColors.color_8.value,
            linkColor: cmsColors.color_5.value,
            accentBackgroundColor: cmsColors.color_25.value,
            accentColor2: cmsColors.color_32.value,
            altColor: cmsColors.color_31.value,
            headerBackground: cmsColors.color_23.value,
            footerBackground: cmsColors.color_27.value,
            navBackground: cmsColors.color_23.value,
            BckdHeaderSocial: cmsColors.color_24.value,
            NavText: cmsColors.color_18.value,
            navHover: cmsColors.color_19.value,
            linkHover: cmsColors.color_6.value,
            bckdContent: cmsColors.color_22.value,
            footerText: cmsColors.color_28.value,
            navCurrent: cmsColors.color_20.value,
            captionText: cmsColors.color_16.value,
            captionBackground: cmsColors.color_17.value,
        }
    } else {
        return {
            promoColor: cmsColors?.color_3.value,
            textColor: cmsColors?.color_3a.value,
            headingColor: cmsColors?.color_2.value,
            subHeadingColor: cmsColors?.color_3.value,
            textColorAccent: cmsColors?.color_4.value,
            btnBackground: cmsColors?.color_8.value,
            linkColor: cmsColors?.color_19.value,
            accentBackgroundColor: cmsColors?.color_3.value,
            accentColor2: cmsColors?.color_16.value,
            altColor: cmsColors?.color_16.value,
            headerBackground: cmsColors?.color_17.value,
            footerBackground: cmsColors?.color_20.value,
            navBackground: cmsColors?.color_16.value,
            BckdHeaderSocial: cmsColors?.color_17.value,
            NavText: cmsColors?.color_18.value,
            linkHover: cmsColors?.color_7.value,
            footerText: cmsColors?.color_12.value,
            navHover: cmsColors.color_19.value,
            navCurrent: cmsColors.color_19.value,
            //clt
            captionText: cmsColors.color_16.value,
            captionBackground: cmsColors.color_17.value,
        }
    }
}

const getColumnsCssClass = (page) => {
    if (page.sections[1].wide == '938' || page.sections[1].wide == '988') {
        return 'full-column'
    } else if (page.sections[1].wide == '484' && page.sections[2].wide == '484') {
        return 'half-columns'
    } else if (page.sections[1].wide == '316' && page.sections[2].wide == '316' && page.sections[3].wide == '316') {
        return 'third-columns'
    } else if (page.sections[1].wide == '232' && page.sections[2].wide == '232' && page.sections[3].wide == '232' && page.sections[4].wide == '232') {
        return 'fourth-columns'
    } else if (page.sections[1].wide == '652' && page.sections[2].wide == '316') {
        return 'two-third_one-third'
    } else if (page.sections[1].wide == '316' && page.sections[2].wide == '652') {
        return 'one-third_two-third'
    } else if (page.sections[1].wide == '232' && page.sections[2].wide == '736') {
        return 'one-fourth_three-fourth'
    } else if (page.sections[1].wide == '736' && page.sections[2].wide == '232') {
        return 'three-fourth_one-fourth'
    } else if (page.sections[1].wide == '484' && page.sections[2].wide == '232' && page.sections[3].wide == '232') {
        return 'half_one-fourth_one-fourth'
    } else if (page.sections[1].wide == '232' && page.sections[2].wide == '232' && page.sections[3].wide == '484') {
        return 'one-fourth_one-fourth_half'
    } else if (page.sections[1].wide == '232' && page.sections[2].wide == '484' && page.sections[3].wide == '232') {
        return 'one-fourth_half_one-fourth'
    }
}

//newwwww
function iconConvert(str) {
    if (str.indexOf('google') !== -1) {
        return 'google'
    } else if (str.indexOf('facebook') !== -1) {
        return 'facebook'
    } else if (str.indexOf('instagram') !== -1) {
        return 'instagram'
    } else if (str.indexOf('twitter') !== -1) {
        return 'twitter'
    } else {
        return 'social'
    }
}

function socialConvert(str) {
    let icon = iconConvert(str)
    if (icon === 'google') {
        return ['fab', 'google']
    } else if (icon === 'facebook') {
        return ['fab', 'facebook']
    } else if (icon === 'instagram') {
        return ['fab', 'instagram']
    } else if (icon === 'twitter') {
        return ['fab', 'twitter']
    } else {
        return ['fas', 'rocket']
    }
}

module.exports = {
    addMultipleS3,
    transformCMSData,
    updatePageList,
    addFileS3,
    stripUrl,
    transformPagesData,
    createOrEditLayout,
    deletePages,
}
