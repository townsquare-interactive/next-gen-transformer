import { z } from 'zod';
import { AddressSchema, AnalyticsSchema, NavMenuItemSchema } from './utils-zod.js';
/* ----------------------------------- Saved Data -------------------------------------*/
const CodeSchema = z.object({
    CSS: z.string(),
    footer: z.string(),
    header: z.string(),
    tab: z.string(),
    visible: z.number(),
});
const NavsSchema = z.object({
    menu_data: z.object({
        'primary-menu': z.array(NavMenuItemSchema),
    }),
    current_menu_name: z.string(),
    front_page: z.number(),
    menu_alignment: z.string(),
    deleted_menu_items: z.array(z.unknown()).optional(),
    deleted_menu_slugs: z.array(z.unknown()).optional(),
});
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
});
/* ----------------------------------- Site Data -------------------------------------*/
const colorSchema = z.object({
    key: z.string(),
    type: z.string().nullish(),
    label: z.string(),
    value: z.string(),
});
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
});
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
    pages: z.record(z.object({
        title: z.string(),
        slug: z.string(),
        id: z.number(),
    })),
});
const savedData = z.object({
    pages: z.record(SavedPagesSchema).optional(),
    navs: NavsSchema.optional(),
    code: CodeSchema.optional(),
});
export const saveInputSchema = z.object({
    savedData: savedData,
    siteData: siteData,
});
export const createSiteInputSchema = z.object({
    subdomain: z.string(),
    clientId: z.number(),
    templateIdentifier: z.string(),
    type: z.literal('apex'),
});
/*------------------------Landing Page Schema------------------------------------------------------*/
//after modification of req page but before moving into sections
const pageModules = z.array(z.object({
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
}));
const LandingColorsSchema = z.object({
    primary: z.string().optional(),
    accent: z.string().optional(),
    buttonHover: z.string().optional(),
    footerBackground: z.string().optional(),
    footerText: z.string().optional(),
    headerBackground: z.string().optional(),
    tertiary: z.string().optional(),
});
const SocialSchema = z.array(z.string());
const SEOGlobalSchema = z.object({
    aiosp_home_title: z.string().optional(),
    aiosp_home_description: z.string().optional(),
    aiosp_google_verify: z.string().optional(),
});
const ColorInputSchema = z.object({
    primary: z.string().optional(),
    accent: z.string().optional(),
    buttonHover: z.string().optional(),
    footerBackground: z.string().optional(),
    footerText: z.string().optional(),
    headerBackground: z.string().optional(),
    tertiary: z.string().optional(),
});
const CustomComponentSchema = z.object({
    type: z.string(),
    apiKey: z.string().optional(),
    logo: z.string().optional(),
    siteName: z.string().optional(),
});
const ReviewSchema = z.object({
    text: z.string(),
    name: z.string().optional(),
});
const PageSectionSchema = z.array(z.object({
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
        .array(z.object({
        type: z.string(),
        videoUrl: z.string().optional(),
        image: z.string().optional(),
        embed: z.string().optional(),
    }))
        .optional(),
}));
const PageSchema = z.object({
    sections: PageSectionSchema,
});
const HeaderButtonSchema = z.object({
    label: z.string().optional(),
    type: z.union([z.literal('phone'), z.literal('email'), z.literal('link'), z.literal('')]).optional(),
    link: z.string().optional(),
});
const ScriptsSchema = z.object({
    header: z.string().optional(),
    body: z.string().optional(),
});
//request body coming from AI tool
export const LandingInputSchema = z.object({
    siteName: z.string(),
    url: z.string(),
    pageUri: z.string().optional(),
    logo: z.string().optional(),
    favicon: z.string().optional(),
    phoneNumber: z.string().optional(),
    email: z.union([z.string().email(), z.literal('')]),
    socials: SocialSchema.optional(),
    seo: z.object({ global: SEOGlobalSchema }).optional(),
    colors: ColorInputSchema,
    customComponents: z.array(CustomComponentSchema).optional(),
    headerButton: HeaderButtonSchema.optional(),
    code: ScriptsSchema.optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    page: PageSchema,
    address: AddressSchema.optional(),
    analytics: AnalyticsSchema.optional(),
    fonts: z
        .array(z.object({
        key: z.string(),
        count: z.number(),
        isFirstPlace: z.boolean(),
    }))
        .optional(),
});
export const SubdomainInputSchema = z.object({
    subdomain: z.string().min(1),
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtem9kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc2NoZW1hL2lucHV0LXpvZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsQ0FBQyxFQUFFLE1BQU0sS0FBSyxDQUFBO0FBQ3ZCLE9BQU8sRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFFLGlCQUFpQixFQUFFLE1BQU0sZ0JBQWdCLENBQUE7QUFDbEYseUZBQXlGO0FBRXpGLE1BQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDeEIsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7SUFDZixNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtJQUNsQixNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtJQUNsQixHQUFHLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtJQUNmLE9BQU8sRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO0NBQ3RCLENBQUMsQ0FBQTtBQUVGLE1BQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDeEIsU0FBUyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDaEIsY0FBYyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUM7S0FDN0MsQ0FBQztJQUNGLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7SUFDN0IsVUFBVSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7SUFDdEIsY0FBYyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7SUFDMUIsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUU7SUFDbkQsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUU7Q0FDdEQsQ0FBQyxDQUFBO0FBRUY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztLQXdFSztBQUVMLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUM5QixJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUNYLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO1FBQ2QsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7UUFDaEIsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7UUFDbEIsT0FBTyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7UUFDbkIsT0FBTyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDeEMsUUFBUSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLCtDQUErQztRQUNoRixTQUFTLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUU7UUFDaEQsV0FBVyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUU7UUFDbEMsU0FBUyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUU7S0FDbkMsQ0FBQztJQUNGLEtBQUssRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztJQUNuQixHQUFHLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7Q0FDcEIsQ0FBQyxDQUFBO0FBRUYsd0ZBQXdGO0FBRXhGLE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDekIsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7SUFDZixJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLE9BQU8sRUFBRTtJQUMxQixLQUFLLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtJQUNqQixLQUFLLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtDQUNwQixDQUFDLENBQUE7QUFFRixNQUFNLFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQzFCLE9BQU8sRUFBRSxXQUFXO0lBQ3BCLE9BQU8sRUFBRSxXQUFXO0lBQ3BCLE9BQU8sRUFBRSxXQUFXO0lBQ3BCLE9BQU8sRUFBRSxXQUFXO0lBQ3BCLE9BQU8sRUFBRSxXQUFXO0lBQ3BCLE9BQU8sRUFBRSxXQUFXO0lBQ3BCLE9BQU8sRUFBRSxXQUFXO0lBQ3BCLE9BQU8sRUFBRSxXQUFXO0lBQ3BCLE9BQU8sRUFBRSxXQUFXO0lBQ3BCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0NB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