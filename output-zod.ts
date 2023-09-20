import { z } from 'zod'

const Slot = z.object({})

const Logo = z.object({
    fonts: z.array(z.unknown()),
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
    list: z.record(z.string()),
})

//pieces
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

const Contact = z.object({
    email: z.unknown(),
    hours: z.object({
        friday: z.string(),
        monday: z.string(),
        sunday: z.string(),
        tuesday: z.string(),
        saturday: z.string(),
        thursday: z.string(),
        wednesday: z.string(),
    }),
    phone: z.array(
        z.object({
            name: z.string(),
            number: z.string(),
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
    // Define the properties for ThemeStyles here.
})

export const SiteDataSchema = z.object({
    logos: Logo,
    social: z.array(z.unknown()),
    contact: Contact,
    siteName: z.string(),
    url: z.string(),
    /*composites: z.optional(
        z.object({
            footer: z.optional(Composite),
        })
    ),*/
    composites: z.unknown(),
    cmsColors: ThemeStyles,
    theme: z.string(),
    cmsUrl: z.string(),
    s3Folder: z.string(),
    favicon: z.string(),
    fontImport: z.string(),
    config: Config,
    error: z.unknown(),
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
    pagelink2Id: z.optional(z.string()),
    editingIcon1: z.optional(z.boolean()),
    editingIcon2: z.optional(z.string()),
    editingIcon3: z.optional(z.string()),
    iconSelected: z.optional(z.string()),
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
    twoButtons: z.boolean(),
    isWrapLink: z.boolean(),
    visibleButton: z.boolean(),
    isBeaconHero: z.optional(z.boolean()),
    imagePriority: z.boolean(),
    itemCount: z.number(),
    btnStyles: z.optional(z.string()),
    nextImageSizes: z.optional(z.string()),
    imageType: z.optional(z.string()),
})

const EmptyArray = z.array(z.string()).refine((arr) => arr.length === 0)

const AttributesSchema = z.object({
    id: z.string(),
    uid: z.string(),
    lazy: z.string(),
    type: z.string(),
    well: z.string().optional(),
    align: z.string().optional(),
    items: z.array(ModuleItemSchema),
    title: z.string().optional(),
    export: z.number(),
    columns: z.number(),
    imgsize: z.string(),
    lightbox: z.string().optional(),
    blockField1: z.string().optional(),
    blockField2: z.string().optional(),
    blockSwitch1: z.number(),
    scale_to_fit: z.string().optional(),
    customClassName: z.string().optional(),
    modId: z.string().optional(),
    modCount: z.number(),
    columnLocation: z.number(),
    isSingleColumn: z.boolean(),
})

const InnerModuleSchema = z.object({
    attributes: AttributesSchema,
    componentType: z.string(),
})

/* const ModuleSchema = z.array(
    z.array(
        z.union([
            z.union([InnerModuleSchema, z.object({}).strict()]),
            EmptyArray, //Empty array allowed
        ])
    )
) */
const ModuleSchema = z.array(
    z.array(
        z.union([
            InnerModuleSchema,
            //z.object({}),
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
            //modules: z.unknown(),
            sections: z.array(z.object({ wide: z.string() })), // Array of Sections
            //sections: z.unknown(),
            hideTitle: z.number(),
            head_script: z.string(),
            columnStyles: z.string(),
            page_type: z.optional(z.string()),
        }),
        attrs: z.record(z.unknown()), // An empty record (you can adjust the type)
        //z.union([InnerModuleSchema, z.object({}).strict()])
        seo: SeoSchema,
        //seo: z.unknown(),
        head_script: z.optional(z.string()), // Optional head_script
        JS: z.optional(z.string()), // Optional JS
    })
)

//check data based off Zod schema
export const zodDataParse = (data: any, schema: any, type: string) => {
    const validatedPageData = schema.safeParse(data)

    if (validatedPageData.success === false) {
        return console.log(`${type} zod error:`, JSON.stringify(validatedPageData))
    }
}
