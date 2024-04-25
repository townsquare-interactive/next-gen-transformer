import { z } from 'zod'
import { NavMenuItemSchema } from './input-zod.js'
const Slot = z.object({})
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

export type CompositeData = z.infer<typeof CompositeSchema>
export type CMSPagesSchemaType = z.infer<typeof CMSPagesSchema>

const LogoItem = z
    .object({
        slots: z.array(Slot),
        activeSlots: z.array(z.number()),
    })
    .nullish()

const Logo = z.object({
    // fonts: z.array(z.unknown()),
    footer: z.object({
        LogoItem,
    }),
    header: z.object({
        LogoItem,
    }),
    mobile: z.object({
        LogoItem,
    }),
    //list: z.record(z.string()), //remove
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

const Address = z.object({
    zip: z.string(),
    city: z.string(),
    name: z.string().nullable(),
    state: z.string(),
    street: z.string(),
    street2: z.string().nullable().optional(),
    coordinates: z.optional(z.object({ lat: z.string().or(z.number()), long: z.string().or(z.number()) })),
    url: OptionalString,
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
            disabled: z.string().nullable(),
            isPrimaryPhone: z.boolean(),
        })
    ),
    address: Address.optional(),
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
    makeUrl: z.string(),
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

/* const CMSNavItem = z.object({
    ID: z.number(),
    menu_list_id: z.number(),
    title: z.string(),
    post_type: z.string(),
    type: z.string().nullish(),
    menu_item_parent: z.union([z.number(), z.string()]),
    object_id: z.number(),
    object: z.string(),
    target: z.string().nullish(),
    classes: z.string().nullish(),
    menu_order: z.number(),
    mi_url: z.string().nullish(),
    url: z.string(),
    disabled: z.union([z.boolean(), z.string()]).optional(),
    slug: z.string(),
}) */

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
    themeColors: ThemeColorsSchema,
    businessId: z.string(),
    titleText: z.string().optional(),
    mainAction: z.string().optional(),
    descText: z.string().optional(),
    businessInfo: z.unknown().optional(),
    showMyAccountBtn: z.boolean(),
    widgetLabel: z.string().optional(),
})

export const SiteDataSchema = z.object({
    logos: Logo.describe('Data for all logo slots'),
    social: z.array(socialItem.optional()),
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
    favicon: z.string(),
    fontImport: z.string().describe('CSS for importing google fonts'),
    config: Config,
    contactFormData: ContactFormData.optional(),
    published: z.boolean().optional(),
    redirectUrl: z.string().optional(),
    publishedDomains: z.array(z.string().optional()),
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
            hideNav: z.boolean(),
            hideSocial: z.boolean(),
        })
        .nullable(),
    analytics: z
        .object({
            gaId: OptionalString,
            gtmId: OptionalString,
        })
        .optional(),
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
    imageSize: z.optional(
        z.object({
            width: z.number().nullable(),
            height: z.number().nullable(),
            size: z.string().or(z.number()).nullable(),
        })
    ),
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

export const CMSPagesSchema = z.array(
    z.object({
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
    })
)

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

//check data based off Zod schema
export const zodDataParse = (data: any, schema: any, type = '', parseLevel: 'safeParse' | 'parse' = 'safeParse') => {
    let validatedPageData

    if (parseLevel === 'safeParse') {
        validatedPageData = schema.safeParse(data)
    } else {
        validatedPageData = schema.parse(data)
    }

    if (validatedPageData.success === false) {
        return console.log(`${type} zod error:`, JSON.stringify(validatedPageData))
    }
}
