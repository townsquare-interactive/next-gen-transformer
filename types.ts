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
    }
    attrs: {}
    seo: {
        title: null | string
        descr: null | string
        selectedImages: null | string
        imageOverride: null | string
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
    assets: { url: string; fileName: string }[]
    globalStyles: string
}
