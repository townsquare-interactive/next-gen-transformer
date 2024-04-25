import { z } from 'zod'

/* ----------------------------------- Saved Data -------------------------------------*/

const CodeSchema = z.object({
    CSS: z.string(),
    footer: z.string(),
    header: z.string(),
    tab: z.string(),
    visible: z.number(),
})

export const NavMenuItemSchema = z.object({
    ID: z.number(),
    menu_list_id: z.number(),
    title: z.string(),
    post_type: z.string(),
    type: z.string().nullish(),
    menu_item_parent: z.union([z.string(), z.number()]).nullable(),
    object_id: z.number().nullish(),
    object: z.string(),
    target: z.string().nullable(),
    classes: z.string().or(z.array(z.unknown())).nullable(),
    menu_order: z.number(),
    mi_url: z.string().nullable(),
    url: z.string(),
    disabled: z.boolean().optional(),
})

const NavsSchema = z.object({
    menu_data: z.object({
        'primary-menu': z.array(NavMenuItemSchema),
    }),
    current_menu_name: z.string(),
    front_page: z.number(),
    menu_alignment: z.string(),
    deleted_menu_items: z.array(z.unknown()).optional(),
    deleted_menu_slugs: z.array(z.unknown()).optional(),
})

/* const ItemSchema = z.object({
    id: z.string(),
    headline: z.string(),
    subheader: z.string(),
    image: z.string(),
    captionOn: z.string(),
    icon: z.string().optional(),
    icon2: z.string().optional(),
    icon3: z.string().optional(),
    bkgrd_color: z.string().optional(),
    btnType: z.string(),
    btnType2: z.string(),
    btnSize: z.string(),
    btnSize2: z.string(),
    desc: z.string().optional(),
    pagelink: z.string().optional(),
    weblink: z.string().optional(),
    actionlbl: z.union([z.string(), z.number()]).optional(),
    newwindow: z.union([z.string(), z.number()]).optional(),
    pagelink2: z.string().optional(),
    weblink2: z.string().optional(),
    actionlbl2: z.string().optional(),
    newwindow2: z.union([z.string(), z.number()]).optional(),
    align: z.string().optional(),
    isFeatured: z.string(),
    isPlugin: z.string().optional(),
    headerTag: z.string(),
    plugin: z.string().optional(),
    disabled: z.union([z.boolean(), z.string()]),
    pagelinkId: z.string().optional(),
    pagelink2Id: z.string().optional(),
    buttonList: z.array(
        z.object({
            // Define the schema for Button here if needed
        })
    ),
    linkNoBtn: z.boolean(),
    btnCount: z.number().optional(),
    isWrapLink: z.boolean(),
    visibleButton: z.boolean(),
    isBeaconHero: z.boolean(),
    imagePriority: z.boolean(),
    itemCount: z.number(),
    btnStyles: z.string(),
    nextImageSizes: z.string().optional(),
})

const ModuleSchema = z.object({
    attributes: z.object({
        title: z.string(),
        class: z.string(),
        align: z.string(),
        imgsize: z.string(),
        columns: z.string(),
        type: z.string(),
        well: z.string(),
        lightbox: z.string(),
        lazy: z.string(),
        blockSwitch1: z.number().optional(),
        blockField1: z.string().optional(),
        blockField2: z.string(),
        scale_to_fit: z.string(),
        export: z.number(),
        items: z.array(ItemSchema),
        id: z.string(),
        modId: z.string(),
        modCount: z.number(),
        columnLocation: z.number(),
        isSingleColumn: z.boolean(),
    }),
    componentType: z.string(),
    title: z.string().optional(),
}) */

const SavedPagesSchema = z.object({
    data: z.object({
        JS: z.string(),
        type: z.string(),
        layout: z.number(),
        columns: z.number(),
        modules: z.array(z.record(z.object({}))),
        sections: z.array(z.object({})), // Define the schema for Section here if needed
        hideTitle: z.number().or(z.boolean()).optional(),
        head_script: z.string().optional(),
        page_type: z.string().optional(),
    }),
    attrs: z.object({}),
    seo: z.object({}),
})

/* ----------------------------------- Site Data -------------------------------------*/

const colorSchema = z.object({
    key: z.string(),
    type: z.string().nullish(),
    label: z.string(),
    value: z.string(),
})

const colorsSchema = z.object({
    color_1: colorSchema,
    color_2: colorSchema,
    color_3: colorSchema,
    color_4: colorSchema,
    color_5: colorSchema,
    color_6: colorSchema,
    color_7: colorSchema,
    color_8: colorSchema,
    color_9: colorSchema,
    color_10: colorSchema,
    color_11: colorSchema,
    color_12: colorSchema,
    color_13: colorSchema,
    color_14: colorSchema,
    color_15: colorSchema,
    color_16: colorSchema,
    color_17: colorSchema,
    color_18: colorSchema,
    color_19: colorSchema,
    color_20: colorSchema,
    color_21: colorSchema,
    color_22: colorSchema,
    color_23: colorSchema,
    color_24: colorSchema,
    color_25: colorSchema,
    color_26: colorSchema,
    color_27: colorSchema,
    color_28: colorSchema,
    color_29: colorSchema,
    color_30: colorSchema,
    color_31: colorSchema,
    color_32: colorSchema,
    color_33: colorSchema,
    color_34: colorSchema,
    color_35: colorSchema,
    color_36: colorSchema,
})

//allows an object with anything it, but still required
const siteData = z.object({
    config: z.object({
        website: z.object({
            url: z.string(),
        }),
    }),
    design: z.object({
        themes: z.object({
            selected: z.union([z.literal('beacon-theme_charlotte'), z.literal('beacon-theme_apex')]),
        }),
        colors: colorsSchema,
        fonts: z.object({}),
    }),
    pages: z.record(
        z.object({
            title: z.string(),
            slug: z.string(),
            id: z.number(),
        })
    ),
})

const savedData = z.object({
    pages: z.record(SavedPagesSchema).optional(),
    navs: NavsSchema.optional(),
    code: CodeSchema.optional(),
})

export const saveInputSchema = z.object({
    savedData: savedData,
    siteData: siteData,
})

export const createSiteInputSchema = z.object({
    subdomain: z.string(),
    clientId: z.number(),
    templateIdentifier: z.string(),
    type: z.literal('apex'),
})

//------------------------AI Schema-----------------------

const coordinatesSchema = z.object({
    lat: z.string().optional(),
    long: z.string().optional(),
})

const addressSchema = z.object({
    zip: z.string().optional(),
    city: z.string().optional(),
    name: z.string().optional(),
    state: z.string().optional(),
    street: z.string().optional(),
    street2: z.string().optional(),
    coordinates: coordinatesSchema.optional(),
    url: z.string(),
})

const seoGlobalSchema = z.object({
    aiosp_home_title: z.string().optional(),
    aiosp_google_verify: z.string().optional(),
    aiosp_home_description: z.string().optional(),
    aiosp_page_title_format: z.string().optional(),
    aiosp_description_format: z.string().optional(),
    aiosp_404_title_format: z.string().optional(),
})

const zSections = z.array(
    z.object({
        headline: z.string().optional(),
        reviewHeadline: z.string().optional(),
        ctaText: z.string().optional(),
        image: z.string().optional(),
        subheader: z.string().optional(),
        ctaLink: z.string().optional(),
        desc: z.string().optional(),
        desc2: z.string().optional(),
        reviews: z.array(z.object({ name: z.string(), text: z.string() })).optional(),
        components: z.array(
            z.object({
                type: z.string(),
                image: z.string().optional(),
                videoUrl: z.string().optional(),
            })
        ),
    })
)

const pageModules = z.array(
    z.object({
        headline: z.string().optional(),
        actionlbl: z.string().optional(),
        image: z.string().optional(),
        subheader: z.string().optional(),
        type: z.string().optional(),
        weblink: z.string().optional(),
        videoUrl: z.string().optional(),
        desc1: z.string().optional(),
        desc2: z.string().optional(),
        reviews: z.array(z.object({ name: z.string(), text: z.string() })).optional(),
    })
)

const aiReqSchema = z.object({
    logo: z.string(),
    socials: z.array(z.string()),
    address: addressSchema.optional(),
    siteName: z.string(),
    phoneNumber: z.string(),
    email: z.string().email(),
    url: z.string(),
    seo: z.object({
        global: seoGlobalSchema,
    }),
    colors: z.object({
        primary: z.string(),
        accent: z.string(),
        buttonHover: z.string().optional(),
        footerBackground: z.string().optional(),
        footerText: z.string().optional(),
    }),
    favicon: z.string(),
    customComponents: z.array(
        z.object({
            type: z.string(),
            apiKey: z.string(),
        })
    ),
    page: z.object({
        id: z.string(),
        title: z.string(),
        slug: z.string(),
        pageType: z.string(),
        url: z.string(),
        modules: pageModules,
        seo: seoGlobalSchema,
        sections: zSections.optional(),
    }),
})

const SocialSchema = z.array(z.string().url())

const SEOGlobalSchema = z.object({
    aiosp_home_title: z.string().optional(),
    aiosp_home_description: z.string().optional(),
})

const ColorsSchema = z.object({
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
})

const CustomComponentSchema = z.object({
    type: z.string(),
    apiKey: z.string().optional(),
})

const ReviewSchema = z.object({
    text: z.string(),
    name: z.string().optional(),
})

const PageSectionSchema = z.object({
    headline: z.string().optional(),
    ctaText: z.string().optional(),
    image: z.string().url().optional(),
    subheader: z.string().optional(),
    ctaLink: z.string().url().optional(),
    desc: z.string().optional(),
    desc2: z.string().optional(),
    reviewHeadline: z.string().optional(),
    reviews: z.array(ReviewSchema).optional(),
    components: z
        .array(
            z.object({
                type: z.string(),
                videoUrl: z.string().url().optional(),
            })
        )
        .optional(),
})

const PageSchema = z.object({
    sections: z.array(PageSectionSchema),
})

export const LandingInputSchema = z.object({
    siteName: z.string(),
    url: z.string().url(),
    logo: z.string().url().optional(),
    favicon: z.string().url().optional(),
    phoneNumber: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/),
    email: z.string().email().optional(),
    socials: SocialSchema.optional(),
    seo: z.object({ global: SEOGlobalSchema }).optional(),
    colors: ColorsSchema,
    customComponents: z.array(CustomComponentSchema).optional(),
    page: PageSchema,
})

export type AiReq = z.infer<typeof aiReqSchema>
export type AiPageModules = z.infer<typeof pageModules>
export type Sections = z.infer<typeof zSections>
