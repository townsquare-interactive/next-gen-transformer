import { z } from 'zod'

const Slot = z.object({})

const CompositeItemSchema = z.object({
    title: z.string().optional(),
    component: z.string(),
    nav_menu: z.nullable(z.any()),
    name: z.string(),
    subtitle: z.string().optional(),
    text: z.string().optional(),
    autoopen: z.boolean().optional(),
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
            }),
            sections: z.nullable(z.any()),
        })
        .optional(),
})

export type CompositeData = z.infer<typeof CompositeSchema>

const Logo = z.object({
    // fonts: z.array(z.unknown()),
    footer: z.object({
        pct: z.nullable(z.number()),
        slots: z.array(Slot),
        activeSlots: z.array(z.number()),
    }),
    header: z.object({
        pct: z.nullable(z.number()),
        slots: z.array(Slot),
        activeSlots: z.array(z.number()),
    }),
    mobile: z.object({
        pct: z.nullable(z.number()),
        slots: z.array(Slot),
        activeSlots: z.array(z.number()),
    }),
    //list: z.record(z.string()), //remove
})

const SeoSchema = z.object({
    title: z.optional(z.string()),
    descr: z.optional(z.string()),
    selectedImages: z.optional(z.string()),
    imageOverride: z.optional(z.string()),
})

const Address = z.object({
    zip: z.string(),
    city: z.string(),
    name: z.optional(z.string()),
    state: z.string(),
    street: z.string(),
    street2: z.optional(z.string()),
    coordinates: z.optional(z.array(z.string())),
    url: z.optional(z.string()),
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
                name: z.string().optional(),
                email: z.string().nullish(),
                disabled: z.string().optional(),
                isPrimaryEmail: z.boolean().optional(),
            })
        )
        .optional(),
    hours: z.optional(hours),
    phone: z.array(
        z.object({
            name: z.string(),
            number: z.string().optional(),
            disabled: z.string(),
            isPrimaryPhone: z.boolean(),
        })
    ),
    address: Address,
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
    mailChimp: z.object({
        audId: z.string(),
        datacenter: z.string(),
    }),
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

const CMSNavItem = z.object({
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
    disabled: z.union([z.boolean(), z.string()]),
    slug: z.string(),
})

const CMSNavItemSchema = z.object({
    ...CMSNavItem.shape,
    submenu: z
        .array(
            z.object({
                CMSNavItem: CMSNavItem,
                submenu: z.array(z.object({ CMSNavItem: CMSNavItem })),
            })
        )
        .optional(),
})

export const SiteDataSchema = z.object({
    logos: Logo,
    social: z.array(z.unknown()),
    contact: Contact,
    siteName: z.string(),
    url: z.string(),
    composites: CompositeSchema.nullish(),
    modalData: CompositeItemSchema.optional(),
    cmsNav: z.array(CMSNavItemSchema).optional(),
    cmsColors: ThemeStyles,
    theme: z.string(),
    cmsUrl: z.string(),
    s3Folder: z.string(),
    favicon: z.string(),
    fontImport: z.string(),
    config: Config,
})

const ButtonList = z.array(
    z.object({
        name: z.optional(z.string()),
        link: z.optional(z.string()),
        window: z.optional(z.string()),
        label: z.optional(z.string()),
        active: z.boolean(),
        btnType: z.string(),
        btnSize: z.optional(z.string()),
        linkType: z.string(),
        blockBtn: z.optional(z.boolean()),
    })
)

const ModuleItemSchema = z.object({
    id: z.string(),
    desc: z.optional(z.string()),
    icon: z.optional(z.string()),
    align: z.optional(z.string()),
    icon2: z.optional(z.string()),
    icon3: z.optional(z.string()),
    image: z.optional(z.string()),
    plugin: z.optional(z.string()),
    btnSize: z.optional(z.string()),
    btnType: z.optional(z.string()),
    weblink: z.optional(z.string()),
    btnSize2: z.optional(z.string()),
    btnType2: z.optional(z.string()),
    disabled: z.optional(z.string()),
    headline: z.optional(z.string()),
    isPlugin: z.optional(z.string()),
    pagelink: z.optional(z.string()),
    weblink2: z.optional(z.string()),
    actionlbl: z.optional(z.string()),
    captionOn: z.optional(z.string()),
    headerTag: z.optional(z.string()),
    imageSize: z.optional(
        z.object({
            width: z.number(),
            height: z.number(),
            size: z.string().or(z.number()),
        })
    ),
    modColor1: z.optional(z.string()),
    newwindow: z.optional(z.string()),
    pagelink2: z.optional(z.string()),
    subheader: z.optional(z.string()),
    actionlbl2: z.optional(z.string()),
    isFeatured: z.optional(z.string()),
    modOpacity: z.optional(z.number()),
    modSwitch1: z.optional(z.number()),
    newwindow2: z.optional(z.string()),
    pagelinkId: z.optional(z.number().or(z.string())),
    bkgrd_color: z.optional(z.string()),
    pagelink2Id: z.optional(z.number().or(z.string())),
    promoColor: z.optional(z.string()),
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
    captionStyle: z.optional(z.string()),
    buttonList: z.optional(ButtonList),
    linkNoBtn: z.boolean(),
    btnCount: z.number(),
    isWrapLink: z.boolean(),
    visibleButton: z.boolean(),
    isBeaconHero: z.optional(z.boolean()),
    imagePriority: z.boolean(),
    itemCount: z.number().min(1),
    btnStyles: z.optional(z.string()),
    nextImageSizes: z.optional(z.string()),
    imageType: z.optional(z.union([z.literal('crop'), z.literal('nocrop')])),
    links: z.object({
        weblink: z.optional(z.string()),
        pagelink: z.optional(z.string()),
        weblink2: z.optional(z.string()),
        pagelink2: z.optional(z.string()),
    }),
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
    id: z.string(),
    uid: z.string(),
    lazy: z.string(),
    type: z.string(),
    well: z.string(),
    align: z.string().optional(),
    items: z.array(ModuleItemSchema),
    title: z.string().optional(),
    //export: z.number(),
    columns: z.number().min(1),
    imgsize: z.string().refine((value) => imageRatioList.includes(value), {
        message: 'Invalid image ratio',
    }),
    lightbox: z.string().optional(),
    blockField1: z.string().optional(),
    blockField2: z.string().optional(),
    blockSwitch1: z.number(),
    scale_to_fit: z.string().optional(),
    customClassName: z.string().optional(),
    modId: z.string().optional(),
    modCount: z.number().min(1),
    columnLocation: z.number(),
    isSingleColumn: z.optional(z.boolean()),
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
            id: z.string(),
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
            hideTitle: z.number(),
            head_script: z.string(),
            columnStyles: z.string(),
            page_type: z.optional(z.string()),
        }),
        attrs: z.record(z.unknown()), //for page name changes
        seo: SeoSchema,
        head_script: z.optional(z.string()),
        JS: z.optional(z.string()),
    })
)

//check data based off Zod schema
export const zodDataParse = (data: any, schema: any, type: string) => {
    const validatedPageData = schema.safeParse(data)

    if (validatedPageData.success === false) {
        return console.log(`${type} zod error:`, JSON.stringify(validatedPageData))
    }
}
