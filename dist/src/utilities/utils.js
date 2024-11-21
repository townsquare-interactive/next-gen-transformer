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
    console.log('domain after convert func', domain);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUlBLE1BQU0sQ0FBQyxNQUFNLFNBQVMsR0FBRyxnREFBZ0QsQ0FBQTtBQUN6RSxNQUFNLFlBQVksR0FBRyxTQUFTLEdBQUcsZ0JBQWdCLENBQUE7QUFFakQsVUFBVTtBQUNWLE1BQU0sQ0FBQyxNQUFNLE9BQU8sR0FBRztJQUNuQixNQUFNLEVBQUUsUUFBUTtJQUNoQixRQUFRLEVBQUUsVUFBVTtJQUNwQixTQUFTLEVBQUUsV0FBVztDQUN6QixDQUFBO0FBRUQsTUFBTSxVQUFVLGFBQWEsQ0FBQyxHQUFXO0lBQ3JDLElBQUksSUFBSSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUUzQixJQUFJLElBQUksS0FBSyxPQUFPLENBQUMsTUFBTSxFQUFFO1FBQ3pCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0tBQ2pDO1NBQU0sSUFBSSxJQUFJLEtBQUssT0FBTyxDQUFDLFFBQVEsRUFBRTtRQUNsQyxPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUNuQztTQUFNLElBQUksSUFBSSxLQUFLLE9BQU8sQ0FBQyxTQUFTLEVBQUU7UUFDbkMsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUE7S0FDcEM7U0FBTSxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7UUFDM0IsT0FBTyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQTtLQUM1QjtTQUFNLElBQUksSUFBSSxLQUFLLFVBQVUsRUFBRTtRQUM1QixPQUFPLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFBO0tBQzdCO1NBQU0sSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO1FBQzNCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsU0FBUyxD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SSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLEVBQUU7UUFDM0csT0FBTyw0QkFBNEIsQ0FBQTtLQUN0QztTQUFNLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLEVBQUU7UUFDM0csT0FBTyw0QkFBNEIsQ0FBQTtLQUN0QztBQUNMLENBQUMsQ0FBQTtBQUVELE1BQU0sQ0FBQyxNQUFNLGFBQWEsR0FBRyxDQUFDLEtBQVUsRUFBRSxRQUFRLEdBQUcsU0FBUyxFQUFFLEVBQUU7SUFDOUQsSUFBSSxlQUFlLENBQUE7SUFDbkIsSUFBSSxXQUFXLENBQUE7SUFFZixJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNqQyxlQUFlLEdBQUcsRUFBRSxDQUFBO1FBQ3BCLFdBQVcsR0FBRyxFQUFFLENBQUE7S0FDbkI7U0FBTTtRQUNILE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDMUQsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUN0RCxNQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FB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