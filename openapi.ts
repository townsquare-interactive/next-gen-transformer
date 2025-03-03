import { createDocument } from 'zod-openapi'
import { GetPageListSchema, LandingInputSchema, ScrapePagesSchema, ScrapeWebsiteSchema } from './src/schema/input-zod.js'
import * as errorTypes from './src/utilities/errors.json' assert { type: 'json' }
import { scrapeResponseExample, landing200ResponseExample, unauthorizedResponseExample } from './templates/responseExamples.js'

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
