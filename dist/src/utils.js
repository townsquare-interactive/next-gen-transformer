export const bucketUrl = 'https://townsquareinteractive.s3.amazonaws.com';
const globalAssets = bucketUrl + '/global-assets';
//contants
export const socials = {
    google: 'google',
    facebook: 'facebook',
    instagram: 'instagram',
};
export function socialConvert(str) {
    let icon = iconConvert(str);
    if (icon === socials.google) {
        return ['fab', socials.google];
    }
    else if (icon === socials.facebook) {
        return ['fab', socials.facebook];
    }
    else if (icon === socials.instagram) {
        return ['fab', socials.instagram];
    }
    else if (icon === 'twitter') {
        return ['fab', 'twitter'];
    }
    else if (icon === 'linkedin') {
        return ['fab', 'linkedin'];
    }
    else if (icon === 'youtube') {
        return ['fab', 'youtube'];
    }
    else if (icon === 'pinterest') {
        return ['fab', 'pinterest'];
    }
    else if (icon === 'apple') {
        return ['fab', 'apple'];
    }
    else if (icon === 'vimeo') {
        return ['fab', 'vimeo'];
    }
    else if (icon === 'x-twitter') {
        return ['fab', 'x-twitter'];
    }
    else {
        return ['fas', 'rocket'];
    }
}
export function iconConvert(str) {
    if (str.indexOf(socials.google) !== -1) {
        return socials.google;
    }
    else if (str.indexOf(socials.facebook) !== -1) {
        return socials.facebook;
    }
    else if (str.indexOf(socials.instagram) !== -1) {
        return socials.instagram;
    }
    else if (str.indexOf('twitter') !== -1) {
        return 'twitter';
    }
    else if (str.indexOf('linkedin') !== -1) {
        return 'linkedin';
    }
    else if (str.indexOf('youtube') !== -1) {
        return 'youtube';
    }
    else if (str.indexOf('pinterest') !== -1) {
        return 'pinterest';
    }
    else if (str.indexOf('apple') !== -1) {
        return 'apple';
    }
    else if (str.indexOf('vimeo') !== -1) {
        return 'vimeo';
    }
    else if (str.indexOf('/x.com') !== -1) {
        return 'x-twitter';
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
    else if (type === 'parallax_1' || type === 'video_1b') {
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
export const convertUrlToApexId = (url) => {
    // Remove protocol
    const withoutProtocol = url.replace(/(^\w+:|^)\/\//, '');
    const withoutTSI = withoutProtocol.replace('.production.townsquareinteractive', '');
    // Remove www prefix
    const withoutWww = withoutTSI.replace(/^www\./, '');
    // Extract the domain part (before the first '/')
    const domain = withoutWww.split('/')[0];
    // Replace all periods except the last one with hyphens
    const lastPeriodIndex = domain.lastIndexOf('.');
    const transformedDomain = domain.substring(0, lastPeriodIndex).replace(/\./g, '-') + domain.substring(lastPeriodIndex);
    // Remove the TLD
    const domainParts = transformedDomain.split('.');
    if (domainParts.length > 1) {
        domainParts.pop(); // Remove the last part (TLD)
    }
    return domainParts.join('.');
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
    const newAdd = contactInfo.address?.street?.replaceAll(' ', '+');
    const mapLink = 'https://www.google.com/maps/place/' + newAdd + '+' + contactInfo.address.zip;
    const contactLinks = [];
    const multiPhones = contactInfo.phone.length > 1 ? true : false;
    const hideEmail = !multiPhones && contactInfo.email?.length > 1;
    //create coordinates for map
    if (contactInfo.address) {
        let coords = await newAddyCoords(contactInfo.address);
        contactInfo.address = { ...contactInfo.address, coordinates: coords };
    }
    if (contactInfo.phone) {
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
    }
    if (contactInfo.email) {
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
export const setColors = (cmsColors, cmsTheme) => {
    if (cmsTheme === 'beacon-theme_charlotte' || 'beacon-theme_apex') {
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
export const createFontCss = (fonts, siteType = 'website') => {
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
        return createFontImport(headlineFont, bodyFont, featuredFont, siteType);
    }
    return { fontImportGroup, fontClasses };
};
export const createFontImport = (headlineFont, bodyFont, featuredFont, siteType) => {
    const fontTypes = [headlineFont.google, bodyFont.google, featuredFont.google];
    const uniqueFontGroup = removeDuplicatesArray(fontTypes);
    if (siteType === 'landing') {
        uniqueFontGroup.push('Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0');
    }
    console.log('unique font group', uniqueFontGroup);
    const fontImportGroup = `@import url(https://fonts.googleapis.com/css?family=${uniqueFontGroup.join('|')}&display=swap);`;
    const fontClasses = ` body {font-family:${bodyFont.label}}
.hd-font{font-family:${headlineFont.label}} 
.txt-font{font-family:${bodyFont.label}}
.feat-font{font-family:${featuredFont.label}}
`;
    return { fontImportGroup, fontClasses };
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
export const convertSpecialTokens = (str, type = 'desc') => {
    //const removedBreak = str.replaceAll('[rn]', '\n')
    const removedBreak = type === 'desc' ? str.replaceAll('[rn]', '<br>') : str.replaceAll('[rn]', '\n');
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
    text = text.replace(/\n/g, '[rn]');
    //skip p tag insert here
    if (text.startsWith('<') || text.includes('<a')) {
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
    return processedDesc;
}
export const convertDescText = (desc) => {
    const wrappedText = wrapTextWithPTags(desc);
    let convertedDesc = convertSpecialTokens(wrappedText);
    //const convertedImages = processImageTag(convertedDesc, cmsUrl)
    return convertedDesc;
};
export const seperateScriptCode = (customPageCode, pageSlug) => {
    let pageCss = '';
    let styleMatchReg = /<style[^>]*>([^<]+)<\/style>/gi;
    let nextMatch = styleMatchReg.exec(customPageCode);
    let cssStringArray = [];
    while (nextMatch != null) {
        cssStringArray.push(nextMatch[1]);
        nextMatch = styleMatchReg.exec(customPageCode);
    }
    const codeWithoutStyles = customPageCode.replace(styleMatchReg, '');
    const cssString = convertSpecialTokens(cssStringArray.join(' '), 'code');
    if (cssString) {
        pageCss = pageSlug
            ? `.page-${pageSlug} {
            ${cssString} 
        }`
            : cssString;
    }
    return { css: pageCss || '', scripts: convertSpecialTokens(codeWithoutStyles, 'code') || '' };
};
const createHeaderCtaBtns = (btnList) => {
    const headerBtns = [];
    for (let n = 0; n < btnList.length; n++) {
        const currentBtn = btnList[n];
        headerBtns.push({
            label: currentBtn.label,
            link: currentBtn.link,
            active: true,
            opensModal: -1,
            window: 1,
            btnType: 'btn_cta_landing',
            btnSize: 'btn_md',
            googleIcon: currentBtn.googleIcon,
            icon: currentBtn.icon,
        });
    }
    return headerBtns;
};
export const getlandingPageOptions = () => {
    const ctaBtns = [
        {
            label: 'GET 24/7 SERVICE CALL NOW',
            link: 'tel:(732)%20351-2519',
            googleIcon: `<span class="material-symbols-outlined call">phone_android</span>`,
            faIcon: ['fas', 'mobile-notch'],
            icon: {
                iconPrefix: 'fas',
                iconModel: 'mobile-notch',
            },
        },
        {
            label: 'Schedule NOW',
            link: 'tel:(732)%20351-2519',
            googleIcon: `<span class="material-symbols-outlined">calendar_clock</span>`,
            icon: {
                iconPrefix: 'far',
                iconModel: 'calendar-clock',
            },
        },
    ];
    const mobileCtaBtns = [
        {
            label: 'CALL NOW',
            link: 'tel:(732)%20351-2519',
            googleIcon: `<span class="material-symbols-outlined call">phone_android</span>`,
            icon: {
                iconPrefix: 'fas',
                iconModel: 'mobile-notch',
            },
        },
        {
            label: 'Schedule',
            link: 'tel:(732)%20351-2519',
            googleIcon: `<span class="material-symbols-outlined">calendar_clock</span>`,
            icon: {
                iconPrefix: 'far',
                iconModel: 'calendar-clock',
            },
        },
    ];
    const headerBtns = createHeaderCtaBtns(ctaBtns);
    const mobileHeaderBtns = createHeaderCtaBtns(mobileCtaBtns);
    return { ctaBtns: headerBtns, hideNav: true, hideSocial: true, mobileHeaderBtns: mobileHeaderBtns };
};
export function removeWhiteSpace(str) {
    return str.replace(/\s+/g, '');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUEsTUFBTSxDQUFDLE1BQU0sU0FBUyxHQUFHLGdEQUFnRCxDQUFBO0FBQ3pFLE1BQU0sWUFBWSxHQUFHLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQTtBQUVqRCxVQUFVO0FBQ1YsTUFBTSxDQUFDLE1BQU0sT0FBTyxHQUFHO0lBQ25CLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLFFBQVEsRUFBRSxVQUFVO0lBQ3BCLFNBQVMsRUFBRSxXQUFXO0NBQ3pCLENBQUE7QUFFRCxNQUFNLFVBQVUsYUFBYSxDQUFDLEdBQVc7SUFDckMsSUFBSSxJQUFJLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBRTNCLElBQUksSUFBSSxLQUFLLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUMxQixPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUNsQyxDQUFDO1NBQU0sSUFBSSxJQUFJLEtBQUssT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ25DLE9BQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQ3BDLENBQUM7U0FBTSxJQUFJLElBQUksS0FBSyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDcEMsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUE7SUFDckMsQ0FBQztTQUFNLElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQzVCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUE7SUFDN0IsQ0FBQztTQUFNLElBQUksSUFBSSxLQUFLLFVBQVUsRUFBRSxDQUFDO1FBQzdCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUE7SUFDOUIsQ0FBQztTQUFNLElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQzVCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUE7SUFDN0IsQ0FBQztTQUFNLElBQUksSUFBSSxLQUFLLFdBQVcsRUFBRSxDQUFDO1FBQzlCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUE7SUFDL0IsQ0FBQztTQUFNLElBQUksSUFBSSxLQUFLLE9BQU8sRUFBRSxDQUFDO1FBQzFCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFDM0IsQ0FBQztTQUFNLElBQUksSUFBSSxLQUFLLE9BQU8sRUFBRSxDQUFDO1FBQzFCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFDM0IsQ0FBQztTQUFNLElBQUksSUFBSSxLQUFLLFdBQVcsRUFBRSxDQUFDO1FBQzlCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUE7SUFDL0IsQ0FBQztTQUFNLENBQUM7UUFDSixPQUFPLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFBO0lBQzVCLENBQUM7QUFDTCxDQUFDO0FBRUQsTUFBTSxVQUFVLFdBQVcsQ0FBQyxHQUFXO0lBQ25DLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNyQyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUE7SUFDekIsQ0FBQztTQUFNLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM5QyxPQUFPLE9BQU8sQ0FBQyxRQUFRLENBQUE7SUFDM0IsQ0FBQztTQUFNLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUMvQyxPQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUE7SUFDNUIsQ0FBQztTQUFNLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENB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QVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLEVBQUUsQ0FBQztRQUM1RyxPQUFPLGVBQWUsQ0FBQTtJQUMxQixDQUFDO1NBQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLEVBQUUsQ0FBQztRQUM5SSxPQUFPLGdCQUFnQixDQUFBO0lBQzNCLENBQUM7U0FBTSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLEVBQUUsQ0FBQztRQUMxRSxPQUFPLHFCQUFxQixDQUFBO0lBQ2hDLENBQUM7U0FBTSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLEVBQUUsQ0FBQztRQUMxRSxPQUFPLHFCQUFxQixDQUFBO0lBQ2hDLENBQUM7U0FBTSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLEVBQUUsQ0FB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