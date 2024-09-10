import { z } from 'zod'
import { AddressSchema, AnalyticsSchema, NavMenuItemSchema } from './utils-zod.js'
/* ----------------------------------- Saved Data -------------------------------------*/

const CodeSchema = z.object({
    CSS: z.string(),
    footer: z.string(),
    header: z.string(),
    tab: z.string(),
    visible: z.number(),
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

/*------------------------Landing Page Schema------------------------------------------------------*/

//after modification of req page but before moving into sections
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
        reviews: z.array(z.object({ name: z.string().optional(), text: z.string() })).optional(),
        embed: z.string().optional(),
        contactFormTitle: z.string().optional(),
        dataLayerEventBtn: z.string().optional(),
        dataLayerEventWrap: z.string().optional(),
    })
)

const LandingColorsSchema = z.object({
    primary: z.string().optional(),
    accent: z.string().optional(),
    buttonHover: z.string().optional(),
    footerBackground: z.string().optional(),
    footerText: z.string().optional(),
    headerBackground: z.string().optional(),
    tertiary: z.string().optional(),
})

const SocialSchema = z.array(z.string())

const SEOGlobalSchema = z.object({
    aiosp_home_title: z.string().optional(),
    aiosp_home_description: z.string().optional(),
    aiosp_google_verify: z.string().optional(),
})

const ColorInputSchema = z.object({
    primary: z.string().optional(),
    accent: z.string().optional(),
    buttonHover: z.string().optional(),
    footerBackground: z.string().optional(),
    footerText: z.string().optional(),
    headerBackground: z.string().optional(),
    tertiary: z.string().optional(),
})

const CustomComponentSchema = z.object({
    type: z.string(),
    apiKey: z.string().optional(),
    logo: z.string().optional(),
    siteName: z.string().optional(),
})

const ReviewSchema = z.object({
    text: z.string(),
    name: z.string().optional(),
})

export const RemoveLandingPageSchema = z.object({
    url: z.string(),
})

const PageSectionSchema = z.array(
    z.object({
        headline: z.string().optional(),
        ctaText: z.string().optional(),
        image: z.string().optional(),
        subheader: z.string().optional(),
        ctaLink: z.string().optional(),
        dataLayerEventBtn: z.string().optional(),
        dataLayerEventWrap: z.string().optional(),
        desc: z.string().optional(),
        desc2: z.string().optional(),
        reviewHeadline: z.string().optional(),
        reviews: z.array(ReviewSchema).optional(),
        components: z
            .array(
                z.object({
                    type: z.string(),
                    videoUrl: z.string().optional(),
                    image: z.string().optional(),
                    embed: z.string().optional(),
                    contactFormTitle: z.string().optional(),
                })
            )
            .optional(),
    })
)

const PageSchema = z.object({
    sections: PageSectionSchema,
})

const HeaderButtonSchema = z.object({
    label: z.string().optional(),
    type: z.union([z.literal('phone'), z.literal('email'), z.literal('link'), z.literal('')]).optional(),
    link: z.string().optional(),
    dataLayerEvent: z.string().optional(),
})

const HeaderButtonsObj = z.object({ button1: HeaderButtonSchema.optional(), button2: HeaderButtonSchema.optional() }).optional()

const ScriptsSchema = z.object({
    header: z.string().optional(),
    body: z.string().optional(),
})

//request body coming from AI tool
export const LandingInputSchema = z.object({
    siteName: z.string(),
    url: z.string(),
    s3Folder: z.string(),
    finalDomain: z.string().optional(),
    subdomainOverride: z.string().optional(),
    pageUri: z.string().optional(),
    logo: z.string().optional(),
    favicon: z.string().optional(),
    phoneNumber: z.string().optional(),
    email: z.union([z.string().email(), z.literal('')]),
    socials: SocialSchema.optional(),
    seo: z.object({ global: SEOGlobalSchema }).optional(),
    colors: ColorInputSchema,
    customComponents: z.array(CustomComponentSchema).optional(),
    headerCtaButtons: HeaderButtonsObj,
    code: ScriptsSchema.optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    page: PageSchema,
    address: AddressSchema.optional(),
    analytics: AnalyticsSchema.optional(),
    fonts: z
        .array(
            z.object({
                key: z.string(),
                count: z.number(),
                isFirstPlace: z.boolean(),
            })
        )
        .optional(),
})

export const SubdomainInputSchema = z.object({
    subdomain: z.string().min(1),
})

export type HeaderButtons = z.infer<typeof HeaderButtonsObj>
export type LandingReq = z.infer<typeof LandingInputSchema>
export type CustomComponent = z.infer<typeof CustomComponentSchema>
export type AiPageModules = z.infer<typeof pageModules>
export type Sections = z.infer<typeof PageSectionSchema>
export type LandingColors = z.infer<typeof LandingColorsSchema>
export type RemoveLandingPageReq = z.infer<typeof RemoveLandingPageSchema>
