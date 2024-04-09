import type { Sections } from '../schema/input-zod.js'
import { convertDescText, socialConvert } from './utils.js'

export const transformSocial = (socials: string[]) => {
    let newSocials = []
    for (let i = 0; i < socials.length; i++) {
        newSocials.push({
            url: socials[i],
            icon: socialConvert(socials[i]),
            name: socials[i],
        })
    }
    return newSocials
}

export const addGuarnSpan = (text: string) => {
    if (text) {
        return `<span class='guarntext'>` + text + '</span>'
    } else return ''
}

export const createModulesWithSections = (sections: Sections) => {
    let modules = []
    for (let i = 0; i < sections.length; i++) {
        const section = sections[i]
        if (section.headline && i === 0) {
            modules.push({
                headline: section.headline,
                actionlbl: section.ctaText || 'GIVE US A CALL',
                image: section.image,
                subheader: section.subheader,
                type: 'dl',
                weblink: section.ctaLink,
            })
        }
        if (i === 1) {
            if (section.headline) {
                modules.push({
                    type: 'banner',
                    headline: section.headline,
                    actionlbl: section.ctaLink || 'CALL US NOW',
                    weblink: section.ctaLink,
                })
            }
            if (section.desc) {
                modules.push({
                    type: 'text content',
                    desc1: section.desc,
                    desc2: section.desc2,
                    headline: addGuarnSpan(section.subheader || ''),
                })
            }
        }
        if (i == 2) {
            if (section.reviewHeadline) {
                modules.push({
                    type: 'headline',
                    headline: section.reviewHeadline,
                })
            }
            if (section.reviews) {
                modules.push({
                    type: 'reviews',
                    reviews: section.reviews,
                })
            }
            if (section.headline) {
                modules.push({
                    type: 'banner',
                    headline: section.headline,
                    actionlbl: section.ctaLink || 'CALL US NOW',
                    weblink: section.ctaLink,
                })
            }
        }
        if (section.components?.length > 0) {
            for (let x = 0; x < section.components.length; x++) {
                let currentComponent = section.components[x]
                if (currentComponent.type === 'coupon') {
                    modules.push({
                        type: 'coupon',
                        image: currentComponent.image,
                    })
                } else if (currentComponent.type === 'form') {
                    modules.push({
                        type: 'form',
                    })
                } else if (currentComponent.type === 'video') {
                    modules.push({
                        type: 'video',
                        videoUrl: currentComponent.videoUrl,
                    })
                }
            }
        }
    }

    return modules
}

export const createReviewItems = (reviews: { name: string; text: string }[]) => {
    let items = []
    for (let i = 0; i < reviews.length; i++) {
        const newItem = {
            desc: convertDescText(reviews[i].text),
            align: 'center',
            headline: reviews[i].name,
            linkNoBtn: false,
            btnCount: 0,
            isWrapLink: false,
            visibleButton: false,
            itemCount: 1,
        }
        items.push(newItem)
    }
    return items
}
