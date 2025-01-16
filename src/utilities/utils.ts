//import { z } from 'zod'
import { SiteDataType } from '../schema/output-zod'
import { CMSNavItem, CMSPage, Contact, LunaModuleItem, CarouselSettings, ThemeStyles, PageSeo, Logo, Slot, FontType, DomainOptions } from '../../types'
import crypto from 'crypto'

export const bucketUrl = 'https://townsquareinteractive.s3.amazonaws.com'
const globalAssets = bucketUrl + '/global-assets'

//contants
export const socials = {
    google: 'google',
    facebook: 'facebook',
    instagram: 'instagram',
}

export function socialConvert(str: string) {
    let icon = iconConvert(str)

    if (icon === socials.google) {
        return ['fab', socials.google]
    } else if (icon === socials.facebook) {
        return ['fab', socials.facebook]
    } else if (icon === socials.instagram) {
        return ['fab', socials.instagram]
    } else if (icon === 'twitter') {
        return ['fab', 'twitter']
    } else if (icon === 'linkedin') {
        return ['fab', 'linkedin']
    } else if (icon === 'youtube') {
        return ['fab', 'youtube']
    } else if (icon === 'pinterest') {
        return ['fab', 'pinterest']
    } else if (icon === 'apple') {
        return ['fab', 'apple']
    } else if (icon === 'vimeo') {
        return ['fab', 'vimeo']
    } else if (icon === 'x-twitter') {
        return ['fab', 'x-twitter']
    } else if (icon === 'tiktok') {
        return ['fab', 'tiktok']
    } else {
        return ['fas', 'rocket']
    }
}

export function iconConvert(str: string) {
    if (str.indexOf(socials.google) !== -1) {
        return socials.google
    } else if (str.indexOf(socials.facebook) !== -1) {
        return socials.facebook
    } else if (str.indexOf(socials.instagram) !== -1) {
        return socials.instagram
    } else if (str.indexOf('twitter') !== -1) {
        return 'twitter'
    } else if (str.indexOf('linkedin') !== -1) {
        return 'linkedin'
    } else if (str.indexOf('youtube') !== -1) {
        return 'youtube'
    } else if (str.indexOf('pinterest') !== -1) {
        return 'pinterest'
    } else if (str.indexOf('apple') !== -1) {
        return 'apple'
    } else if (str.indexOf('vimeo') !== -1) {
        return 'vimeo'
    } else if (str.indexOf('/x.com') !== -1) {
        return 'x-twitter'
    } else if (str.indexOf('tiktok') !== -1) {
        return 'tiktok'
    } else {
        return 'social'
    }
}

export const addProtocolToLink = (url: string) => {
    if (!url.includes('http')) {
        url = 'http://' + url
    }

    return url
}

export const moduleRenderTypes = ['Article', 'PhotoGrid', 'Banner', 'Parallax', 'Testimonials', 'Card', 'PhotoGallery', 'ContactFormRoutes', 'Modal']

export const determineModRenderType = (type: string) => {
    if (type.includes('article')) {
        return 'Article'
    } else if (type === 'photo_grid') {
        return 'PhotoGrid'
    } else if (type === 'banner_1') {
        return 'Banner'
    } else if (type === 'parallax_1' || type === 'video_1b') {
        return 'Parallax'
    } else if (type === 'testimonials_1' || type === 'testimonials_2') {
        return 'Testimonials'
    } else if (type === 'card_1' || type === 'card_2') {
        return 'Card'
    } else if (type === 'photo_gallery_1' || type === 'photo_gallery_2') {
        return 'PhotoGallery'
    } else if (type === 'plugin') {
        return 'ContactFormRoutes'
    } else if (type === 'modal_1') {
        return 'Modal'
    } else {
        return type
    }
}

//cleaning up module type names that are not specific
export const modVariationType = (type: string) => {
    if (type === 'testimonials_2') {
        return 'review_carousel'
    } else if (type === 'photo_gallery_2') {
        return 'thumbnail_gallery'
    } else {
        return type
    }
}

export function btnIconConvert(icon: string) {
    if (icon) {
        //replaces fas fa-rocket with faRocket
        const iconPrefix = icon.includes('fas') ? 'fas' : icon.includes('far') ? 'far' : icon.includes('fab') ? 'fab' : ''
        const stripIcon = icon.replace(iconPrefix, '')
        const iconModel = stripIcon.replace(/^(.*?)-/, '')

        return { iconPrefix: iconPrefix, iconModel: iconModel }
    }
}

export const convertUrlToApexId = (url: string, changeHyphens = true) => {
    // Remove protocol
    const withoutProtocol = url.replace(/(^\w+:|^)\/\//, '')
    const withoutTSI = withoutProtocol.replace('.production.townsquareinteractive', '')

    // Remove www prefix
    const withoutWww = withoutTSI.replace(/^www\./, '')

    // Extract the domain part (before the first '/')
    let domain = withoutWww.split('/')[0]

    if (domain.includes('.vercel')) {
        //remove vercel domain postfixes
        domain = removeCustomVercelDomainPostfixes(domain)
    }

    if (changeHyphens) {
        // Replace all periods except the last one with hyphens
        const lastPeriodIndex = domain.lastIndexOf('.')
        domain = domain.substring(0, lastPeriodIndex).replace(/\./g, '-') + domain.substring(lastPeriodIndex)
    } else {
        domain = domain.split('.')[0]
    }

    // Remove the TLD
    const domainParts = domain.split('.')
    if (domainParts.length > 1) {
        domainParts.pop() // Remove the last part (TLD)
    }
    console.log('domain after convert func', domain)
    return domainParts.join('.')
}

const removeCustomVercelDomainPostfixes = (str: string) => {
    let apexID = str
    apexID = apexID.replace('.vercel', '')
    apexID = apexID.replace('-preview', '')
    apexID = apexID.replace('-lp', '')
    apexID = apexID.replace('-prev', '')
    apexID = apexID.replace('-main', '')
    return apexID
}

//strip anything between / ... /
export const stripSiteAndUrl = (url: string, siteUrl: string) => {
    if (url === '#') {
        return '#'
    } else if (url.includes(siteUrl)) {
        url = url.replace(siteUrl, '')
        return url
    } else if (url.includes('//')) {
        const removedSiteAndDomain = url.match(/\/(.*)$/)
        console.log('url', removedSiteAndDomain)
        if (removedSiteAndDomain) {
            return removedSiteAndDomain[0]
        } else {
            return ''
        }
    } else {
        return url
    }
}

export const stripImageFolders = (file: string) => {
    const result = file.substring(file.lastIndexOf('/') + 1)
    return result
}

export const createContactForm = (formTitle: string, email: string) => {
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
    }
    return contactFormData
}

export const transformCompositeItems = (compositeItems: any[]) => {
    let newModalData
    const componentItems = compositeItems
    //seperate modal item
    const modalItems = componentItems.filter((e: any) => e.component === 'popup_modal')
    //all non modal items
    let newCompositeItems = componentItems.filter((e: any) => e.component != 'popup_modal')

    //add plugin for each item
    for (const i in modalItems) {
        modalItems[i].modalType = 'site'
        if (modalItems[i].form_id) {
            modalItems[i].plugin = '[gravity]'
        }
    }

    //uses first modal item right now, not sure if we will need to account for multiple
    if (modalItems.length > 0) {
        newModalData = replaceKey(modalItems[0], 'title', 'headline')
        newModalData = replaceKey(modalItems[0], 'subtitle', 'subheader')
        newModalData = replaceKey(modalItems[0], 'text', 'desc')
        newModalData = { items: [newModalData], autoOpen: modalItems[0].autoOpen || false }
    }

    //add contact form capability
    if (compositeItems.filter((item) => item.form_id).length > 0) {
        const contactFormData = createContactForm('', '')
        newModalData = {
            ...newModalData,
            contactFormData: contactFormData,
        }
    }

    return { newModalData, newCompositeItems }
}

export function checkModalBtn(btnLink: string, pageModals: { modalNum: number; modalTitle: any }[]) {
    for (let x in pageModals) {
        if (btnLink === '#modal_' + pageModals[x].modalTitle.replace(' ', '-')) {
            return Number(x)
        }
    }
    return -1
}

export const filterPrimaryContact = (settings: any) => {
    const primaryContact = (settings?.contact?.contact_list?.wide?.items.filter((site: any) => site.isPrimary))[0]

    return primaryContact
}

//decide primary phone/email
export const decidePrimaryPhoneOrEmail = (primaryContact: any, currentLayout: SiteDataType, type = 'phone') => {
    if (primaryContact) {
        const contacts = primaryContact[type]
        if (contacts) {
            const primaryContact = contacts.filter((contact: any) => contact[`isPrimary${capitalize(type)}`])
            if (primaryContact.length > 0) {
                console.log('using primary contact', primaryContact[0])
                if (type === 'phone') {
                    return primaryContact[0].number || ''
                } else if (type === 'email') {
                    return primaryContact[0].email || ''
                }
            }
        }
    }

    // If no primary contact found, return the fallback contact from currentLayout
    return type === 'phone' ? currentLayout.phoneNumber || '' : type === 'email' ? currentLayout.email || '' : ''
}

export async function transformcontact(contactInfo: Contact) {
    const icons = {
        phone: ['fas', 'phone'],
        email: ['fas', 'envelope'],
        location: ['fas', 'location-pin'],
    }

    const newAdd = contactInfo.address?.street?.replaceAll(' ', '+')
    const mapLink = 'https://www.google.com/maps/place/' + newAdd + '+' + contactInfo.address?.zip
    const contactLinks = []
    const multiPhones = contactInfo.phone.length > 1 ? true : false
    const hideEmail = !multiPhones && contactInfo.email?.length > 1

    //create coordinates for map
    if (contactInfo.address) {
        let coords = await newAddyCoords(contactInfo.address)
        contactInfo.address = { ...contactInfo.address, coordinates: coords }
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
                }

                contactLinks.push(phone)
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
                }

                contactLinks.push(email)
            }
        }
    }

    const contactMap = {
        cName: 'map',
        link: mapLink,
        icon: icons.location,
        content: contactInfo.address?.name || '',
        active: contactInfo.address?.street ? true : false,
    }

    multiPhones ? contactLinks.unshift(contactMap) : contactLinks.push(contactMap)

    contactInfo = { ...contactInfo, address: { ...contactInfo.address, url: mapLink }, contactLinks: contactLinks, showContactBox: multiPhones }

    return contactInfo
}

export const transformNav = (menu: CMSNavItem[], siteUrl: string) => {
    for (let i = 0; i < menu.length; i++) {
        const slug = menu[i].title ? menu[i].title.replace(/\s+/g, '-') : ''

        //loop through first submenu
        for (let x = 0; x < menu[i].submenu.length; x++) {
            const subMenu1 = menu[i].submenu[x]
            if (menu[i].title) {
                const subSlug = subMenu1.title.replace(/\s+/g, '-')
                menu[i].submenu[x] = { ...subMenu1, slug: subSlug.toLowerCase(), url: subMenu1.url ? stripSiteAndUrl(subMenu1.url, siteUrl) : '' }

                //loop through second submenu
                if (menu[i].submenu[x]) {
                    for (let k = 0; k < menu[i].submenu[x].submenu.length; k++) {
                        const subMenu2 = menu[i].submenu[x].submenu[k]
                        if (subMenu2.title) {
                            const subSlug2 = subMenu2.title.replace(/\s+/g, '-')
                            menu[i].submenu[x].submenu[k] = {
                                ...subMenu2,
                                slug: subSlug2.toLowerCase(),
                                url: menu[i].submenu[x].submenu[k].url ? stripSiteAndUrl(menu[i].submenu[x]?.submenu[k].url, siteUrl) : '',
                            }
                        }
                    }
                }
            }
        }

        menu[i] = { ...menu[i], slug: slug.toLowerCase(), url: menu[i].url ? stripSiteAndUrl(menu[i].url, siteUrl) : '' }
    }

    return determineNavParent(menu)
}

export const determineNavParent = (menu: CMSNavItem[]) => {
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

export const createLinkAndButtonVariables = (
    currentItem: LunaModuleItem,
    modType: string,
    columns: number | string,
    pageModals: { modalNum: number; modalTitle: any }[]
) => {
    const btnCount = decideBtnCount(currentItem)
    const linkNoBtn = btnCount === 0 && isLink(currentItem) === true
    const isWrapLink = (btnCount === 1 || linkNoBtn) && modType != 'article' && checkModalBtn(currentItem.weblink || '', pageModals) === -1
    const visibleButton = linkAndBtn(currentItem)

    const determineBtnSize = (btnSize: string, modType: string, columns: number | string) => {
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

    const btn1isModal = checkModalBtn(currentItem.weblink || '', pageModals) > -1 ? true : false
    const btn2isModal = checkModalBtn(currentItem.weblink2 || '', pageModals) > -1 ? true : false

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
    ]

    return { linkNoBtn, btnCount, isWrapLink, visibleButton, buttonList }
}

//trying to adjust next.js image sizes depending on modules/columns
export const createImageSizes = (modType: string, columns: number | string) => {
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

export function isButton(item: LunaModuleItem) {
    if (item.actionlbl || item.actionlbl2) {
        return true
    } else {
        return false
    }
}

export function isLink(item: LunaModuleItem) {
    if (item.pagelink || item.pagelink2 || item.weblink || item.weblink2) {
        return true
    } else {
        return false
    }
}

export const isFeatureBtn = (modRenderType: string, well: string | number, btnCount: number, isFeatured?: string | boolean) => {
    if (
        well &&
        modRenderType != 'PhotoGrid' &&
        modRenderType != 'Parallax' &&
        modRenderType != 'PhotoGallery' &&
        isFeatured === 'active' &&
        btnCount === 1 &&
        modRenderType != 'PhotoGallery'
    ) {
        console.log
        return true
    } else {
        return false
    }
}

export const createTsiImageLink = (cmsUrl: string, imgUrl: string) => {
    let imageUrl = 'http://' + cmsUrl + imgUrl
    return encodeURI(imageUrl)
}

export const createFavLink = (cmsUrl: string, fav: string) => {
    let stripPath = stripImageFolders(fav)
    let fullUrl = cmsUrl + stripPath
    return fullUrl
}

export function decideBtnCount(currentItem: LunaModuleItem) {
    if (
        (currentItem.actionlbl && !currentItem.actionlbl2 && (currentItem.pagelink || currentItem.weblink)) ||
        (!currentItem.actionlbl && currentItem.actionlbl2 && (currentItem.pagelink2 || currentItem.weblink2))
    ) {
        return 1
    } else if (
        currentItem.actionlbl &&
        currentItem.actionlbl2 &&
        (currentItem.pagelink || currentItem.weblink) &&
        (currentItem.pagelink2 || currentItem.weblink2)
    ) {
        return 2
    } else if (!currentItem.actionlbl && !currentItem.actionlbl2) {
        return 0
    } else {
        return 0
    }
}

export function linkAndBtn(currentItem: LunaModuleItem) {
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

export function isGridCaption(item: LunaModuleItem) {
    if (item.pagelink || item.pagelink2 || item.weblink || item.weblink2 || item.headline || item.subheader) {
        return true
    } else {
        return false
    }
}

export function capitalize(str: string) {
    if (!str) {
        return ''
    }

    return str[0].toUpperCase() + str.slice(1)
}

export const transformLogos = (logos: Logo, cmsUrl: string) => {
    //change logo sources
    function transformLogoSlots(slots: Slot[]) {
        for (const x in slots) {
            if (slots[x].image_src) {
                slots[x].image_src = createTsiImageLink(cmsUrl, slots[x].image_src || '')
            }
        }
        return slots
    }

    logos.header.slots = transformLogoSlots(logos.header.slots)
    logos.footer.slots = transformLogoSlots(logos.footer.slots)
    logos.mobile.slots = transformLogoSlots(logos.mobile.slots)

    const transformedLogos = removeFieldsFromObj(logos, ['list', 'fonts'])

    return transformedLogos
}

export const transformPageSeo = (pageSeo: PageSeo) => {
    return {
        title: pageSeo.title || '',
        descr: pageSeo.descr || '',
        selectedImages: pageSeo.selectedImages || '',
        imageOverride: pageSeo.imageOverride || '',
    }
}

//fields to possibly remove
export const removeFieldsFromObj = (obj: any, fields: any[]) => {
    for (let i = 0; i < fields.length; i++) {
        const field = fields[i]
        if (obj.hasOwnProperty(field)) {
            delete obj[field]
        }
    }
    return obj
}

export const createGallerySettings = (settings: CarouselSettings, blockSwitch1: string | number, type: string) => {
    //convert to numbers
    const interval = Number(settings.interval) * 1000
    const restartDelay = Number(settings.restartdelay)

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

export const transformLinksInItem = (item: LunaModuleItem) => {
    item = { ...item, links: transformItemLinks(item) }
    item = removeFieldsFromObj(item, ['pagelink', 'weblink', 'weblink2', 'pagelink2'])

    return item
}

const transformItemLinks = (item: LunaModuleItem) => {
    return {
        pagelink: item.pagelink || '',
        pagelink2: item.pagelink2 || '',
        weblink: item.weblink || '',
        weblink2: item.weblink2 || '',
    }
}

export const createModalPageList = (modules: any[]) => {
    let pageModals = []
    let modalNum = 0
    for (let i in modules) {
        if (Object.keys(modules[i]).length != 0) {
            for (const [key, pageModule] of Object.entries<Record<string, any>>(modules[i])) {
                //for (const pageModule in value.data.modules[i]) {
                if (pageModule && Object.entries(pageModule).length != 0) {
                    //console.log('type of check', typeof pageModule)
                    if (pageModule.type === 'modal_1') {
                        let autoOpen = false

                        if (pageModule.well == '1') {
                            autoOpen = true
                        }
                        for (let m in pageModule.items) {
                            if (pageModule.items[m].autoOpen === true) {
                                autoOpen = true
                            }
                        }
                        pageModals.push({
                            modalNum: modalNum,
                            modalTitle: pageModule.title || '',
                            autoOpen: autoOpen,
                            openEveryTime: false,
                        })
                        pageModule.modalNum = modalNum
                        modalNum += 1
                    }
                }
            }
        }
    }
    return pageModals
}

export const alternatePromoColors = (items: LunaModuleItem[], themeStyles: ThemeStyles, well: string) => {
    const colorList = Array(items.length).fill(['var(--promo)', 'var(--promo2)', 'var(--promo3)', 'var(--promo4)', 'var(--promo5)']).flat()

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
        .flat()

    for (let i = 0; i < items.length; i++) {
        if (!items[i].image) {
            items[i] = { ...items[i], promoColor: colorList[i], textureImage: well == '1' ? textureImageList[i] : '' }
        } else {
            items[i] = { ...items[i], promoColor: colorList[i] }
        }
    }

    return items
}

export const isPromoButton = (item: LunaModuleItem, modType: string, btnNum: number) => {
    if ((modType === 'Parallax' || modType === 'Banner') && item.modColor1 && btnNum === 1) {
        return 'btn_override'
    } else if ((modType === 'Parallax' || modType === 'Banner') && item.modColor1 && btnNum === 2) {
        return 'btn2_override'
    } else if (
        btnNum === 1 &&
        ((modType === 'PhotoGrid' && !item.image) || (modType === 'Parallax' && !item.image) || (modType === 'PhotoGallery' && !item.image))
    ) {
        return 'btn_promo'
    } else if (btnNum === 1 && modType === 'Banner' && !item.image) {
        return 'btn_promo'
    } else if (btnNum === 1) {
        return 'btn_1'
    } else {
        return 'btn_2'
    }
}

export const setColors = (cmsColors: any, cmsTheme: string) => {
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

export const getColumnsCssClass = (page: CMSPage) => {
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

export const createFontCss = (fonts: any, siteType = 'website') => {
    let fontImportGroup
    let fontClasses

    if (Object.keys(fonts).length === 0) {
        fontImportGroup = ''
        fontClasses = ''
    } else {
        const headlineFont = fonts.list[fonts.sections.hdrs.value]
        const bodyFont = fonts.list[fonts.sections.body.value]
        const featuredFont = fonts.list[fonts.sections.feat.value]

        return createFontImport(headlineFont, bodyFont, featuredFont, siteType)
    }
    return { fontImportGroup, fontClasses }
}

export const createFontImport = (headlineFont: FontType, bodyFont: FontType, featuredFont: FontType, siteType: string) => {
    const fontTypes = [headlineFont.google, bodyFont.google, featuredFont.google]
    const uniqueFontGroup = removeDuplicatesArray(fontTypes)
    if (siteType === 'landing') {
        uniqueFontGroup.push('Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0')
    }
    console.log('unique font group', uniqueFontGroup)
    const fontImportGroup = `@import url(https://fonts.googleapis.com/css?family=${uniqueFontGroup.join('|')}&display=swap);`
    const fontClasses = ` body {font-family:${bodyFont.label}}
.hd-font{font-family:${headlineFont.label}} 
.txt-font{font-family:${bodyFont.label}}
.feat-font{font-family:${featuredFont.label}}
`
    return { fontImportGroup, fontClasses }
}

export async function fetchCoordinates(address: any) {
    const url = `https://nominatim.openstreetmap.org/search?street=${address.street}&city=${address.city}&state=${address.state}&postalcode${address.zip}&format=json`
    try {
        const resCoords = await fetch(encodeURI(url))
        const coords = await resCoords.json()
        return { lat: coords[0].lat, long: coords[0].lon }
    } catch (err) {
        console.log('map coordinates error')
        return { lat: 0, long: 0 }
    }
}

export const newAddyCoords = async (addy: any) => {
    let mapCoords
    if (addy.zip && addy.state && addy.city) {
        mapCoords = await fetchCoordinates(addy)
        console.log(mapCoords)
    } else {
        mapCoords = { lat: '', long: '' }
    }
    return mapCoords
}

//reuseables
export const removeDuplicatesArray = (arr: any[]) => {
    let uniqueArr = arr.filter((c, index) => {
        return arr.indexOf(c) === index
    })
    return uniqueArr
}

export const convertSpecialTokens = (str: string, type = 'desc') => {
    //const removedBreak = str.replaceAll('[rn]', '\n')
    const removedBreak = type === 'desc' ? str.replaceAll('[rn]', '<br>') : str.replaceAll('[rn]', '\n')
    const removedBlank = removedBreak.replaceAll('[t]', ' ')
    const removedParenthesis = removedBlank.replaceAll('&quot;', "'")

    return removedParenthesis
}

export const replaceKey = (value: Record<any, any>, oldKey: string, newKey: string) => {
    if (oldKey !== newKey && value[oldKey]) {
        value[newKey] = value[oldKey]
        //Object.defineProperty(value, newKey, Object.getOwnPropertyDescriptor(value, oldKey))
        delete value[oldKey]
    } else if ([oldKey]) {
        console.log('key is not in obj')
    }

    return { ...value }
}

//Need to wrap <p> tags around text that does not contain list tags
export function wrapTextWithPTags(text: string) {
    text = text.replace(/\n/g, '[rn]')

    //skip p tag insert here
    if (text.startsWith('<') || text.includes('<a')) {
        return text
    }

    // Match text outside of html tags
    const regex = /(<\/?(ul|ol|b|div|span|i|a|li)[^>]*>)|([^<]+)/gi

    // Split the text based on the regex and process each part
    const parts = text.split(regex)

    // Initialize a flag to keep track of whether we're inside <ul> or <ol> tags
    let insideList = false

    //tags we want to include
    const tags = ['ul', 'ol', 'b', 'div', 'span', 'i', 'a', 'li']

    // Process each part and wrap text in <p> tags if not inside a list
    const result = parts.map((part) => {
        const lowerCasePart = part?.toLowerCase()
        //console.log(part)
        if (
            lowerCasePart === '<ul>' ||
            lowerCasePart === '<ol>' ||
            lowerCasePart === '<b>' ||
            lowerCasePart === '<i>' ||
            lowerCasePart === '<div>' ||
            lowerCasePart === '<span>' ||
            lowerCasePart?.includes('<a') ||
            lowerCasePart === '<li>'
            //tags.includes(`<${lowerCasePart}>`)
        ) {
            insideList = true
            return lowerCasePart
        } else if (
            lowerCasePart === '</ul>' ||
            lowerCasePart === '</ol>' ||
            lowerCasePart === '</b>' ||
            lowerCasePart === '</div>' ||
            lowerCasePart === '</span>' ||
            lowerCasePart === '</i>' ||
            lowerCasePart === '</a>' ||
            lowerCasePart === '</li>'
            //tags.includes(`</${lowerCasePart}>`)
        ) {
            insideList = false
            return lowerCasePart
        } else if (part === undefined || part === '' || part === ' ' || tags.includes(lowerCasePart)) {
            return ''
        } else if (!insideList && part != ' ' && part?.trim() !== '') {
            return `<p>${part}</p>`
        }
        return part
    })

    //const removedUnwrapped = removeUnwrappedLists(result.join(''))
    const removedUnwrapped = result.join('')
    return removedUnwrapped
}

function processImageTag(desc: string, cmsUrl: string) {
    // Regular expression to match <img> tag
    var imgRegex = /<img([^>]*)src\s*=\s*["']([^"']*)["']([^>]*)>/g

    // Function to replace the src attribute
    function replaceSrc(match: any, p1: string, p2: string, p3: string) {
        // Add the string variable to the beginning of the src value
        var newSrc = cmsUrl + p2
        return '<img' + p1 + 'src="' + 'http://' + newSrc + '"' + p3 + '>'
    }

    // Use replace function with the defined callback
    var processedDesc = desc.replace(imgRegex, replaceSrc)

    return processedDesc
}

export const convertDescText = (desc: string) => {
    const wrappedText = wrapTextWithPTags(desc)
    let convertedDesc = convertSpecialTokens(wrappedText)

    //const convertedImages = processImageTag(convertedDesc, cmsUrl)
    return convertedDesc
}

export const seperateScriptCode = (customPageCode: string, pageSlug?: string) => {
    let pageCss = ''
    let styleMatchReg = /<style[^>]*>([^<]+)<\/style>/gi
    let nextMatch = styleMatchReg.exec(customPageCode)
    let cssStringArray = []
    while (nextMatch != null) {
        cssStringArray.push(nextMatch[1])
        nextMatch = styleMatchReg.exec(customPageCode)
    }

    const codeWithoutStyles = customPageCode.replace(styleMatchReg, '')

    const cssString = convertSpecialTokens(cssStringArray.join(' '), 'code')

    if (cssString) {
        pageCss = pageSlug
            ? `.page-${pageSlug} {
            ${cssString} 
        }`
            : cssString
    }

    return { css: pageCss || '', scripts: convertSpecialTokens(codeWithoutStyles, 'code') || '' }
}

const createHeaderCtaBtns = (btnList: any[]) => {
    const headerBtns = []
    for (let n = 0; n < btnList.length; n++) {
        const currentBtn = btnList[n]

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
        })
    }
    return headerBtns
}

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
    ]

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
    ]

    const headerBtns = createHeaderCtaBtns(ctaBtns)
    const mobileHeaderBtns = createHeaderCtaBtns(mobileCtaBtns)

    return { ctaBtns: headerBtns, hideNav: true, hideSocial: true, mobileHeaderBtns: mobileHeaderBtns }
}

export function removeWhiteSpace(str: string) {
    return str.replace(/\s+/g, '')
}

export const createRandomFiveCharString = (): string => {
    return Math.random().toString(36).substring(2, 7)
}

//check if there is a domain that has been randomly generated in list of publishedDomains (5 is the current random generated amount)
export const checkApexIDInDomain = (checkingDomain: string, domainOptions: DomainOptions, postfix: string): boolean => {
    const apexAndHyphen = domainOptions.domain + '-'

    if (checkingDomain.includes(apexAndHyphen)) {
        //check for -lp domains
        if (checkingDomain === apexAndHyphen + 'lp' + postfix) {
            return true
        }

        //check for -(random gen) URLs
        const regex = new RegExp(`${apexAndHyphen}.{5}\\${postfix}`)
        return regex.test(checkingDomain)
    }

    return false
}

export const getPageNameFromDomain = (domain: string) => {
    const domainSplit = domain.split('/')
    if (domainSplit.length <= 1) {
        return 'no page name'
    }
    const pageName = domainSplit[domainSplit.length - 1]
    return pageName
}

export function generateAccessToken(length = 16) {
    //string will be double the length param
    return crypto.randomBytes(length).toString('hex')
}
