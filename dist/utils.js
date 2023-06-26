'use strict'
const z = require('zod')
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
const determineModRenderType = (type) => {
    if (type.includes('article')) {
        return 'Article'
    } else if (type === 'photo_grid') {
        return 'PhotoGrid'
    } else if (type === 'banner_1') {
        return 'Banner'
    } else if (type === 'parallax_1') {
        return 'Parallax'
    } else if (type === 'testimonials_1' || type === 'testimonials_2') {
        return 'Testimonials'
    } else if (type === 'card_1' || type === 'card_2') {
        return 'Card'
    } else if (type === 'photo_gallery_1' || type === 'photo_gallery_2') {
        return 'PhotoGallery'
    } else if (type === 'plugin') {
        return 'ContactFormRoutes'
    } else {
        return type
    }
}
//cleaning up module type names that are not specific
const modVariationType = (type) => {
    if (type === 'testimonials_2') {
        return 'review_carousel'
    } else if (type === 'photo_gallery_2') {
        return 'thumbnail_gallery'
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
//strip anything between / ... /
const stripSiteAndUrl = (url) => {
    if (url === '#') {
        return '#'
    } else {
        const removedSiteAndDomain = url.match(/\/(.*)$/)
        return removedSiteAndDomain[0]
    }
}
const stripImageFolders = (file) => {
    const result = file.substring(file.lastIndexOf('/') + 1)
    return result
}

function transformcontact(contactInfo) {
    console.log('Transforming contact info')
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
                active: hideEmail ? false : contactInfo.email[x].email ? true : false,
            }
            contactLinks.push(email)
        }
    }

    console.log('street', contactInfo.address.street)
    const contactMap = {
        cName: 'map',
        link: mapLink,
        icon: icons.location,
        content: contactInfo.address.name,
        active: contactInfo.address.street != null ? true : false,
    }
    multiPhones ? contactLinks.unshift(contactMap) : contactLinks.push(contactMap)
    contactInfo = Object.assign(Object.assign({}, contactInfo), { contactLinks: contactLinks, showContactBox: multiPhones })
    return contactInfo
}

const transformNav = (menu) => {
    for (let i = 0; i < menu.length; i++) {
        const slug = menu[i].title ? menu[i].title.replace(/\s+/g, '-') : ''
        //loop through first submenu
        for (let x = 0; x < menu[i].submenu.length; x++) {
            const subMenu1 = menu[i].submenu[x]
            if (menu[i].title) {
                const subSlug = subMenu1.title.replace(/\s+/g, '-')
                menu[i].submenu[x] = Object.assign(Object.assign({}, subMenu1), {
                    slug: subSlug.toLowerCase(),
                    url: subMenu1.url ? stripSiteAndUrl(subMenu1.url) : '',
                })
                //loop through second submenu
                if (menu[i].submenu[x]) {
                    for (let k = 0; k < menu[i].submenu[x].submenu.length; k++) {
                        const subMenu2 = menu[i].submenu[x].submenu[k]
                        if (subMenu2.title) {
                            const subSlug2 = subMenu2.title.replace(/\s+/g, '-')
                            menu[i].submenu[x].submenu[k] = Object.assign(Object.assign({}, subMenu2), {
                                slug: subSlug2.toLowerCase(),
                                url: menu[i].submenu[x].submenu[k].url ? stripSiteAndUrl(menu[i].submenu[x].submenu[k].url) : '',
                            })
                        }
                    }
                }
            }
        }
        menu[i] = Object.assign(Object.assign({}, menu[i]), { slug: slug.toLowerCase(), url: menu[i].url ? stripSiteAndUrl(menu[i].url) : '' })
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
                let newTable = submenu.length != 0 ? Object.assign(Object.assign({}, menu[i]), { submenu }) : menu[i]
                editTable.push(newTable)
            }
        }
    }
    return editTable.length != 0 ? editTable : menu
}
const createLinkAndButtonVariables = (currentItem, modType, columns) => {
    var _a, _b, _c, _d
    const linkNoBtn = isButton(currentItem) === false && isLink(currentItem) === true
    const singleButton = isOneButton(currentItem)
    const twoButtons = isTwoButtons(currentItem)
    const isWrapLink = (singleButton || linkNoBtn) && modType != 'article'
    // && !currentItem.desc.includes('<a')
    const visibleButton = linkAndBtn(currentItem)
    const determineBtnSize = (btnSize, modType, columns) => {
        if (
            (btnSize === null || btnSize === void 0 ? void 0 : btnSize.includes('lg')) &&
            (columns == 1 || modType === 'photo_grid' || modType === 'cta_banner')
        ) {
            return 'btn_lg'
        } else if (
            (btnSize === null || btnSize === void 0 ? void 0 : btnSize.includes('xl')) &&
            (columns == 1 || modType === 'photo_grid' || modType === 'cta_banner')
        ) {
            return 'btn_xl'
        } else if ((btnSize === null || btnSize === void 0 ? void 0 : btnSize.includes('sm')) || columns == 3 || columns == 4) {
            return 'btn_sm'
        } else if (btnSize === null || btnSize === void 0 ? void 0 : btnSize.includes('xs')) {
            return 'btn_xs'
        } else if (((btnSize === null || btnSize === void 0 ? void 0 : btnSize.includes('md')) || !btnSize) && (columns == 1 || columns == 2)) {
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
            btnType: currentItem.btnType ? currentItem.btnType : isPromoButton(currentItem, modType, 1),
            btnSize: determineBtnSize(currentItem.btnSize, modType, columns),
            linkType: currentItem.pagelink ? 'local' : 'ext',
            blockBtn: ((_a = currentItem.btnSize) === null || _a === void 0 ? void 0 : _a.includes('btn_block'))
                ? true
                : ((_b = currentItem.btnSize) === null || _b === void 0 ? void 0 : _b.includes('btn_blk'))
                ? true
                : false,
        },
        {
            name: 'btn2',
            link: currentItem.pagelink2 || currentItem.weblink2,
            window: currentItem.newwindow2,
            icon: btnIconConvert(currentItem.icon2 || ''),
            label: currentItem.actionlbl2,
            active: currentItem.actionlbl2 && (currentItem.pagelink2 || currentItem.weblink2) ? true : false,
            btnType: currentItem.btnType2 ? currentItem.btnType2 : isPromoButton(currentItem, modType, 2),
            btnSize: determineBtnSize(currentItem.btnSize2, modType, columns),
            linkType: currentItem.pagelink2 ? 'local' : 'ext',
            blockBtn: ((_c = currentItem.btnSize2) === null || _c === void 0 ? void 0 : _c.includes('btn_block'))
                ? true
                : ((_d = currentItem.btnSize2) === null || _d === void 0 ? void 0 : _d.includes('btn_blk'))
                ? true
                : false,
        },
    ]
    return { linkNoBtn, twoButtons, isWrapLink, visibleButton, buttonList }
}
const createBtnStyles = (value, modType, key, themeStyles, currentItem, itemCount, isFeatureButton) => {
    let btnStyles
    btnStyles = ` #id_${key} .item_${itemCount} .btn2_override {color:${themeStyles['textColorAccent']}; background-color:transparent;} `
    if (currentItem.promoColor) {
        btnStyles =
            btnStyles +
            `  #id_${key} .item_${itemCount} .btn_promo {color: ${currentItem.promoColor}; background-color: ${themeStyles['textColorAccent']};}
            #id_${key} .item_${itemCount} .btn_promo:hover{color: ${themeStyles['textColorAccent']}; background-color: ${currentItem.promoColor};}`
    }
    if (currentItem.modColor1) {
        btnStyles =
            btnStyles +
            ` #id_${key} .item_${itemCount} .btn_override {color: ${currentItem.modColor1}; background-color: ${themeStyles['captionText']};} #id_${key} .item_${itemCount} .btn_override:hover{color: ${themeStyles['captionText']}; background-color: ${currentItem.modColor1};}
        #id_${key} .item_${itemCount} .btn2_override:hover{color: ${currentItem.modColor1}; background-color: ${themeStyles['textColorAccent']};}
        `
    }
    if (isFeatureButton) {
        btnStyles = btnStyles + `#id_${key} .is-wrap-link:hover .btn_1{color: var(--hero-btn-background); background-color:var(--txt-accent) ;}`
    } else if (value.well && modType != 'PhotoGrid' && modType != 'Parallax' && modType != 'PhotoGallery' && !isFeatureButton) {
        btnStyles =
            btnStyles +
            `#id_${key} .is-wrap-link:hover .btn_1{color: ${themeStyles['promoColor']}; background-color: ${themeStyles['textColorAccent']}}; 
            `
    }
    return btnStyles
}
const createImageSizes = (modType, columns) => {
    if (modType === 'Parallax' || modType === 'Banner' || modType === 'PhotoGallery') {
        return '100vw'
        //return 'large'
    } else if (modType === 'Testimonials') {
        return '130px'
        //return 'testimonial'
    } else if (columns === 3 || columns === 4) {
        return `(max-width: 768px)100vw,(max-width: 1024px)50vw,33vw`
        //return 'columns'
    } else {
        return `(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 1200px`
        //return 'normal'
    }
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
const createGallerySettings = (settings, blockSwitch1, type) => {
    //convert to numbers
    const schemaNum = z.coerce.number()
    const interval = schemaNum.parse(settings.interval) * 1000
    const restartDelay = schemaNum.parse(settings.restartdelay)
    const newSettings = {
        autoplay: settings.autoplay == 0 ? false : true,
        pauseOnHover: settings.pauseonhover == 0 ? false : true,
        animation: settings.animation || 'slidein',
        effect: settings.effect || 'slide',
        interval: interval <= 0 ? 5000 : interval,
        restartDelay: restartDelay <= 0 ? 2500 : restartDelay ? restartDelay * 1000 : 2500,
        mobileResize: blockSwitch1 == 0 ? false : true,
        useThumbnail: type === 'thumbnail_gallery' || false,
    }
    return newSettings
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
            items[i] = Object.assign(Object.assign({}, items[i]), { promoColor: colorList[i], textureImage: well == '1' ? textureImageList[i] : '' })
            //noImgCount += 1
        } else {
            items[i] = Object.assign(Object.assign({}, items[i]), { promoColor: colorList[i] })
        }
    }
    return items
}
const isPromoButton = (items, modType, btnNum) => {
    if ((modType === 'Parallax' || modType === 'Banner') && items.modColor1 && btnNum === 1) {
        return 'btn_override'
    } else if ((modType === 'Parallax' || modType === 'Banner') && items.modColor1 && btnNum === 2) {
        return 'btn2_override'
    } else if (
        btnNum === 1 &&
        ((modType === 'PhotoGrid' && !items.image) || (modType === 'Parallax' && !items.image) || (modType === 'PhotoGallery' && !items.image))
    ) {
        return 'btn_promo'
    } else if (btnNum === 1 && modType === 'Banner' && !items.image) {
        /*  else if (btnNum === 1 && ((modType === 'Banner' && items.modColor1) || (modType === 'Parallax' && items.modColor1))) {
        return 'btn_override'
    } */
        return 'btn_promo'
    } else if (btnNum === 1) {
        return 'btn_1'
    } else {
        return 'btn_2'
    }
}
const createItemStyles = (items, well, modType, type) => {
    var _a, _b
    for (let i = 0; i < items.length; i++) {
        let itemStyle
        const currentItem = items[i]
        if (modType === 'Parallax') {
            if (currentItem.modColor1 && well != '1' && !currentItem.image) {
                itemStyle = { background: `${currentItem.modColor1}` }
            } else if (currentItem.modColor1 && well === '1' && !currentItem.image) {
                itemStyle = { background: `var(--accent-background)` }
            } else if (currentItem.modColor1 && well === '1') {
                itemStyle = { background: `${currentItem.modColor1}` }
            } else if (well === '1' && !currentItem.image) {
                itemStyle = {
                    backgroundImage: `linear-gradient(-45deg, ${currentItem.textureImage.gradientColors[0]}, ${currentItem.textureImage.gradientColors[1]})`,
                }
            } else if (!currentItem.image) {
                itemStyle = { background: `${currentItem.promoColor}` }
            } else if (currentItem.image && currentItem.modColor1 && currentItem.modOpacity) {
                let modBackground = currentItem.modColor1.replace(')', `,${currentItem.modOpacity})`)
                itemStyle = { background: modBackground }
            } else {
                itemStyle = {}
            }
        } else if (modType === 'Banner' || modType === 'PhotoGallery') {
            if (currentItem.modColor1 && !currentItem.image && !currentItem.modOpacity && modType === 'Banner') {
                itemStyle = { background: `${currentItem.modColor1}` }
            } else if (well === '1' && !currentItem.image && (modType === 'Banner' || type === 'thumbnail_gallery')) {
                itemStyle = {
                    backgroundImage: `linear-gradient(-45deg, ${(_a = currentItem.textureImage) === null || _a === void 0 ? void 0 : _a.gradientColors[0]}, ${
                        (_b = currentItem.textureImage) === null || _b === void 0 ? void 0 : _b.gradientColors[1]
                    })`,
                }
            } else if (currentItem.promoColor) {
                itemStyle = { background: `${currentItem.promoColor}` }
            } else {
                itemStyle = {}
            }
        }
        items[i] = Object.assign(Object.assign({}, items[i]), { itemStyle: itemStyle })
    }
    return items
}
const setColors = (cmsColors, cmsTheme) => {
    if (cmsTheme === 'beacon-theme_charlotte') {
        return {
            logoColor: cmsColors.color_1.value,
            headingColor: cmsColors.color_2.value,
            subHeadingColor: cmsColors === null || cmsColors === void 0 ? void 0 : cmsColors.color_3.value,
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
            promoColor: cmsColors === null || cmsColors === void 0 ? void 0 : cmsColors.color_3.value,
            textColor: cmsColors === null || cmsColors === void 0 ? void 0 : cmsColors.color_3a.value,
            headingColor: cmsColors === null || cmsColors === void 0 ? void 0 : cmsColors.color_2.value,
            subHeadingColor: cmsColors === null || cmsColors === void 0 ? void 0 : cmsColors.color_3.value,
            textColorAccent: cmsColors === null || cmsColors === void 0 ? void 0 : cmsColors.color_4.value,
            btnBackground: cmsColors === null || cmsColors === void 0 ? void 0 : cmsColors.color_8.value,
            linkColor: cmsColors === null || cmsColors === void 0 ? void 0 : cmsColors.color_19.value,
            accentBackgroundColor: cmsColors === null || cmsColors === void 0 ? void 0 : cmsColors.color_3.value,
            accentColor2: cmsColors === null || cmsColors === void 0 ? void 0 : cmsColors.color_16.value,
            altColor: cmsColors === null || cmsColors === void 0 ? void 0 : cmsColors.color_16.value,
            headerBackground: cmsColors === null || cmsColors === void 0 ? void 0 : cmsColors.color_17.value,
            footerBackground: cmsColors === null || cmsColors === void 0 ? void 0 : cmsColors.color_20.value,
            navBackground: cmsColors === null || cmsColors === void 0 ? void 0 : cmsColors.color_16.value,
            BckdHeaderSocial: cmsColors === null || cmsColors === void 0 ? void 0 : cmsColors.color_17.value,
            NavText: cmsColors === null || cmsColors === void 0 ? void 0 : cmsColors.color_18.value,
            linkHover: cmsColors === null || cmsColors === void 0 ? void 0 : cmsColors.color_7.value,
            footerText: cmsColors === null || cmsColors === void 0 ? void 0 : cmsColors.color_12.value,
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
    const fontClasses = ` body {font-family:${bodyFont.label}}
    .hd-font{font-family:${headlineFont.label}} 
    .txt-font{font-family:${bodyFont.label}}
    .feat-font{font-family:${featuredFont.label}}
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
        --caption-txt: ${themeStyles['captionText']};
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
    .txt-color-sh{color:var(--sh);} 
    .navLink:hover{color: var(--nav-hover);} 
    .navLink{color:var(--nav-txt);} 
    .social-icon{color:var(--nav-txt);} 
    .social-icon:hover {background-color:var(--btn-background); color:var(--btn-txt);}
    .footer-icon:hover{background-color: var(--nav-hover);}
    .current-page{color:var(--nav-current);} 
    .caption-txt{color:var(--caption-txt);}
    .box-links{color:var(--link);}
    .box-links:hover{color:var(--nav-hover);}
    .testimonial-txt-color{color:var(--btn-background);}
    .testimonials-mod.well .hero, .card-mod .hero, .photogallery-mod.well .hero{
    &.item, .desc {color:var(--hero-txt);}
    .stars, .quotes, .hd, .sh {color:var(--txt-accent);}
}
    `
    const btnStyles = ` .btn_1{color: var(--btn-txt); background-color: var(--btn-background);} 
    .btn_1:hover{color: var(--btn-background); background-color: var(--btn-txt);} 
    .btn_2{color: var(--link); border-color: var(--link);} 
    .btn_2:hover{color: var(--link-hover); border-color: var(--link-hover);} 
    .btn_alt{color: var(--promo); background-color: var(--btn-txt);} 
    .btn_alt:hover{color: var(--btn-txt); background-color: var(--promo);}
    .close-toggle {color:var(--btn-txt); background-color:var(--btn-background);}
    .close-toggle:hover {color:var(--btn-background); background-color:var(--btn-txt);}
    .btn_p4.btn_1 {background-color:var(--promo4); color:var(--btn-txt);}
    .btn_p4.btn_1:hover{color: var(--promo4); background-color: var(--btn-txt);} 
    .btn_p3.btn_1 {background-color:var(--promo3); color:var(--btn-txt);}
    .btn_p3.btn_1:hover{color: var(--promo3); background-color: var(--btn-txt);} 
    .btn_p2.btn_1 {background-color:var(--promo2); color:var(--btn-txt);}
    .btn_p2.btn_1:hover{color: var(--promo2); background-color: var(--btn-txt);} 
    .btn_p4.btn_2 {border-color:var(--promo4); color:var(--promo4);}
    .btn_p3.btn_2 {border-color:var(--promo3); color:var(--promo3);}
    .btn_p2.btn_2 {border-color:var(--promo2); color:var(--promo2);}
    .btn_p4.btn_2:hover, .btn_p3.btn_2:hover , .btn_p2.btn_2:hover  {border-color:var(--link-hover); color:var(--link-hover);}
    .hero .one-btn-w .btn_1.btn_w {color: var(--btn-txt); background-color: var(--hero-btn-background);}
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
    .testimonials-mod .hero-background, .card-mod .hero-background {background-color:var(--hero-background);}
    .caption-background{background-color:var(--caption-background);}
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
    return Object.assign({}, value)
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
    determineModRenderType,
    createItemStyles,
    createBtnStyles,
    createImageSizes,
    isOneButton,
    createGallerySettings,
    modVariationType,
}
//# sourceMappingURL=utils.js.map
