import { z } from 'zod'
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

//check data based off Zod schema
export const zodDataParse = (data: any, schema: any, type = 'input', parseLevel: 'safeParse' | 'parse' = 'safeParse') => {
    const zodErrorLoop = (error: any) => {
        const pathList = []
        for (let i = 0; i < error.length; i++) {
            console.log('errror things', error[i])
            const currentErrorPath = error[i].path
            const innerPathList = []
            for (let x = 0; x < currentErrorPath.length; x++) {
                innerPathList.push(currentErrorPath[x])
            }
            const errorStatus = {
                //fieldPath: innerPathList.join(' -> '),
                fieldPath: error[i].path,
                message: error[i].message,
            }
            pathList.push(errorStatus)
        }
        return pathList
    }

    const validatedPageData = schema.safeParse(data)

    if (validatedPageData.success === false) {
        console.log(validatedPageData.error)
        const pathList = zodErrorLoop(JSON.parse(validatedPageData.error))

        const zodErrorObject = {
            message: type === 'input' ? 'Error validating form fields' : 'Validation error on output data going to S3',
            errorType: type === 'input' ? 'VAL-004' : 'VAL-005',
            state: {
                erroredFields: pathList,
            },
        }
        if (parseLevel === 'safeParse') {
            return console.log('Zod parse error', zodErrorObject)
        } else {
            throw new ValidationError(zodErrorObject)
        }
    } else {
        return validatedPageData.data
    }
}
