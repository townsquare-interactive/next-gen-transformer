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

const determineModType = (type) => {
    if (type.includes('article')) {
        return 'Article'
    } else if (type === 'photo_grid') {
        return 'PhotoGrid'
    } else if (type === 'banner_1') {
        return 'Banner'
    } else if (type === 'parallax_1') {
        return 'Parallax'
    } else {
        return type
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

const stripImageFolders = (file) => {
    const result = file.substring(file.lastIndexOf('/') + 1)
    return result
}

function transformcontact(contactInfo, siteName) {
    const icons = {
        phone: ['fas', 'phone'],
        email: ['fas', 'envelope'],
        location: ['fas', 'location-pin'],
    }

    const newAdd = contactInfo.address.street.replaceAll(' ', '+')

    const mapLink = 'https://www.google.com/maps/place/' + newAdd + '+' + contactInfo.address.zip

    const contactLinks = []

    const multiPhones = contactInfo.phone.length > 1 ? true : false

    const hideEmail = !multiPhones && contactInfo.email.length > 1

    for (x in contactInfo.phone) {
        if (contactInfo.phone[x]) {
            const phone = {
                cName: 'phone',
                link: 'tel:' + contactInfo.phone[x].number,
                icon: icons.phone,
                content: multiPhones ? contactInfo.phone[x].name + ': ' + contactInfo.phone[x].number : contactInfo.phone[x].number,
                active: contactInfo.phone[x].number ? true : false,
            }

            contactLinks.push(phone)
        }
    }

    for (x in contactInfo.email) {
        if (contactInfo.email[x]) {
            const email = {
                cName: 'email',
                link: `mailto:${contactInfo.email[x].email}`,
                icon: icons.email,
                content: contactInfo.email[x].name + ': ' + contactInfo.email[x].email,
                active: hideEmail ? false : contactInfo.email[x] ? true : false,
            }

            contactLinks.push(email)
        }
    }

    const contactMap = {
        cName: 'map',
        link: mapLink,
        icon: icons.location,
        content: contactInfo.address.name,
        active: contactInfo.address ? true : false,
    }

    multiPhones ? contactLinks.unshift(contactMap) : contactLinks.push(contactMap)

    contactInfo = { ...contactInfo, contactLinks: contactLinks, showContactBox: multiPhones }

    return contactInfo
}

const transformNav = (menu) => {
    for (let i = 0; i < menu.length; i++) {
        const slug = menu[i].title.replace(/\s+/g, '-')
        //loop through first submenu
        for (let x = 0; x < menu[i].submenu.length; x++) {
            const subMenu1 = menu[i].submenu[x]
            const subSlug = subMenu1.title.replace(/\s+/g, '-')
            menu[i].submenu[x] = { ...subMenu1, slug: subSlug.toLowerCase() }
            //loop through second submenu
            for (let k = 0; k < menu[i].submenu[x].submenu.length; k++) {
                const subMenu2 = menu[i].submenu[x].submenu[k]
                const subSlug2 = subMenu2.title.replace(/\s+/g, '-')
                menu[i].submenu[x].submenu[k] = { ...subMenu2, slug: subSlug2.toLowerCase() }
            }
        }

        menu[i] = { ...menu[i], slug: slug.toLowerCase() }
    }

    return determineNavParent(menu)
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

const createLinkAndButtonVariables = (currentItem, modType, columns) => {
    const linkNoBtn = isButton(currentItem) === false && isLink(currentItem) === true

    const singleButton = isOneButton(currentItem)

    const twoButtons = isTwoButtons(currentItem)

    const isWrapLink = (singleButton || linkNoBtn) && modType != 'article'
    // && !currentItem.desc.includes('<a')

    const visibleButton = linkAndBtn(currentItem)

    const determineBtnSize = (btnSize, modType, columns) => {
        if (btnSize?.includes('lg') && (columns == 1 || modType === 'photo_grid' || modType === 'cta_banner')) {
            return 'btn_lg'
        } else if (btnSize?.includes('xl') && (columns == 1 || modType === 'photo_grid' || modType === 'cta_banner')) {
            return 'btn_xl'
        } else if (btnSize?.includes('sm') || columns == 3 || columns == 4) {
            return 'btn_sm'
        } else if (btnSize?.includes('xs')) {
            return 'btn_xs'
        } else if ((btnSize?.includes('md') || !btnSize) && (columns == 1 || columns == 2)) {
            return 'btn_md'
        } else {
            return 'btn_md'
        }
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
            btnSize: determineBtnSize(currentItem.btnSize, modType, columns),
            linkType: currentItem.pagelink ? 'local' : 'ext',
            blockBtn: currentItem.btnSize?.includes('btn_block') ? true : currentItem.btnSize?.includes('btn_blk') ? true : false,
        },
        {
            name: 'btn2',
            link: currentItem.pagelink2 || currentItem.weblink2,
            window: currentItem.newwindow2,
            icon: btnIconConvert(currentItem.icon2 || ''),
            label: currentItem.actionlbl2,
            active: currentItem.actionlbl2 && (currentItem.pagelink2 || currentItem.weblink2) ? true : false,
            btnType: currentItem.btnType2,
            btnSize: determineBtnSize(currentItem.btnSize2, modType, columns),
            linkType: currentItem.pagelink2 ? 'local' : 'ext',
            blockBtn: currentItem.btnSize2?.includes('btn_block') ? true : currentItem.btnSize2?.includes('btn_blk') ? true : false,
        },
    ]

    return { linkNoBtn, twoButtons, isWrapLink, visibleButton, buttonList }
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
    if (item.pagelink || item.pagelink2 || item.weblink || item.weblink2 || item.headline || item.subheader) {
        return true
    } else {
        return false
    }
}

const alternatePromoColors = (items, themeStyles, well) => {
    const colorList = Array(items.length)
        .fill([themeStyles.promoColor, themeStyles.promoColor2, themeStyles.promoColor3, themeStyles.promoColor4, themeStyles.promoColor5])
        .flat()

    const textureImageList = Array(items.length)
        .fill([
            {
                image: `/subtle-white-feathers.png`,
                gradientColors: [themeStyles.promoColor, themeStyles.promoColor2],
            },
            {
                image: '/shattered-dark.png',
                gradientColors: [themeStyles.promoColor2, themeStyles.promoColor3],
            },
            {
                image: '/fabric-of-squares.png',
                gradientColors: [themeStyles.promoColor3, themeStyles.promoColor4],
            },
            {
                image: '/cartographer.png',
                gradientColors: [themeStyles.promoColor4, themeStyles.promoColor5],
            },
            {
                image: `/bright-squares.png`,
                gradientColors: [themeStyles.promoColor, themeStyles.promoColor3],
            },
        ])
        .flat()

    //let noImgCount = 0
    for (let i = 0; i < items.length; i++) {
        if (!items[i].image) {
            items[i] = { ...items[i], promoColor: colorList[i], textureImage: well == '1' ? textureImageList[i] : '' }
            //noImgCount += 1
        } else {
            items[i] = { ...items[i], promoColor: colorList[i] }
        }
    }

    return items
}

const isPromoButton = (items, modType) => {
    if ((modType === 'PhotoGrid' && !items.image) || (modType === 'Parallax' && !items.image)) {
        return 'btn_promo'
    } else if ((modType === 'Banner' && items.modColor1) || (modType === 'Parallax' && items.modColor1)) {
        return 'btn_override'
    } else if (modType === 'Banner' && !items.image) {
        return 'btn_promo'
    } else {
        return 'btn_1'
    }
}

const setColors = (cmsColors, cmsTheme) => {
    if (cmsTheme === 'beacon-theme_charlotte') {
        return {
            logoColor: cmsColors.color_1.value,
            headingColor: cmsColors.color_2.value,
            subHeadingColor: cmsColors?.color_3.value,
            textColor: cmsColors.color_4.value,
            linkColor: cmsColors.color_5.value,
            linkHover: cmsColors.color_6.value,
            btnText: cmsColors.color_7.value,
            btnBackground: cmsColors.color_8.value,
            textColorAccent: cmsColors.color_9.value,
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
            backgroundMain: cmsColors.color_21.value,
            bckdContent: cmsColors.color_22.value,
            headerBackground: cmsColors.color_23.value,
            BckdHeaderSocial: cmsColors.color_24.value,
            accentBackgroundColor: cmsColors.color_25.value,
            backgroundHero: cmsColors.color_26.value,
            footerBackground: cmsColors.color_27.value,
            footerText: cmsColors.color_28.value,
            footerLink: cmsColors.color_29.value,
            promoText: cmsColors.color_30.value,
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

const createFontCss = (fonts) => {
    const headlineFont = fonts.list[fonts.sections.hdrs.value]
    const bodyFont = fonts.list[fonts.sections.body.value]
    const featuredFont = fonts.list[fonts.sections.feat.value]
    const fontTypes = [headlineFont.google, bodyFont.google, featuredFont.google]
    const uniqueFontGroup = removeDuplicatesArray(fontTypes)
    const fontImportGroup = `@import url(https://fonts.googleapis.com/css?family=${uniqueFontGroup.join('|')}&display=swap);`
    const fontClasses = ` body {font-family:${bodyFont.label};}
    .hd-font{font-family:${headlineFont.label};} 
    .txt-font{font-family:${bodyFont.label};}
    .feat-font{font-family:${featuredFont.label};}
    `

    return { fontImportGroup, fontClasses }
}

const createColorClasses = (themeStyles) => {
    const colorVars = `
    :root {
        --logo: ${themeStyles['logoColor']};
        --hd: ${themeStyles['headingColor']};
        --sh: ${themeStyles['subHeadingColor']};
        --txt: ${themeStyles['textColor']};
        --link: ${themeStyles['linkColor']};
        --link-hover: ${themeStyles['linkHover']};
        --btn-txt: ${themeStyles['btnText']};
        --btn-background: ${themeStyles['btnBackground']};
        --txt-accent: ${themeStyles['textColorAccent']};
        --hero-sh: ${themeStyles['heroSubheadline']};
        --hero-txt: ${themeStyles['heroText']};
        --hero-btn-txt: ${themeStyles['heroBtnText']};
        --hero-btn-background: ${themeStyles['heroBtnBackground']};
        --hero-link: ${themeStyles['heroLink']};
        --hero-link-hover: ${themeStyles['heroLinkHover']};
        --caption-text: ${themeStyles['captionText']};
        --caption-background: ${themeStyles['captionBackground']};
        --nav-txt: ${themeStyles['NavText']};
        --nav-hover: ${themeStyles['navHover']};
        --nav-current: ${themeStyles['navCurrent']};
        --main-background: ${themeStyles['backgroundMain']};
        --content-background: ${themeStyles['bckdContent']};
        --header-background: ${themeStyles['headerBackground']};
        --social-background: ${themeStyles['BckdHeaderSocial']};
        --accent-background: ${themeStyles['accentBackgroundColor']};
        --hero-background: ${themeStyles['backgroundHero']};
        --footer-background: ${themeStyles['footerBackground']};
        --footer-txt: ${themeStyles['footerText']};
        --footer-link: ${themeStyles['footerLink']};
        --promo-txt: ${themeStyles['promoText']};
        --promo: ${themeStyles['promoColor']};
        --promo2: ${themeStyles['promoColor2']};
        --promo3: ${themeStyles['promoColor3']};
        --promo4: ${themeStyles['promoColor4']};
        --promo5: ${themeStyles['promoColor5']};
        --promo6: ${themeStyles['promoColor6']};
       }
       `

    const textColors = ` body .txt-font .dsc a{ color: var(--link);}
    .accent-txt{color:var(--txt-accent);} 
    .txt-color{color:var(--txt);} 
    .txt-color-hd{color:var(--hd);} 
    .navLink:hover{color: var(--nav-hover);} 
    .navLink{color:var(--nav-txt);} 
    .social-icon:hover{background-color: var(--nav-hover);} 
    .social-icon{color:var(--nav-txt);} 
    .footer-icon:hover{background-color: var(--nav-hover);}
    .current-page{color:var(--nav-current);} 
    .caption-txt{color:var(--caption-txt);}
    .box-links{color:var(--link);}
    .box-links:hover{color:var(--nav-hover);}
    `

    const btnStyles = ` .btn_1{color: var(--txt-accent); background-color: var(--btn-background);} 
    .btn_1:hover{color: var(--btn-background); background-color: var(--txt-accent);} 
    .btn_2{color: var(--link); border-color: var(--link);} 
    .btn_2:hover{color: var(--link-hover); border-color: var(--link-hover);} 
    .btn_alt{color: var(--promo); background-color: var(--txt-accent);} 
    .btn_alt:hover{color: var(--txt-accent); background-color: var(--promo);}
    .close-toggle {color:var(--txt-accent); background-color:var(--btn-background);}
    .close-toggle:hover {color:var(--btn-background); background-color:var(--txt-accent);}
    .btn_p4.btn_1 {background-color:var(--promo4); color:var(--txt-accent);}
    .btn_p4.btn_1:hover{color: var(--promo4); background-color: var(--txt-accent);} 
    .btn_p3.btn_1 {background-color:var(--promo3); color:var(--txt-accent);}
    .btn_p3.btn_1:hover{color: var(--promo3); background-color: var(--txt-accent);} 
    .btn_p2.btn_1 {background-color:var(--promo2); color:var(--txt-accent);}
    .btn_p2.btn_1:hover{color: var(--promo2); background-color: var(--txt-accent);} 
    .btn_p4.btn_2 {border-color:var(--promo4); color:var(--promo4);}
    .btn_p3.btn_2 {border-color:var(--promo3); color:var(--promo3);}
    .btn_p2.btn_2 {border-color:var(--promo2); color:var(--promo2);}
    .btn_p4.btn_2:hover, .btn_p3.btn_2:hover , .btn_p2.btn_2:hover  {border-color:var(--link-hover); color:var(--link-hover);}

    `

    const backgroundStyles = ` .border-background{background-color:var(--accent-background);} 
    .hero-background{background-color:var(--promo);} 
    .content-background{background-color:var(--content-background);} 
    .footer{background-color:var(--footer-background); color: var(--footer-txt);} 
    .header-background{background-color:var(--header-background);} 
    .social-bar-background{background-color:var(--social-background);} 
    .promo-background{background-color:var(--promo);}
    .cta{background-color:var(--promo);}
    .cta:hover{background-color:var(--promo2);}
    `

    let colorStyles = colorVars + textColors + btnStyles + backgroundStyles

    return colorStyles
}

//reuseables
const removeDuplicatesArray = (arr) => {
    let uniqueArr = arr.filter((c, index) => {
        return arr.indexOf(c) === index
    })
    return uniqueArr
}

const convertSpecialTokens = (str) => {
    const removedBreak = str.replaceAll('[rn]', '\n')
    const removedBlank = removedBreak.replaceAll('[t]', ' ')
    const removedParenthesis = removedBlank.replaceAll('&quot;', "'")

    return removedParenthesis
}

const replaceKey = (value, oldKey, newKey) => {
    if (oldKey !== newKey && value[oldKey]) {
        Object.defineProperty(value, newKey, Object.getOwnPropertyDescriptor(value, oldKey))
        delete value[oldKey]
    }
    return { ...value }
}

module.exports = {
    socialConvert,
    btnIconConvert,
    setColors,
    getColumnsCssClass,
    transformcontact,
    determineNavParent,
    stripUrl,
    isGridCaption,
    alternatePromoColors,
    stripImageFolders,
    replaceKey,
    createColorClasses,
    transformNav,
    convertSpecialTokens,
    createFontCss,
    createLinkAndButtonVariables,
    determineModType,
}
