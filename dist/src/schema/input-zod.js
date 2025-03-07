import { z } from 'zod';
import { AddressSchema, AnalyticsSchema, NavMenuItemSchema } from './utils-zod.js';
import { extendZodWithOpenApi } from 'zod-openapi';
/* ----------------------------------- Saved Data -------------------------------------*/
extendZodWithOpenApi(z);
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
const URL = z
    .string()
    .regex(/^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/, {
    message: 'Invalid URL format',
})
    .openapi({
    description: 'Website URL',
    example: 'https://example.com',
});
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
    favicon: 'https://townsquareignite.s3.us-east-1.amazonaws.com/landing-pages/clients/auxhomeservices.com/images/selected/aux_logo_tagline_cmyk-removebg-preview.png',
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
                descLessText: "Our team provides unparalleled service excellence and solutions designed to meet your home's specific needs, ensuring comfort and efficiency all year round.",
                descMoreText: "With several decades of experience, AUX Home Services excels in delivering high-quality HVAC, plumbing, and electrical services to homeowners throughout Birmingham and surrounding areas. Our certified professionals are equipped to handle any job, big or small, with precision and care. Whether it's a simple repair, routine maintenance, or a complex installation, we ensure that every task meets the highest standards of workmanship and safety. Our commitment to customer satisfaction means we are dedicated to solving your home's most pressing needs efficiently and affordably.",
                descMaxText: 'At AUX Home Services, we pride ourselves on offering a comprehensive range of home service solutions tailored to the specific needs of your family and property. Our expert technicians utilize the latest industry technology and techniques to provide precise and reliable solutions. From upgrading an aging HVAC system to clearing clogged drains, our services are designed to improve the quality and comfort of your home environment. We believe in transparent pricing without hidden fees, ensuring our clients receive the best value for their investments. Trust AUX Home Services to deliver the impeccable service and lasting results that Birmingham homeowners deserve.',
                desc2LessText: 'Discover how our tailored HVAC, plumbing, and electrical solutions provide comfort, efficiency, and peace of mind.',
                desc2MoreText: "AUX Home Services is committed to delivering exceptional service that addresses and rectifies all of your home's service needs efficiently. We specialize in HVAC systems, ensuring that whether it's the height of summer or the depths of winter, your home remains a haven of comfort. Our licensed plumbing professionals tackle everything from leaks to installations, ensuring reliable and sustainable service every time. Additionally, our electrical experts can assist with installations, rewiring, and safety inspections while adhering to all industry standards. The expertise and detailed attention we dedicate to each project set AUX Home Services apart as Birmingham's premier choice for home solutions.",
                desc2MaxText: "Over the years, AUX Home Services has developed a reputation for excellence by adhering to our core values of integrity, transparency, and customer-focused service. Each member of our team undergoes rigorous training to stay updated with industry innovations and safety standards, ensuring that every client receives state-of-the-art service and solutions. Whether protecting your home from Alabama's unpredictable weather with robust HVAC systems or resolving persistent plumbing problems, we provide solutions engineered for optimal performance and efficiency. Our approach is personalized; we conduct thorough inspections and consultations to understand your needs before presenting the most effective solution. By choosing AUX Home Services, you are selecting a partner committed to enhancing your home's comfort and safety.",
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
};
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
});
const SaveFileMethod = z.literal('writeFolder').or(z.literal('s3Upload').or(z.literal('test').or(z.literal('dudaUpload'))));
const scrapeExample = {
    url: 'https://siteexample.com',
    saveMethod: 's3Upload',
    uploadLocation: '234kj324lk32jl3klllk3',
    backupImagesSave: true,
    saveImages: true,
    analyzeHomepageData: true,
    scrapeImages: true,
};
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
})
    .openapi({
    example: scrapeExample,
});
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
});
//request body coming from AI tool
export const GetPageListSchema = z.object({
    url: URL,
});
export const RequestDataSchema = z.object({
    domain: z.string().refine((domain) => domain.includes('/'), {
        message: "The domain must include a '/'",
    }),
});
ScrapeWebsiteSchema.openapi({ ref: 'scrape-site' });
LandingInputSchema.openapi({ ref: 'landing' });
GetPageListSchema.openapi({ ref: 'get-page-list' });
ScrapePagesSchema.openapi({ ref: 'scrape-pages' });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtem9kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NjaGVtYS9pbnB1dC16b2QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLENBQUMsRUFBRSxNQUFNLEtBQUssQ0FBQTtBQUN2QixPQUFPLEVBQUUsYUFBYSxFQUFFLGVBQWUsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGdCQUFnQixDQUFBO0FBQ2xGLE9BQU8sRUFBRSxvQkFBb0IsRUFBa0IsTUFBTSxhQUFhLENBQUE7QUFDbEUseUZBQXlGO0FBRXpGLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFBO0FBRXZCLE1BQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDeEIsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7SUFDZixNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtJQUNsQixNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtJQUNsQixHQUFHLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtJQUNmLE9BQU8sRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO0NBQ3RCLENBQUMsQ0FBQTtBQUVGLE1BQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDeEIsU0FBUyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDaEIsY0FBYyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUM7S0FDN0MsQ0FBQztJQUNGLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7SUFDN0IsVUFBVSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7SUFDdEIsY0FBYyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7SUFDMUIsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUU7SUFDbkQsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUU7Q0FDdEQsQ0FBQyxDQUFBO0FBRUY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztLQXdFSztBQUVMLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUM5QixJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUNYLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO1FBQ2QsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7UUFDaEIsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7UUFDbEIsT0FBTyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7UUFDbkIsT0FBTyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDeEMsUUFBUSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLCtDQUErQztRQUNoRixTQUFTLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxRQUFRLEVBQUU7UUFDaEQsV0FBVyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUU7UUFDbEMsU0FBUyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLEVBQUU7S0FDbkMsQ0FBQztJQUNGLEtBQUssRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztJQUNuQixHQUFHLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7Q0FDcEIsQ0FBQyxDQUFBO0FBRUYsd0ZBQXdGO0FBRXhGLE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDekIsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7SUFDZixJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLE9BQU8sRUFBRTtJQUMxQixLQUFLLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtJQUNqQixLQUFLLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtDQUNwQixDQUFDLENBQUE7QUFFRixNQUFNLFlBQVksR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQzFCLE9BQU8sRUFBRSxXQUFXO0lBQ3BCLE9BQU8sRUFBRSxXQUFXO0lBQ3BCLE9BQU8sRUFBRSxXQUFXO0lBQ3BCLE9BQU8sRUFBRSxXQUFXO0lBQ3BCLE9BQU8sRUFBRSxXQUFXO0lBQ3BCLE9BQU8sRUFBRSxXQUFXO0lBQ3BCLE9BQU8sRUFBRSxXQUFXO0lBQ3BCLE9BQU8sRUFBRSxXQUFXO0lBQ3BCLE9BQU8sRUFBRSxXQUFXO0lBQ3BCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lBQ3JCLFFBQVEsRUFBRSxXQUFXO0lB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