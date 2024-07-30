import { ZodError, ZodTypeAny, z } from 'zod'
import { ValidationError } from '../src/errors.js'
const OptionalString = z.string().optional()

export const AddressSchema = z.object({
    zip: z.string(),
    city: z.string(),
    name: z.string().optional(),
    state: z.string(),
    street: z.string(),
    street2: z.string().optional(),
    coordinates: z.optional(z.object({ lat: z.string().or(z.number()), long: z.string().or(z.number()) })),
    url: OptionalString,
})

export const NavMenuItemSchema = z.object({
    ID: z.number(),
    menu_list_id: z.number(),
    title: z.string(),
    post_type: z.string(),
    type: z.string().nullish(),
    menu_item_parent: z.union([z.string(), z.number()]).nullable(),
    object_id: z.number().nullish(),
    object: z.string(),
    target: z.string().nullable(),
    classes: z.string().or(z.array(z.unknown())).nullable(),
    menu_order: z.number(),
    mi_url: z.string().nullable(),
    url: z.string(),
    disabled: z.boolean().optional(),
})

export const AnalyticsSchema = z.object({
    gaId: OptionalString,
    gtmId: OptionalString,
})

const zodErrorLoop = (error: any) => {
    const pathList = []
    for (let i = 0; i < error.errors.length; i++) {
        const currentErrorPath = error.errors[i].path
        const innerPathList = []
        for (let x = 0; x < currentErrorPath.length; x++) {
            innerPathList.push(currentErrorPath[x])
        }
        const errorStatus = {
            fieldPath: error.errors[i].path,
            message: error.errors[i].message,
        }
        pathList.push(errorStatus)
    }
    return pathList
}

export const zodDataParse = <T, S extends ZodTypeAny>(data: T, schema: S, type: string = 'input'): T => {
    const validatedPageData = schema.safeParse(data)

    if (!validatedPageData.success) {
        console.log(validatedPageData.error)
        const pathList = zodErrorLoop(validatedPageData.error)

        const zodErrorObject = {
            message: type === 'input' ? 'Error validating form fields' : 'Validation error on output data going to S3',
            errorType: type === 'input' ? 'VAL-004' : 'VAL-005',
            state: {
                erroredFields: pathList,
            },
        }
        console.log(zodErrorObject)
        throw new ValidationError(zodErrorObject)
    } else {
        return validatedPageData.data
    }
}

export const logZodDataParse = <T, S extends ZodTypeAny>(data: T, schema: S, type: string = 'input'): void => {
    const validatedPageData = schema.safeParse(data)

    if (!validatedPageData.success) {
        const pathList = zodErrorLoop(validatedPageData.error)

        const zodErrorObject = {
            message: 'Zod parsing error log on ' + type,
            erroredFields: pathList,
        }

        return console.log('Zod parse error', zodErrorObject)
    }
}
