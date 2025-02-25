import { createDocument } from 'zod-openapi'
import { LandingInputSchema, ScrapeWebsiteSchema } from './src/schema/input-zod.js'

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
    components: {
        schemas: {
            ScrapeWebsiteSchema,
            LandingInputSchema,
        },
    },
})
