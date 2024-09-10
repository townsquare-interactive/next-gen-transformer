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
    contactFormTitle: z.string().optional(),
    dataLayerEventBtn: z.string().optional(),
    dataLayerEventWrap: z.string().optional(),
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
export const RemoveLandingPageSchema = z.object({
    url: z.string(),
});
const PageSectionSchema = z.array(z.object({
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
        .array(z.object({
        type: z.string(),
        videoUrl: z.string().optional(),
        image: z.string().optional(),
        embed: z.string().optional(),
        contactFormTitle: z.string().optional(),
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
    dataLayerEvent: z.string().optional(),
});
const HeaderButtonsObj = z.object({ button1: HeaderButtonSchema.optional(), button2: HeaderButtonSchema.optional() }).optional();
const ScriptsSchema = z.object({
    header: z.string().optional(),
    body: z.string().optional(),
});
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtem9kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NjaGVtYS9pbnB1dC16b2QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLENBQUMsRUFBRSxNQUFNLEtBQUssQ0FBQTtBQUN2QixPQUFPLEVBQUUsYUFBYSxFQUFFLGVBQWUsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGdCQUFnQixDQUFBO0FBQ2xGLHlGQUF5RjtBQUV6RixNQUFNLFVBQVUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3hCLEdBQUcsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO0lBQ2YsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7SUFDbEIsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7SUFDbEIsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7SUFDZixPQUFPLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtDQUN0QixDQUFDLENBQUE7QUFFRixNQUFNLFVBQVUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3hCLFNBQVMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQ2hCLGNBQWMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDO0tBQzdDLENBQUM7SUFDRixpQkFBaUIsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO0lBQzdCLFVBQVUsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO0lBQ3RCLGNBQWMsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO0lBQzFCLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFO0lBQ25ELGtCQUFrQixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFO0NBQ3RELENBQUMsQ0FBQTtBQUVGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7S0F3RUs7QUFFTCxNQUFNLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDOUIsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDWCxFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtRQUNkLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO1FBQ2hCLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO1FBQ2xCLE9BQU8sRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO1FBQ25CLE9BQU8sRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3hDLFFBQVEsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSwrQ0FBK0M7UUFDaEYsU0FBUyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFO1FBQ2hELFdBQVcsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO1FBQ2xDLFNBQVMsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO0tBQ25DLENBQUM7SUFDRixLQUFLLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7SUFDbkIsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO0NBQ3BCLENBQUMsQ0FBQTtBQUVGLHdGQUF3RjtBQUV4RixNQUFNLFdBQVcsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3pCLEdBQUcsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO0lBQ2YsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxPQUFPLEVBQUU7SUFDMUIsS0FBSyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7SUFDakIsS0FBSyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7Q0FDcEIsQ0FBQyxDQUFBO0FBRUYsTUFBTSxZQUFZLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUMxQixPQUFPLEVBQUUsV0FBVztJQUNwQixPQUFPLEVBQUUsV0FBVztJQUNwQixPQUFPLEVBQUUsV0FBVztJQUNwQixPQUFPLEVBQUUsV0FBVztJQUNwQixPQUFPLEVBQUUsV0FBVztJQUNwQixPQUFPLEVBQUUsV0FBVztJQUNwQixPQUFPLEVBQUUsV0FBVztJQUNwQixPQUFPLEVBQUUsV0FBVztJQUNwQixPQUFPLEVBQUUsV0FBVztJQUNwQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUs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