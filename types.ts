import { CompositeData } from './src/schema/output-zod'

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
        hideTitle: number | boolean
        head_script: string
        columnStyles: string
        page_type?: string
    }
    attrs: {}
    seo: PageSeo
}

interface Module {
    attributes: {
        title?: string
        class?: string
        align?: string
        imgsize?: string
        columns: number
        type: string
        well?: string
        lightbox?: string
        lazy?: string
        blockSwitch1?: number
        blockField1?: string
        blockField2?: string
        scale_to_fit?: string
        export?: number
        items: Item[]
        id: string
        modId: string
        modCount: number
        columnLocation?: number
        isSingleColumn?: boolean
    }
    componentType: string
    title?: string
}

interface Item {
    id?: string
    headline?: string
    subheader?: string
    image?: string
    captionOn?: string
    icon?: string
    icon2?: string
    icon3?: string
    bkgrd_color?: string
    btnType?: string
    btnType2?: string
    btnSize?: string
    btnSize2?: string
    desc?: string
    pagelink?: string
    weblink?: string
    actionlbl?: string | number
    newwindow?: string | number
    pagelink2?: string
    weblink2?: string
    actionlbl2?: string
    newwindow2?: string | number
    align?: string
    isFeatured?: string
    isPlugin?: string
    headerTag?: string
    plugin?: string
    disabled?: boolean | string
    pagelinkId?: string | number
    pagelink2Id?: string | number
    buttonList?: Button[]
    linkNoBtn?: boolean
    btnCount?: number
    isWrapLink?: boolean
    visibleButton?: boolean
    isBeaconHero?: boolean
    imagePriority?: boolean
    itemCount?: number
    btnStyles?: string
    nextImageSizes?: string
}

interface Button {
    name: string
    link?: string
    window?: string | number
    label?: string
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
    footerTextOverride?: string
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

export interface Logo {
    fonts?: any[]
    footer: LogoBlock
    header: LogoBlock
    mobile: LogoBlock
    list?: {
        [key: number]: string
    }
}

export interface Slot {
    show?: number
    type?: string
    markup?: string
    hasLinks?: boolean
    alignment?: string
    image_src?: string
    image_link?: string
}

export interface Address {
    zip: string
    city: string
    name?: string
    state: string
    street: string
    street2?: string
    coordinates?: { lat: string | number; long: string | number }
    url?: string
}

export interface Contact {
    email: any
    hours?: {
        friday: string
        monday: string
        sunday: string
        tuesday: string
        saturday: string
        thursday: string
        wednesday: string
    }
    phone: Phone[]
    address: Address
    hideZip?: boolean
    advanced?: {
        lat: string
        long: string
    }
    disabled?: boolean | string
    hideCity?: boolean
    hideState?: boolean
    isPrimary?: boolean
    hideAddress?: boolean
    displayInMap?: boolean
    hideAddress2?: boolean
    displayInFooter?: boolean
    contactLinks?: ContactLink[]
    showContactBox?: boolean
}

export interface Attributes {
    city: string
    zip: string
    state: string
    streetAddress: string
    phone: Phone[]
    email: Email[]
    name?: string
}

export interface Email {
    name: string
    email: string
    disabled: string
    isPrimaryEmail: boolean
}

export interface Phone {
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
    layout: any
    columns: number
    modules: {
        type: string
        items: CompositeItem[]
    }
    sections: any
}

interface CompositeItem {
    title: string
    nav_menu: any
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
    mailChimp?: {
        audId: string
        datacenter: string
    }
    zapierUrl?: string
    makeUrl?: string
}

export interface SiteData {
    logos: Logo
    social: any[]
    contact: Contact
    siteName: string
    url: string
    composites?: CompositeData
    cmsColors: ThemeStyles
    theme: string
    cmsUrl: string
    s3Folder: string
    favicon: string
    fontImport: string
    config: Config
    allStyles?: string
    siteType?: string
}

export interface PublishData {
    siteIdentifier: string
    usingPreviewMode?: boolean
    siteLayout: SiteData
    pages?: Page[]
    assets?: { url?: string; fileName: string; name?: string; content?: string }[]
    globalStyles?: GlobalStyles
}

export interface GlobalStyles {
    custom: string
    global: string
}

interface LogoBlock {
    pct?: number
    slots: Slot[]
    activeSlots?: number[]
}

export interface Layout {
    logos: {
        fonts: any[]
        footer: LogoBlock
        header: LogoBlock
        mobile: LogoBlock
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
    contact: Contact
    siteName: string
    phoneNumber: string
    email: string
    url: string
    /*     composites: {
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
    } */
    composites: CompositeData
    cmsNav: CMSNavItem[]
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
    config: Config
    publishedDomains: string[]
    published?: boolean
    allStyles: string
}

export interface CMSNavItem {
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
    disabled: boolean | string
    slug: string
    submenu: {
        ID: number
        menu_list_id: number
        title: string
        post_type: string
        type: string
        menu_item_parent: number
        object_id: number
        object?: string
        target?: string
        classes?: string
        menu_order: number
        mi_url?: string
        url: string
        disabled?: boolean
        submenu: any[]
        slug: string
    }[]
}

export interface PageSeo {
    title?: string
    descr?: string
    selectedImages?: string
    imageOverride?: string
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
        hideTitle: number | boolean
        head_script: string
        columnStyles: string
        page_type?: string
    }
    attrs: {}
    seo: PageSeo
    head_script?: string
    JS?: string
    title: string
    slug: string
    page_type?: string
    url: string
    id: string
    sections: Section[]
}

export interface LunaModuleItem {
    id: string | number
    title?: string
    desc?: string
    image?: string
    plugin?: string
    weblink?: string
    weblink2?: string
    disabled?: string | boolean
    headline?: string
    isPlugin?: boolean
    pagelink?: string
    actionlbl?: string | number
    actionlbl2?: string
    headerTag?: string
    imageSize?: any
    newwindow?: string | number
    newwindow2?: string | number
    pagelink2?: string
    subheader?: string
    isFeatured?: string | boolean
    pagelinkId?: string | number
    pagelink2Id?: string | number
    icon?: string
    icon2?: string
    icon3?: string
    btnType?: string
    btnSize?: string
    btnType2?: string
    btnSize2?: string
    promoColor?: string
    modColor1?: string
    textureImage?: { gradientColors: string[] }
    modOpacity?: number
    itemStyle?: {}
    captionStyle?: any
    extraItemSettings?: extraItemSettings
    useAnchor?: boolean
    links?: {
        pagelink: string
        weblink: string
        pagelink2?: string
        weblink2?: string
    }
    buttonList?: Button[]
    imageType?: 'crop' | 'nocrop'
    imageIcon?: any
    linkNoBtn?: boolean
}

export interface LunaModuleSettings {
    effect: string
    autoplay: string | number
    interval: string
    pauseonhover: string | number
    restartdelay: string
    animation: string
}

export interface LunaModule {
    uid: string
    lazy: string
    type: string
    well: string
    align: string
    class: string
    items: ModuleItem[] | LunaModuleItem[]
    title: string
    export: number
    columns: string | number
    imgsize: string
    lightbox: string
    settings: CarouselSettings
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
    Body: CurrentModule[]
    seo: null | any
}

export interface Request {
    event: string
    createdAt: string
    model: string
    uid: string
    entry: Entry
}

export interface ModuleItem extends LunaModuleItem {
    id: number | string
    headline?: string
    desc?: string
    align?: string
    headerTagH1?: boolean
    isFeatured?: string | boolean
    disabled?: boolean | string
    headSize?: string
    descSize?: string
    subheader?: string
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
        actionlbl?: string | number
        actionlbl2?: string
        btnSize?: string
        btnSize2?: string
        newwindow?: boolean
        newwindow2?: boolean
    }[]
    plugin?: string
    linkNoBtn?: boolean
    //twoButtons?: boolean
    btnCount?: number
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
    imagePriority?: boolean
    isBeaconHero?: boolean
    isFeatureButton?: boolean
    btnStyles?: string
    nextImageSizes?: string
    contactFormData?: any
    video?: { src: string; method: string }
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
    disabled: boolean | string
    useAnchor: boolean
    items: ModuleItem[]
    formTitle?: string
    email?: string
    contactFormData?: any
    useCarousel?: boolean
    settings?: CarouselSettings
    blockSwitch1?: number
    type?: string
    imageOverlay?: boolean
    modId?: string | number
    imagePriority?: boolean
    well?: string
    modCount?: number
    //attributes: CurrentModule
    componentType?: string
    address?: Address
    anchorLink?: string
    extraSettings: {
        border: boolean
        lazyload: boolean
        imgsize: string
        columns?: string | number
    }
}
export interface CarouselSettings {
    autoplay?: number | string | boolean
    pauseonhover?: number | string | boolean
    pauseOnHover?: number | string | boolean
    effect?: string
    animation?: string
    interval?: number
    halfSize?: boolean
    mobileResize?: boolean
    restartdelay?: number
    restartDelay?: number
}

export interface extraItemSettings {
    headSize?: string
    descSize?: string
    isFeatured?: string
    headerTagH1?: boolean
    disabled?: boolean
}

export type anchorTags = { title?: string; url?: string; menu_item_parent?: number }[]

////Strapi Pages
interface ImageFormat {
    name: string
    hash: string
    ext: string
    mime: string
    path: null
    width: number
    height: number
    size: number
    url: string
}

interface ImageData {
    id: number
    attributes: {
        name: string
        alternativeText: null
        caption: null
        width: number
        height: number
        formats: {
            thumbnail: ImageFormat
            small: ImageFormat
            medium: ImageFormat
            large: ImageFormat
        }
        hash: string
        ext: string
        mime: string
        size: number
        url: string
        previewUrl: null
        provider: string
        provider_metadata: null
        createdAt: string
        updatedAt: string
    }
}

interface ParallaxItem {
    id: number
    headline: string | null
    subheader: string | null
    desc: string | null
    disabled: boolean
    align: string | null
    image: { data: ImageData[] }
    buttons: any[] // Update this with the correct button type if available
    extraItemSettings: {
        id: number
        headSize: null
        descSize: null
        isFeatured: boolean
        headerTagH1: boolean
        disabled: boolean
    }
}

/*   interface ModuleItem {
    id: number;
    __component: string;
    title: string | null;
    columns?: string;
    disabled: boolean;
    useAnchor?: boolean;
    items: ParallaxItem[];
    extraSettings: {
      id: number;
      lazyload: boolean;
      border: boolean;
      imgsize: string;
    };
    Body: any[]; // Update this with the correct module type if available
  } */

export interface StrapiPageData {
    data: {
        id: number
        attributes: {
            name: string
            slug: string
            createdAt: string
            updatedAt: string
            publishedAt: string
            homePage: boolean
            ai: any // Update this with the correct type if available
            Body: CurrentModule[]
            seo: any // Update this with the correct type if available
        }
    }[]
}

export interface LunaRequest {
    body: {
        savedData: {
            pages?: CMSPage
            navs?: any
            favicon?: string
            deletePages?: CMSPage[]
            colors?: ColorsObject
            fonts?: Fonts
            code?: { CSS: string }
        }
        siteData: LunaSiteData
    }
}
interface ColorsObject {
    [key: string]: Color
}

interface Color {
    key: string
    type: string
    label: string
    value: string
}

interface LunaSiteData {
    vars: any
    design: LunaDesign
    navigation: any
    settings: any
    config: any
    pages: CMSPage
    navs?: any
    favicon?: string
}

interface LunaDesign {
    colors?: ColorsObject
    fonts?: Fonts
    code: { CSS: string }
    themes: { selected: string }
}

const colors: ColorsObject = {
    color_1: {
        key: 'color_1',
        type: 'hex',
        label: 'Logo',
        value: '#ffffff',
    },
    // Add the rest of your color definitions here...
}

interface Font {
    label: string
    value: string
    family: string
}

export interface FontType {
    label: string
    google?: string
    'font-family': string
}

interface SectionFonts {
    [key: string]: Font
}

interface Fonts {
    sections: {
        hdrs: SectionFonts
        body: SectionFonts
        feat: SectionFonts
    }
    TinyMCE: Record<string, string>
    googleFonts: string
}

interface Font {
    label: string
    value: string
    family: string
}

export interface CreateSiteParams {
    id: string
    clientId: number
    type: string
    subdomain: string
    templateIdentifier: string
    publishedDomains?: string[]
}

export interface DomainRes {
    message: string
    domain: string
    status: 'Error' | 'Success'
}

export interface DomainOptions {
    domain: string
    usingPreview: boolean
}
