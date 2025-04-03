export type PageObject = {
    seo?: {
        no_index?: boolean
        title: string
        description: string
        og_image: string
    }
    draft_status?: string
    title?: string
    path?: string
}

export type LocationObject = {
    label?: string
    phones?: {
        phoneNumber: string
        label: string
    }[]
    emails?: {
        emailAddress: string
        label: string
    }[]
    social_accounts?: {
        tripadvisor?: string
        youtube?: string
        facebook?: string
        yelp?: string
        pinterest?: string
        linkedin?: string
        instagram?: string
        snapchat?: string
        twitter?: string
        rss?: string
        vimeo?: string
        reddit?: string
        foursquare?: string
        google_my_business?: string
        whatsapp?: string
        tiktok?: string
    }
    address?: {
        streetAddress: string
        city: string
        postalCode: string
        country: string
    }
    logo_url?: string
    business_hours?:
        | {
              days: ('MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN')[]
              open: string
              close: string
          }[]
        | null
}

export type BusinessInfoObject = {
    site_texts?: {
        custom: Array<{ label: string; text: string }>
    }
    companyName: string
    business_data: {
        name: string
        logo_url: string
    }
    location_data: LocationObject
}
