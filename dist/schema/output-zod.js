import { z } from 'zod';
import { AddressSchema, AnalyticsSchema, NavMenuItemSchema } from './utils-zod.js';
const Slot = z.object({});
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
    activeSlots: z.array(z.number()),
})
    .nullish();
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
        disabled: z.string().nullable(),
        isPrimaryPhone: z.boolean(),
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
    makeUrl: z.string(),
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
    businessId: z.string(),
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
        hideNav: z.boolean().optional(),
        hideSocial: z.boolean().optional(),
    })
        .nullable(),
    analytics: AnalyticsSchema.optional(),
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
    /*     imageSize: z.optional(
        z.object({
            width: z.number().nullable(),
            height: z.number().nullable(),
            size: z.string().or(z.number()).nullable(),
        })
    ), */
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
export const CMSPagesSchema = z.array(z.object({
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
}));
export const PageListSchema = z.object({
    pages: z.array(z.object({
        name: z.string(),
        slug: z.string(),
        url: z.string(),
        id: z.string().or(z.number()),
        page_type: z.string().optional(),
    })),
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0LXpvZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NjaGVtYS9vdXRwdXQtem9kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxDQUFDLEVBQUUsTUFBTSxLQUFLLENBQUE7QUFFdkIsT0FBTyxFQUFFLGFBQWEsRUFBRSxlQUFlLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUNsRixNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0FBQ3pCLE1BQU0sY0FBYyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtBQUU1QyxNQUFNLG1CQUFtQixHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDakMsS0FBSyxFQUFFLENBQUM7U0FDSCxLQUFLLENBQ0YsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUNMLEtBQUssRUFBRSxjQUFjO1FBQ3JCLFNBQVMsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO1FBQ3JCLFFBQVEsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM3QixJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtRQUNoQixRQUFRLEVBQUUsY0FBYztRQUN4QixJQUFJLEVBQUUsY0FBYztRQUNwQixRQUFRLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsRUFBRTtLQUNuQyxDQUFDLENBQ0w7U0FDQSxRQUFRLEVBQUU7Q0FDbEIsQ0FBQyxDQUFBO0FBQ0YsTUFBTSxlQUFlLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUM3QixTQUFTLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUNoQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtJQUN2QixLQUFLLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFB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