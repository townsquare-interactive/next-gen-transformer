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

function btnIconConvert(icon) {
    if (icon) {
        //replaces fas fa-rocket with faRocket
        const iconPrefix = icon.includes('fas') ? 'fas' : icon.includes('far') ? 'far' : icon.includes('fab') ? 'fab' : ''
        const stripIcon = icon.replace(iconPrefix, '')
        const iconModel = stripIcon.replace(/^(.*?)-/, '')

        return { iconPrefix: iconPrefix, iconModel: iconModel }
    }
}

//Strip url of protocol and .production / .com
const stripUrl = (url) => {
    const removeProtocol = url.replace(/(^\w+:|^)\/\//, '')
    return removeProtocol.replace(/\..*/, '')
}

function transformcontact(contactInfo) {
    const icons = {
        phone: ['fas', 'phone'],
        email: ['fas', 'envelope'],
        location: ['fas', 'location-pin'],
    }

    const newAdd = contactInfo.address.street.replaceAll(' ', '+')

    const mapLink = 'https://www.google.com/maps/place/' + newAdd + '+' + contactInfo.address.zip

    contactInfo = { ...contactInfo, icons: icons, mapLink: mapLink }
    return contactInfo
}

const determineNavParent = (menu) => {
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

function isButton(item) {
    if (item.actionlbl || item.actionlbl2) {
        return true
    } else {
        return false
    }
}

function isLink(item) {
    if (item.pagelink || item.pagelink2 || item.weblink || item.weblink2) {
        return true
    } else {
        return false
    }
}

function isOneButton(currentItem) {
    if (
        (currentItem.actionlbl && !currentItem.actionlbl2 && (currentItem.pagelink || currentItem.weblink)) ||
        (!currentItem.actionlbl && currentItem.actionlbl2 && (currentItem.pagelink2 || currentItem.weblink2))
    ) {
        return true
    } else {
        return false
    }
}

function isTwoButtons(currentItem) {
    if (currentItem.actionlbl && currentItem.actionlbl2 && (currentItem.pagelink || currentItem.weblink) && (currentItem.pagelink2 || currentItem.weblink2)) {
        return true
    } else {
        return false
    }
}

function linkAndBtn(currentItem) {
    if (
        (currentItem.actionlbl && currentItem.pagelink) ||
        (currentItem.actionlbl && currentItem.weblink) ||
        (currentItem.actionlbl2 && currentItem.pagelink2) ||
        (currentItem.actionlbl2 && currentItem.weblink2)
    ) {
        return true
    } else {
        return false
    }
}

function isGridCaption(item) {
    if (item.pagelink || item.pagelink2 || item.weblink || item.weblink2 || item.headline) {
        return true
    } else {
        return false
    }
}

const alternatePromoColors = (items, themeStyles, modType) => {
    const colorList = Array(items.length)
        .fill([
            themeStyles.promoColor,
            themeStyles.promoColor2,
            themeStyles.promoColor3,
            themeStyles.promoColor4,
            themeStyles.promoColor5,
            themeStyles.promoColor6,
        ])
        .flat()

    const textureImageList = Array(items.length)
        .fill([
            {
                image: `/wp-content/themes/beacon-theme_charlotte/css/bkgs/bright-squares.png`,
                gradient: `linear-gradient(-45deg, ${themeStyles.promoColor3}, ${themeStyles.promoColor});`,
            },
            {
                image: `/wp-content/themes/beacon-theme_charlotte/css/bkgs/subtle-white-feathers.png`,
                gradient: `linear-gradient(-45deg, ${themeStyles.promoColor}, ${themeStyles.promoColor2});`,
            },
            {
                image: '/wp-content/themes/beacon-theme_charlotte/css/bkgs/shattered-dark.png',
                gradient: `linear-gradient(-45deg, ${themeStyles.promoColor2}, ${themeStyles.promoColor3});`,
            },
            {
                image: '/wp-content/themes/beacon-theme_charlotte/css/bkgs/fabric-of-squares.png',
                gradient: `linear-gradient(-45deg, ${themeStyles.promoColor3}, ${themeStyles.promoColor4});`,
            },
            {
                image: '/wp-content/themes/beacon-theme_charlotte/css/bkgs/cartographer.png',
                gradient: `linear-gradient(-45deg, ${themeStyles.promoColor4}, ${themeStyles.promoColor5});`,
            },
        ])
        .flat()

    let noImgCount = 0
    for (let i = 0; i < items.length; i++) {
        if (modType === 'PhotoGrid') {
            if (!items[i].image) {
                items[i] = { ...items[i], promoColor: colorList[noImgCount], textureImage: textureImageList[noImgCount] }
                noImgCount += 1
            }
        } else if (modType === 'Banner') {
            items[i] = { ...items[i], promoColor: colorList[i], textureImage: textureImageList[i] }
        }
    }

    return items
}

const isPromoButton = (items, modType) => {
    if (modType === 'PhotoGrid' && !items.image) {
        return true
    } else if (modType === 'Banner') {
        return true
    } else {
        return false
    }
}

const setColors = (cmsColors, cmsTheme) => {
    if (cmsTheme === 'beacon-theme_charlotte') {
        return {
            //add
            logoColor: cmsColors.color_1.value,

            headingColor: cmsColors.color_2.value,
            subHeadingColor: cmsColors?.color_3.value,
            textColor: cmsColors.color_4.value,
            linkColor: cmsColors.color_5.value,
            linkHover: cmsColors.color_6.value,

            //ad
            btnText: cmsColors.color_7.value,

            btnBackground: cmsColors.color_8.value,
            textColorAccent: cmsColors.color_9.value,

            //addd
            heroSubheadline: cmsColors.color_10.value,
            heroText: cmsColors.color_11.value,
            heroBtnText: cmsColors.color_12.value,
            heroBtnBackground: cmsColors.color_13.value,
            heroLink: cmsColors.color_14.value,
            heroLinkHover: cmsColors.color_15.value,

            captionText: cmsColors.color_16.value,
            captionBackground: cmsColors.color_17.value,
            NavText: cmsColors.color_18.value,
            navHover: cmsColors.color_19.value,
            navCurrent: cmsColors.color_20.value,
            //add
            backgroundMain: cmsColors.color_21.value,

            bckdContent: cmsColors.color_22.value,
            // navBackground: cmsColors.color_23.value,
            headerBackground: cmsColors.color_23.value,

            BckdHeaderSocial: cmsColors.color_24.value,
            accentBackgroundColor: cmsColors.color_25.value,
            //add
            backgroundHero: cmsColors.color_26.value,
            footerBackground: cmsColors.color_27.value,
            footerText: cmsColors.color_28.value,

            //add
            footerLink: cmsColors.color_29.value,
            promoText: cmsColors.color_30.value,

            //accentColor2: cmsColors.color_32.value,

            promoColor: cmsColors.color_31.value,
            promoColor2: cmsColors.color_32.value,
            promoColor3: cmsColors.color_33.value,
            promoColor4: cmsColors.color_34.value,
            promoColor5: cmsColors.color_35.value,
            promoColor6: cmsColors.color_36.value,
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

module.exports = {
    socialConvert,
    btnIconConvert,
    setColors,
    getColumnsCssClass,
    transformcontact,
    determineNavParent,
    stripUrl,
    isButton,
    isLink,
    isOneButton,
    isTwoButtons,
    linkAndBtn,
    isGridCaption,
    alternatePromoColors,
    isPromoButton,
}
