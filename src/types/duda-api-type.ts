export type PageObject = {
    seo?: {
        no_index?: boolean
        title: string
        description: string
        og_image: string
    }
    draft_status?: string
    title: string
    path: string
}
