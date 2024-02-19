export const bucketUrl = 'https://townsquareinteractive.s3.amazonaws.com';
const globalAssets = bucketUrl + '/global-assets';
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
export const addProtocolToLink = (url) => {
    if (!url.includes('http')) {
        url = 'http://' + url;
    }
    return url;
};
export const moduleRenderTypes = ['Article', 'PhotoGrid', 'Banner', 'Parallax', 'Testimonials', 'Card', 'PhotoGallery', 'ContactFormRoutes', 'Modal'];
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
    else if (type === 'modal_1') {
        return 'Modal';
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
        if (removedSiteAndDomain) {
            return removedSiteAndDomain[0];
        }
        else {
            return '';
        }
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
                type: 'email',
                label: 'Email',
                isReq: true,
                fieldType: 'input',
                isVisible: true,
                size: 'md',
            },
            {
                name: 'phone',
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
export const transformCompositeItems = (compositeItems) => {
    let newModalData;
    const componentItems = compositeItems;
    //seperate modal item
    const modalItems = componentItems.filter((e) => e.component === 'popup_modal');
    //all non modal items
    let newCompositeItems = componentItems.filter((e) => e.component != 'popup_modal');
    //add plugin for each item
    for (const i in modalItems) {
        modalItems[i].modalType = 'site';
        if (modalItems[i].form_id) {
            modalItems[i].plugin = '[gravity]';
        }
    }
    //uses first modal item right now, not sure if we will need to account for multiple
    if (modalItems.length > 0) {
        newModalData = replaceKey(modalItems[0], 'title', 'headline');
        newModalData = replaceKey(modalItems[0], 'subtitle', 'subheader');
        newModalData = replaceKey(modalItems[0], 'text', 'desc');
        newModalData = { items: [newModalData], autoOpen: modalItems[0].autoOpen || false };
    }
    //add contact form capability
    if (compositeItems.filter((item) => item.form_id).length > 0) {
        const contactFormData = createContactForm('', '');
        newModalData = {
            ...newModalData,
            contactFormData: contactFormData,
        };
    }
    return { newModalData, newCompositeItems };
};
export function checkModalBtn(btnLink, pageModals) {
    for (let x in pageModals) {
        if (btnLink === '#modal_' + pageModals[x].modalTitle.replace(' ', '-')) {
            return Number(x);
        }
    }
    return -1;
}
export const filterPrimaryContact = (settings) => {
    const primaryContact = (settings?.contact?.contact_list?.wide?.items.filter((site) => site.isPrimary))[0];
    return primaryContact;
};
//decide primary phone/email
export const decidePrimaryPhoneOrEmail = (primaryContact, currentLayout, type = 'phone') => {
    if (primaryContact) {
        const contacts = primaryContact[type];
        if (contacts) {
            const primaryContact = contacts.filter((contact) => contact[`isPrimary${capitalize(type)}`]);
            if (primaryContact.length > 0) {
                console.log('using primary contact', primaryContact[0]);
                if (type === 'phone') {
                    return primaryContact[0].number || '';
                }
                else if (type === 'email') {
                    return primaryContact[0].email || '';
                }
            }
        }
    }
    // If no primary contact found, return the fallback contact from currentLayout
    return type === 'phone' ? currentLayout.phoneNumber || '' : type === 'email' ? currentLayout.email || '' : '';
};
export async function transformcontact(contactInfo) {
    const icons = {
        phone: ['fas', 'phone'],
        email: ['fas', 'envelope'],
        location: ['fas', 'location-pin'],
    };
    const newAdd = contactInfo.address.street?.replaceAll(' ', '+');
    const mapLink = 'https://www.google.com/maps/place/' + newAdd + '+' + contactInfo.address.zip;
    const contactLinks = [];
    const multiPhones = contactInfo.phone.length > 1 ? true : false;
    const hideEmail = !multiPhones && contactInfo.email.length > 1;
    //create coordinates for map
    if (contactInfo.address) {
        let coords = await newAddyCoords(contactInfo.address);
        contactInfo.address = { ...contactInfo.address, coordinates: coords };
    }
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
        content: contactInfo.address.name || '',
        active: contactInfo.address.street ? true : false,
    };
    multiPhones ? contactLinks.unshift(contactMap) : contactLinks.push(contactMap);
    contactInfo = { ...contactInfo, address: { ...contactInfo.address, url: mapLink }, contactLinks: contactLinks, showContactBox: multiPhones };
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
                                url: menu[i].submenu[x].submenu[k].url ? stripSiteAndUrl(menu[i].submenu[x]?.submenu[k].url, siteUrl) : '',
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
export const createLinkAndButtonVariables = (currentItem, modType, columns, pageModals) => {
    const btnCount = decideBtnCount(currentItem);
    const linkNoBtn = btnCount === 0 && isLink(currentItem) === true;
    const isWrapLink = (btnCount === 1 || linkNoBtn) && modType != 'article' && checkModalBtn(currentItem.weblink || '', pageModals) === -1;
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
    const btn1isModal = checkModalBtn(currentItem.weblink || '', pageModals) > -1 ? true : false;
    const btn2isModal = checkModalBtn(currentItem.weblink2 || '', pageModals) > -1 ? true : false;
    const buttonList = [
        {
            name: 'btn1',
            link: btn1isModal ? '#' : currentItem.pagelink || currentItem.weblink,
            window: currentItem.newwindow,
            icon: btnIconConvert(currentItem.icon || ''),
            label: currentItem.actionlbl,
            active: currentItem.actionlbl && (currentItem.pagelink || currentItem.weblink) ? true : false,
            btnType: currentItem.btnType ? currentItem.btnType : isPromoButton(currentItem, modType, 1),
            btnSize: determineBtnSize(currentItem.btnSize || '', modType, columns),
            linkType: currentItem.pagelink ? 'local' : 'ext',
            blockBtn: currentItem.btnSize?.includes('btn_block') ? true : currentItem.btnSize?.includes('btn_blk') ? true : false,
            opensModal: checkModalBtn(currentItem.weblink || '', pageModals),
        },
        {
            name: 'btn2',
            link: btn2isModal ? '#' : currentItem.pagelink2 || currentItem.weblink2,
            window: currentItem.newwindow2,
            icon: btnIconConvert(currentItem.icon2 || ''),
            label: currentItem.actionlbl2,
            active: currentItem.actionlbl2 && (currentItem.pagelink2 || currentItem.weblink2) ? true : false,
            btnType: currentItem.btnType2 ? currentItem.btnType2 : isPromoButton(currentItem, modType, 2),
            btnSize: determineBtnSize(currentItem.btnSize2 || '', modType, columns),
            linkType: currentItem.pagelink2 ? 'local' : 'ext',
            blockBtn: currentItem.btnSize2?.includes('btn_block') ? true : currentItem.btnSize2?.includes('btn_blk') ? true : false,
            opensModal: checkModalBtn(currentItem.weblink2 || '', pageModals),
        },
    ];
    return { linkNoBtn, btnCount, isWrapLink, visibleButton, buttonList };
};
export const createBtnStyles = (value, modType, key, themeStyles, currentItem, itemCount, isFeatureButton) => {
    let btnStyles;
    btnStyles = ` #id_${key} .item_${itemCount} .btn2_override {color:${themeStyles['textColorAccent']}; background-color:transparent;} `;
    if (currentItem.promoColor) {
        btnStyles =
            btnStyles +
                `#id_${key} .item_${itemCount} .btn_promo {color: ${currentItem.promoColor}; background-color: ${themeStyles['promoText']};}
            #id_${key} .item_${itemCount} .btn_promo:hover{color: ${themeStyles['promoText']}; background-color: ${currentItem.promoColor};}`;
    }
    if (currentItem.modColor1) {
        btnStyles =
            btnStyles +
                ` #id_${key} .item_${itemCount} .btn_override {color: ${currentItem.modColor1}; background-color: ${themeStyles['captionText']};} #id_${key} .item_${itemCount} .btn_override:hover{color: ${themeStyles['captionText']}; background-color: ${currentItem.modColor1};}
        #id_${key} .item_${itemCount} .btn2_override:hover{color: ${currentItem.modColor1}; background-color: ${themeStyles['textColorAccent']};}`;
    }
    if (isFeatureButton) {
        btnStyles = btnStyles + `#id_${key} .is-wrap-link:hover .btn_1{color: var(--hero-btn-background); background-color:var(--txt-accent) ;}`;
    }
    else if ((value.well || modType === 'Card') && modType != 'PhotoGrid' && modType != 'Parallax' && modType != 'PhotoGallery' && !isFeatureButton) {
        btnStyles = btnStyles + `#id_${key} .is-wrap-link:hover .btn_1{color: ${themeStyles['btnBackground']}; background-color: ${themeStyles['btnText']}};`;
    }
    return btnStyles;
};
//trying to adjust next.js image sizes depending on modules/columns
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
export const isFeatureBtn = (modRenderType, well, btnCount, isFeatured) => {
    if (well &&
        modRenderType != 'PhotoGrid' &&
        modRenderType != 'Parallax' &&
        modRenderType != 'PhotoGallery' &&
        isFeatured === 'active' &&
        btnCount === 1 &&
        modRenderType != 'PhotoGallery') {
        console.log;
        return true;
    }
    else {
        return false;
    }
};
export const createTsiImageLink = (cmsUrl, imgUrl) => {
    let imageUrl = 'http://' + cmsUrl + imgUrl;
    return encodeURI(imageUrl);
};
export const createFavLink = (cmsUrl, fav) => {
    let stripPath = stripImageFolders(fav);
    let fullUrl = cmsUrl + stripPath;
    return fullUrl;
};
export function decideBtnCount(currentItem) {
    if ((currentItem.actionlbl && !currentItem.actionlbl2 && (currentItem.pagelink || currentItem.weblink)) ||
        (!currentItem.actionlbl && currentItem.actionlbl2 && (currentItem.pagelink2 || currentItem.weblink2))) {
        return 1;
    }
    else if (currentItem.actionlbl &&
        currentItem.actionlbl2 &&
        (currentItem.pagelink || currentItem.weblink) &&
        (currentItem.pagelink2 || currentItem.weblink2)) {
        return 2;
    }
    else if (!currentItem.actionlbl && !currentItem.actionlbl2) {
        return 0;
    }
    else {
        return 0;
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
export function capitalize(str) {
    if (!str) {
        return '';
    }
    return str[0].toUpperCase() + str.slice(1);
}
export const transformLogos = (logos, cmsUrl) => {
    //change logo sources
    function transformLogoSlots(slots) {
        for (const x in slots) {
            if (slots[x].image_src) {
                slots[x].image_src = createTsiImageLink(cmsUrl, slots[x].image_src || '');
            }
        }
        return slots;
    }
    logos.header.slots = transformLogoSlots(logos.header.slots);
    logos.footer.slots = transformLogoSlots(logos.footer.slots);
    logos.mobile.slots = transformLogoSlots(logos.mobile.slots);
    const transformedLogos = removeFieldsFromObj(logos, ['list', 'fonts']);
    return transformedLogos;
};
export const transformPageSeo = (pageSeo) => {
    return {
        title: pageSeo.title || '',
        descr: pageSeo.descr || '',
        selectedImages: pageSeo.selectedImages || '',
        imageOverride: pageSeo.imageOverride || '',
    };
};
//fields to possibly remove
export const removeFieldsFromObj = (obj, fields) => {
    for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        if (obj.hasOwnProperty(field)) {
            delete obj[field];
        }
    }
    return obj;
};
export const createGallerySettings = (settings, blockSwitch1, type) => {
    //convert to numbers
    const interval = Number(settings.interval) * 1000;
    const restartDelay = Number(settings.restartdelay);
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
export const transformLinksInItem = (item) => {
    item = { ...item, links: transformItemLinks(item) };
    item = removeFieldsFromObj(item, ['pagelink', 'weblink', 'weblink2', 'pagelink2']);
    return item;
};
const transformItemLinks = (item) => {
    return {
        pagelink: item.pagelink || '',
        pagelink2: item.pagelink2 || '',
        weblink: item.weblink || '',
        weblink2: item.weblink2 || '',
    };
};
export const createModalPageList = (modules) => {
    let pageModals = [];
    let modalNum = 0;
    for (let i in modules) {
        if (Object.keys(modules[i]).length != 0) {
            for (const [key, pageModule] of Object.entries(modules[i])) {
                //for (const pageModule in value.data.modules[i]) {
                if (pageModule && Object.entries(pageModule).length != 0) {
                    //console.log('type of check', typeof pageModule)
                    if (pageModule.type === 'modal_1') {
                        let autoOpen = false;
                        if (pageModule.well == '1') {
                            autoOpen = true;
                        }
                        for (let m in pageModule.items) {
                            if (pageModule.items[m].autoOpen === true) {
                                autoOpen = true;
                            }
                        }
                        pageModals.push({
                            modalNum: modalNum,
                            modalTitle: pageModule.title || '',
                            autoOpen: autoOpen,
                            openEveryTime: false,
                        });
                        pageModule.modalNum = modalNum;
                        modalNum += 1;
                    }
                }
            }
        }
    }
    return pageModals;
};
export const alternatePromoColors = (items, themeStyles, well) => {
    const colorList = Array(items.length).fill(['var(--promo)', 'var(--promo2)', 'var(--promo3)', 'var(--promo4)', 'var(--promo5)']).flat();
    const textureImageList = Array(items.length)
        .fill([
        {
            image: `${globalAssets}/subtle-white-feathers.png`,
            gradientColors: ['var(--promo)', 'var(--promo2)'],
        },
        {
            image: `${globalAssets}/shattered-dark.png`,
            gradientColors: ['var(--promo2)', 'var(--promo3)'],
        },
        {
            image: `${globalAssets}/fabric-of-squares.png`,
            gradientColors: ['var(--promo3)', 'var(--promo4)'],
        },
        {
            image: `${globalAssets}/cartographer.png`,
            gradientColors: ['var(--promo4)', 'var(--promo5)'],
        },
        {
            image: `${globalAssets}/bright-squares.png`,
            gradientColors: ['var(--promo)', 'var(--promo3)'],
        },
    ])
        .flat();
    for (let i = 0; i < items.length; i++) {
        if (!items[i].image) {
            items[i] = { ...items[i], promoColor: colorList[i], textureImage: well == '1' ? textureImageList[i] : '' };
        }
        else {
            items[i] = { ...items[i], promoColor: colorList[i] };
        }
    }
    return items;
};
export const isPromoButton = (item, modType, btnNum) => {
    if ((modType === 'Parallax' || modType === 'Banner') && item.modColor1 && btnNum === 1) {
        return 'btn_override';
    }
    else if ((modType === 'Parallax' || modType === 'Banner') && item.modColor1 && btnNum === 2) {
        return 'btn2_override';
    }
    else if (btnNum === 1 &&
        ((modType === 'PhotoGrid' && !item.image) || (modType === 'Parallax' && !item.image) || (modType === 'PhotoGallery' && !item.image))) {
        return 'btn_promo';
    }
    else if (btnNum === 1 && modType === 'Banner' && !item.image) {
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
                    backgroundImage: `linear-gradient(-45deg, ${currentItem.textureImage?.gradientColors[0]}, ${currentItem.textureImage?.gradientColors[1]})`,
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
        items[i] = { ...items[i], itemStyle: itemStyle, captionStyle: captionStyle || '' };
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
    .social-icon:hover, .footer-icon:hover {background-color:var(--btn-background); color:var(--btn-txt);}
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
export async function fetchCoordinates(address) {
    const url = `https://nominatim.openstreetmap.org/search?street=${address.street}&city=${address.city}&state=${address.state}&postalcode${address.zip}&format=json`;
    try {
        const resCoords = await fetch(encodeURI(url));
        const coords = await resCoords.json();
        return { lat: coords[0].lat, long: coords[0].lon };
    }
    catch (err) {
        console.log('map coordinates error');
        return { lat: 0, long: 0 };
    }
}
export const newAddyCoords = async (addy) => {
    let mapCoords;
    if (addy.zip && addy.state && addy.city) {
        mapCoords = await fetchCoordinates(addy);
        console.log(mapCoords);
    }
    else {
        mapCoords = { lat: '', long: '' };
    }
    return mapCoords;
};
//reuseables
export const removeDuplicatesArray = (arr) => {
    let uniqueArr = arr.filter((c, index) => {
        return arr.indexOf(c) === index;
    });
    return uniqueArr;
};
export const convertSpecialTokens = (str) => {
    //const removedBreak = str.replaceAll('[rn]', '\n')
    const removedBreak = str.replaceAll('[rn]', '<br>');
    const removedBlank = removedBreak.replaceAll('[t]', ' ');
    const removedParenthesis = removedBlank.replaceAll('&quot;', "'");
    return removedParenthesis;
};
export const replaceKey = (value, oldKey, newKey) => {
    if (oldKey !== newKey && value[oldKey]) {
        value[newKey] = value[oldKey];
        //Object.defineProperty(value, newKey, Object.getOwnPropertyDescriptor(value, oldKey))
        delete value[oldKey];
    }
    else if ([oldKey]) {
        console.log('key is not in obj');
    }
    return { ...value };
};
//Need to wrap <p> tags around text that does not contain list tags
export function wrapTextWithPTags(text) {
    //dont edit text that starts with a html tag
    text = text.replace(/\n/g, '[rn]');
    if (text.startsWith('<') || text.includes('<a')) {
        console.log('skipping <p> tag insertion');
        if (text.includes('One of the best ways')) {
            console.log('incoming text', text);
        }
        return text;
    }
    // Match text outside of html tags
    const regex = /(<\/?(ul|ol|b|div|span|i|a|li)[^>]*>)|([^<]+)/gi;
    // Split the text based on the regex and process each part
    const parts = text.split(regex);
    // Initialize a flag to keep track of whether we're inside <ul> or <ol> tags
    let insideList = false;
    //tags we want to include
    const tags = ['ul', 'ol', 'b', 'div', 'span', 'i', 'a', 'li'];
    // Process each part and wrap text in <p> tags if not inside a list
    const result = parts.map((part) => {
        const lowerCasePart = part?.toLowerCase();
        //console.log(part)
        if (lowerCasePart === '<ul>' ||
            lowerCasePart === '<ol>' ||
            lowerCasePart === '<b>' ||
            lowerCasePart === '<i>' ||
            lowerCasePart === '<div>' ||
            lowerCasePart === '<span>' ||
            lowerCasePart?.includes('<a') ||
            lowerCasePart === '<li>'
        //tags.includes(`<${lowerCasePart}>`)
        ) {
            insideList = true;
            return lowerCasePart;
        }
        else if (lowerCasePart === '</ul>' ||
            lowerCasePart === '</ol>' ||
            lowerCasePart === '</b>' ||
            lowerCasePart === '</div>' ||
            lowerCasePart === '</span>' ||
            lowerCasePart === '</i>' ||
            lowerCasePart === '</a>' ||
            lowerCasePart === '</li>'
        //tags.includes(`</${lowerCasePart}>`)
        ) {
            insideList = false;
            return lowerCasePart;
        }
        else if (part === undefined || part === '' || part === ' ' || tags.includes(lowerCasePart)) {
            return '';
        }
        else if (!insideList && part != ' ' && part?.trim() !== '') {
            return `<p>${part}</p>`;
        }
        return part;
    });
    //const removedUnwrapped = removeUnwrappedLists(result.join(''))
    const removedUnwrapped = result.join('');
    return removedUnwrapped;
}
function processImageTag(desc, cmsUrl) {
    // Regular expression to match <img> tag
    var imgRegex = /<img([^>]*)src\s*=\s*["']([^"']*)["']([^>]*)>/g;
    // Function to replace the src attribute
    function replaceSrc(match, p1, p2, p3) {
        // Add the string variable to the beginning of the src value
        var newSrc = cmsUrl + p2;
        return '<img' + p1 + 'src="' + 'http://' + newSrc + '"' + p3 + '>';
    }
    // Use replace function with the defined callback
    var processedDesc = desc.replace(imgRegex, replaceSrc);
    console.log('lets see how it works', desc, processedDesc);
    return processedDesc;
}
export const convertDescText = (desc, cmsUrl) => {
    const wrappedText = wrapTextWithPTags(desc);
    const convertedDesc = convertSpecialTokens(wrappedText);
    //const convertedImages = processImageTag(convertedDesc, cmsUrl)
    return convertedDesc;
};
//converts hex or rgb to HSL
export function colorToHSL(color) {
    // Function to convert RGB to HSL
    function rgbToHSL(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s, l = (max + min) / 2;
        if (max === min) {
            // Achromatic (gray)
            h = s = 0;
        }
        else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        // Convert hue to degrees
        h *= 360;
        // Round values to integers or fractions as needed
        h = Math.round(h);
        s = Math.round(s * 100);
        l = Math.round(l * 100);
        return `hsl(${h}, ${s}%, ${l}%)`;
    }
    // Remove whitespace and convert to lowercase for case-insensitive comparison
    color = color.replace(/\s/g, '').toLowerCase();
    if (color.startsWith('#')) {
        // Hex color value
        return rgbToHSL(parseInt(color.slice(1, 3), 16), parseInt(color.slice(3, 5), 16), parseInt(color.slice(5, 7), 16));
    }
    else if (color.startsWith('rgb(') && color.endsWith(')')) {
        // RGB color value
        const rgbValues = color.slice(4, -1).split(',');
        if (rgbValues.length === 3) {
            const r = parseInt(rgbValues[0]);
            const g = parseInt(rgbValues[1]);
            const b = parseInt(rgbValues[2]);
            return rgbToHSL(r, g, b);
        }
    }
    else {
        // If the input doesn't match either format, return an error message or default value
        console.log('invalid color format');
        return color;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUEsTUFBTSxDQUFDLE1BQU0sU0FBUyxHQUFHLGdEQUFnRCxDQUFBO0FBQ3pFLE1BQU0sWUFBWSxHQUFHLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQTtBQUVqRCxNQUFNLFVBQVUsYUFBYSxDQUFDLEdBQVc7SUFDckMsSUFBSSxJQUFJLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQzNCLElBQUksSUFBSSxLQUFLLFFBQVEsRUFBRTtRQUNuQixPQUFPLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQzNCO1NBQU0sSUFBSSxJQUFJLEtBQUssVUFBVSxFQUFFO1FBQzVCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUE7S0FDN0I7U0FBTSxJQUFJLElBQUksS0FBSyxXQUFXLEVBQUU7UUFDN0IsT0FBTyxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQTtLQUM5QjtTQUFNLElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtRQUMzQixPQUFPLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFBO0tBQzVCO1NBQU07UUFDSCxPQUFPLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFBO0tBQzNCO0FBQ0wsQ0FBQztBQUVELE1BQU0sVUFBVSxXQUFXLENBQUMsR0FBVztJQUNuQyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7UUFDOUIsT0FBTyxRQUFRLENBQUE7S0FDbEI7U0FBTSxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7UUFDdkMsT0FBTyxVQUFVLENBQUE7S0FDcEI7U0FBTSxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7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