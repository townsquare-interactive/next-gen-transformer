export interface Page {
    data: {
        id: string
        title: string
        slug: string
        pageType: string
        url: string
        JS: string
        type: string
        layout: number
        columns: number
        modules: Module[][]
        sections: Section[]
        hideTitle: boolean
        head_script: string
        columnStyles: string
        page_type?: string
    }
    attrs: {}
    seo: {
        title: string
        descr: string
        selectedImages: string
        imageOverride: string
    }
}

interface Module {
    attributes: {
        title: string
        class: string
        align: string
        imgsize: string
        columns: string
        type: string
        well: string
        lightbox: string
        lazy: string
        blockSwitch1?: number
        blockField1?: string
        blockField2: string
        scale_to_fit: string
        export: number
        items: Item[]
        id: string
        modId: string
        modCount: number
        columnLocation: number
        isSingleColumn: boolean
    }
    componentType: string
}

interface Item {
    id: string
    headline: string
    subheader: string
    image: string
    captionOn: string
    icon?: string
    icon2?: string
    icon3?: string
    bkgrd_color?: string
    btnType: string
    btnType2: string
    btnSize: string
    btnSize2: string
    desc?: string
    pagelink?: string
    weblink?: string
    actionlbl?: string
    newwindow?: string
    pagelink2?: string
    weblink2?: string
    actionlbl2?: string
    newwindow2?: string
    align?: string
    isFeatured: string
    isPlugin?: string
    headerTag: string
    plugin?: string
    disabled: string
    pagelinkId?: string
    pagelink2Id?: string
    buttonList: Button[]
    linkNoBtn: boolean
    twoButtons: boolean
    isWrapLink: boolean
    visibleButton: boolean
    isBeaconHero: boolean
    imagePriority: boolean
    itemCount: number
    btnStyles: string
    nextImageSizes?: string
}

interface Button {
    name: string
    link: string
    window: string
    label: string
    active: boolean
    btnType: string
    btnSize: string
    linkType: string
    blockBtn: boolean
}

export interface ThemeStyles {
    logoColor: string
    headingColor: string
    subHeadingColor: string
    textColor: string
    linkColor: string
    linkHover: string
    btnText: string
    btnBackground: string
    textColorAccent: string
    heroSubheadline: string
    heroText: string
    heroBtnText: string
    heroBtnBackground: string
    heroLink: string
    heroLinkHover: string
    captionText: string
    captionBackground: string
    NavText: string
    navHover: string
    navCurrent: string
    backgroundMain: string
    bckdContent: string
    headerBackground: string
    BckdHeaderSocial: string
    accentBackgroundColor: string
    backgroundHero: string
    footerBackground: string
    footerText: string
    footerLink: string
    promoText: string
    promoColor: string
    promoColor2: string
    promoColor3: string
    promoColor4: string
    promoColor5: string
    promoColor6: string
}

interface Section {
    wide: string
}

interface Logo {
    fonts: any[]
    footer: {
        pct: null | number
        slots: Slot[]
        activeSlots: number[]
    }
    header: {
        pct: number | null
        slots: Slot[]
        activeSlots: number[]
    }
    mobile: {
        pct: null | number
        slots: Slot[]
        activeSlots: number[]
    }
    list: {
        [key: number]: string
    }
}

interface Slot {
    show?: number
    type: string
    markup?: string
    hasLinks?: boolean
    alignment: string
    image_src: string
    image_link: string
}

interface Contact {
    email: Email[]
    hours: {
        friday: string
        monday: string
        sunday: string
        tuesday: string
        saturday: string
        thursday: string
        wednesday: string
    }
    phone: Phone[]
    address: {
        zip: string
        city: string
        name: string
        state: string
        street: string
        street2: string
    }
    hideZip: boolean
    advanced: {
        lat: string
        long: string
    }
    disabled: string
    hideCity: boolean
    hideState: boolean
    isPrimary: boolean
    hideAddress: boolean
    displayInMap: boolean
    hideAddress2: boolean
    displayInFooter: boolean
    contactLinks: ContactLink[]
    showContactBox: boolean
}

interface Email {
    name: string
    email: string
    disabled: string
    isPrimaryEmail: boolean
}

interface Phone {
    name: string
    number: string
    disabled: string
    isPrimaryPhone: boolean
}

interface ContactLink {
    cName: string
    link: string
    icon: string[]
    content: string
    active: boolean
}

interface Composite {
    type: string
    layout: null | any
    columns: number
    modules: {
        type: string
        items: Item[]
    }
    sections: null | any
}

interface Item {
    title: string
    nav_menu: number
    component: string
}

interface CmsColors {
    logoColor: string
    headingColor: string
    subHeadingColor: string
    textColor: string
    linkColor: string
    linkHover: string
    btnText: string
    btnBackground: string
    textColorAccent: string
    heroSubheadline: string
    heroText: string
    heroBtnText: string
    heroBtnBackground: string
    heroLink: string
    heroLinkHover: string
    captionText: string
    captionBackground: string
    NavText: string
    navHover: string
    navCurrent: string
    backgroundMain: string
    bckdContent: string
    headerBackground: string
    BckdHeaderSocial: string
    accentBackgroundColor: string
    backgroundHero: string
    footerBackground: string
    footerText: string
    footerLink: string
    promoText: string
    promoColor: string
    promoColor2: string
    promoColor3: string
    promoColor4: string
    promoColor5: string
    promoColor6: string
}

interface Config {
    mailChimp: {
        audId: string
        datacenter: string
    }
    zapierUrl: string
    makeUrl: string
}

export interface SiteData {
    logos: Logo
    social: any[]
    contact: Contact
    siteName: string
    url: string
    composites: {
        footer: Composite
    }
    cmsColors: CmsColors
    theme: string
    cmsUrl: string
    s3Folder: string
    favicon: string
    fontImport: string
    config: Config
}

export interface PublishData {
    siteIdentifier: string
    siteLayout: SiteData
    pages: Page[]
    assets: { url: string; fileName: string; name: string; content: string }[]
    globalStyles: string
}

export interface Layout {
    logos: {
        fonts: any[]
        footer: {
            pct: number
            slots: {
                show: number
                type: string
                markup: string
                hasLinks: boolean
                alignment: string
                image_src: string
                image_link: string
                image_link_ext?: string
            }[]
            activeSlots: number[]
        }
        header: {
            pct: number
            slots: {
                show: number
                type: string
                markup: string
                hasLinks: boolean
                alignment: string
                image_src: string
                image_link: string
            }[]
            activeSlots: number[]
        }
        mobile: {
            pct: number
            slots: {
                show: number
                type: string
                markup: string
                hasLinks: boolean
                alignment: string
                image_src: string
                image_link: string
                image_link_ext?: string
            }[]
            activeSlots: number[]
        }
        list: { [key: string]: string }
    }
    social: {
        id: number
        name: string
        format: string
        label: string
        value: string
        enabled: number
        input: [string, string]
        url: string
        icon: [string, string]
    }[]
    contact: {
        email: {
            name: string
            email: string
            disabled: string
            isPrimaryEmail: boolean
        }[]
        hours: {
            friday: string
            monday: string
            sunday: string
            tuesday: string
            saturday: string
            thursday: string
            wednesday: string
        }
        phone: {
            name: string
            number: string
            disabled: string
            isPrimaryPhone: boolean
        }[]
        address: {
            zip: string
            city: string
            name: string
            state: string
            street: string
            street2: string
        }
        hideZip: boolean
        advanced: {
            lat: string
            long: string
        }
        disabled: string
        hideCity: boolean
        hideState: boolean
        isPrimary: boolean
        hideAddress: boolean
        displayInMap: boolean
        hideAddress2: boolean
        displayInFooter: boolean
        selectedPrimaryEmailLabel: string
        selectedPrimaryPhoneLabel: string
        selectedPrimaryPhoneNumber: string
        selectedPrimaryEmailAddress: string
        contactLinks: {
            cName: string
            link: string
            icon: [string, string]
            content: string
            active: boolean
        }[]
        showContactBox: boolean
    }
    siteName: string
    phoneNumber: string
    email: string
    url: string
    composites: {
        footer: {
            type: string
            layout: null
            columns: number
            modules: {
                type: string
                items: {
                    text: string
                    title: string
                    filter: boolean
                    component: string
                    nav_menu?: number
                }[]
            }
            sections: null
        }
    }
    cmsNav: {
        ID: number
        menu_list_id: number
        title: string
        post_type: string
        type: string | null
        menu_item_parent: number | string
        object_id: number
        object: string
        target: null
        classes: null
        menu_order: number
        mi_url: null
        url: string
        disabled: boolean
        submenu: {
            ID: number
            menu_list_id: number
            title: string
            post_type: string
            type: string
            menu_item_parent: number
            object_id: number
            object: string
            target: null
            classes: null
            menu_order: number
            mi_url: null
            url: string
            disabled: boolean
            submenu: never[]
            slug: string
        }[]
        slug: string
    }[]
    seo: {
        global: {
            aiosp_page_title_format: string
            aiosp_description_format: string
            aiosp_404_title_format: string
        }
    }
    cmsColors: ThemeStyles
    theme: string
    cmsUrl: string
    s3Folder: string
    favicon: string
    fontImport: string
    config: {
        mailChimp: {
            audId: string
            datacenter: string
            auth: string
        }
        zapierUrl: string
        makeUrl: string
    }
}

export interface CMSPage {
    data: {
        id: string
        title: string
        slug: string
        pageType: string
        url: string
        JS: string
        type: string
        layout: number
        columns: number
        modules: Module[][]
        sections: Section[]
        hideTitle: boolean
        head_script: string
        columnStyles: string
        page_type: string
    }
    attrs: {}
    seo: {
        title: string
        descr: string
        selectedImages: string
        imageOverride: string
    }
    head_script?: string
    JS?: string
    title: string
    slug: string
    page_type: string
    url: string
    id: string
}

export interface LunaModuleItem {
    id: string
    desc: string
    image: string
    plugin: string
    weblink: string
    disabled: string
    headline: string
    isPlugin: string
    pagelink: string
    actionlbl: string
    headerTag: string
    imageSize: any
    newwindow: string
    pagelink2: string
    subheader: string
    isFeatured: string
    pagelinkId: string
    pagelink2Id: string
}

export interface LunaModuleSettings {
    effect: string
    autoplay: string
    interval: string
    pauseonhover: string
    restartdelay: string
}

export interface LunaModule {
    uid: string
    lazy: string
    type: string
    well: string
    align: string
    class: string
    items: ModuleItem[]
    title: string
    export: number
    columns: string
    imgsize: string
    lightbox: string
    settings: LunaModuleSettings
    blockSwitch1: number
    scale_to_fit: string
}

/*------------------------ Strapi Types ------------------------------------ */
interface Entry {
    id: number
    name: string
    slug: string
    createdAt: string
    updatedAt: string
    publishedAt: string
    homePage: boolean
    ai: null | any
    Body: Array<CurrentModule>
    seo: null | any
}

export interface Request {
    event: string
    createdAt: string
    model: string
    uid: string
    entry: Entry
}

export interface ModuleItem {
    id: number
    headline?: string
    desc?: string
    align?: string
    headerTagH1?: boolean
    isFeatured?: boolean
    disabled?: boolean
    headSize?: string
    descSize?: string
    subheader?: null | string
    //image?: { alternativeText: string; url: string; caption: string }[]
    image?: any
    buttons?: {
        pagelink?: string
        extlink?: string
        text?: string
        ext?: boolean
        weblink?: string
        pagelink2?: string
        weblink2?: string
        actionlbl?: string
        actionlbl2?: string
        btnSize?: string
        btnSize2?: string
        newwindow?: boolean
        newwindow2?: boolean
    }[]
    plugin?: string
    linkNoBtn?: boolean
    twoButtons?: boolean
    isWrapLink?: boolean
    visibleButton?: boolean
    buttonList?: any[]
    caption_tag?: string
    img_alt_tag?: string
    stars?: string
    actionlbl?: string | number
    modColor1?: string
    modOpacity?: number
    headerTag?: string
    itemCount?: number
    modSwitch1?: number
}

/*   interface Button {
    // Add button properties here
    // Specify the property names and types according to your requirements
  } */

export interface CurrentModule {
    __component: string
    id: number | string
    border: boolean
    lazyload: boolean
    imgsize: string
    columns?: string | number
    title?: string
    disabled: boolean
    useAnchor: boolean
    items: ModuleItem[]
    formTitle?: string
    email?: string
    contactFormData?: any
    useCarousel?: boolean
    settings?: CarouselSettings
    blockSwitch1?: string
    type?: string
    imageOverlay?: boolean
    modId?: string | number
    imagePriority?: boolean
    well?: string
    modCount?: number
    //attributes: CurrentModule
    componentType?: string
}
export interface CarouselSettings {
    autoplay: boolean
    pauseOnHover: boolean
    effect: string
    animation: string
    interval: number
    restartDelay: number
    halfSize?: boolean
    mobileResize: boolean
}
