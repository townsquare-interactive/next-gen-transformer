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
    domain: z.string(),
});
export const RemoveLandingProjectSchema = z.object({
    apexID: z.string(),
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
export const SubdomainInputSchema = z.object({
    subdomain: z.string().min(1),
});
const Logos = z.object({
    header: z.string().optional(),
    footer: z.string().optional(),
    mobile: z.string().optional(),
});
const CustomOptions = z.object({
    fonts: z
        .array(z.object({
        key: z.string(),
        count: z.number(),
        isFirstPlace: z.boolean(),
    }))
        .optional(),
    code: ScriptsSchema.optional(),
    headerCtaButtons: HeaderButtonsObj,
    analytics: AnalyticsSchema.optional(),
    customComponents: z.array(CustomComponentSchema).optional(),
});
const ContactData = z.object({
    address: AddressSchema.optional(),
    phoneNumber: z.string().optional(),
    email: z.union([z.string().email(), z.literal('')]),
});
//request body coming from AI tool
export const LandingInputSchema = z.object({
    siteName: z.string(),
    url: z.string(),
    productionDomain: z.string().optional(),
    subdomainOverride: z.string().optional(),
    s3Folder: z.string(),
    pageUri: z.string().optional(),
    logos: Logos,
    favicon: z.string().optional(),
    contactData: ContactData,
    socials: SocialSchema.optional(),
    seo: z.object({ global: SEOGlobalSchema }).optional(),
    colors: ColorInputSchema,
    title: z.string().optional(),
    description: z.string().optional(),
    page: PageSchema,
    customOptions: CustomOptions,
});
const SaveFileMethod = z.literal('writeFolder').or(z.literal('s3Upload').or(z.literal('test').or(z.literal('dudaUpload'))));
//request body coming from AI tool
export const ScrapeImageSchema = z.object({
    url: z.string(),
    savingMethod: SaveFileMethod.optional(),
    uploadLocation: z.string().optional(),
    backupImagesSave: z.boolean().optional(),
    saveImages: z.boolean().optional(),
    useAi: z.boolean().optional(),
    scrapeImages: z.boolean().optional(),
});
export const RequestDataSchema = z.object({
    domain: z.string().refine((domain) => domain.includes('/'), {
        message: "The domain must include a '/'",
    }),
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtem9kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NjaGVtYS9pbnB1dC16b2QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLENBQUMsRUFBRSxNQUFNLEtBQUssQ0FBQTtBQUN2QixPQUFPLEVBQUUsYUFBYSxFQUFFLGVBQWUsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGdCQUFnQixDQUFBO0FBQ2xGLHlGQUF5RjtBQUV6RixNQUFNLFVBQVUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3hCLEdBQUcsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO0lBQ2YsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7SUFDbEIsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7SUFDbEIsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7SUFDZixPQUFPLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtDQUN0QixDQUFDLENBQUE7QUFFRixNQUFNLFVBQVUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3hCLFNBQVMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQ2hCLGNBQWMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDO0tBQzdDLENBQUM7SUFDRixpQkFBaUIsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO0lBQzdCLFVBQVUsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO0lBQ3RCLGNBQWMsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO0lBQzFCLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFO0lBQ25ELGtCQUFrQixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFO0NBQ3RELENBQUMsQ0FBQTtBQUVGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7S0F3RUs7QUFFTCxNQUFNLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDOUIsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDWCxFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtRQUNkLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO1FBQ2hCLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO1FBQ2xCLE9BQU8sRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO1FBQ25CLE9BQU8sRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3hDLFFBQVEsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSwrQ0FBK0M7UUFDaEYsU0FBUyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsUUFBUSxFQUFFO1FBQ2hELFdBQVcsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO1FBQ2xDLFNBQVMsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO0tBQ25DLENBQUM7SUFDRixLQUFLLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7SUFDbkIsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO0NBQ3BCLENBQUMsQ0FBQTtBQUVGLHdGQUF3RjtBQUV4RixNQUFNLFdBQVcsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3pCLEdBQUcsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO0lBQ2YsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxPQUFPLEVBQUU7SUFDMUIsS0FBSyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7SUFDakIsS0FBSyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7Q0FDcEIsQ0FBQyxDQUFBO0FBRUYsTUFBTSxZQUFZLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUMxQixPQUFPLEVBQUUsV0FBVztJQUNwQixPQUFPLEVBQUUsV0FBVztJQUNwQixPQUFPLEVBQUUsV0FBVztJQUNwQixPQUFPLEVBQUUsV0FBVztJQUNwQixPQUFPLEVBQUUsV0FBVztJQUNwQixPQUFPLEVBQUUsV0FBVztJQUNwQixPQUFPLEVBQUUsV0FBVztJQUNwQixPQUFPLEVBQUUsV0FBVztJQUNwQixPQUFPLEVBQUUsV0FBVztJQUNwQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUs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