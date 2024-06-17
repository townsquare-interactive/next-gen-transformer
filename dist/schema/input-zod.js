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
    global: z.object({
        aiosp_home_title: z.string().optional(),
        aiosp_google_verify: z.string().optional(),
        aiosp_home_description: z.string().optional(),
        aiosp_page_title_format: z.string().optional(),
        aiosp_description_format: z.string().optional(),
        aiosp_404_title_format: z.string().optional(),
    }),
})
/* const zSections = z.array(
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
) */
//after modification of req pageå
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
/* export const aiReqSchema = z.object({
    logo: z.string(),
    socials: z.array(z.string()),
    address: addressSchema.optional(),
    siteName: z.string(),
    phoneNumber: z.string(),
    email: z.string().email().optional(),
    url: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    seo: seoGlobalSchema.optional(),
    colors: LandingColorsSchema,
    favicon: z.string().optional(),
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
        sections: zSections.optional(),
    }),
}) */
const SocialSchema = z.array(z.string())
const SEOGlobalSchema = z.object({
    aiosp_home_title: z.string().optional(),
    aiosp_home_description: z.string().optional(),
    aiosp_google_verify: z.string().optional(),
})
/* const ColorInputSchema = z.object({
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
}) */
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
const PageSectionSchema = z.array(
    z.object({
        headline: z.string().optional(),
        ctaText: z.string().optional(),
        image: z.string().optional(),
        subheader: z.string().optional(),
        ctaLink: z.string().optional(),
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
                })
            )
            .optional(),
    })
)
/* const zSections = z.array(
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
) */
const PageSchema = z.object({
    sections: PageSectionSchema,
    modules: z.unknown(),
})
export const LandingInputSchema = z.object({
    siteName: z.string(),
    url: z.string(),
    logo: z.string().optional(),
    favicon: z.string().optional(),
    /* z
        .string()
        .regex(/^\(\d{3}\) \d{3}-\d{4}$/)
        .optional(), */
    phoneNumber: z.string().optional(),
    //email: z.string().email().optional(),
    email: z.union([z.string().email(), z.literal('')]),
    socials: SocialSchema.optional(),
    seo: z.object({ global: SEOGlobalSchema }).optional(),
    colors: ColorInputSchema,
    customComponents: z.array(CustomComponentSchema).optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    page: PageSchema,
})
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtem9kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc2NoZW1hL2lucHV0LXpvZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsQ0FBQyxFQUFFLE1BQU0sS0FBSyxDQUFBO0FBRXZCLHlGQUF5RjtBQUV6RixNQUFNLFVBQVUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3hCLEdBQUcsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO0lBQ2YsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7SUFDbEIsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7SUFDbEIsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7SUFDZixPQUFPLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtDQUN0QixDQUFDLENBQUE7QUFFRixNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3RDLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO0lBQ2QsWUFBWSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7SUFDeEIsS0FBSyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7SUFDakIsU0FBUyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7SUFDckIsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxPQUFPLEVBQUU7SUFDMUIsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRTtJQUM5RCxTQUFTLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLE9BQU8sRUFBRTtJQUMvQixNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtJQUNsQixNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtJ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SUFDcEIsT0FBTyxFQUFFLFdBQVc7SUFDcEIsT0FBTyxFQUFFLFdBQVc7SUFDcEIsT0FBTyxFQUFFLFdBQVc7SUFDcEIsT0FBTyxFQUFFLFdBQVc7SUFDcEIsT0FBTyxFQUFFLFdBQVc7SUFDcEIsT0FBTyxFQUFFLFdBQVc7SUFDcEIsT0FBTyxFQUFFLFdBQVc7SUFDcEIsT0FBTyxFQUFFLFdBQVc7SUFDcEIsUUFBUSxFQUFFLFdBQVc7SUFDckIsUUFBUSxFQUFFLFdBQVc7SUFDckIsUUFBUSxFQUFFLFdBQVc7SUFDckIsUUFBUSxFQUFFLFdBQVc7SUFDckIsUUFBUSxFQUFFLFdBQVc7SUFDckIsUUFBUSxFQUFFLFdBQVc7SUFDckIsUUFBUSxFQUFFLFdBQVc7SUFDckIsUUFBUSxFQUFFLFdBQVc7SUFDckIsUUFBUSxFQUFFLFdBQVc7SUFDckIsUUFBUSxFQUFFLFdBQVc7SUFDckIsUUFBUSxFQUFFLFdBQVc7SUFDckIsUUFBUSxFQUFFLFdBQVc7SUFDckIsUUFBUSxFQUFFLFdBQVc7SUFDckIsUUFBUSxFQUFFLFdBQVc7SUFDckIsUUFBUSxFQUFFLFdBQVc7SUFDckIsUUFBUSxFQUFFLFdBQVc7SUFDckIsUUFBUSxFQUFFLFdBQVc7SUFDckIsUUFBUSxFQUFFLFdBQVc7SUFDckIsUUFBUSxFQUFFLFdBQVc7SUFDckIsUUFBUSxFQUFFLFdBQVc7SUFDckIsUUFBUSxFQUFFLFdBQVc7SUFDckIsUUFBUSxFQUFFLFdBQVc7SUFDckIsUUFBUSxFQUFFLFdBQVc7SUFDckIsUUFBUSxFQUFFLFdBQVc7SUFDckIsUUFBUSxFQUFFLFdBQVc7SUFDckIsUUFBUSxFQUFFLFdBQVc7SUFDckIsUUFBUSxFQUFFLFdBQVc7Q0FDeEIsQ0FBQyxDQUFBO0FBRUYsdURBQXVEO0FBQ3ZELE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDdEIsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDYixPQUFPLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztZQUNkLEdBQUcsRUFBRSxDQUFDLENBQUMs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
