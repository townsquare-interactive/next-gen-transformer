import { z } from 'zod'
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
