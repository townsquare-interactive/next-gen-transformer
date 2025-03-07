import { createDocument } from 'zod-openapi';
import { GetPageListSchema, LandingInputSchema, ScrapePagesSchema, ScrapeWebsiteSchema } from './src/schema/input-zod.js';
import * as errorTypes from './src/utilities/errors.json' assert { type: 'json' };
import { scrapeResponseExample, landing200ResponseExample, unauthorizedResponseExample } from './templates/responseExamples.js';
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
                                                businessInfo: {
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BlbmFwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL29wZW5hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGFBQWEsQ0FBQTtBQUM1QyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsa0JBQWtCLEVBQUUsaUJBQWlCLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQTtBQUN6SCxPQUFPLEtBQUssVUFBVSxNQUFNLDZCQUE2QixDQUFDLFNBQVMsSUFBSSxFQUFFLE1BQU0sRUFBRSxDQUFBO0FBQ2pGLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSx5QkFBeUIsRUFBRSwyQkFBMkIsRUFBRSxNQUFNLGlDQUFpQyxDQUFBO0FBRS9ILE1BQU0sQ0FBQyxNQUFNLFdBQVcsR0FBRyxjQUFjLENBQUM7SUFDdEMsT0FBTyxFQUFFLE9BQU87SUFDaEIsSUFBSSxFQUFFO1FBQ0YsS0FBSyxFQUFFLHNCQUFzQjtRQUM3QixXQUFXLEVBQUUsdURBQXVEO1FBQ3BFLE9BQU8sRUFBRSxPQUFPO0tBQ25CO0lBQ0QsT0FBTyxFQUFFO1FBQ0w7WUFDSSxHQUFHLEVBQUUsZ0NBQWdDO1lBQ3JDLFdBQVcsRUFBRSxvQkFBb0I7U0FDcEM7UUFDRDtZQUNJLEdBQUcsRUFBRSxHQUFHO1lBQ1IsV0FBVyxFQUFFLGtEQUFrRDtTQUNsRTtLQUNKO0lBQ0QsUUFBUSxFQUFFO1FBQ047WUFDSSxVQUFVLEVBQUUsRUFBRTtTQUNqQjtLQUNKO0lBQ0QsS0FBSyxFQUFFO1FBQ0gsNkJBQTZCLEVBQUU7WUFDM0IsSUFBSSxFQUFFO2dCQUNGLE9BQU8sRUFBRSxvQ0FBb0M7Z0JBQzdDLFdBQVcsRUFBRSwrSEFBK0g7Z0JBQzVJLFdBQVcsRUFBRTtvQkFDVCxRQUFRLEVBQUUsSUFBSTtvQkFDZCxPQUFPLEVBQUU7d0JBQ0wsa0JBQWtCLEVBQUU7NEJBQ2hCLE1BQU0sRUFBRTtnQ0FDSixJQUFJLEVBQUUsMENBQTBDOzZCQUNu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