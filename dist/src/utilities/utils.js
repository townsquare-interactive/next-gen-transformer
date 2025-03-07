import crypto from 'crypto';
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
    else if (icon === 'tiktok') {
        return ['fab', 'tiktok'];
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
    else if (str.indexOf('tiktok') !== -1) {
        return 'tiktok';
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
export const convertUrlToApexId = (url, changeHyphens = true) => {
    // Remove protocol
    const withoutProtocol = url.replace(/(^\w+:|^)\/\//, '');
    const withoutTSI = withoutProtocol.replace('.production.townsquareinteractive', '');
    // Remove www prefix
    const withoutWww = withoutTSI.replace(/^www\./, '');
    // Extract the domain part (before the first '/')
    let domain = withoutWww.split('/')[0];
    if (domain.includes('.vercel')) {
        //remove vercel domain postfixes
        domain = removeCustomVercelDomainPostfixes(domain);
    }
    if (changeHyphens) {
        // Replace all periods except the last one with hyphens
        const lastPeriodIndex = domain.lastIndexOf('.');
        domain = domain.substring(0, lastPeriodIndex).replace(/\./g, '-') + domain.substring(lastPeriodIndex);
    }
    else {
        domain = domain.split('.')[0];
    }
    // Remove the TLD
    const domainParts = domain.split('.');
    if (domainParts.length > 1) {
        domainParts.pop(); // Remove the last part (TLD)
    }
    return domainParts.join('.');
};
const removeCustomVercelDomainPostfixes = (str) => {
    let apexID = str;
    apexID = apexID.replace('.vercel', '');
    apexID = apexID.replace('-preview', '');
    apexID = apexID.replace('-lp', '');
    apexID = apexID.replace('-prev', '');
    apexID = apexID.replace('-main', '');
    return apexID;
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
    const mapLink = 'https://www.google.com/maps/place/' + newAdd + '+' + contactInfo.address?.zip;
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
        content: contactInfo.address?.name || '',
        active: contactInfo.address?.street ? true : false,
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
export const createRandomFiveCharString = () => {
    return Math.random().toString(36).substring(2, 7);
};
//check if there is a domain that has been randomly generated in list of publishedDomains (5 is the current random generated amount)
export const checkApexIDInDomain = (checkingDomain, domainOptions, postfix) => {
    const apexAndHyphen = domainOptions.domain + '-';
    if (checkingDomain.includes(apexAndHyphen)) {
        //check for -lp domains
        if (checkingDomain === apexAndHyphen + 'lp' + postfix) {
            return true;
        }
        //check for -(random gen) URLs
        const regex = new RegExp(`${apexAndHyphen}.{5}\\${postfix}`);
        return regex.test(checkingDomain);
    }
    return false;
};
export const getPageNameFromDomain = (domain) => {
    const domainSplit = domain.split('/');
    if (domainSplit.length <= 1) {
        return 'no page name';
    }
    const pageName = domainSplit[domainSplit.length - 1];
    return pageName;
};
export function generateAccessToken(length = 16) {
    //string will be double the length param
    return crypto.randomBytes(length).toString('hex');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLE9BQU8sTUFBTSxNQUFNLFFBQVEsQ0FBQTtBQUUzQixNQUFNLENBQUMsTUFBTSxTQUFTLEdBQUcsZ0RBQWdELENBQUE7QUFDekUsTUFBTSxZQUFZLEdBQUcsU0FBUyxHQUFHLGdCQUFnQixDQUFBO0FBRWpELFVBQVU7QUFDVixNQUFNLENBQUMsTUFBTSxPQUFPLEdBQUc7SUFDbkIsTUFBTSxFQUFFLFFBQVE7SUFDaEIsUUFBUSxFQUFFLFVBQVU7SUFDcEIsU0FBUyxFQUFFLFdBQVc7Q0FDekIsQ0FBQTtBQUVELE1BQU0sVUFBVSxhQUFhLENBQUMsR0FBVztJQUNyQyxJQUFJLElBQUksR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUE7SUFFM0IsSUFBSSxJQUFJLEtBQUssT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzFCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2xDLENBQUM7U0FBTSxJQUFJLElBQUksS0FBSyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDbkMsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDcEMsQ0FBQztTQUFNLElBQUksSUFBSSxLQUFLLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNwQyxPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUNyQyxDQUFDO1NBQU0sSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFLENBQUM7UUFDNUIsT0FBTyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQTtJQUM3QixDQUFDO1NBQU0sSUFBSSxJQUFJLEtBQUssVUFBVSxFQUFFLENBQUM7UUFDN0IsT0FBTyxDQUFDLEtBQUssRUFBRSxVQUFVLENB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LENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQzVHLE9BQU8sZUFBZSxDQUFBO0lBQzFCLENBQUM7U0FBTSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQzlJLE9BQU8sZ0JBQWdCLENBQUE7SUFDM0IsQ0FBQztTQUFNLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQzFFLE9BQU8scUJBQXFCLENBQUE7SUFDaEMsQ0FBQztTQUFNLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQzFFLE9BQU8scUJBQXFCLENBQUE7SUFDaEMsQ0FBQztTQUFNLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQzFF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