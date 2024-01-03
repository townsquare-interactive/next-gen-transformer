import { z } from 'zod';
/* ----------------------------------- Saved Data -------------------------------------*/
const CodeSchema = z.object({
    CSS: z.string(),
    footer: z.string(),
    header: z.string(),
    tab: z.string(),
    visible: z.number(),
});
const NavMenuItemSchema = z.object({
    ID: z.number(),
    menu_list_id: z.number(),
    title: z.string(),
    post_type: z.string(),
    type: z.string(),
    menu_item_parent: z.union([z.string(), z.number()]).nullable(),
    object_id: z.number(),
    object: z.string(),
    target: z.string().nullable(),
    classes: z.string().nullable(),
    menu_order: z.number(),
    mi_url: z.string().nullable(),
    url: z.string(),
    disabled: z.boolean().optional(),
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
        sections: z.array(z.object({})),
        hideTitle: z.number().optional(),
        head_script: z.string().optional(),
        page_type: z.string().optional(),
    }),
    attrs: z.object({}),
    seo: z.object({}),
});
/* ----------------------------------- Site Data -------------------------------------*/
const colorSchema = z.object({
    key: z.string(),
    type: z.string(),
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
            selected: z.literal('beacon-theme_charlotte'),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtem9kLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc2NoZW1hL2lucHV0LXpvZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsQ0FBQyxFQUFFLE1BQU0sS0FBSyxDQUFBO0FBRXZCLHlGQUF5RjtBQUV6RixNQUFNLFVBQVUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3hCLEdBQUcsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO0lBQ2YsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7SUFDbEIsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7SUFDbEIsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7SUFDZixPQUFPLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtDQUN0QixDQUFDLENBQUE7QUFFRixNQUFNLGlCQUFpQixHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDL0IsRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7SUFDZCxZQUFZLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtJQUN4QixLQUFLLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtJQUNqQixTQUFTLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtJQUNyQixJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtJQUNoQixnQkFBZ0IsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFO0lBQzlELFNBQVMsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO0lBQ3JCLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO0lBQ2xCLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFO0lBQzdCLE9BQU8sRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMs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QixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztJQUNyQixRQUFRLEVBQUUsV0FBVztDQUN4QixDQUFDLENBQUE7QUFFRix1REFBdUQ7QUFDdkQsTUFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUN0QixNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUNiLE9BQU8sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDO1lBQ2QsR0FBRyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUU7U0FDbEIsQ0FBQztLQUNMLENBQUM7SUFDRixNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUNiLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDO1lBQ2IsUUFBUSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsd0JBQXdCLENBQUM7U0FDaEQsQ0FBQztRQUNGLE1BQU0sRUFBRSxZQUFZO1FBQ3BCLEtBQUssRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztLQUN0QixDQUFDO0lBQ0YsS0FBSyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQ1gsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUNMLEtBQUssRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO1FBQ2pCLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO1FBQ2hCLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO0tBQ2pCLENBQUMsQ0FDTDtDQUNKLENBQUMsQ0FBQTtBQUVGLE1BQU0sU0FBUyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDdkIsS0FBSyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxRQUFRLEVBQUU7SUFDNUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxRQUFRLEVBQUU7SUFDM0IsSUFBSSxFQUFFLFVBQVUsQ0FBQyxRQUFRLEVBQUU7Q0FDOUIsQ0FBQyxDQUFBO0FBRUYsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDcEMsU0FBUyxFQUFFLFNBQVM7SUFDcEIsUUFBUSxFQUFFLFFBQVE7Q0FDckIsQ0FBQyxDQUFBO0FBRUYsTUFBTSxDQUFDLE1BQU0scUJBQXFCLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUMxQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtJQUNyQixRQUFRLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRTtJQUNwQixrQkFBa0IsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFO0lBQzlCLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztDQUMxQixDQUFDLENBQUEifQ==