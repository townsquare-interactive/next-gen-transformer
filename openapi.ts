import { createDocument } from 'zod-openapi'
import {
    GetPageListSchema,
    GetScrapeDataSchema,
    LandingInputSchema,
    MoveS3DataToDudaSchema,
    SaveGeneratedContentSchema,
    ScrapePagesSchema,
    ScrapeWebsiteSchema,
    ToggleBusinessSchema,
} from './src/schema/input-zod.js'
import { scrapeResponseExample, landing200ResponseExample, unauthorizedResponseExample, siteDataResponseExample } from './templates/responseExamples.js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const errorTypes: Record<string, { description: string }> = JSON.parse(readFileSync(join(__dirname, './src/utilities/errors.json'), 'utf8'))

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
            description: 'Production server.',
        },
        {
            url: '/',
            description: 'Current server (use for testing and development)',
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
                                        vercelLogUrl: { type: 'string' },
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
                                                businessInfo: {
                                                    type: 'object',
                                                    properties: {
                                                        logoTag: { type: 'string' },
                                                        companyName: { type: 'string' },
                                                        address: { type: 'string' },
                                                        phoneNumber: { type: 'string' },
                                                        hours: {
                                                            type: 'object',
                                                            properties: {
                                                                regularHours: { type: 'string' },
                                                                is24Hours: { type: 'boolean' },
                                                            },
                                                        },

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
                        description: 'Operation completed - folder deleted successfully',
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
                                },
                            },
                        },
                    },
                    '404': {
                        description: 'Folder not found',
                        content: {
                            'application/json': {
                                schema: { type: 'string' },
                                example: {
                                    status: 'fail',
                                    message: 'S3 Folder does not exist, mertscharlotte/scraped',
                                    url: 'mertscharlotte.com',
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
        '/api/cms-routes/page-list': {
            get: {
                summary: 'Get list of pages from a website',
                description: 'Retrieves a list of pages from the specified website URL.',
                parameters: [
                    {
                        name: 'url',
                        in: 'query',
                        required: true,
                        description: 'URL of the website to scan for pages',
                        schema: {
                            type: 'string',
                        },
                    },
                ],
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
        '/api/cms-routes/scraped-data': {
            get: {
                summary: 'Get scraped data from S3',
                description: 'Retrieves scraped data from S3 for a given URL.',
                parameters: [
                    {
                        name: 'url',
                        in: 'query',
                        required: true,
                        description: 'URL of the website previously scraped',
                        schema: {
                            type: 'string',
                        },
                    },
                ],
                responses: {
                    '200': {
                        description: 'Successfully retrieved scraped data',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        data: { type: 'string' },
                                    },
                                    example: siteDataResponseExample,
                                },
                            },
                        },
                    },
                    '401': unauthorizedResponseExample,
                },
            },
        },
        '/api/cms-routes/move-s3-data-to-duda': {
            post: {
                summary: 'Move S3 data to Duda',
                description: 'Moves S3 data to Duda for a given URL.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/MoveS3DataToDudaSchema',
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Successfully moved S3 data to Duda',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                },
                                example: scrapeResponseExample,
                            },
                        },
                    },
                    '401': unauthorizedResponseExample,
                },
            },
        },
        '/api/cms-routes/duda-toggle-business-schema': {
            patch: {
                summary: 'Toggle business schema',
                description: 'Toggles the business schema for a given URL.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ToggleBusinessSchema',
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'business schema enabled',
                    },
                    '401': unauthorizedResponseExample,
                    '500': {
                        description: 'Bad request',
                        content: {
                            'application/json': {
                                example: {
                                    id: '8c14b40b-b269-480f-a085-a394c902f0ba',
                                    errorType: 'DUD-019',
                                    message:
                                        'Error uploading data: Missing required schema fields: Business Name,Geo Coordinates,Physical Address (Error ID: 8c14b40b-b269-480f-a085-a394c902f0ba)',
                                    domain: '5d22ed458e774b5cbbed7e3335e86975',
                                    state: {
                                        missingFields: ['Business Name', 'Geo Coordinates', 'Physical Address'],
                                        fileStatus: 'not uploaded',
                                    },
                                    status: 'Error',
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/cms-routes/duda-save-content': {
            post: {
                summary: 'Save generated content to Duda',
                description: 'Saves generated content to Duda for a given URL.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/SaveGeneratedContentSchema',
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Successfully saved content to Duda',
                    },
                    '401': unauthorizedResponseExample,
                    '404': {
                        description: 'Duda site not found',
                    },
                },
            },
        },
        '/api/cms-routes/scraped-info-doc': {
            get: {
                summary: 'Get scraped info doc',
                description: 'Retrieves the formatted business information document from S3 for a given URL.',
                parameters: [
                    {
                        name: 'url',
                        in: 'query',
                        required: true,
                        description: 'URL of the website to retrieve the info document for',
                        schema: {
                            type: 'string',
                        },
                    },
                ],
                responses: {
                    '200': {
                        description: 'Successfully retrieved info document',
                        content: {
                            'text/plain': {
                                schema: {
                                    type: 'string',
                                },
                                example: `
=====================================
BUSINESS INFORMATION
=====================================
Company Name: Example Company

Contact Details:
---------------
    Phone:   (555) 555-5555
    Email:   contact@example.com
    Address:
    Street:  123 Main St
    City:    Anytown
    State:   CA
    Zip:     12345
    Country: US

Business Hours:
-------------
    MON: 9:00 AM - 5:00 PM
    TUE: 9:00 AM - 5:00 PM
    WED: 9:00 AM - 5:00 PM
    THU: 9:00 AM - 5:00 PM
    FRI: 9:00 AM - 5:00 PM
    SAT: Closed
    SUN: Closed`,
                            },
                        },
                    },
                    '401': unauthorizedResponseExample,
                    '404': {
                        description: 'Info document not found',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        message: { type: 'string' },
                                        status: { type: 'string' },
                                    },
                                },
                                example: {
                                    id: '9cc7daa5-0e0f-4912-82e9-7c43ab154eab',
                                    errorType: 'AMS-006',
                                    message: 'Scraping Error: Scraped info doc not found in S3 (Error ID: 9cc7daa5-0e0f-4912-82e9-7c43ab154eab)',
                                    domain: 'https://www.toymaniasusa.com',
                                    state: {
                                        scrapeStatus: 'Asset doc never uploaded',
                                        req: {
                                            url: 'https://www.toymaniasusa.com',
                                        },
                                    },
                                    status: 'Error',
                                },
                            },
                        },
                    },
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
                description: 'Enter your bearer token',
            },
        },
        schemas: {
            ScrapeWebsiteSchema,
            LandingInputSchema,
            GetPageListSchema,
            ScrapePagesSchema,
            GetScrapeDataSchema,
            MoveS3DataToDudaSchema,
            ToggleBusinessSchema,
            SaveGeneratedContentSchema,
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
