import { createDocument } from 'zod-openapi'
import { GetPageListSchema, LandingInputSchema, ScrapePagesSchema, ScrapeWebsiteSchema } from './src/schema/input-zod.js'
import * as errorTypes from './src/utilities/errors.json' assert { type: 'json' }

const scrapeResponseExample = {
    imageUploadTotal: 29,
    failedImageCount: 0,
    uploadedResources: [
        {
            fileName: 'https://townsquareinteractive.s3.us-east-1.amazonaws.com/aquapoolandspaoh%2Fscraped%2Fimages%2Fv1_4593b7d7.png',
            status: 'uploaded',
        },
        {
            fileName: 'https://townsquareinteractive.s3.us-east-1.amazonaws.com/aquapoolandspaoh%2Fscraped%2Fimages%2Fstar4.png',
            status: 'uploaded',
        },
        {
            fileName:
                'https://townsquareinteractive.s3.us-east-1.amazonaws.com/aquapoolandspaoh%2Fscraped%2Fimages%2FACg8ocLbelpzoqf5qsCcg9cJRyGkSzNid6Jws3Kyg2INS5tNi9CM4g%3Ds72-p-mo.jpg',
            status: 'uploaded',
        },
    ],
    failedImages: [],
    s3LogoUrl: 'https://townsquareinteractive.s3.us-east-1.amazonaws.com/aquapoolandspaoh%2Fscraped%2Fimages%2Flogos%2Fheader-logo.png',
    scrapedPages: [
        {
            url: 'https://aquapoolandspaoh.com/',
            seo: {
                title: 'Aqua Pool & Spa | Custom Pools | Pool Hardscaping | New Martinsville, WV & Hannibal, OH',
                metaDescription:
                    'Aqua Pool & Spa provides custom pool installation services including concrete, fiberglass & vinyl pools. Serving New Martinsville, WV & Hannibal, OH. Call today!',
                metaKeywords: '',
                ogTitle: 'Aqua Pool & Spa | Custom Pools | Pool Hardscaping | New Martinsville, WV & Hannibal, OH',
                ogDescription:
                    'Aqua Pool & Spa provides custom pool installation services including concrete, fiberglass & vinyl pools. Serving New Martinsville, WV & Hannibal, OH. Call today!',
                pageUrl: 'https://aquapoolandspaoh.com/',
            },
            images: [
                '',
                'https://aquapoolandspaoh.com/files/shutterstock/2023/11/1699373659636_shutterstock_316062692_1699373171_e1b44676722eb2c8eb7630f90d0a37024f.jpg?w=1600&h=2133',
                'https://aquapoolandspaoh.com/files/shutterstock/2023/11/1699373659636_shutterstock_316062692_1699373171_e1b44676722eb2c8eb7630f90d0a37024f.jpg?w=1600&h=2133&ct=1',
                'https://aquapoolandspaoh.com/files/shutterstock/2023/11/shutterstock_613622132_1699545014_e1a3b5ae99e0e77bd06cfea271179a4410.jpg?w=1600&h=2133',
                'https://aquapoolandspaoh.com/files/shutterstock/2023/11/shutterstock_613622132_1699545014_e1a3b5ae99e0e77bd06cfea271179a4410.jpg?w=1600&h=2133&ct=1',
            ],
            content:
                "Hire a Reputable and Licensed Pool Installer\nWe can install vinyl, concrete or fiberglass pools\n Contact Us\n\nMake Your Home the Neighborhood Hangout\nWe're licensed to complete pool installations in Ohio, West Virginia and Pennsylvania\n Request a Quote\n\nTake Your Property to the Next Level With Custom Pool Construction\nLook into the pool installation services we offer throughout New Martinsville, WV, Hannibal, OH and the surrounding areas\n Contact Us\n\nHire a Reputable and Licensed Pool Installer\nWe can install vinyl, concrete or fiberglass pools\n Contact Us\n\nMake Your Home the Neighborhood Hangout\nWe're licensed to complete pool installations in Ohio, West Virginia and Pennsylvania\n Request a Quote\n\n123\n\n\n\n\n\n                \n                \n                \n                 \n\nWe Offer Our Services in \n\n\n\n\n\n\n\n\n All Summer Long With Your Own Private Pool\n\n\n\nTurn to us for custom pool construction services in or around New Martinsville, WV or Hannibal, OH\n\nOne of the best ways to add more fun to your summer and drastically increase the value of your property is with a custom pool installation. At Aqua Pool & Spa, we have over a decade of experience providing top-quality pool installation services to homeowners in New Martinsville, WV, Hannibal, OH and beyond.We install vinyl pools, concrete pools and fiberglass pools. We can even build pool hardscaping features and enhance your existing pool with a pool slide or diving board.For a free estimate on the pool building services we offer, contact us today.\n\n\n\n\n\n\n\nConcrete Pools\nLet us build a custom concrete pool for your backyard.\n Learn More\n\n\nFiberglass Pools\nEnjoy swimming in privacy with your own fiberglass pool installation.\n Learn More\n\n\nVinyl Pools\nWe'll install a beautiful vinyl pool on your property.\n Learn More\n\n\nPool Hardscaping\nEnhance the appearance of your pool area with our hardscaping services.\n Learn More\n\n\n\n\n\n\n                 \n\nWhy choose us to install your pool?\n\nWe're licensed in Ohio, West Virginia and Pennsylvania. Home builders and homeowners choose us for custom pool construction services because of our:Attention to detailQuality workTimelinessDecade of experienceProfessionalismHave any questions about our pool installation services? Call 740-312-7321 now to learn more.\n\n\n\n\n\n\n\n\n\n\n                \n                \n            \n\n\n\n\n\n\n\n\n\n        \n        \n\nContactLet's Talk!Thanks for stopping by! We're here to help, please don't hesitate to reach out.Get in touch Contact us",
            forms: [],
        },
    ],
    url: 'https://aquapoolandspaoh.com/',
    siteData: {
        baseUrl: 'https://aquapoolandspaoh.com/',
        pages: [
            {
                url: 'https://aquapoolandspaoh.com/',
                seo: {
                    title: 'Aqua Pool & Spa | Custom Pools | Pool Hardscaping | New Martinsville, WV & Hannibal, OH',
                    metaDescription:
                        'Aqua Pool & Spa provides custom pool installation services including concrete, fiberglass & vinyl pools. Serving New Martinsville, WV & Hannibal, OH. Call today!',
                    metaKeywords: '',
                    ogTitle: 'Aqua Pool & Spa | Custom Pools | Pool Hardscaping | New Martinsville, WV & Hannibal, OH',
                    ogDescription:
                        'Aqua Pool & Spa provides custom pool installation services including concrete, fiberglass & vinyl pools. Serving New Martinsville, WV & Hannibal, OH. Call today!',
                    pageUrl: 'https://aquapoolandspaoh.com/',
                },
                images: [
                    '',
                    'https://aquapoolandspaoh.com/files/shutterstock/2023/11/1699373659636_shutterstock_316062692_1699373171_e1b44676722eb2c8eb7630f90d0a37024f.jpg?w=1600&h=2133',
                    'https://aquapoolandspaoh.com/files/shutterstock/2023/11/1699373659636_shutterstock_316062692_1699373171_e1b44676722eb2c8eb7630f90d0a37024f.jpg?w=1600&h=2133&ct=1',
                    'https://aquapoolandspaoh.com/files/shutterstock/2023/11/shutterstock_613622132_1699545014_e1a3b5ae99e0e77bd06cfea271179a4410.jpg?w=1600&h=2133',
                    'https://aquapoolandspaoh.com/files/shutterstock/2023/11/shutterstock_613622132_1699545014_e1a3b5ae99e0e77bd06cfea271179a4410.jpg?w=1600&h=2133&ct=1',
                ],
                content:
                    "Hire a Reputable and Licensed Pool Installer\nWe can install vinyl, concrete or fiberglass pools\n Contact Us\n\nMake Your Home the Neighborhood Hangout\nWe're licensed to complete pool installations in Ohio, West Virginia and Pennsylvania\n Request a Quote\n\nTake Your Property to the Next Level With Custom Pool Construction\nLook into the pool installation services we offer throughout New Martinsville, WV, Hannibal, OH and the surrounding areas\n Contact Us\n\nHire a Reputable and Licensed Pool Installer\nWe can install vinyl, concrete or fiberglass pools\n Contact Us\n\nMake Your Home the Neighborhood Hangout\nWe're licensed to complete pool installations in Ohio, West Virginia and Pennsylvania\n Request a Quote\n\n123\n\n\n\n\n\n                \n                \n                \n                 \n\nWe Offer Our Services in \n\n\n\n\n\n\n\n\n All Summer Long With Your Own Private Pool\n\n\n\nTurn to us for custom pool construction services in or around New Martinsville, WV or Hannibal, OH\n\nOne of the best ways to add more fun to your summer and drastically increase the value of your property is with a custom pool installation. At Aqua Pool & Spa, we have over a decade of experience providing top-quality pool installation services to homeowners in New Martinsville, WV, Hannibal, OH and beyond.We install vinyl pools, concrete pools and fiberglass pools. We can even build pool hardscaping features and enhance your existing pool with a pool slide or diving board.For a free estimate on the pool building services we offer, contact us today.\n\n\n\n\n\n\n\nConcrete Pools\nLet us build a custom concrete pool for your backyard.\n Learn More\n\n\nFiberglass Pools\nEnjoy swimming in privacy with your own fiberglass pool installation.\n Learn More\n\n\nVinyl Pools\nWe'll install a beautiful vinyl pool on your property.\n Learn More\n\n\nPool Hardscaping\nEnhance the appearance of your pool area with our hardscaping services.\n Learn More\n\n\n\n\n\n\n                 \n\nWhy choose us to install your pool?\n\nWe're licensed in Ohio, West Virginia and Pennsylvania. Home builders and homeowners choose us for custom pool construction services because of our:Attention to detailQuality workTimelinessDecade of experienceProfessionalismHave any questions about our pool installation services? Call 740-312-7321 now to learn more.\n\n\n\n\n\n\n\n\n\n\n                \n                \n            \n\n\n\n\n\n\n\n\n\n        \n        \n\nContactLet's Talk!Thanks for stopping by! We're here to help, please don't hesitate to reach out.Get in touch Contact us",
                forms: [],
            },
        ],
        dudaUploadLocation: '',
        aiAnalysis: {
            logoTag: '<img src="/files/2023/11/water-drop-white.png">',
            companyName: 'Aqua Pool & Spa',
            address: 'Hannibal, OH 43931',
            phoneNumber: '(740) 312-7321',
            hours: 'Mon: 7:00AM-7:00PM, Tue: 7:00AM-7:00PM, Wed: 7:00AM-7:00PM, Thu: 7:00AM-7:00PM, Fri: 7:00AM-7:00PM, Sat: 7:00AM-7:00PM, Sun: 7:00AM-7:00PM',
            styles: {
                colors: {
                    primaryColor: '#1A6F8D',
                    secondaryColor: '#ffffff',
                    tertiaryColor: '#4DB6AC',
                    quaternary: null,
                    textColor: '#4A4A4A',
                    mainContentBackgroundColor: '#008C7A',
                },
                fonts: {
                    headerFonts: ['Abril Fatface', 'Arial', 'sans-serif'],
                    bodyFonts: ['Arial', 'sans-serif'],
                },
            },
            links: {
                socials: [],
                other: ['https://maps.google.com/maps?daddr=, Hannibal, OH 43931'],
            },
        },
    },
}

/* const landingResponseExample = {
    url: 'https://joshtesthome.com/',
    subdomainOverride: '',
    productionDomain: '',
    s3Folder: 'joshtesthome.com',
    pageName: 'GTM Conversion Linker Test',
    pageUri: 'gtm-conversion-linker-test',
    userName: '',
    lastSavedDate: '',
    siteName: 'AUX Home Services',
    title: 'Aux Home Services | HVAC Company in Hueytown & Birmingham, AL',
    description: '',
    logos: {
        header: 'https://townsquareignite.s3.us-east-1.amazonaws.com/landing-pages/clients/auxhomeservices.com/images/selected/aux_logo_tagline_cmyk-removebg-preview.png',
        footer: '',
    },
    favicon: '',
    contactData: {
        address: {
            zip: '35209',
            city: 'Birmingham',
            name: '',
            state: 'AL',
            street: '100 Crescent Ct',
        },
        phoneNumber: '',
        email: '',
    },
    colors: {
        primary: '#014c97',
        accent: '#c10222',
        tertiary: '#b94a48',
        headerBackground: '',
        footerText: '#FFFFFF',
        footerBackground: '#1F2937',
    },
    seo: {
        global: {
            aiosp_home_title: 'AUX Home Services | HVAC Experts',
            aiosp_google_verify: 'google_verify',
            aiosp_home_description: 'Your trusted partner for HVAC, Plumbing, and Electrical solutions in Birmingham, AL.',
        },
    },
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
    socials: ['http://www.facebook.com/AUXHomeServices/'],
    customOptions: {
        fonts: [],
        code: {
            header: '',
            body: '',
        },
        headerCtaButtons: {
            button1: {
                label: '',
                link: '',
                dataLayerEvent: 'header_btn_1_click',
            },
            button2: {
                label: '',
                link: '',
                dataLayerEvent: 'header_btn_2_click',
            },
        },
        analytics: {
            gtmId: '',
            gaId: '',
        },
        customComponents: [
            {
                type: 'Webchat',
                apiKey: '',
            },
            {
                type: 'ScheduleEngine',
                apiKey: '',
            },
            {
                type: 'BMP',
                apiKey: '',
            },
        ],
    },
} */

const landing200ResponseExample = {
    message: "site domain published'",
    domain: 'thejoefood.vercel.app/home',
    status: 'Success',
}

const unauthorizedResponseExample = {
    description: 'Unauthorized - Invalid or missing authentication token',
    content: {
        'application/json': {
            schema: {
                type: 'object' as const,
                properties: {
                    id: { type: 'string' as const },
                    errorType: { type: 'string' as const },
                    message: { type: 'string' as const },
                    state: {
                        type: 'object' as const,
                        properties: {
                            req: { type: 'object' as const },
                        },
                    },
                    status: { type: 'string' as const },
                },
            },
            example: {
                id: '05198e47-5a2c-4d5b-8ef5-bcedf257599d',
                errorType: 'AUT-017',
                message: 'Incorrect authorization bearer token (Error ID: 05198e47-5a2c-4d5b-8ef5-bcedf257599d)',
                state: {
                    req: {
                        url: 'https://joshtesthome.com/',
                    },
                },
                status: 'Error',
            },
        },
    },
}

export const openApiSpec = createDocument({
    openapi: '3.1.0',
    info: {
        title: 'Apex Transformer API',
        description: 'An API for manipulating and saving data for websites.',
        version: '1.0.0',
    },
    servers: [
        {
            url: 'https://cms-routes.vercel.app/',
            description: 'The production server.',
        },
    ],
    security: [
        {
            bearerAuth: [],
        },
    ],
    paths: {
        '/api/cms-routes/scrape-site': {
            post: {
                summary: 'Scrape a website and upload assets',
                description: 'Scraped the passed in URL, assets are then uploaded to a corresponding S3 folder and images can be uploaded to other sources.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ScrapeWebsiteSchema',
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Successful scrape',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        imageUploadTotal: { type: 'number' },
                                        failedImageCount: { type: 'number' },
                                        uploadedResources: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    fileName: { type: 'string' },
                                                    status: { type: 'string' },
                                                },
                                            },
                                        },
                                        failedImages: { type: 'array' },
                                        s3LogoUrl: { type: 'string' },
                                        scrapedPages: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    url: { type: 'string' },
                                                    seo: {
                                                        type: 'object',
                                                        properties: {
                                                            title: { type: 'string' },
                                                            metaDescription: { type: 'string' },
                                                            metaKeywords: { type: 'string' },
                                                            ogTitle: { type: 'string' },
                                                            ogDescription: { type: 'string' },
                                                            pageUrl: { type: 'string' },
                                                        },
                                                    },
                                                    images: {
                                                        type: 'array',
                                                        items: { type: 'string' },
                                                    },
                                                    content: { type: 'string' },
                                                    forms: { type: 'array' },
                                                },
                                            },
                                        },
                                        url: { type: 'string' },
                                        siteData: {
                                            type: 'object',
                                            properties: {
                                                baseUrl: { type: 'string' },
                                                pages: {
                                                    type: 'array',
                                                    items: { type: 'object' }, // Same structure as scrapedPages
                                                },
                                                dudaUploadLocation: { type: 'string' },
                                                aiAnalysis: {
                                                    type: 'object',
                                                    properties: {
                                                        logoTag: { type: 'string' },
                                                        companyName: { type: 'string' },
                                                        address: { type: 'string' },
                                                        phoneNumber: { type: 'string' },
                                                        hours: { type: 'string' },
                                                        styles: {
                                                            type: 'object',
                                                            properties: {
                                                                colors: { type: 'object' },
                                                                fonts: { type: 'object' },
                                                            },
                                                        },
                                                        links: {
                                                            type: 'object',
                                                            properties: {
                                                                socials: { type: 'array' },
                                                                other: {
                                                                    type: 'array',
                                                                    items: { type: 'string' },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                                example: scrapeResponseExample,
                            },
                        },
                    },
                    '400': {
                        description: 'Bad request',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string' },
                                        errorType: { type: 'string' },
                                        message: { type: 'string' },
                                        state: {
                                            type: 'object',
                                            properties: {
                                                erroredFields: {
                                                    type: 'array',
                                                    items: {
                                                        type: 'object',
                                                        properties: {
                                                            fieldPath: {
                                                                type: 'array',
                                                                items: { type: 'string' },
                                                            },
                                                            message: { type: 'string' },
                                                        },
                                                    },
                                                },
                                                req: {
                                                    type: 'object',
                                                    properties: {
                                                        url: { type: 'string' },
                                                    },
                                                },
                                            },
                                        },
                                        status: { type: 'string' },
                                    },
                                },
                                example: {
                                    id: '9a808615-2207-4efe-8f50-8f5991a97aab',
                                    errorType: 'VAL-005',
                                    message: 'Validation error on output data going to S3 (Error ID: 9a808615-2207-4efe-8f50-8f5991a97aab)',
                                    state: {
                                        erroredFields: [
                                            {
                                                fieldPath: ['url'],
                                                message: 'Invalid URL format: Must start with http:// or https:// and contain a valid domain with a TLD.',
                                            },
                                        ],
                                        req: {
                                            url: '//aquapoolandspaoh.com/',
                                        },
                                    },
                                    status: 'Error',
                                },
                            },
                        },
                    },
                    '401': unauthorizedResponseExample,
                },
            },
        },
        '/api/cms-routes/scrape-site/{url}': {
            delete: {
                summary: 'Remove scraped site folder',
                description: 'Removes the scraped site folder in S3 and its contents from storage',
                parameters: [
                    {
                        name: 'url',
                        in: 'path',
                        required: true,
                        description: 'URL of the site to remove',
                        schema: {
                            type: 'string',
                        },
                    },
                ],
                responses: {
                    '200': {
                        description: 'Operation completed - folder either deleted successfully or not found',
                        content: {
                            'application/json': {
                                schema: {
                                    oneOf: [
                                        {
                                            type: 'object',
                                            properties: {
                                                status: {
                                                    type: 'string',
                                                    enum: ['success'],
                                                },
                                                message: { type: 'string' },
                                            },
                                        },
                                        {
                                            type: 'object',
                                            properties: {
                                                status: {
                                                    type: 'string',
                                                    enum: ['fail'],
                                                },
                                                message: { type: 'string' },
                                            },
                                        },
                                    ],
                                },
                                examples: {
                                    success: {
                                        value: {
                                            status: 'success',
                                            message: 'S3 Folder Deleted example-folder',
                                        },
                                        summary: 'Successful deletion',
                                    },
                                    notFound: {
                                        value: {
                                            status: 'fail',
                                            message: 'S3 Folder does not exist, example-folder',
                                        },
                                        summary: 'Folder not found',
                                    },
                                },
                            },
                        },
                    },
                    '401': unauthorizedResponseExample,
                },
            },
        },
        '/api/cms-routes/landing': {
            post: {
                summary: 'Create landing page',
                description: 'Creates a new landing page with the provided data',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/LandingInputSchema',
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Landing page created successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string' },
                                        domain: { type: 'string' },
                                        status: { type: 'string' },
                                    },
                                },
                                example: landing200ResponseExample,
                            },
                        },
                    },
                    '401': unauthorizedResponseExample,
                },
            },
        },
        '/api/cms-routes/get-page-list': {
            post: {
                summary: 'Get list of pages from a website',
                description: 'Retrieves a list of pages from the specified website URL.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/GetPageListSchema',
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Successfully retrieved page list',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        type: 'string',
                                    },
                                },
                                example: ['https://example.com/', 'https://example.com/about', 'https://example.com/contact'],
                            },
                        },
                    },
                    '401': unauthorizedResponseExample,
                },
            },
        },
        '/api/cms-routes/scrape-pages': {
            post: {
                summary: 'Scrape specific pages from a website',
                description: 'Scrapes content and assets from specified pages of a website.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ScrapePagesSchema',
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Successfully scraped pages',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        imageUploadTotal: { type: 'number' },
                                        failedImageCount: { type: 'number' },
                                        uploadedResources: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    fileName: { type: 'string' },
                                                    status: { type: 'string' },
                                                },
                                            },
                                        },
                                        failedImages: { type: 'array' },
                                        s3LogoUrl: { type: 'string' },
                                        scrapedPages: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    url: { type: 'string' },
                                                    seo: {
                                                        type: 'object',
                                                        properties: {
                                                            title: { type: 'string' },
                                                            metaDescription: { type: 'string' },
                                                            metaKeywords: { type: 'string' },
                                                            ogTitle: { type: 'string' },
                                                            ogDescription: { type: 'string' },
                                                            pageUrl: { type: 'string' },
                                                        },
                                                    },
                                                    images: {
                                                        type: 'array',
                                                        items: { type: 'string' },
                                                    },
                                                    content: { type: 'string' },
                                                    forms: { type: 'array' },
                                                },
                                            },
                                        },
                                    },
                                },
                                example: scrapeResponseExample,
                            },
                        },
                    },
                    '401': unauthorizedResponseExample,
                },
            },
        },
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter your bearer token in the format "Bearer {token}"',
            },
        },
        schemas: {
            ScrapeWebsiteSchema,
            LandingInputSchema,
            GetPageListSchema,
            ScrapePagesSchema,
            ErrorTypes: {
                type: 'string',
                enum: Object.keys(errorTypes),
                description: Object.entries(errorTypes)
                    .map(([code, { description }]) => `- ${code}: ${description}`)
                    .join('\n'),
            },
        },
    },
})
