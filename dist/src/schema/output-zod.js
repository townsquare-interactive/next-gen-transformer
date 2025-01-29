import { z } from 'zod';
import { AddressSchema, AnalyticsSchema, NavMenuItemSchema } from './utils-zod.js';
import { LandingInputSchema } from './input-zod.js';
const Slot = z.object({
    show: z.number().optional(),
    type: z.string().optional(),
    markup: z.string().optional(),
    hasLinks: z.boolean().optional(),
    alignment: z.string().optional(),
    image_src: z.any().optional(),
    image_link: z.string().optional(),
});
const OptionalString = z.string().optional();
const CompositeItemSchema = z.object({
    items: z
        .array(z.object({
        title: OptionalString,
        component: z.string(),
        nav_menu: z.nullable(z.any()),
        name: z.string(),
        subtitle: OptionalString,
        text: OptionalString,
        autoopen: z.boolean().optional(),
    }))
        .optional(),
});
const ContactFormData = z.object({
    formTitle: z.string().optional(),
    formService: z.string(),
    email: z.string().optional(),
    formEmbed: z.string().optional(),
    formFields: z.array(z.object({
        name: z.string(),
        placeholder: z.string().optional(),
        type: z.string().optional(),
        label: z.string(),
        isReq: z.boolean(),
        fieldType: z.string(),
        isVisible: z.boolean(),
        size: z.string(),
    })),
});
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
});
const LogoItem = z
    .object({
    slots: z.array(Slot),
    activeSlots: z.array(z.number()).optional(),
    pct: z.number().optional(),
})
    .nullish()
    .optional();
const Logo = z.object({
    footer: LogoItem,
    header: LogoItem,
    mobile: LogoItem,
});
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
});
const SeoSchema = z.object({
    title: OptionalString,
    descr: OptionalString,
    selectedImages: OptionalString,
    imageOverride: OptionalString,
});
const hours = z.object({
    friday: z.string().nullish(),
    monday: z.string().nullish(),
    sunday: z.string().nullish(),
    tuesday: z.string().nullish(),
    saturday: z.string().nullish(),
    thursday: z.string().nullish(),
    wednesday: z.string().nullish(),
});
//const onlyNumbers = new RegExp(/^\d+$/)
//regext example .regex(/^[2-9]/, 'Area code cannot start with a 1')
const Contact = z.object({
    email: z
        .array(z.object({
        name: OptionalString,
        email: z.string().nullish(),
        disabled: OptionalString,
        isPrimaryEmail: z.boolean().optional(),
    }))
        .optional(),
    hours: z.optional(hours),
    phone: z.array(z.object({
        name: z.string(),
        number: OptionalString,
        disabled: z.string().nullable().optional(),
        isPrimaryPhone: z.boolean().optional(),
    })),
    address: AddressSchema.optional(),
    hideZip: z.optional(z.boolean()),
    advanced: z.optional(z.object({
        lat: z.string(),
        long: z.string(),
    })),
    disabled: z.optional(z.union([z.boolean(), z.string()])),
    hideCity: z.optional(z.boolean()),
    hideState: z.optional(z.boolean()),
    isPrimary: z.optional(z.boolean()),
    hideAddress: z.optional(z.boolean()),
    displayInMap: z.optional(z.boolean()),
    hideAddress2: z.optional(z.boolean()),
    displayInFooter: z.optional(z.boolean()),
    contactLinks: z.optional(z.array(z.object({
        cName: z.string(),
        link: z.string(),
        icon: z.array(z.string()),
        content: z.string(),
        active: z.boolean(),
    }))),
    showContactBox: z.optional(z.boolean()),
});
const Config = z.object({
    mailChimp: z
        .object({
        audId: z.string(),
        datacenter: z.string(),
    })
        .optional(),
    zapierUrl: z.string(),
    makeUrl: z.string().optional(),
});
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
});
const CMSNavItemSchema = z.object({
    ...NavMenuItemSchema.shape,
    submenu: z
        .array(z
        .object({
        submenu: z.array(z.object({ CMSNavItem: NavMenuItemSchema.nullish() })).nullish(),
    })
        .merge(NavMenuItemSchema))
        .optional(),
});
const ActionSchema = z.object({
    name: z.string(),
    text: z.string(),
    icon: z.string().optional(),
});
const ThemeColorsSchema = z.object({
    color: z.string(),
    bgColor: z.string(),
    buttonTextColor: z.string(),
    buttonBgColor: z.string(),
    labelTextColor: z.string(),
    labelBgColor: z.string(),
});
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
});
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
});
const ButtonList = z.array(z.object({
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
}));
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
    itemStyle: z.optional(z.union([
        z.object({
            background: z.string(),
        }),
        z.object({
            backgroundImage: z.string(),
        }),
        z.object({}),
    ])),
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
});
const EmptyArray = z.array(z.string()).refine((arr) => arr.length === 0);
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
];
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
});
const InnerModuleSchema = z.object({
    attributes: AttributesSchema,
    componentType: z.string(),
});
const ModuleSchema = z.array(z.array(z.union([
    InnerModuleSchema,
    EmptyArray, //Empty array allowed
])));
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
});
export const CMSPagesSchema = z.array(ApexPageSchema);
export const PageListSchema = z.object({
    pages: z.array(z.object({
        name: z.string(),
        slug: z.string(),
        url: z.string(),
        id: z.string().or(z.number()),
        page_type: z.string().optional(),
    })),
});
// Schema for ScrapedPageSeo
const ScrapedPageSeoSchema = z.object({
    pageUrl: z.string(),
    title: z.string().optional(),
    metaDescription: z.string().optional(),
    metaKeywords: z.string().optional(),
    ogTitle: z.string().optional(),
});
// Schema for ScrapedPageData
const ScrapedPageDataSchema = z.object({
    seo: ScrapedPageSeoSchema.optional(), // `undefined` translates to `.optional()` in Zod
    images: z.array(z.string()),
    url: z.string(),
    content: z.string().nullable(),
});
// Schema for ScreenshotData
const ScreenshotDataSchema = z.object({
    logoTag: z.string().optional().nullable(),
    companyName: z.string().nullable(),
    address: z.string().nullable(),
    phoneNumber: z.string().nullable(),
    hours: z.string().nullable(),
    links: z.object({
        socials: z.array(z.string()),
        other: z.array(z.string()),
    }),
});
// Schema for ScrapedAndAnalyzedSiteData
export const ScrapedAndAnalyzedSiteDataSchema = z.object({
    baseUrl: z.string(),
    pages: z.array(ScrapedPageDataSchema),
    dudaUploadLocation: z.string().nullable(),
    aiAnalysis: ScreenshotDataSchema.optional(),
    s3LogoUrl: z.string().optional(),
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0LXpvZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zY2hlbWEvb3V0cHV0LXpvZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsQ0FBQyxFQUFFLE1BQU0sS0FBSyxDQUFBO0FBQ3ZCLE9BQU8sRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFFLGlCQUFpQixFQUFFLE1BQU0sZ0JBQWdCLENBQUE7QUFDbEYsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sZ0JBQWdCLENBQUE7QUFFbkQsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNsQixJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUMzQixJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUMzQixNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUM3QixRQUFRLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUNoQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUNoQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUM3QixVQUFVLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtDQUNwQyxDQUFDLENBQUE7QUFDRixNQUFNLGNBQWMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUE7QUFFNUMsTUFBTSxtQkFBbUIsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ2pDLEtBQUssRUFBRSxDQUFDO1NBQ0gsS0FBSyxDQUNGLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDTCxLQUFLLEVBQUUsY0FBYztRQUNyQixTQUFTLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFB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QUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNqQyxNQUFNLEVBQUUsY0FBYztJQUN0QixLQUFLLEVBQUUsY0FBYztJQUNyQixjQUFjLEVBQUUsY0FBYztDQUNqQyxDQUFDLENBQ0wsQ0FBQTtBQUVELE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDckMsRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxPQUFPLEVBQUU7SUFDeEIsSUFBSSxFQUFFLGNBQWM7SUFDcEIsSUFBSSxFQUFFLGNBQWM7SUFDcEIsS0FBSyxFQUFFLGNBQWM7SUFDckIsS0FBSyxFQUFFLGNBQWM7SUFDckIsS0FBSyxFQUFFLGNBQWM7SUFDckIsS0FBSyxFQUFFLGNBQWM7SUFDckIsTUFBTSxFQUFFLGNBQWM7SUFDdEIsT0FBTyxFQUFFLGNBQWM7SUFDdkIsT0FBTyxFQUFFLGNBQWM7SUFDdkIsT0FBTyxFQUFFLGNBQWM7SUFDdkIsUUFBUSxFQUFFLGNBQWM7SUFDeEIsUUFBUSxFQUFFLGNBQWM7SUFDeEIsUUFBUSxFQUFFLGNBQWM7SUFDeEIsUUFBUSxFQUFFLGNBQWM7SUFDeEIsUUFBUSxFQUFFLGNBQWM7SUFDeEIsUUFBUSxFQUFFLGNBQWM7SUFDeEIsUUFBUSxFQUFFLGNBQWM7SUFDeEIsU0FBUyxFQUFFLGNBQWM7SUFDekIsU0FBUyxFQUFFLGNBQWM7SUFDekIsU0FBUyxFQUFFLGNBQWM7SUFDekIsU0FBUyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLEVBQUU7SUFDakMsU0FBUyxFQUFFLGNBQWM7SUFDekIsU0FBUyxFQUFFLGNBQWM7SUFDekIsU0FBUyxFQUFFLGNBQWM7SUFDekIsU0FBUyxFQUFFLGNBQWM7SUFDekIsVUFBVSxFQUFFLGNBQWM7SUFDMUIsVUFBVSxFQUFFLGNBQWM7SUFDMUIsVUFBVSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENB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