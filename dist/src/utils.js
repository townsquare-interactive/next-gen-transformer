import z from 'zod';
export function socialConvert(str) {
    let icon = iconConvert(str);
    if (icon === 'google') {
        return ['fab', 'google'];
    }
    else if (icon === 'facebook') {
        return ['fab', 'facebook'];
    }
    else if (icon === 'instagram') {
        return ['fab', 'instagram'];
    }
    else if (icon === 'twitter') {
        return ['fab', 'twitter'];
    }
    else {
        return ['fas', 'rocket'];
    }
}
export function iconConvert(str) {
    if (str.indexOf('google') !== -1) {
        return 'google';
    }
    else if (str.indexOf('facebook') !== -1) {
        return 'facebook';
    }
    else if (str.indexOf('instagram') !== -1) {
        return 'instagram';
    }
    else if (str.indexOf('twitter') !== -1) {
        return 'twitter';
    }
    else {
        return 'social';
    }
}
export const determineModRenderType = (type) => {
    if (type.includes('article')) {
        return 'Article';
    }
    else if (type === 'photo_grid') {
        return 'PhotoGrid';
    }
    else if (type === 'banner_1') {
        return 'Banner';
    }
    else if (type === 'parallax_1') {
        return 'Parallax';
    }
    else if (type === 'testimonials_1' || type === 'testimonials_2') {
        return 'Testimonials';
    }
    else if (type === 'card_1' || type === 'card_2') {
        return 'Card';
    }
    else if (type === 'photo_gallery_1' || type === 'photo_gallery_2') {
        return 'PhotoGallery';
    }
    else if (type === 'plugin') {
        return 'ContactFormRoutes';
    }
    else {
        return type;
    }
};
//cleaning up module type names that are not specific
export const modVariationType = (type) => {
    if (type === 'testimonials_2') {
        return 'review_carousel';
    }
    else if (type === 'photo_gallery_2') {
        return 'thumbnail_gallery';
    }
    else {
        return type;
    }
};
export function btnIconConvert(icon) {
    if (icon) {
        //replaces fas fa-rocket with faRocket
        const iconPrefix = icon.includes('fas') ? 'fas' : icon.includes('far') ? 'far' : icon.includes('fab') ? 'fab' : '';
        const stripIcon = icon.replace(iconPrefix, '');
        const iconModel = stripIcon.replace(/^(.*?)-/, '');
        return { iconPrefix: iconPrefix, iconModel: iconModel };
    }
}
//Strip url of protocol and .production / .com
export const stripUrl = (url) => {
    const removeProtocol = url.replace(/(^\w+:|^)\/\//, '');
    return removeProtocol.replace(/\..*/, '');
};
//strip anything between / ... /
export const stripSiteAndUrl = (url, siteUrl) => {
    if (url === '#') {
        return '#';
    }
    else if (url.includes(siteUrl)) {
        url = url.replace(siteUrl, '');
        return url;
    }
    else if (url.includes('//')) {
        const removedSiteAndDomain = url.match(/\/(.*)$/);
        console.log('url', removedSiteAndDomain);
        return removedSiteAndDomain[0];
    }
    else {
        return url;
    }
};
export const stripImageFolders = (file) => {
    const result = file.substring(file.lastIndexOf('/') + 1);
    return result;
};
export const createContactForm = (formTitle, email) => {
    const contactFormData = {
        formTitle: formTitle || 'Contact Us Today',
        formService: 'webhook',
        email: email,
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
    };
    return contactFormData;
};
export function transformcontact(contactInfo) {
    const icons = {
        phone: ['fas', 'phone'],
        email: ['fas', 'envelope'],
        location: ['fas', 'location-pin'],
    };
    const newAdd = contactInfo.address.street.replaceAll(' ', '+');
    const mapLink = 'https://www.google.com/maps/place/' + newAdd + '+' + contactInfo.address.zip;
    const contactLinks = [];
    const multiPhones = contactInfo.phone.length > 1 ? true : false;
    const hideEmail = !multiPhones && contactInfo.email.length > 1;
    for (const x in contactInfo.phone) {
        if (contactInfo.phone[x]) {
            const phone = {
                cName: 'phone',
                link: 'tel:' + contactInfo.phone[x].number,
                icon: icons.phone,
                content: multiPhones ? contactInfo.phone[x].name + ': ' + contactInfo.phone[x].number : contactInfo.phone[x].number,
                active: contactInfo.phone[x].number ? true : false,
            };
            contactLinks.push(phone);
        }
    }
    for (const x in contactInfo.email) {
        if (contactInfo.email[x]) {
            const email = {
                cName: 'email',
                link: `mailto:${contactInfo.email[x].email}`,
                icon: icons.email,
                content: contactInfo.email[x].name + ': ' + contactInfo.email[x].email,
                active: hideEmail ? false : contactInfo.email[x].email ? true : false,
            };
            contactLinks.push(email);
        }
    }
    const contactMap = {
        cName: 'map',
        link: mapLink,
        icon: icons.location,
        content: contactInfo.address.name,
        active: contactInfo.address.street ? true : false,
    };
    multiPhones ? contactLinks.unshift(contactMap) : contactLinks.push(contactMap);
    contactInfo = { ...contactInfo, contactLinks: contactLinks, showContactBox: multiPhones };
    return contactInfo;
}
export const transformNav = (menu, siteUrl) => {
    for (let i = 0; i < menu.length; i++) {
        const slug = menu[i].title ? menu[i].title.replace(/\s+/g, '-') : '';
        //loop through first submenu
        for (let x = 0; x < menu[i].submenu.length; x++) {
            const subMenu1 = menu[i].submenu[x];
            if (menu[i].title) {
                const subSlug = subMenu1.title.replace(/\s+/g, '-');
                menu[i].submenu[x] = { ...subMenu1, slug: subSlug.toLowerCase(), url: subMenu1.url ? stripSiteAndUrl(subMenu1.url, siteUrl) : '' };
                //loop through second submenu
                if (menu[i].submenu[x]) {
                    for (let k = 0; k < menu[i].submenu[x].submenu.length; k++) {
                        const subMenu2 = menu[i].submenu[x].submenu[k];
                        if (subMenu2.title) {
                            const subSlug2 = subMenu2.title.replace(/\s+/g, '-');
                            menu[i].submenu[x].submenu[k] = {
                                ...subMenu2,
                                slug: subSlug2.toLowerCase(),
                                url: menu[i].submenu[x].submenu[k].url ? stripSiteAndUrl(menu[i].submenu[x].submenu[k].url, siteUrl) : '',
                            };
                        }
                    }
                }
            }
        }
        menu[i] = { ...menu[i], slug: slug.toLowerCase(), url: menu[i].url ? stripSiteAndUrl(menu[i].url, siteUrl) : '' };
    }
    return determineNavParent(menu);
};
export const determineNavParent = (menu) => {
    let editTable = [];
    for (let i = 0; i < menu.length; i++) {
        //create table of items that have parent
        if (menu[i].menu_item_parent == 0) {
            //Sometimes submenu is not passed but we can use menu_item_parent
            if (!menu[i].submenu) {
                let submenu = menu.filter((value) => menu[i].ID == value.menu_item_parent);
                let newTable = submenu.length != 0 ? { ...menu[i], submenu } : menu[i];
                editTable.push(newTable);
            }
        }
    }
    return editTable.length != 0 ? editTable : menu;
};
export const createLinkAndButtonVariables = (currentItem, modType, columns) => {
    const linkNoBtn = isButton(currentItem) === false && isLink(currentItem) === true;
    const singleButton = isOneButton(currentItem);
    const twoButtons = isTwoButtons(currentItem);
    const isWrapLink = (singleButton || linkNoBtn) && modType != 'article';
    // && !currentItem.desc.includes('<a')
    const visibleButton = linkAndBtn(currentItem);
    const determineBtnSize = (btnSize, modType, columns) => {
        if (btnSize?.includes('lg') && (columns == 1 || modType === 'photo_grid' || modType === 'cta_banner')) {
            return 'btn_lg';
        }
        else if (btnSize?.includes('xl') && (columns == 1 || modType === 'photo_grid' || modType === 'cta_banner')) {
            return 'btn_xl';
        }
        else if (btnSize?.includes('sm') || columns == 3 || columns == 4) {
            return 'btn_sm';
        }
        else if (btnSize?.includes('xs')) {
            return 'btn_xs';
        }
        else if ((btnSize?.includes('md') || !btnSize) && (columns == 1 || columns == 2)) {
            return 'btn_md';
        }
        else {
            return 'btn_md';
        }
    };
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
            blockBtn: currentItem.btnSize?.includes('btn_block') ? true : currentItem.btnSize?.includes('btn_blk') ? true : false,
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
            blockBtn: currentItem.btnSize2?.includes('btn_block') ? true : currentItem.btnSize2?.includes('btn_blk') ? true : false,
        },
    ];
    return { linkNoBtn, twoButtons, isWrapLink, visibleButton, buttonList };
};
export const createBtnStyles = (value, modType, key, themeStyles, currentItem, itemCount, isFeatureButton) => {
    let btnStyles;
    btnStyles = ` #id_${key} .item_${itemCount} .btn2_override {color:${themeStyles['textColorAccent']}; background-color:transparent;} `;
    if (currentItem.promoColor) {
        btnStyles =
            btnStyles +
                `  #id_${key} .item_${itemCount} .btn_promo {color: ${currentItem.promoColor}; background-color: ${themeStyles['textColorAccent']};}
            #id_${key} .item_${itemCount} .btn_promo:hover{color: ${themeStyles['textColorAccent']}; background-color: ${currentItem.promoColor};}`;
    }
    if (currentItem.modColor1) {
        btnStyles =
            btnStyles +
                ` #id_${key} .item_${itemCount} .btn_override {color: ${currentItem.modColor1}; background-color: ${themeStyles['captionText']};} #id_${key} .item_${itemCount} .btn_override:hover{color: ${themeStyles['captionText']}; background-color: ${currentItem.modColor1};}
        #id_${key} .item_${itemCount} .btn2_override:hover{color: ${currentItem.modColor1}; background-color: ${themeStyles['textColorAccent']};}
        `;
    }
    if (isFeatureButton) {
        btnStyles = btnStyles + `#id_${key} .is-wrap-link:hover .btn_1{color: var(--hero-btn-background); background-color:var(--txt-accent) ;}`;
    }
    else if (value.well && modType != 'PhotoGrid' && modType != 'Parallax' && modType != 'PhotoGallery' && !isFeatureButton) {
        btnStyles =
            btnStyles +
                `#id_${key} .is-wrap-link:hover .btn_1{color: ${themeStyles['promoColor']}; background-color: ${themeStyles['textColorAccent']}}; 
            `;
    }
    return btnStyles;
};
export const createImageSizes = (modType, columns) => {
    if (modType === 'Parallax' || modType === 'Banner' || modType === 'PhotoGallery') {
        return '100vw';
        //return 'large'
    }
    else if (modType === 'Testimonials') {
        return '130px';
        //return 'testimonial'
    }
    else if (columns === 3 || columns === 4) {
        return `(max-width: 768px)100vw,(max-width: 1024px)50vw,33vw`;
        //return 'columns'
    }
    else {
        return `(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 1200px`;
        //return 'normal'
    }
};
export function isButton(item) {
    if (item.actionlbl || item.actionlbl2) {
        return true;
    }
    else {
        return false;
    }
}
export function isLink(item) {
    if (item.pagelink || item.pagelink2 || item.weblink || item.weblink2) {
        return true;
    }
    else {
        return false;
    }
}
export function isOneButton(currentItem) {
    if ((currentItem.actionlbl && !currentItem.actionlbl2 && (currentItem.pagelink || currentItem.weblink)) ||
        (!currentItem.actionlbl && currentItem.actionlbl2 && (currentItem.pagelink2 || currentItem.weblink2))) {
        return true;
    }
    else {
        return false;
    }
}
export function isTwoButtons(currentItem) {
    if (currentItem.actionlbl && currentItem.actionlbl2 && (currentItem.pagelink || currentItem.weblink) && (currentItem.pagelink2 || currentItem.weblink2)) {
        return true;
    }
    else {
        return false;
    }
}
export function linkAndBtn(currentItem) {
    if ((currentItem.actionlbl && currentItem.pagelink) ||
        (currentItem.actionlbl && currentItem.weblink) ||
        (currentItem.actionlbl2 && currentItem.pagelink2) ||
        (currentItem.actionlbl2 && currentItem.weblink2)) {
        return true;
    }
    else {
        return false;
    }
}
export function isGridCaption(item) {
    if (item.pagelink || item.pagelink2 || item.weblink || item.weblink2 || item.headline || item.subheader) {
        return true;
    }
    else {
        return false;
    }
}
export const createGallerySettings = (settings, blockSwitch1, type) => {
    //convert to numbers
    const schemaNum = z.coerce.number();
    const interval = schemaNum.parse(settings.interval) * 1000;
    const restartDelay = schemaNum.parse(settings.restartdelay);
    const newSettings = {
        autoplay: settings.autoplay == 0 ? false : true,
        pauseOnHover: settings.pauseonhover == 0 ? false : true,
        animation: settings.animation || 'slidein',
        effect: settings.effect || 'slide',
        interval: interval <= 0 ? 5000 : interval,
        restartDelay: restartDelay <= 0 ? 2500 : restartDelay ? restartDelay * 1000 : 2500,
        mobileResize: blockSwitch1 == 0 ? false : true,
        useThumbnail: type === 'thumbnail_gallery' || false,
    };
    return newSettings;
};
export const alternatePromoColors = (items, themeStyles, well) => {
    const colorList = Array(items.length).fill(['var(--promo)', 'var(--promo2)', 'var(--promo3)', 'var(--promo4)', 'var(--prom5)']).flat();
    const textureImageList = Array(items.length)
        .fill([
        {
            image: `/subtle-white-feathers.png`,
            gradientColors: ['var(--promo)', 'var(--promo2)'],
        },
        {
            image: '/shattered-dark.png',
            gradientColors: ['var(--promo2)', 'var(--promo3)'],
        },
        {
            image: '/fabric-of-squares.png',
            gradientColors: ['var(--promo3)', 'var(--promo4)'],
        },
        {
            image: '/cartographer.png',
            gradientColors: ['var(--promo4)', 'var(--prom5)'],
        },
        {
            image: `/bright-squares.png`,
            gradientColors: ['var(--promo)', 'var(--promo3)'],
        },
    ])
        .flat();
    //let noImgCount = 0
    for (let i = 0; i < items.length; i++) {
        if (!items[i].image) {
            items[i] = { ...items[i], promoColor: colorList[i], textureImage: well == '1' ? textureImageList[i] : '' };
            //noImgCount += 1
        }
        else {
            items[i] = { ...items[i], promoColor: colorList[i] };
        }
    }
    return items;
};
export const isPromoButton = (items, modType, btnNum) => {
    if ((modType === 'Parallax' || modType === 'Banner') && items.modColor1 && btnNum === 1) {
        return 'btn_override';
    }
    else if ((modType === 'Parallax' || modType === 'Banner') && items.modColor1 && btnNum === 2) {
        return 'btn2_override';
    }
    else if (btnNum === 1 &&
        ((modType === 'PhotoGrid' && !items.image) || (modType === 'Parallax' && !items.image) || (modType === 'PhotoGallery' && !items.image))) {
        return 'btn_promo';
    }
    else if (btnNum === 1 && modType === 'Banner' && !items.image) {
        /*  else if (btnNum === 1 && ((modType === 'Banner' && items.modColor1) || (modType === 'Parallax' && items.modColor1))) {
        return 'btn_override'
    } */
        return 'btn_promo';
    }
    else if (btnNum === 1) {
        return 'btn_1';
    }
    else {
        return 'btn_2';
    }
};
export const createItemStyles = (items, well, modType, type) => {
    for (let i = 0; i < items.length; i++) {
        let itemStyle;
        let captionStyle;
        const currentItem = items[i];
        if (modType === 'Parallax') {
            if (currentItem.modColor1 && well != '1' && !currentItem.image) {
                itemStyle = { background: `${currentItem.modColor1}` };
            }
            else if (currentItem.modColor1 && well === '1' && !currentItem.image) {
                itemStyle = { background: `var(--accent-background)` };
            }
            else if (currentItem.modColor1 && well === '1') {
                itemStyle = { background: `${currentItem.modColor1}` };
            }
            else if (well === '1' && !currentItem.image) {
                itemStyle = {
                    backgroundImage: `linear-gradient(-45deg, ${currentItem.textureImage.gradientColors[0]}, ${currentItem.textureImage.gradientColors[1]})`,
                };
            }
            else if (!currentItem.image) {
                itemStyle = { background: `${currentItem.promoColor}` };
            }
            else if (currentItem.image && currentItem.modColor1 && currentItem.modOpacity) {
                let modBackground = currentItem.modColor1.replace(')', `,${currentItem.modOpacity})`);
                itemStyle = { background: modBackground };
            }
            else {
                itemStyle = {};
            }
        }
        else if (modType === 'Banner' || modType === 'PhotoGallery') {
            if (currentItem.modColor1 && !currentItem.image && !currentItem.modOpacity && modType === 'Banner') {
                itemStyle = { background: `${currentItem.modColor1}` };
            }
            else if (well === '1' && !currentItem.image && (modType === 'Banner' || type === 'thumbnail_gallery')) {
                itemStyle = {
                    backgroundImage: `linear-gradient(-45deg, ${currentItem.textureImage?.gradientColors[0]}, ${currentItem.textureImage?.gradientColors[1]})`,
                };
            }
            else if (currentItem.image && currentItem.modColor1 && currentItem.modOpacity) {
                let modBackground = currentItem.modColor1.replace(')', `,${1 - currentItem.modOpacity})`);
                captionStyle = { background: modBackground };
            }
            else if (currentItem.promoColor) {
                itemStyle = { background: `${currentItem.promoColor}` };
            }
            else {
                itemStyle = {};
            }
        }
        console.log('item style', itemStyle);
        items[i] = { ...items[i], itemStyle: itemStyle, captionStyle: captionStyle || '' };
        //banner
    }
    return items;
};
export const setColors = (cmsColors, cmsTheme) => {
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
        };
    }
    else {
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
        };
    }
};
export const getColumnsCssClass = (page) => {
    if (page.sections[1].wide == '938' || page.sections[1].wide == '988') {
        return 'full-column';
    }
    else if (page.sections[1].wide == '484' && page.sections[2].wide == '484') {
        return 'half-columns';
    }
    else if (page.sections[1].wide == '316' && page.sections[2].wide == '316' && page.sections[3].wide == '316') {
        return 'third-columns';
    }
    else if (page.sections[1].wide == '232' && page.sections[2].wide == '232' && page.sections[3].wide == '232' && page.sections[4].wide == '232') {
        return 'fourth-columns';
    }
    else if (page.sections[1].wide == '652' && page.sections[2].wide == '316') {
        return 'two-third_one-third';
    }
    else if (page.sections[1].wide == '316' && page.sections[2].wide == '652') {
        return 'one-third_two-third';
    }
    else if (page.sections[1].wide == '232' && page.sections[2].wide == '736') {
        return 'one-fourth_three-fourth';
    }
    else if (page.sections[1].wide == '736' && page.sections[2].wide == '232') {
        return 'three-fourth_one-fourth';
    }
    else if (page.sections[1].wide == '484' && page.sections[2].wide == '232' && page.sections[3].wide == '232') {
        return 'half_one-fourth_one-fourth';
    }
    else if (page.sections[1].wide == '232' && page.sections[2].wide == '232' && page.sections[3].wide == '484') {
        return 'one-fourth_one-fourth_half';
    }
    else if (page.sections[1].wide == '232' && page.sections[2].wide == '484' && page.sections[3].wide == '232') {
        return 'one-fourth_half_one-fourth';
    }
};
export const createFontCss = (fonts) => {
    let fontImportGroup;
    let fontClasses;
    if (Object.keys(fonts).length === 0) {
        fontImportGroup = '';
        fontClasses = '';
    }
    else {
        const headlineFont = fonts.list[fonts.sections.hdrs.value];
        const bodyFont = fonts.list[fonts.sections.body.value];
        const featuredFont = fonts.list[fonts.sections.feat.value];
        const fontTypes = [headlineFont.google, bodyFont.google, featuredFont.google];
        const uniqueFontGroup = removeDuplicatesArray(fontTypes);
        fontImportGroup = `@import url(https://fonts.googleapis.com/css?family=${uniqueFontGroup.join('|')}&display=swap);`;
        fontClasses = ` body {font-family:${bodyFont.label}}
    .hd-font{font-family:${headlineFont.label}} 
    .txt-font{font-family:${bodyFont.label}}
    .feat-font{font-family:${featuredFont.label}}
    `;
    }
    return { fontImportGroup, fontClasses };
};
export const createColorClasses = (themeStyles) => {
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
       `;
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
    `;
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
    `;
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
    `;
    let colorStyles = colorVars + textColors + btnStyles + backgroundStyles;
    return colorStyles;
};
//reuseables
export const removeDuplicatesArray = (arr) => {
    let uniqueArr = arr.filter((c, index) => {
        return arr.indexOf(c) === index;
    });
    return uniqueArr;
};
export const convertSpecialTokens = (str) => {
    const removedBreak = str.replaceAll('[rn]', '\n');
    const removedBlank = removedBreak.replaceAll('[t]', ' ');
    const removedParenthesis = removedBlank.replaceAll('&quot;', "'");
    return removedParenthesis;
};
export const replaceKey = (value, oldKey, newKey) => {
    if (oldKey !== newKey && value[oldKey]) {
        Object.defineProperty(value, newKey, Object.getOwnPropertyDescriptor(value, oldKey));
        delete value[oldKey];
    }
    return { ...value };
};
/* export default {
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
    createContactForm,
}
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFBO0FBRW5CLE1BQU0sVUFBVSxhQUFhLENBQUMsR0FBRztJQUM3QixJQUFJLElBQUksR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDM0IsSUFBSSxJQUFJLEtBQUssUUFBUSxFQUFFO1FBQ25CLE9BQU8sQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDM0I7U0FBTSxJQUFJLElBQUksS0FBSyxVQUFVLEVBQUU7UUFDNUIsT0FBTyxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQTtLQUM3QjtTQUFNLElBQUksSUFBSSxLQUFLLFdBQVcsRUFBRTtRQUM3QixPQUFPLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFBO0tBQzlCO1NBQU0sSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO1FBQzNCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUE7S0FDNUI7U0FBTTtRQUNILE9BQU8sQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUE7S0FDM0I7QUFDTCxDQUFDO0FBRUQsTUFBTSxVQUFVLFdBQVcsQ0FBQyxHQUFHO0lBQzNCLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUM5QixPQUFPLFFBQVEsQ0FBQTtLQUNsQjtTQUFNLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUN2QyxPQUFPLFVBQVUsQ0FBQTtLQUNwQjtTQUFNLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUN4QyxPQUFPLFdBQVcsQ0FBQTtLQUNyQjtTQUFNLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUN0QyxPQUFPLFNBQVMsQ0FBQTtLQUNuQjtTQUFNO1FBQ0gsT0FBTyxRQUFRLENBQUE7S0FDbEI7QUFDTCxDQUFDO0FBRUQsTUFBTSxDQUFDLE1BQU0sc0JBQXNCLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBRTtJQUMzQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUU7UUFDMUIsT0FBTyxTQUFTLENBQUE7S0FDbkI7U0FBTSxJQUFJLElBQUksS0FBSyxZQUFZLEVBQUU7UUFDOUIsT0FBTyxXQUFXLENBQUE7S0FDckI7U0FBTSxJQUFJLElBQUksS0FBSyxVQUFVLEVBQUU7UUFDNUIsT0FBTyxRQUFRLENBQUE7S0FDbEI7U0FBTSxJQUFJLElBQUksS0FBSyxZQUFZLEVBQUU7UUFDOUIsT0FBTyxVQUFVLENBQUE7S0FDcEI7U0FBTSxJQUFJLElBQUksS0FBSyxnQkFBZ0IsSUFBSSxJQUFJLEtBQUssZ0JBQWdCLEVBQUU7UUFDL0QsT0FBTyxjQUFjLENBQUE7S0FDeEI7U0FBTSxJQUFJLElBQUksS0FBSyxRQUFRLElBQUksSUFBSSxLQUFLLFFBQVEsRUFBRTtRQUMvQyxPQUFPLE1BQU0sQ0FBQTtLQUNoQjtTQUFNLElBQUksSUFBSSxLQUFLLGlCQUFpQixJQUFJLElBQUksS0FBSyxpQkFBaUIsRUFBRTtRQUNqRSxPQUFPLGNBQWMsQ0FBQTtLQUN4QjtTQUFNLElBQUksSUFBSSxLQUFLLFFBQVEsRUFBRTtRQUMxQixPQUFPLG1CQUFtQixDQUFBO0tBQzdCO1NBQU07UUFDSCxPQUFPLElBQUksQ0FBQTtLQUNkO0FBQ0wsQ0FBQyxDQUFBO0FBRUQscURBQXFEO0FBQ3JELE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUU7SUFDckMsSUFBSSxJQUFJLEtBQUssZ0JBQWdCLEVBQUU7UUFDM0IsT0FBTyxpQkFBaUIsQ0FBQTtLQUMzQjtTQUFNLElBQUksSUFBSSxLQUFLLGlCQUFpQixFQUFFO1FBQ25DLE9BQU8sbUJBQW1CLENBQUE7S0FDN0I7U0FBTTtRQUNILE9BQU8sSUFBSSxDQUFBO0tBQ2Q7QUFDTCxDQUFDLENBQUE7QUFFRCxNQUFNLFVBQVUsY0FBYyxDQUFDLElBQUk7SUFDL0IsSUFBSSxJQUFJLEVBQUU7UUFDTixzQ0FBc0M7UUFDdEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFBO1FBQ2xILE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBQzlDLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBRWxELE9BQU8sRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsQ0FBQTtLQUMxRDtBQUNMLENBQUM7QUFFRCw4Q0FBOEM7QUFDOUMsTUFBTSxDQUFDLE1BQU0sUUFBUSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUU7SUFDNUIsTUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDdkQsT0FBTyxjQUFjLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQTtBQUM3QyxDQUFDLENBQUE7QUFFRCxnQ0FBZ0M7QUFDaEMsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUFHLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxFQUFFO0lBQzVDLElBQUksR0FBRyxLQUFLLEdBQUcsRUFBRTtRQUNiLE9BQU8sR0FBRyxDQUFBO0tBQ2I7U0FBTSxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDOUIsR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBQzlCLE9BQU8sR0FBRyxDQUFBO0tBQ2I7U0FBTSxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDM0IsTUFBTSxvQkFBb0IsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQ2pELE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLG9CQUFvQixDQUFDLENBQUE7UUFDeEMsT0FBTyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUNqQztTQUFNO1FBQ0gsT0FBTyxHQUFHLENBQUE7S0FDYjtBQUNMLENBQUMsQ0FBQTtBQUVELE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUU7SUFDdEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBQ3hELE9BQU8sTUFBTSxDQUFBO0FBQ2pCLENBQUMsQ0FBQTtBQUVELE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFHLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxFQUFFO0lBQ2xELE1BQU0sZUFBZSxHQUFHO1FBQ3BCLFNBQVMsRUFBRSxTQUFTLElBQUksa0JBQWtCO1FBQzFDLFdBQVcsRUFBRSxTQUFTO1FBQ3RCLEtBQUssRUFBRSxLQUFLO1FBQ1osVUFBVSxFQUFFO1lBQ1I7Z0JBQ0ksSUFBSSxFQUFFLE9BQU87Z0JBQ2IsV0FBVyxFQUFFLFlBQVk7Z0JBQ3pCLElBQUksRUFBRSxNQUFNO2dCQUNaLEtBQUssRUFBRSxZQUFZO2dCQUNuQixLQUFLLEVBQUUsSUFBSTtnQkFDWCxTQUFTLEVBQUUsT0FBTztnQkFDbEIsU0FBUyxFQUFFLElBQUk7Z0JBQ2YsSUFBSSxFQUFFLElBQUk7YUFDYjtZQUNEO2dCQUNJLElBQUksRUFBRSxPQUFPO2dCQUNiLFdBQVcsRUFBRSxZQUFZO2dCQUN6QixJQUFJLEVBQUUsTUFBTTtnQkFDWixLQUFLLEVBQUUsV0FBVztnQkFDbEIsS0FBSyxFQUFFLElBQUk7Z0JBQ1gsU0FBUyxFQUFFLE9BQU87Z0JBQ2xCLFNBQVMsRUFBRSxJQUFJO2dCQUNmLElBQUksRUFBRSxJQUFJO2FBQ2I7WUFFRDtnQkFDSSxJQUFJLEVBQUUsT0FBTztnQkFDYiw0QkFBNEI7Z0JBQzVCLElBQUksRUFBRSxPQUFPO2dCQUNiLEtBQUssRUFBRSxPQUFPO2dCQUNkLEtBQUssRUFBRSxJQUFJO2dCQUNYLFNBQVMsRUFBRSxPQUFPO2dCQUNsQixTQUFTLEVBQUUsSUFBSTtnQkFDZixJQUFJLEVBQUUsSUFBSTthQUNiO1lBQ0Q7Z0JBQ0ksSUFBSSxFQUFFLE9BQU87Z0JBQ2IsNEJBQTRCO2dCQUM1QixJQUFJLEVBQUUsT0FBTztnQkFDYixLQUFLLEVBQUUsT0FBTztnQkFDZCxLQUFLLEVBQUUsS0FBSztnQkFDWixTQUFTLEVBQUUsT0FBTztnQkFDbEIsU0FBUyxFQUFFLElBQUk7Z0JBQ2YsSUFBSSxFQUFFLElBQUk7YUFDYjtZQUNEO2dCQUNJLEtBQUssRUFBRSxTQUFTO2dCQUNoQixJQUFJLEVBQUUsWUFBWTtnQkFDbEIsS0FBSyxFQUFFLElBQUk7Z0JBQ1gsU0FBUyxFQUFFLFVBQVU7Z0JBQ3JCLFNBQVMsRUFBRSxJQUFJO2dCQUNmLElBQUksRUFBRSxJQUFJO2FBQ2I7WUFDRDtnQkFDSSxLQUFLLEVBQUUsU0FBUztnQkFDaEIsUUFBUSxFQUFFLGdCQUFnQjtnQkFDMUIsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osU0FBUyxFQUFFLE9BQU87Z0JBQ2xCLFNBQVMsRUFBRSxJQUFJO2dCQUNmLElBQUksRUFBRSxJQUFJO2FBQ2I7WUFDRDtnQkFDSSxLQUFLLEVBQUUsVUFBVTtnQkFDakIsSUFBSSxFQUFFLEtBQUs7Z0JBQ1gsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osU0FBUyxFQUFFLE9BQU87Z0JBQ2xCLFNBQVMsRUFBRSxJQUFJO2dCQUNmLElBQUksRUFBRSxJQUFJO2FBQ2I7WUFDRDtnQkFDSSxLQUFLLEVBQUUsTUFBTTtnQkFDYixJQUFJLEVBQUUsTUFBTTtnQkFDWixLQUFLLEVBQUUsS0FBSztnQkFDWixTQUFTLEVBQUUsT0FBTztnQkFDbEIsU0FBUyxFQUFFLElBQUk7Z0JBQ2YsSUFBSSxFQUFFLElBQUk7YUFDYjtZQUNEO2dCQUNJLEtBQUssRUFBRSxPQUFPO2dCQUNkLElBQUksRUFBRSxPQUFPO2dCQUNiLEtBQUssRUFBRSxLQUFLO2dCQUNaLFNBQVMsRUFBRSxPQUFPO2dCQUNsQixTQUFTLEVBQUUsSUFBSTtnQkFDZixJQUFJLEVBQUUsSUFBSTthQUNiO1NBQ0o7S0FDSixDQUFBO0lBQ0QsT0FBTyxlQUFlLENBQUE7QUFDMUIsQ0FBQyxDQUFBO0FBRUQsTUFBTSxVQUFVLGdCQUFnQixDQUFDLFdBQVc7SUFDeEMsTUFBTSxLQUFLLEdBQUc7UUFDVixLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDO1FBQ3ZCLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUM7UUFDMUIsUUFBUSxFQUFFLENBQUMsS0FBSyxFQUFFLGNBQWMsQ0FBQztLQUNwQyxDQUFBO0lBRUQsTUFBTSxNQUFNLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUU5RCxNQUFNLE9BQU8sR0FBRyxvQ0FBb0MsR0FBRyxNQUFNLEdBQUcsR0FBRyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFBO0lBRTdGLE1BQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQTtJQUV2QixNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFBO0lBRS9ELE1BQU0sU0FBUyxHQUFHLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQTtJQUU5RCxLQUFLLE1BQU0sQ0FBQyxJQUFJLFdBQVcsQ0FBQyxLQUFLLEVBQUU7UUFDL0IsSUFBSSxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3RCLE1BQU0sS0FBSyxHQUFHO2dCQUNWLEtBQUssRUFBRSxPQUFPO2dCQUNkLElBQUksRUFBRSxNQUFNLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNO2dCQUMxQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEtBQUs7Z0JBQ2pCLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNO2dCQUNuSCxNQUFNLEVBQUUsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSzthQUNyRCxDQUFBO1lBRUQsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtTQUMzQjtLQUNKO0lBRUQsS0FBSyxNQUFNLENBQUMsSUFBSSxXQUFXLENBQUMsS0FBSyxFQUFFO1FBQy9CLElBQUksV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUN0QixNQUFNLEtBQUssR0FBRztnQkFDVixLQUFLLEVBQUUsT0FBTztnQkFDZCxJQUFJLEVBQUUsVUFBVSxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRTtnQkFDNUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxLQUFLO2dCQUNqQixPQUFPLEVBQUUsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSztnQkFDdEUsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLO2FBQ3hFLENBQUE7WUFFRCxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO1NBQzNCO0tBQ0o7SUFFRCxNQUFNLFVBQVUsR0FBRztRQUNmLEtBQUssRUFBRSxLQUFLO1FBQ1osSUFBSSxFQUFFLE9BQU87UUFDYixJQUFJLEVBQUUsS0FBSyxDQUFDLFFBQVE7UUFDcEIsT0FBTyxFQUFFLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSTtRQUNqQyxNQUFNLEVBQUUsV0FBVyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSztLQUNwRCxDQUFBO0lBRUQsV0FBVyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0lBRTlFLFdBQVcsR0FBRyxFQUFFLEdBQUcsV0FBVyxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxDQUFBO0lBRXpGLE9BQU8sV0FBVyxDQUFBO0FBQ3RCLENBQUM7QUFFRCxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUU7SUFDMUMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDbEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUE7UUFDcEUsNEJBQTRCO1FBRTVCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM3QyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ25DLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRTtnQkFDZixNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUE7Z0JBQ25ELElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLFFBQVEsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLEdBQUcsRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUE7Z0JBQ2xJLDZCQUE2QjtnQkFFN0IsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUNwQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUN4RCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQTt3QkFDOUMsSUFBSSxRQUFRLENBQUMsS0FBSyxFQUFFOzRCQUNoQixNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUE7NEJBQ3BELElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHO2dDQUM1QixHQUFHLFFBQVE7Z0NBQ1gsSUFBSSxFQUFFLFFBQVEsQ0FBQyxXQUFXLEVBQUU7Z0NBQzVCLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7NkJBQzVHLENBQUE7eUJBQ0o7cUJBQ0o7aUJBQ0o7YUFDSjtTQUNKO1FBRUQsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFBO0tBQ3BIO0lBRUQsT0FBTyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNuQyxDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLElBQUksRUFBRSxFQUFFO0lBQ3ZDLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQTtJQUNsQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNsQyx3Q0FBd0M7UUFDeEMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxFQUFFO1lBQy9CLGlFQUFpRTtZQUNqRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRTtnQkFDbEIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtnQkFDMUUsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtnQkFDdEUsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTthQUMzQjtTQUNKO0tBQ0o7SUFFRCxPQUFPLFNBQVMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQTtBQUNuRCxDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsTUFBTSw0QkFBNEIsR0FBRyxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEVBQUU7SUFDMUUsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEtBQUssSUFBSSxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssSUFBSSxDQUFBO0lBRWpGLE1BQU0sWUFBWSxHQUFHLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQTtJQUU3QyxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUE7SUFFNUMsTUFBTSxVQUFVLEdBQUcsQ0FBQyxZQUFZLElBQUksU0FBUyxDQUFDLElBQUksT0FBTyxJQUFJLFNBQVMsQ0FBQTtJQUN0RSxzQ0FBc0M7SUFFdEMsTUFBTSxhQUFhLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBRTdDLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxFQUFFO1FBQ25ELElBQUksT0FBTyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLElBQUksT0FBTyxLQUFLLFlBQVksSUFBSSxPQUFPLEtBQUssWUFBWSxDQUFDLEVBQUU7WUFDbkcsT0FBTyxRQUFRLENBQUE7U0FDbEI7YUFBTSxJQUFJLE9BQU8sRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLE9BQU8sS0FBSyxZQUFZLElBQUksT0FBTyxLQUFLLFlBQVksQ0FBQyxFQUFFO1lBQzFHLE9BQU8sUUFBUSxDQUFBO1NBQ2xCO2FBQU0sSUFBSSxPQUFPLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLE9BQU8sSUFBSSxDQUFDLElBQUksT0FBTyxJQUFJLENBQUMsRUFBRTtZQUNoRSxPQUFPLFFBQVEsQ0FBQTtTQUNsQjthQUFNLElBQUksT0FBTyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNoQyxPQUFPLFFBQVEsQ0FBQTtTQUNsQjthQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLE9BQU8sSUFBSSxDQUFDLENBQUMsRUFBRTtZQUNoRixPQUFPLFFBQVEsQ0FBQTtTQUNsQjthQUFNO1lBQ0gsT0FBTyxRQUFRLENBQUE7U0FDbEI7SUFDTCxDQUFDLENBQUE7SUFFRCxNQUFNLFVBQVUsR0FBRztRQUNmO1lBQ0ksSUFBSSxFQUFFLE1BQU07WUFDWixJQUFJLEVBQUUsV0FBVyxDQUFDLFFBQVEsSUFBSSxXQUFXLENBQUMsT0FBTztZQUNqRCxNQUFNLEVBQUUsV0FBVyxDQUFDLFNBQVM7WUFDN0IsSUFBSSxFQUFFLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUM1QyxLQUFLLEVBQUUsV0FBVyxDQUFDLFNBQVM7WUFDNUIsTUFBTSxFQUFFLFdBQVcsQ0FBQyxTQUFTLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLO1lBQzdGLE9BQU8sRUFBRSxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDM0YsT0FBTyxFQUFFLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQztZQUNoRSxRQUFRLEVBQUUsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLO1lBQ2hELFFBQVEsRUFBRSxXQUFXLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLO1NBQ3hIO1FBQ0Q7WUFDSSxJQUFJLEVBQUUsTUFBTTtZQUNaLElBQUksRUFBRSxXQUFXLENBQUMsU0FBUyxJQUFJLFdBQVcsQ0FBQyxRQUFRO1lBQ25ELE1BQU0sRUFBRSxXQUFXLENBQUMsVUFBVTtZQUM5QixJQUFJLEVBQUUsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDO1lBQzdDLEtBQUssRUFBRSxXQUFXLENBQUMsVUFBVTtZQUM3QixNQUFNLEVBQUUsV0FBVyxDQUFDLFVBQVUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLElBQUksV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUs7WUFDaEcsT0FBTyxFQUFFLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUM3RixPQUFPLEVBQUUsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDO1lBQ2pFLFFBQVEsRUFBRSxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUs7WUFDakQsUUFBUSxFQUFFLFdBQVcsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUs7U0FDMUg7S0FDSixDQUFBO0lBRUQsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxVQUFVLEVBQUUsQ0FBQTtBQUMzRSxDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsTUFBTSxlQUFlLEdBQUcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsRUFBRTtJQUN6RyxJQUFJLFNBQVMsQ0FBQTtJQUViLFNBQVMsR0FBRyxRQUFRLEdBQUcsVUFBVSxTQUFTLDBCQUEwQixXQUFXLENBQUMsaUJBQWlCLENBQUMsbUNBQW1DLENBQUE7SUFFckksSUFBSSxXQUFXLENBQUMsVUFBVSxFQUFFO1FBQ3hCLFNBQVM7WUFDTCxTQUFTO2dCQUNULFNBQVMsR0FBRyxVQUFVLFNBQVMsdUJBQXVCLFdBQVcsQ0FBQyxVQUFVLHVCQUF1QixXQUFXLENBQUMsaUJBQWlCLENBQUM7a0JBQzNILEdBQUcsVUFBVSxTQUFTLDRCQUE0QixXQUFXLENBQUMsaUJBQWlCLENBQUMsdUJBQXVCLFdBQVcsQ0FBQyxVQUFVLElBQUksQ0FBQTtLQUM5STtJQUVELElBQUksV0FBVyxDQUFDLFNBQVMsRUFBRTtRQUN2QixTQUFTO1lBQ0wsU0FBUztnQkFDVCxRQUFRLEdBQUcsVUFBVSxTQUFTLDBCQUEwQixXQUFXLENBQUMsU0FBUyx1QkFBdUIsV0FBVyxDQUFDLGFBQWEsQ0FBQyxVQUFVLEdBQUcsVUFBVSxTQUFTLCtCQUErQixXQUFXLENBQUMsYUFBYSxDQUFDLHVCQUF1QixXQUFXLENBQUMsU0FBUztjQUNqUSxHQUFHLFVBQVUsU0FBUyxnQ0FBZ0MsV0FBVyxDQUFDLFNBQVMsdUJBQXVCLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQztTQUNySSxDQUFBO0tBQ0o7SUFFRCxJQUFJLGVBQWUsRUFBRTtRQUNqQixTQUFTLEdBQUcsU0FBUyxHQUFHLE9BQU8sR0FBRyxzR0FBc0csQ0FBQTtLQUMzSTtTQUFNLElBQUksS0FBSyxDQUFDLElBQUksSUFBSSxPQUFPLElBQUksV0FBVyxJQUFJLE9BQU8sSUFBSSxVQUFVLElBQUksT0FBTyxJQUFJLGNBQWMsSUFBSSxDQUFDLGVBQWUsRUFBRTtRQUN2SCxTQUFTO1lBQ0wsU0FBUztnQkFDVCxPQUFPLEdBQUcsc0NBQXNDLFdBQVcsQ0FBQyxZQUFZLENBQUMsdUJBQXVCLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQzthQUM3SCxDQUFBO0tBQ1I7SUFFRCxPQUFPLFNBQVMsQ0FBQTtBQUNwQixDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsRUFBRTtJQUNqRCxJQUFJLE9BQU8sS0FBSyxVQUFVLElBQUksT0FBTyxLQUFLLFFBQVEsSUFBSSxPQUFPLEtBQUssY0FBYyxFQUFFO1FBQzlFLE9BQU8sT0FBTyxDQUFBO1FBQ2QsZ0JBQWdCO0tBQ25CO1NBQU0sSUFBSSxPQUFPLEtBQUssY0FBYyxFQUFFO1FBQ25DLE9BQU8sT0FBTyxDQUFBO1FBQ2Qsc0JBQXNCO0tBQ3pCO1NBQU0sSUFBSSxPQUFPLEtBQUssQ0FBQyxJQUFJLE9BQU8sS0FBSyxDQUFDLEVBQUU7UUFDdkMsT0FBTyxzREFBc0QsQ0FBQTtRQUM3RCxrQkFBa0I7S0FDckI7U0FBTTtRQUNILE9BQU8sNERBQTRELENBQUE7UUFDbkUsaUJBQWlCO0tBQ3BCO0FBQ0wsQ0FBQyxDQUFBO0FBRUQsTUFBTSxVQUFVLFFBQVEsQ0FBQyxJQUFJO0lBQ3pCLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1FBQ25DLE9BQU8sSUFBSSxDQUFBO0tBQ2Q7U0FBTTtRQUNILE9BQU8sS0FBSyxDQUFBO0tBQ2Y7QUFDTCxDQUFDO0FBRUQsTUFBTSxVQUFVLE1BQU0sQ0FBQyxJQUFJO0lBQ3ZCLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtRQUNsRSxPQUFPLElBQUksQ0FBQTtLQUNkO1NBQU07UUFDSCxPQUFPLEtBQUssQ0FBQTtLQUNmO0FBQ0wsQ0FBQztBQUVELE1BQU0sVUFBVSxXQUFXLENBQUMsV0FBVztJQUNuQyxJQUNJLENBQUMsV0FBVyxDQUFDLFNBQVMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNuRyxDQUFDLENBQUMsV0FBVyxDQUFDLFNBQVMsSUFBSSxXQUFXLENBQUMsVUFBVSxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsSUFBSSxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsRUFDdkc7UUFDRSxPQUFPLElBQUksQ0FBQTtLQUNkO1NBQU07UUFDSCxPQUFPLEtBQUssQ0FBQTtLQUNmO0FBQ0wsQ0FBQztBQUVELE1BQU0sVUFBVSxZQUFZLENBQUMsV0FBVztJQUNwQyxJQUFJLFdBQVcsQ0FBQyxTQUFTLElBQUksV0FBVyxDQUFDLFVBQVUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsSUFBSSxXQUFXLENBQUMsUUFBUSxDQUFDLEVBQUU7UUFDckosT0FBTyxJQUFJLENBQUE7S0FDZDtTQUFNO1FBQ0gsT0FBTyxLQUFLLENBQUE7S0FDZjtBQUNMLENBQUM7QUFFRCxNQUFNLFVBQVUsVUFBVSxDQUFDLFdBQVc7SUFDbEMsSUFDSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLElBQUksV0FBVyxDQUFDLFFBQVEsQ0FBQztRQUMvQyxDQUFDLFdBQVcsQ0FBQyxTQUFTLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQztRQUM5QyxDQUFDLFdBQVcsQ0FBQyxVQUFVLElBQUksV0FBVyxDQUFDLFNBQVMsQ0FBQztRQUNqRCxDQUFDLFdBQVcsQ0FBQyxVQUFVLElBQUksV0FBVyxDQUFDLFFBQVEsQ0FBQyxFQUNsRDtRQUNFLE9BQU8sSUFBSSxDQUFBO0tBQ2Q7U0FBTTtRQUNILE9BQU8sS0FBSyxDQUFBO0tBQ2Y7QUFDTCxDQUFDO0FBRUQsTUFBTSxVQUFVLGFBQWEsQ0FBQyxJQUFJO0lBQzlCLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7UUFDckcsT0FBTyxJQUFJLENBQUE7S0FDZDtTQUFNO1FBQ0gsT0FBTyxLQUFLLENBQUE7S0FDZjtBQUNMLENBQUM7QUFFRCxNQUFNLENBQUMsTUFBTSxxQkFBcUIsR0FBRyxDQUFDLFFBQVEsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLEVBQUU7SUFDbEUsb0JBQW9CO0lBQ3BCLE1BQU0sU0FBUyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUE7SUFDbkMsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFBO0lBQzFELE1BQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFBO0lBRTNELE1BQU0sV0FBVyxHQUFHO1FBQ2hCLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJO1FBQy9DLFlBQVksRUFBRSxRQUFRLENBQUMsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJO1FBQ3ZELFNBQVMsRUFBRSxRQUFRLENBQUMsU0FBUyxJQUFJLFNBQVM7UUFDMUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxNQUFNLElBQUksT0FBTztRQUNsQyxRQUFRLEVBQUUsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRO1FBQ3pDLFlBQVksRUFBRSxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSTtRQUNsRixZQUFZLEVBQUUsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJO1FBQzlDLFlBQVksRUFBRSxJQUFJLEtBQUssbUJBQW1CLElBQUksS0FBSztLQUN0RCxDQUFBO0lBRUQsT0FBTyxXQUFXLENBQUE7QUFDdEIsQ0FBQyxDQUFBO0FBRUQsTUFBTSxDQUFDLE1BQU0sb0JBQW9CLEdBQUcsQ0FBQyxLQUFLLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxFQUFFO0lBQzdELE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsY0FBYyxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUE7SUFFdEksTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztTQUN2QyxJQUFJLENBQUM7UUFDRjtZQUNJLEtBQUssRUFBRSw0QkFBNEI7WUFDbkMsY0FBYyxFQUFFLENBQUMsY0FBYyxFQUFFLGVBQWUsQ0FBQztTQUNwRDtRQUNEO1lBQ0ksS0FBSyxFQUFFLHFCQUFxQjtZQUM1QixjQUFjLEVBQUUsQ0FBQyxlQUFlLEVBQUUsZUFBZSxDQUFDO1NBQ3JEO1FBQ0Q7WUFDSSxLQUFLLEVBQUUsd0JBQXdCO1lBQy9CLGNBQWMsRUFBRSxDQUFDLGVBQWUsRUFBRSxlQUFlLENBQUM7U0FDckQ7UUFDRDtZQUNJLEtBQUssRUFBRSxtQkFBbUI7WUFDMUIsY0FBYyxFQUFFLENBQUMsZUFBZSxFQUFFLGNBQWMsQ0FBQztTQUNwRDtRQUNEO1lBQ0ksS0FBSyxFQUFFLHFCQUFxQjtZQUM1QixjQUFjLEVBQUUsQ0FBQyxjQUFjLEVBQUUsZUFBZSxDQUFDO1NBQ3BEO0tBQ0osQ0FBQztTQUNELElBQUksRUFBRSxDQUFBO0lBRVgsb0JBQW9CO0lBQ3BCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ25DLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFO1lBQ2pCLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsWUFBWSxFQUFFLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQTtZQUMxRyxpQkFBaUI7U0FDcEI7YUFBTTtZQUNILEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtTQUN2RDtLQUNKO0lBRUQsT0FBTyxLQUFLLENBQUE7QUFDaEIsQ0FBQyxDQUFBO0FBRUQsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUNwRCxJQUFJLENBQUMsT0FBTyxLQUFLLFVBQVUsSUFBSSxPQUFPLEtBQUssUUFBUSxDQUFDLElBQUksS0FBSyxDQUFDLFNBQVMsSUFBSSxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQ3JGLE9BQU8sY0FBYyxDQUFBO0tBQ3hCO1NBQU0sSUFBSSxDQUFDLE9BQU8sS0FBSyxVQUFVLElBQUksT0FBTyxLQUFLLFFBQVEsQ0FBQyxJQUFJLEtBQUssQ0FBQyxTQUFTLElBQUksTUFBTSxLQUFLLENBQUMsRUFBRTtRQUM1RixPQUFPLGVBQWUsQ0FBQTtLQUN6QjtTQUFNLElBQ0gsTUFBTSxLQUFLLENBQUM7UUFDWixDQUFDLENBQUMsT0FBTyxLQUFLLFdBQVcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sS0FBSyxVQUFVLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLEtBQUssY0FBYyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQ3pJO1FBQ0UsT0FBTyxXQUFXLENBQUE7S0FDckI7U0FBTSxJQUFJLE1BQU0sS0FBSyxDQUFDLElBQUksT0FBTyxLQUFLLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUU7UUFDN0Q7O1FBRUE7UUFDQSxPQUFPLFdBQVcsQ0FBQTtLQUNyQjtTQUFNLElBQUksTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNyQixPQUFPLE9BQU8sQ0FBQTtLQUNqQjtTQUFNO1FBQ0gsT0FBTyxPQUFPLENBQUE7S0FDakI7QUFDTCxDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFO0lBQzNELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ25DLElBQUksU0FBUyxDQUFBO1FBQ2IsSUFBSSxZQUFZLENBQUE7UUFDaEIsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzVCLElBQUksT0FBTyxLQUFLLFVBQVUsRUFBRTtZQUN4QixJQUFJLFdBQVcsQ0FBQyxTQUFTLElBQUksSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUU7Z0JBQzVELFNBQVMsR0FBRyxFQUFFLFVBQVUsRUFBRSxHQUFHLFdBQVcsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFBO2FBQ3pEO2lCQUFNLElBQUksV0FBVyxDQUFDLFNBQVMsSUFBSSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRTtnQkFDcEUsU0FBUyxHQUFHLEVBQUUsVUFBVSxFQUFFLDBCQUEwQixFQUFFLENBQUE7YUFDekQ7aUJBQU0sSUFBSSxXQUFXLENBQUMsU0FBUyxJQUFJLElBQUksS0FBSyxHQUFHLEVBQUU7Z0JBQzlDLFNBQVMsR0FBRyxFQUFFLFVBQVUsRUFBRSxHQUFHLFdBQVcsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFBO2FBQ3pEO2lCQUFNLElBQUksSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUU7Z0JBQzNDLFNBQVMsR0FBRztvQkFDUixlQUFlLEVBQUUsMkJBQTJCLFdBQVcsQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxLQUFLLFdBQVcsQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxHQUFHO2lCQUMzSSxDQUFBO2FBQ0o7aUJBQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUU7Z0JBQzNCLFNBQVMsR0FBRyxFQUFFLFVBQVUsRUFBRSxHQUFHLFdBQVcsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFBO2FBQzFEO2lCQUFNLElBQUksV0FBVyxDQUFDLEtBQUssSUFBSSxXQUFXLENBQUMsU0FBUyxJQUFJLFdBQVcsQ0FBQyxVQUFVLEVBQUU7Z0JBQzdFLElBQUksYUFBYSxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxJQUFJLFdBQVcsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFBO2dCQUNyRixTQUFTLEdBQUcsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUE7YUFDNUM7aUJBQU07Z0JBQ0gsU0FBUyxHQUFHLEVBQUUsQ0FBQTthQUNqQjtTQUNKO2FBQU0sSUFBSSxPQUFPLEtBQUssUUFBUSxJQUFJLE9BQU8sS0FBSyxjQUFjLEVBQUU7WUFDM0QsSUFBSSxXQUFXLENBQUMsU0FBUyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLElBQUksT0FBTyxLQUFLLFFBQVEsRUFBRTtnQkFDaEcsU0FBUyxHQUFHLEVBQUUsVUFBVSxFQUFFLEdBQUcsV0FBVyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUE7YUFDekQ7aUJBQU0sSUFBSSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssSUFBSSxDQUFDLE9BQU8sS0FBSyxRQUFRLElBQUksSUFBSSxLQUFLLG1CQUFtQixDQUFDLEVBQUU7Z0JBQ3JHLFNBQVMsR0FBRztvQkFDUixlQUFlLEVBQUUsMkJBQTJCLFdBQVcsQ0FBQyxZQUFZLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxLQUFLLFdBQVcsQ0FBQyxZQUFZLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxHQUFHO2lCQUM3SSxDQUFBO2FBQ0o7aUJBQU0sSUFBSSxXQUFXLENBQUMsS0FBSyxJQUFJLFdBQVcsQ0FBQyxTQUFTLElBQUksV0FBVyxDQUFDLFVBQVUsRUFBRTtnQkFDN0UsSUFBSSxhQUFhLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLFdBQVcsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFBO2dCQUN6RixZQUFZLEdBQUcsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLENBQUE7YUFDL0M7aUJBQU0sSUFBSSxXQUFXLENBQUMsVUFBVSxFQUFFO2dCQUMvQixTQUFTLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxXQUFXLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQTthQUMxRDtpQkFBTTtnQkFDSCxTQUFTLEdBQUcsRUFBRSxDQUFBO2FBQ2pCO1NBQ0o7UUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsQ0FBQTtRQUVwQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxZQUFZLElBQUksRUFBRSxFQUFFLENBQUE7UUFFbEYsUUFBUTtLQUNYO0lBQ0QsT0FBTyxLQUFLLENBQUE7QUFDaEIsQ0FBQyxDQUFBO0FBRUQsTUFBTSxDQUFDLE1BQU0sU0FBUyxHQUFHLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxFQUFFO0lBQzdDLElBQUksUUFBUSxLQUFLLHdCQUF3QixFQUFFO1FBQ3ZDLE9BQU87WUFDSCxTQUFTLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLO1lBQ2xDLFlBQVksRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUs7WUFDckMsZUFBZSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsS0FBSztZQUN6QyxTQUFTLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLO1lBQ2xDLFNBQVMsRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUs7WUFDbEMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSztZQUNsQyxPQUFPLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLO1lBQ2hDLGFBQWEsRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUs7WUFDdEMsZUFBZSxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSztZQUN4QyxlQUFlLEVBQUUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLO1lBQ3pDLFFBQVEsRUFBRSxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUs7WUFDbEMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSztZQUNyQyxpQkFBaUIsRUFBRSxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUs7WUFDM0MsUUFBUSxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSztZQUNsQyxhQUFhLEVBQUUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLO1lBQ3ZDLFdBQVcsRUFBRSxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUs7WUFDckMsaUJBQWlCLEVBQUUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLO1lBQzNDLE9BQU8sRUFBRSxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUs7WUFDakMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSztZQUNsQyxVQUFVLEVBQUUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLO1lBQ3BDLGNBQWMsRUFBRSxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUs7WUFDeEMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSztZQUNyQyxnQkFBZ0IsRUFBRSxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUs7WUFDMUMsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLO1lBQzFDLHFCQUFxQixFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSztZQUMvQyxjQUFjLEVBQUUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLO1lBQ3hDLGdCQUFnQixFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSztZQUMxQyxVQUFVLEVBQUUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLO1lBQ3BDLFVBQVUsRUFBRSxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUs7WUFDcEMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSztZQUNuQyxVQUFVLEVBQUUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLO1lBQ3BDLFdBQVcsRUFBRSxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUs7WUFDckMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSztZQUNyQyxXQUFXLEVBQUUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLO1lBQ3JDLFdBQVcsRUFBRSxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUs7WUFDckMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSztTQUN4QyxDQUFBO0tBQ0o7U0FBTTtRQUNILE9BQU87WUFDSCxVQUFVLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxLQUFLO1lBQ3BDLFNBQVMsRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLEtBQUs7WUFDcEMsWUFBWSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsS0FBSztZQUN0QyxlQUFlLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxLQUFLO1lBQ3pDLGVBQWUsRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLEtBQUs7WUFDekMsYUFBYSxFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsS0FBSztZQUN2QyxTQUFTLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxLQUFLO1lBQ3BDLHFCQUFxQixFQUFFLFNBQVMsRUFBRSxPQUFPLENBQUMsS0FBSztZQUMvQyxZQUFZLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxLQUFLO1lBQ3ZDLFFBQVEsRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLEtBQUs7WUFDbkMsZ0JBQWdCLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxLQUFLO1lBQzNDLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsS0FBSztZQUMzQyxhQUFhLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxLQUFLO1lBQ3hDLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsS0FBSztZQUMzQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxLQUFLO1lBQ2xDLFNBQVMsRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLEtBQUs7WUFDbkMsVUFBVSxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsS0FBSztZQUNyQyxRQUFRLEVBQUUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLO1lBQ2xDLFVBQVUsRUFBRSxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUs7WUFDcEMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSztZQUNyQyxpQkFBaUIsRUFBRSxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUs7U0FDOUMsQ0FBQTtLQUNKO0FBQ0wsQ0FBQyxDQUFBO0FBRUQsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBRTtJQUN2QyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLEVBQUU7UUFDbEUsT0FBTyxhQUFhLENBQUE7S0FDdkI7U0FBTSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLEVBQUU7UUFDekUsT0FBTyxjQUFjLENBQUE7S0FDeEI7U0FBTSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksS0FBSyxFQUFFO1FBQzNHLE9BQU8sZUFBZSxDQUFBO0tBQ3pCO1NBQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLEVBQUU7UUFDN0ksT0FBTyxnQkFBZ0IsQ0FBQTtLQUMxQjtTQUFNLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssRUFBRTtRQUN6RSxPQUFPLHFCQUFxQixDQUFBO0tBQy9CO1NBQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksS0FBSyxFQUFFO1FBQ3pFLE9BQU8scUJBQXFCLENBQUE7S0FDL0I7U0FBTSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLEVBQUU7UUFDekUsT0FBTyx5QkFBeUIsQ0FBQTtLQUNuQztTQUFNLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssRUFBRTtRQUN6RSxPQUFPLHlCQUF5QixDQUFBO0tBQ25DO1NBQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssRUFBRTtRQUMzRyxPQUFPLDRCQUE0QixDQUFBO0tBQ3RDO1NBQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssRUFBRTtRQUMzRyxPQUFPLDRCQUE0QixDQUFBO0tBQ3RDO1NBQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssRUFBRTtRQUMzRyxPQUFPLDRCQUE0QixDQUFBO0tBQ3RDO0FBQ0wsQ0FBQyxDQUFBO0FBRUQsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUU7SUFDbkMsSUFBSSxlQUFlLENBQUE7SUFDbkIsSUFBSSxXQUFXLENBQUE7SUFFZixJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxL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