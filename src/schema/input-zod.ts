import { z } from 'zod'
import { AddressSchema, AnalyticsSchema, NavMenuItemSchema } from './utils-zod.js'
import { extendZodWithOpenApi } from 'zod-openapi'
/* ----------------------------------- Saved Data -------------------------------------*/

extendZodWithOpenApi(z)

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
    domain: z.string(),
})
export const RemoveLandingProjectSchema = z.object({
    apexID: z.string(),
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
        descLessText: z.string().optional(),
        descMoreText: z.string().optional(),
        descMaxText: z.string().optional(),
        desc2LessText: z.string().optional(),
        desc2MoreText: z.string().optional(),
        desc2MaxText: z.string().optional(),
        desc: z.string().optional(),
        desc2: z.string().optional(),
        descSize: z.string().optional(),
        desc2Size: z.string().optional(),
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

export const SubdomainInputSchema = z.object({
    subdomain: z.string().min(1),
})

const Logos = z.object({
    header: z.string().optional(),
    footer: z.string().optional(),
    mobile: z.string().optional(),
})

const CustomOptions = z.object({
    fonts: z
        .array(
            z.object({
                key: z.string(),
                count: z.number(),
                isFirstPlace: z.boolean(),
            })
        )
        .optional(),
    code: ScriptsSchema.optional(),
    headerCtaButtons: HeaderButtonsObj,
    analytics: AnalyticsSchema.optional(),
    customComponents: z.array(CustomComponentSchema).optional(),
})

const ContactData = z.object({
    address: AddressSchema.optional(),
    phoneNumber: z.string().optional(),
    email: z.union([z.string().email(), z.literal('')]),
})

const URL = z
    .string()
    .regex(/^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/, {
        message: 'Invalid URL format',
    })
    .openapi({
        description: 'Website URL',
        example: 'https://example.com',
    })

const landingExample = {
    siteName: 'Joes Burgers',
    url: 'https://example.com',
    productionDomain: 'thejoefood.com',
    subdomainOverride: 'jburgs',
    s3Folder: 'joesburgers',
    pageUri: 'home',
    logos: {
        header: 'https://townsquareignite.s3.us-east-1.amazonaws.com/landing-pages/clients/auxhomeservices.com/images/selected/aux_logo_tagline_cmyk-removebg-preview.png',
        footer: '',
    },
    favicon:
        'https://townsquareignite.s3.us-east-1.amazonaws.com/landing-pages/clients/auxhomeservices.com/images/selected/aux_logo_tagline_cmyk-removebg-preview.png',
    contactData: {
        address: {
            zip: '35209',
            city: 'Birmingham',
            name: 'Western Location',
            state: 'AL',
            street: '100 Crescent Ct',
        },
        phoneNumber: '392-111-2044',
        email: 'thetest@gmail.com',
    },
    socials: ['http://www.facebook.com/busname/', 'http://www.twitter.com/busname', 'http://instagram.com/busname/', 'http://www.twitter.com/busname/'],
    seo: {
        global: {
            aiosp_home_title: 'AUX Home Services | HVAC Experts',
            aiosp_google_verify: 'google_verify',
            aiosp_home_description: 'Your trusted partner for HVAC, Plumbing, and Electrical solutions in Birmingham, AL.',
        },
    },
    colors: {
        primary: '#014c97',
        accent: '#c10222',
        tertiary: '#b94a48',
        headerBackground: '',
        footerText: '#FFFFFF',
        footerBackground: '#1F2937',
    },
    title: 'Joes burgers Shop',
    description: 'Shop with burgers and more',
    page: {
        sections: [
            {
                headline: 'Expert HVAC Services',
                subheader: 'Superior Solutions for Your Home',
                ctaText: 'Get a Free Quote',
                ctaLink: '',
                dataLayerEventBtn: '',
                dataLayerEventWrap: '',
                image: 'https://townsquareignite.s3.us-east-1.amazonaws.com/landing-pages/clients/auxhomeservices.com/images/selected/Financing-Image.png',
                components: [
                    {
                        type: 'coupon',
                        image: '',
                    },
                    {
                        type: 'form',
                        embed: '',
                        contactFormTitle: '',
                    },
                ],
            },
            {
                headline: 'Trust Our Expertise',
                subheader: 'Excellence in Home Services',
                desc: "Our team provides unparalleled service excellence and solutions designed to meet your home's specific needs, ensuring comfort and efficiency all year round.",
                descSize: 'descLessText',
                desc2: 'Discover how our tailored HVAC, plumbing, and electrical solutions provide comfort, efficiency, and peace of mind.',
                desc2Size: 'desc2LessText',
                ctaText: 'Learn More Now',
                ctaLink: '',
                dataLayerEventBtn: '',
                dataLayerEventWrap: '',
                components: [
                    {
                        type: 'video',
                        videoUrl: '',
                    },
                ],
                descLessText:
                    "Our team provides unparalleled service excellence and solutions designed to meet your home's specific needs, ensuring comfort and efficiency all year round.",
                descMoreText:
                    "With several decades of experience, AUX Home Services excels in delivering high-quality HVAC, plumbing, and electrical services to homeowners throughout Birmingham and surrounding areas. Our certified professionals are equipped to handle any job, big or small, with precision and care. Whether it's a simple repair, routine maintenance, or a complex installation, we ensure that every task meets the highest standards of workmanship and safety. Our commitment to customer satisfaction means we are dedicated to solving your home's most pressing needs efficiently and affordably.",
                descMaxText:
                    'At AUX Home Services, we pride ourselves on offering a comprehensive range of home service solutions tailored to the specific needs of your family and property. Our expert technicians utilize the latest industry technology and techniques to provide precise and reliable solutions. From upgrading an aging HVAC system to clearing clogged drains, our services are designed to improve the quality and comfort of your home environment. We believe in transparent pricing without hidden fees, ensuring our clients receive the best value for their investments. Trust AUX Home Services to deliver the impeccable service and lasting results that Birmingham homeowners deserve.',
                desc2LessText: 'Discover how our tailored HVAC, plumbing, and electrical solutions provide comfort, efficiency, and peace of mind.',
                desc2MoreText:
                    "AUX Home Services is committed to delivering exceptional service that addresses and rectifies all of your home's service needs efficiently. We specialize in HVAC systems, ensuring that whether it's the height of summer or the depths of winter, your home remains a haven of comfort. Our licensed plumbing professionals tackle everything from leaks to installations, ensuring reliable and sustainable service every time. Additionally, our electrical experts can assist with installations, rewiring, and safety inspections while adhering to all industry standards. The expertise and detailed attention we dedicate to each project set AUX Home Services apart as Birmingham's premier choice for home solutions.",
                desc2MaxText:
                    "Over the years, AUX Home Services has developed a reputation for excellence by adhering to our core values of integrity, transparency, and customer-focused service. Each member of our team undergoes rigorous training to stay updated with industry innovations and safety standards, ensuring that every client receives state-of-the-art service and solutions. Whether protecting your home from Alabama's unpredictable weather with robust HVAC systems or resolving persistent plumbing problems, we provide solutions engineered for optimal performance and efficiency. Our approach is personalized; we conduct thorough inspections and consultations to understand your needs before presenting the most effective solution. By choosing AUX Home Services, you are selecting a partner committed to enhancing your home's comfort and safety.",
            },
            {
                headline: 'Contact Us Today',
                ctaText: 'Schedule a Visit',
                ctaLink: '',
                dataLayerEventBtn: '',
                dataLayerEventWrap: '',
                reviewHeadline: '',
                reviews: [],
            },
        ],
    },
    customOptions: {},
}

//request body coming from AI tool
export const LandingInputSchema = z
    .object({
        siteName: z.string().openapi({
            description: 'The business name',
            example: landingExample.siteName,
        }),
        url: URL,
        productionDomain: z.string().optional().openapi({
            description: 'Domain override for production',
            example: landingExample.productionDomain,
        }),
        subdomainOverride: z.string().optional().openapi({
            description: 'Override subdomain',
            example: landingExample.subdomainOverride,
        }),
        s3Folder: z.string().optional().openapi({
            description: 'Scraped site name with removed protocol',
            example: landingExample.s3Folder,
        }),
        pageUri: z.string().optional().optional().openapi({
            description: 'Page slug for the landing page',
            example: landingExample.pageUri,
        }),
        logos: Logos.optional().openapi({
            description: 'URLs for site logos',
            example: landingExample.logos,
        }),
        favicon: z.string().optional().openapi({
            description: 'Link for favicon',
            example: landingExample.favicon,
        }),
        contactData: ContactData.openapi({
            description: 'Contact data from scraped site',
            example: landingExample.contactData,
        }),
        socials: SocialSchema.optional().openapi({
            description: 'List of social media links',
            example: landingExample.socials,
        }),
        seo: z.object({ global: SEOGlobalSchema }).optional().openapi({
            description: 'Site SEO data',
            example: landingExample.seo,
        }),
        colors: ColorInputSchema.openapi({
            description: 'Color variables for the site',
            example: landingExample.colors,
        }),
        title: z.string().optional().openapi({
            description: 'Site title',
            example: landingExample.title,
        }),
        description: z.string().optional().openapi({
            description: 'Meta description',
            example: landingExample.description,
        }),
        page: PageSchema.openapi({
            description: 'Page content and components',
            example: landingExample.page,
        }),
        customOptions: CustomOptions,
    })
    .openapi({
        example: landingExample,
    })

const SaveFileMethod = z.literal('s3Upload').or(z.literal('test').or(z.literal('dudaUpload')))

const scrapeExample = {
    url: 'https://siteexample.com',
    saveMethod: 's3Upload',
    uploadLocation: '234kj324lk32jl3klllk3',
    backupImagesSave: true,
    saveImages: true,
    analyzeHomepageData: true,
    scrapeImages: true,
    queueScrape: false,
} as const

const siteType = z.literal('priority').or(z.literal('secondary')).optional().openapi({
    description: 'Will site be saved as primary or secondary site',
    default: 'priority',
})

//request body coming from AI tool
export const ScrapeWebsiteSchema = z
    .object({
        url: URL,
        saveMethod: SaveFileMethod.optional().openapi({
            description: 'The method of saving images',
            example: scrapeExample.saveMethod,
            default: 's3Upload',
        }),
        uploadLocation: z.string().optional().openapi({
            description: 'Duda site ID for uploading images',
            example: scrapeExample.uploadLocation,
        }),
        backupImagesSave: z.boolean().optional().openapi({
            description: 'Boolean on whether or not to backup images to S3 (on by default)',
            default: scrapeExample.backupImagesSave,
        }),
        saveImages: z.boolean().optional().openapi({
            description: 'Boolean on whether or not to save images at all',
            default: scrapeExample.saveImages,
        }),
        analyzeHomepageData: z.boolean().optional().openapi({
            description: 'Boolean on whether or not to analyze with AI',
            default: scrapeExample.analyzeHomepageData,
        }),
        scrapeImages: z.boolean().optional().openapi({
            description: 'Boolean on whether or not to scrape for images',
            default: scrapeExample.scrapeImages,
        }),
        queueScrape: z.boolean().optional().openapi({
            description: 'Boolean on whether or not to queue the scrape',
            default: scrapeExample.queueScrape,
        }),
        siteType: siteType,
    })
    .openapi({
        example: scrapeExample,
    })

export const ScrapeSettings = ScrapeWebsiteSchema.extend({
    basePath: z.string(),
})

//request body coming from AI tool
export const ScrapePagesSchema = ScrapeWebsiteSchema.extend({
    pages: z.array(URL).openapi({
        example: ['https://example.com', 'https://examples.com/test'],
        description: 'List of pages to scrape',
    }),
}).openapi({
    // Add OpenAPI metadata to the entire schema
    description: 'Schema for scraping multiple pages from a website',
    example: {
        url: 'https://example.com',
        pages: ['https://example.com/page1', 'https://example.com/page2'],
        saveMethod: 's3Upload',
        backupImagesSave: true,
        saveImages: true,
        analyzeHomepageData: true,
        scrapeImages: true,
    },
})

//request body coming from AI tool
export const GetPageListSchema = z.object({
    url: URL,
})

//request body coming from AI tool
export const GetScrapeDataSchema = z.object({
    url: URL,
})

//request body coming from AI tool
export const MoveS3DataToDudaSchema = z.object({
    url: URL,
    uploadLocation: z.string(),
    siteType: siteType,
})

export const RequestDataSchema = z.object({
    domain: z.string().refine((domain) => domain.includes('/'), {
        message: "The domain must include a '/'",
    }),
})

//request body coming from AI tool
export const ToggleBusinessSchema = z.object({
    siteName: z.string(),
    toggleOption: z.boolean(),
})

export const SaveGeneratedContentSchema = z.object({
    gpid: z.string(),
    homepage_content: z.string().optional(),
    service_1_name: z.string().optional(),
    service_1_content: z.string().optional(),
    service_2_name: z.string().optional(),
    service_2_content: z.string().optional(),
    service_3_name: z.string().optional(),
    service_3_content: z.string().optional(),
    service_4_name: z.string().optional(),
    service_4_content: z.string().optional(),
    service_5_name: z.string().optional(),
    service_5_content: z.string().optional(),
    service_6_name: z.string().optional(),
    service_6_content: z.string().optional(),
})

export type Url = z.infer<typeof URL>
export type HeaderButtons = z.infer<typeof HeaderButtonsObj>
export type ScrapeWebsiteReq = z.infer<typeof ScrapeWebsiteSchema>
export type ScrapeSettings = z.infer<typeof ScrapeSettings>
export type LandingReq = z.infer<typeof LandingInputSchema>
export type RequestDataReq = z.infer<typeof RequestDataSchema>
export type CustomComponent = z.infer<typeof CustomComponentSchema>
export type AiPageModules = z.infer<typeof pageModules>
export type Sections = z.infer<typeof PageSectionSchema>
export type LandingColors = z.infer<typeof LandingColorsSchema>
export type RemoveLandingPageReq = z.infer<typeof RemoveLandingPageSchema>
export type RemoveLandingProjectReq = z.infer<typeof RemoveLandingProjectSchema>
export type SaveFileMethodType = z.infer<typeof SaveFileMethod>
export type SaveGeneratedContentReq = z.infer<typeof SaveGeneratedContentSchema>

ScrapeWebsiteSchema.openapi({ ref: 'scrape-site' })
LandingInputSchema.openapi({ ref: 'landing' })
GetPageListSchema.openapi({ ref: 'get-page-list' })
ScrapePagesSchema.openapi({ ref: 'scrape-pages' })
GetScrapeDataSchema.openapi({ ref: 'get-scraped-data' })
MoveS3DataToDudaSchema.openapi({ ref: 'move-s3-data-to-duda' })
ToggleBusinessSchema.openapi({ ref: 'toggle-business-schema' })
SaveGeneratedContentSchema.openapi({ ref: 'save-generated-content' })
