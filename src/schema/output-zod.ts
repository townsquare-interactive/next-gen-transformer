import { z } from 'zod'
import { AddressSchema, AnalyticsSchema, NavMenuItemSchema } from './utils-zod.js'
import { LandingInputSchema } from './input-zod.js'

const Slot = z.object({
    show: z.number().optional(),
    type: z.string().optional(),
    markup: z.string().optional(),
    hasLinks: z.boolean().optional(),
    alignment: z.string().optional(),
    image_src: z.any().optional(),
    image_link: z.string().optional(),
})
const OptionalString = z.string().optional()

const CompositeItemSchema = z.object({
    items: z
        .array(
            z.object({
                title: OptionalString,
                component: z.string(),
                nav_menu: z.nullable(z.any()),
                name: z.string(),
                subtitle: OptionalString,
                text: OptionalString,
                autoopen: z.boolean().optional(),
            })
        )
        .optional(),
})
const ContactFormData = z.object({
    formTitle: z.string().optional(),
    formService: z.string(),
    email: z.string().optional(),
    formEmbed: z.string().optional(),
    formFields: z.array(
        z.object({
            name: z.string(),
            placeholder: z.string().optional(),
            type: z.string().optional(),
            label: z.string(),
            isReq: z.boolean(),
            fieldType: z.string(),
            isVisible: z.boolean(),
            size: z.string(),
        })
    ),
})

const CompositeSchema = z.object({
    footer: z
        .object({
            type: z.string(),
            layout: z.nullable(z.any()),
            columns: z.number(),
            modules: z.object({
                items: z.array(CompositeItemSchema),
                type: z.string(),
                modalNum: z.number().optional(),
            }),
            sections: z.nullable(z.any()),
            contactFormData: ContactFormData.optional(),
        })
        .optional(),
})

const LogoItem = z
    .object({
        slots: z.array(Slot),
        activeSlots: z.array(z.number()).optional(),
        pct: z.number().optional(),
    })
    .nullish()
    .optional()

const Logo = z.object({
    footer: LogoItem,
    header: LogoItem,
    mobile: LogoItem,
})

const socialItem = z.object({
    id: z.number().optional(),
    name: z.string(),
    format: z.string().optional(),
    label: z.string().optional(),
    value: z.string().optional(),
    enabled: z.number().optional(),
    input: z.array(z.string().nullable()).nullable().optional(),
    url: z.string(),
    icon: z.array(z.string()).optional(),
})

const SeoSchema = z.object({
    title: OptionalString,
    descr: OptionalString,
    selectedImages: OptionalString,
    imageOverride: OptionalString,
})

const hours = z.object({
    friday: z.string().nullish(),
    monday: z.string().nullish(),
    sunday: z.string().nullish(),
    tuesday: z.string().nullish(),
    saturday: z.string().nullish(),
    thursday: z.string().nullish(),
    wednesday: z.string().nullish(),
})

//const onlyNumbers = new RegExp(/^\d+$/)
//regext example .regex(/^[2-9]/, 'Area code cannot start with a 1')
const Contact = z.object({
    email: z
        .array(
            z.object({
                name: OptionalString,
                email: z.string().nullish(),
                disabled: OptionalString,
                isPrimaryEmail: z.boolean().optional(),
            })
        )
        .optional(),
    hours: z.optional(hours),
    phone: z.array(
        z.object({
            name: z.string(),
            number: OptionalString,
            disabled: z.string().nullable().optional(),
            isPrimaryPhone: z.boolean().optional(),
        })
    ),
    address: AddressSchema.optional(),
    hideZip: z.optional(z.boolean()),
    advanced: z.optional(
        z.object({
            lat: z.string(),
            long: z.string(),
        })
    ),
    disabled: z.optional(z.union([z.boolean(), z.string()])),
    hideCity: z.optional(z.boolean()),
    hideState: z.optional(z.boolean()),
    isPrimary: z.optional(z.boolean()),
    hideAddress: z.optional(z.boolean()),
    displayInMap: z.optional(z.boolean()),
    hideAddress2: z.optional(z.boolean()),
    displayInFooter: z.optional(z.boolean()),
    contactLinks: z.optional(
        z.array(
            z.object({
                cName: z.string(),
                link: z.string(),
                icon: z.array(z.string()),
                content: z.string(),
                active: z.boolean(),
            })
        )
    ),
    showContactBox: z.optional(z.boolean()),
})

const Config = z.object({
    mailChimp: z
        .object({
            audId: z.string(),
            datacenter: z.string(),
        })
        .optional(),
    zapierUrl: z.string(),
    makeUrl: z.string().optional(),
})

const ThemeStyles = z.object({
    logoColor: z.string(),
    headingColor: z.string(),
    subHeadingColor: z.string(),
    textColor: z.string(),
    linkColor: z.string(),
    linkHover: z.string(),
    btnText: z.string(),
    btnBackground: z.string(),
    textColorAccent: z.string(),
    heroSubheadline: z.string(),
    heroText: z.string(),
    heroBtnText: z.string(),
    heroBtnBackground: z.string(),
    heroLink: z.string(),
    heroLinkHover: z.string(),
    captionText: z.string(),
    captionBackground: z.string(),
    NavText: z.string(),
    navHover: z.string(),
    navCurrent: z.string(),
    backgroundMain: z.string(),
    bckdContent: z.string(),
    headerBackground: z.string(),
    BckdHeaderSocial: z.string(),
    accentBackgroundColor: z.string(),
    backgroundHero: z.string(),
    footerBackground: z.string(),
    footerText: z.string(),
    footerLink: z.string(),
    promoText: z.string(),
    promoColor: z.string(),
    promoColor2: z.string(),
    promoColor3: z.string(),
    promoColor4: z.string(),
    promoColor5: z.string(),
    promoColor6: z.string(),
})

const CMSNavItemSchema = z.object({
    ...NavMenuItemSchema.shape,
    submenu: z
        .array(
            z
                .object({
                    submenu: z.array(z.object({ CMSNavItem: NavMenuItemSchema.nullish() })).nullish(),
                })
                .merge(NavMenuItemSchema)
        )
        .optional(),
})
const ActionSchema = z.object({
    name: z.string(),
    text: z.string(),
    icon: z.string().optional(),
})

const ThemeColorsSchema = z.object({
    color: z.string(),
    bgColor: z.string(),
    buttonTextColor: z.string(),
    buttonBgColor: z.string(),
    labelTextColor: z.string(),
    labelBgColor: z.string(),
})

const VcitaDataSchema = z.object({
    actions: z.array(ActionSchema),
    themeColors: ThemeColorsSchema.optional(),
    businessId: z.string().optional(),
    titleText: z.string().optional(),
    mainAction: z.string().optional(),
    descText: z.string().optional(),
    businessInfo: z.unknown().optional(),
    showMyAccountBtn: z.boolean().optional(),
    widgetLabel: z.string().optional(),
})

export const SiteDataSchema = z.object({
    logos: Logo.describe('Data for all logo slots'),
    social: z.array(socialItem.optional()).optional(),
    contact: Contact,
    siteName: z.string(),
    url: z.string(),
    composites: CompositeSchema.nullish().describe('modules in footer'),
    modalData: CompositeItemSchema.optional().describe('regular pop up modal'),
    cmsNav: z.array(CMSNavItemSchema.nullish()).nullish(),
    cmsColors: ThemeStyles.describe('website theme colors'),
    theme: z.string().describe('cms website theme'),
    cmsUrl: z.string().describe('current luna url'),
    s3Folder: z.string().describe('siteID where data is stored in s3'),
    favicon: z.string().optional(),
    fontImport: z.string().describe('CSS for importing google fonts'),
    config: Config,
    contactFormData: ContactFormData.optional(),
    published: z.boolean().optional(),
    redirectUrl: z.string().optional(),
    publishedDomains: z.array(z.string()),
    allStyles: z.string().optional(),
    styles: z
        .object({
            global: z.string().optional(),
            custom: z.string().optional(),
        })
        .optional(),
    phoneNumber: z.string().optional(),
    email: z.string().optional(),
    customComponents: z.array(z.object({})).optional(),
    scripts: z
        .object({
            header: z.string().optional(),
            footer: z.string().optional(),
        })
        .optional(),
    vcita: VcitaDataSchema.optional().nullable(),
    siteType: z.string(),
    headerOptions: z
        .object({
            ctaBtns: z.array(z.object({})).optional(),
            hideNav: z.boolean().optional(),
            hideSocial: z.boolean().optional(),
        })
        .nullable(),
    analytics: AnalyticsSchema.optional(),
    formService: z.string().optional(),
})

export type SiteDataType = z.infer<typeof SiteDataSchema>

const ButtonList = z.array(
    z.object({
        name: OptionalString,
        link: OptionalString,
        window: OptionalString,
        label: OptionalString,
        active: z.boolean(),
        btnType: z.string(),
        btnSize: OptionalString,
        linkType: z.string(),
        blockBtn: z.optional(z.boolean()),
        action: OptionalString,
        cName: OptionalString,
        dataLayerEvent: OptionalString,
    })
)

export const ModuleItemSchema = z.object({
    id: z.string().nullish(),
    desc: OptionalString,
    icon: OptionalString,
    align: OptionalString,
    icon2: OptionalString,
    icon3: OptionalString,
    image: OptionalString,
    plugin: OptionalString,
    btnSize: OptionalString,
    btnType: OptionalString,
    weblink: OptionalString,
    btnSize2: OptionalString,
    btnType2: OptionalString,
    disabled: OptionalString,
    headline: OptionalString,
    isPlugin: OptionalString,
    pagelink: OptionalString,
    weblink2: OptionalString,
    actionlbl: OptionalString,
    captionOn: OptionalString,
    headerTag: OptionalString,
    imageSize: z.unknown().optional(),
    modColor1: OptionalString,
    newwindow: OptionalString,
    pagelink2: OptionalString,
    subheader: OptionalString,
    actionlbl2: OptionalString,
    isFeatured: OptionalString,
    modOpacity: z.optional(z.number().or(z.string())),
    modSwitch1: z.optional(z.number().or(z.string())),
    newwindow2: OptionalString,
    pagelinkId: z.optional(z.number().or(z.string())),
    bkgrd_color: OptionalString,
    pagelink2Id: z.optional(z.number().or(z.string())),
    promoColor: OptionalString,
    itemStyle: z.optional(
        z.union([
            z.object({
                background: z.string(),
            }),
            z.object({
                backgroundImage: z.string(),
            }),
            z.object({}),
        ])
    ),
    captionStyle: OptionalString,
    buttonList: z.optional(ButtonList),
    linkNoBtn: z.boolean().optional(),
    btnCount: z.number().optional(),
    isWrapLink: z.boolean().optional(),
    visibleButton: z.boolean().optional(),
    isBeaconHero: z.optional(z.boolean()),
    imagePriority: z.boolean().optional(),
    itemCount: z.number().min(1).optional(),
    btnStyles: OptionalString,
    nextImageSizes: OptionalString,
    imageType: z.optional(z.union([z.literal('crop'), z.literal('nocrop')])),
    links: z
        .object({
            weblink: OptionalString,
            pagelink: OptionalString,
            weblink2: OptionalString,
            pagelink2: OptionalString,
            dataLayerEventWrap: OptionalString,
        })
        .optional(),
    video: z
        .object({
            src: z.string(),
            method: z.string(),
        })
        .optional(),
})

const EmptyArray = z.array(z.string()).refine((arr) => arr.length === 0)

const imageRatioList = [
    'square_1_1',
    'round_1_1',
    'landscape_4_3',
    'landscape_3_2',
    'portrait_2_3',
    'portrait_3_4',
    'widescreen_16_9',
    'widescreen_3_1',
    'widescreen_2_4_1',
    'no_sizing',
]

const AttributesSchema = z.object({
    lazy: z.string().optional(),
    type: z.string(),
    well: z.string().optional(),
    align: OptionalString,
    items: z.array(ModuleItemSchema),
    title: OptionalString,
    columns: z.number().min(1),
    imgsize: z
        .string()
        .refine((value) => imageRatioList.includes(value), {
            message: 'Invalid image ratio',
        })
        .optional(),
    lightbox: OptionalString,
    blockField1: OptionalString,
    blockField2: OptionalString,
    blockSwitch1: z.number().optional(),
    scale_to_fit: OptionalString,
    customClassName: OptionalString,
    modId: z.string(),
    modCount: z.number().min(0),
    columnLocation: z.number(),
    isSingleColumn: z.optional(z.boolean()),
    modalNum: z.number().optional(),
    contactFormData: ContactFormData.optional(),
    export: z.number().optional(),
})

const InnerModuleSchema = z.object({
    attributes: AttributesSchema,
    componentType: z.string(),
})

const ModuleSchema = z.array(
    z.array(
        z.union([
            InnerModuleSchema,
            EmptyArray, //Empty array allowed
        ])
    )
)

export const ApexPageSchema = z.object({
    data: z.object({
        id: z.string().or(z.number()),
        title: z.string(),
        slug: z.string(),
        pageType: z.string(),
        url: z.string(),
        JS: z.string(),
        type: z.string(),
        layout: z.number(),
        columns: z.number(),
        modules: ModuleSchema,
        sections: z.array(z.object({ wide: z.string() })),
        hideTitle: z.number().or(z.boolean()),
        head_script: z.string(),
        columnStyles: z.string(),
        page_type: OptionalString,
        pageModals: z.array(z.object({ modalNum: z.number(), modalTitle: z.string().optional(), autoOpen: z.boolean() })),
        scripts: z.string().optional(),
    }),
    attrs: z.record(z.unknown()).optional(), //for page name changes
    seo: SeoSchema,
    head_script: OptionalString,
    JS: OptionalString,
    siteLayout: SiteDataSchema,
    requestData: LandingInputSchema.optional(), //save the incoming request data from route into S3 page
})

export const CMSPagesSchema = z.array(ApexPageSchema)

export const PageListSchema = z.object({
    pages: z.array(
        z.object({
            name: z.string(),
            slug: z.string(),
            url: z.string(),
            id: z.string().or(z.number()),
            page_type: z.string().optional(),
        })
    ),
})

/*----------------------------Scraping--------------------------*/

// Schema for ScrapedPageSeo
const ScrapedPageSeoSchema = z.object({
    pageUrl: z.string(),
    title: z.string().optional(),
    metaDescription: z.string().optional(),
    metaKeywords: z.string().optional(),
    ogTitle: z.string().optional(),
})

const FormFieldSchema = z.object({
    name: z.string(),
    type: z.string(), // Type of input, e.g., text, textarea, etc.
    label: z.string(),
    placeholder: z.string().nullable(),
    required: z.boolean().nullable(),
})

const FormSchema = z.object({
    title: z.string().nullable(),
    fields: z.array(FormFieldSchema),
})

// Schema for ScrapedPageData
const ScrapedPageDataSchema = z.object({
    seo: ScrapedPageSeoSchema.optional(), // `undefined` translates to `.optional()` in Zod
    images: z.array(z.string()),
    url: z.string(),
    content: z.string().nullable(),
    forms: z.array(FormSchema).nullable(),
    title: z.string().nullable().optional(),
})

export const HoursSchema = z
    .object({
        MON: z.string().nullable(),
        TUE: z.string().nullable(),
        WED: z.string().nullable(),
        THU: z.string().nullable(),
        FRI: z.string().nullable(),
        SAT: z.string().nullable(),
        SUN: z.string().nullable(),
    })
    .nullable()

const ColorsSchema = z.object({
    primaryColor: z.string().nullable().optional(),
    secondaryColor: z.string().nullable().optional(),
    tertiaryColor: z.string().nullable().optional(),
    quaternary: z.string().nullable().optional(),
    textColor: z.string().nullable().optional(),
    mainContentBackgroundColor: z.string().nullable().optional(),
})

// Schema for ScreenshotData
const ScreenshotDataSchema = z.object({
    logoTag: z.string().optional().nullable(),
    companyName: z.string().nullable(),
    address: z.object({
        streetAddress: z.string().nullable().optional(),
        city: z.string().nullable().optional(),
        state: z.string().nullable().optional(),
        postalCode: z.string().nullable().optional(),
        country: z.string().nullable().optional(),
    }),
    email: z.string().email().nullable(),
    phoneNumber: z.string().nullable(),
    hours: HoursSchema,
    links: z.object({
        socials: z.array(z.string()),
        other: z.array(z.string()),
    }),
    styles: z.object({
        fonts: z
            .object({
                headerFonts: z.array(z.string().nullable()).nullable(),
                bodyFonts: z.array(z.string().nullable()).nullable(),
            })
            .nullable(),
        colors: ColorsSchema.nullable(),
    }),
})

// Schema for ScrapedAndAnalyzedSiteData
export const ScrapedAndAnalyzedSiteDataSchema = z.object({
    baseUrl: z.string(),
    pages: z.array(ScrapedPageDataSchema),
    dudaUploadLocation: z.string().nullable(),
    businessInfo: ScreenshotDataSchema.optional(),
    assetData: z
        .object({
            s3UploadedImages: z.array(z.string()).optional(),
            s3LogoUrl: z.string().optional(),
        })
        .optional(),
    siteSeo: ScrapedPageSeoSchema.optional(),
})

//scraped data
export type ScrapedPageSeo = z.infer<typeof ScrapedPageSeoSchema>
export type ScrapedAndAnalyzedSiteData = z.infer<typeof ScrapedAndAnalyzedSiteDataSchema>
export type ScrapedPageData = z.infer<typeof ScrapedPageDataSchema>
export type ScreenshotData = z.infer<typeof ScreenshotDataSchema>
export type ScrapedForm = z.infer<typeof FormSchema>
export type BusinessHours = z.infer<typeof HoursSchema>
export type ScrapedColors = z.infer<typeof ColorsSchema>
/*---------------------------End of scraping------------------------------*/

export type CompositeData = z.infer<typeof CompositeSchema>
export type CMSPagesSchemaType = z.infer<typeof CMSPagesSchema>
export type ApexPageType = z.infer<typeof ApexPageSchema>
export type PageListType = z.infer<typeof PageListSchema>
