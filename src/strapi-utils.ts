import { socialConvert, createContactForm, createLinkAndButtonVariables, getAddressCoords } from './utils.js'
import { CurrentModule, Email, ModuleItem, Page, Phone, StrapiPageData, anchorTags } from '../types.js'

export const transformStrapiNav = (nav: [{ title: string; related: { slug: string; homePage: boolean; id: string } }]) => {
    console.log('running strapi transformmmm--------------------------------')
    //nav
    //check for s3 cmsNav / check if page is already there
    let newNav = []

    for (let i = 0; i < nav.length; i++) {
        if (nav[i].related?.slug) {
            const newNavItem = {
                title: nav[i].title,
                slug: nav[i].related.slug,
                url: '/' + nav[i].related.slug,
                id: nav[i].related.id,
                page_type: nav[i].related.homePage && nav[i].related.homePage === true ? 'homepage' : '',
                menu_item_parent: 0,
            }
            newNav.push(newNavItem)
        }
    }

    return newNav
}

export const determineModRenderType = (type: string) => {
    if (type.includes('article')) {
        return 'Article'
    } else if (type === 'module.photogrid-module') {
        return 'PhotoGrid'
    } else if (type === 'module.banner-module') {
        return 'Banner'
    } else if (type === 'module.parallax-module') {
        return 'Parallax'
    } else if (type === 'module.testimonials-module') {
        return 'Testimonials'
    } else if (type === 'module.card-module') {
        return 'Card'
    } else if (type === 'module.photogallery-module') {
        return 'PhotoGallery'
    } else if (type === 'module.contact-form') {
        return 'ContactFormRoutes'
    } else if (type === 'module.map-module') {
        return 'Map'
    } else {
        return type
    }
}

export const determineComponentType = (componentType: string, useCarousel: boolean) => {
    if (componentType === 'module.article-module') {
        return 'article_3'
    } else if (componentType === 'module.banner-module') {
        return 'banner_1'
    } else if (componentType === 'module.parallax-module') {
        return 'parallax_1'
    } else if (componentType === 'module.photogrid-module') {
        return 'photo_grid'
    } else if (componentType === 'module.photogallery-module' && useCarousel === true) {
        return 'thumbnail_gallery'
    } else if (componentType === 'module.photogallery-module' && useCarousel === false) {
        return 'photo_gallery_1'
    } else if (componentType === 'module.testimonials-module' && useCarousel === true) {
        return 'review_carousel'
    } else if (componentType === 'module.testimonials-module' && useCarousel === false) {
        return 'testimonials_1'
    } else if (componentType === 'module.card-module') {
        return 'card_1'
    } else {
        return 'article_3'
    }
}

export const convertColumns = (columns: string | number | undefined) => {
    if (columns === 'one') {
        return 1
    } else if (columns === 'two') {
        return 2
    } else if (columns === 'three') {
        return 3
    } else if (columns === 'four') {
        return 4
    } else if (columns === 'five') {
        return 5
    } else {
        return 1
    }
}

export const createSocials = (socialMedia: { url: string }[]) => {
    let socialMediaItems = []
    if (socialMedia.length != 0) {
        const inputtedSocials = socialMedia || []

        for (let m = 0; m < inputtedSocials.length; m++) {
            let url = inputtedSocials[m].url
            if (!url.includes('http')) {
                url = 'http://' + url
            }

            socialMediaItems.push({ url: url, icon: socialConvert(inputtedSocials[m].url) })
        }
    }
    return socialMediaItems
}

export const transformTextSize = (size: string | undefined) => {
    if (size) {
        return `font_${size.toLowerCase()}`
    }
}

export const createFonts = (fonts: any) => {
    const newFonts = {
        sections: {
            hdrs: {
                label: 'Headlines',
                value: fonts.headlineFont,
                family: "'Lato'",
            },
            body: {
                label: 'Text',
                value: fonts.bodyFont,
                family: "'Lato'",
            },
            feat: {
                label: 'Featured Headlines',
                value: fonts.featFont,
                family: "'Josefin Sans'",
            },
        },
        list: {
            'Abril-Fatface': {
                label: 'Abril Fatface',
                google: 'Abril+Fatface',
                'font-family': "'Abril Fatface'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Alegreya-Sans': {
                label: 'Alegreya Sans',
                google: 'Alegreya+Sans:400,700,400italic,700italic',
                'font-family': "'Alegreya Sans'",
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Alegreya-Sans-SC': {
                label: 'Alegreya Sans SC',
                google: 'Alegreya+SC:400,700,400italic,700italic',
                'font-family': "'Alegreya SC'",
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Amatic: {
                label: 'Amatic',
                google: 'Amatic+SC:400,700',
                'font-family': "'Amatic SC'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Anton: {
                label: 'Anton',
                google: 'Anton',
                'font-family': "'Anton'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Arial: {
                label: 'Arial',
                'font-family': 'Arial',
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Artifika-Regular': {
                label: 'Artifika',
                google: 'Artifika',
                'font-family': "'Artifika'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Arvo: {
                label: 'Arvo',
                google: 'Arvo:400,700,400italic,700italic',
                'font-family': "'Arvo'",
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Autour-One': {
                label: 'Autour One',
                google: 'Autour+One',
                'font-family': "'Autour One'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Barlow: {
                label: 'Barlow',
                google: 'Barlow:400,700,400italic,700italic',
                'font-family': "'Barlow'",
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Barlow Condensed': {
                label: 'Barlow Condensed',
                google: 'Barlow+Condensed:400,700,400italic,700italic',
                'font-family': "'Barlow Condensed'",
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Benchnine: {
                label: 'Benchnine',
                google: 'BenchNine:400,700',
                'font-family': "'Benchnine'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Bevan: {
                label: 'Bevan',
                google: 'Bevan',
                'font-family': "'Bevan'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Bree-Serif': {
                label: 'Bree Serif',
                google: 'Bree+Serif',
                'font-family': "'Bree Serif'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Cantarell-Regular': {
                label: 'Cantarell',
                google: 'Cantarell:400,400italic,700,700italic',
                'font-family': "'Cantarell'",
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Changa-One': {
                label: 'Changa One',
                google: 'Changa+One',
                'font-family': "'Changa One'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Cormorant-Garamond': {
                label: 'Cormorant Garamond',
                google: 'Cormorant+Garamond:300,300i,400,400i,700,700i',
                'font-family': "'Cormorant Garamond'",
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Dosis: {
                label: 'Dosis',
                google: 'Dosis:400,700',
                'font-family': "'Dosis'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Droid-Sans': {
                label: 'Droid Sans',
                google: 'Droid+Sans:400,700,400italic,700italic',
                'font-family': "'Droid Sans'",
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Droid-Serif': {
                label: 'Droid Serif',
                google: 'Droid+Serif:400,700,400italic,700italic',
                'font-family': "'Droid Serif'",
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Eater: {
                label: 'Eater',
                google: 'Eater',
                'font-family': "'Eater'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Fjalla-One': {
                label: 'Fjalla One',
                google: 'Fjalla+One',
                'font-family': "'Fjalla One'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Fredoka-One': {
                label: 'Fredoka One',
                google: 'Fredoka+One',
                'font-family': "'Fredoka One'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Georgia: {
                label: 'Georgia',
                'font-family': 'Georgia',
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Germania-One': {
                label: 'Germania One',
                google: 'Germania+One',
                'font-family': "'Germania One'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Gorditas: {
                label: 'Gorditas',
                google: 'Gorditas:700',
                'font-family': "'Gorditas'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Goudy-Bookletter-1911': {
                label: 'Goudy Bookletter 1911',
                google: 'Goudy+Bookletter+1911',
                'font-family': "'Goudy Bookletter 1911'",
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Great-Vibes': {
                label: 'Great Vibes',
                google: 'Great+Vibes',
                'font-family': "'Great Vibes'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Helvetica: {
                label: 'Helvetica',
                'font-family': 'Helvetica',
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Indie-Flower': {
                label: 'Indie Flower',
                google: 'Indie+Flower',
                'font-family': "'Indie Flower'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Italiana: {
                label: 'Italiana',
                google: 'Italiana',
                'font-family': "'Italiana'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Josefin-Sans': {
                label: 'Josefin Sans',
                google: 'Josefin+Sans:400,700,400italic,700italic',
                'font-family': "'Josefin Sans'",
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Josefin-Slab': {
                label: 'Josefin Slab',
                google: 'Josefin+Slab:400,700,400italic,700italic',
                'font-family': "'Josefin Slab'",
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Keania-One': {
                label: 'Keania One',
                google: 'Keania+One',
                'font-family': "'Keania One'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Lato: {
                label: 'Lato',
                google: 'Lato:300,400,700,900,300italic,400italic,700italic,900italic',
                'font-family': "'Lato'",
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Lobster-1-3': {
                label: 'Lobster',
                google: 'Lobster+Two:400,700,400italic,700italic',
                'font-family': "'Lobster Two'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Lora: {
                label: 'Lora',
                google: 'Lora:400,700,400italic,700italic',
                'font-family': "'Lora'",
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Merriweather-Sans': {
                label: 'Merriweather Sans',
                google: 'Merriweather+Sans:400,700,400italic,700italic',
                'font-family': "'Merriweather Sans'",
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Montserrat: {
                label: 'Montserrat',
                google: 'Montserrat:300,300i,400,400i,700,700i,900,900i|Old+Standard+TT',
                'font-family': "'Montserrat'",
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Muli: {
                label: 'Muli',
                google: 'Muli:300,300italic,400,400italic',
                'font-family': "'Muli'",
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Nixie-One': {
                label: 'Nixie One',
                google: 'Nixie+One',
                'font-family': "'Nixie One'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Old-Standard': {
                label: 'Old Standard',
                google: 'Old+Standard+TT:400,400i,700',
                'font-family': "'Old Standard TT'",
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Open-Sans': {
                label: 'Open Sans',
                google: 'Open+Sans:400,700,400italic,700italic',
                'font-family': "'Open Sans'",
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Open-Sans-Condensed': {
                label: 'Open Sans Condensed',
                google: 'Open+Sans+Condensed:300,300i,700',
                'font-family': "'Open Sans Condensed'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Oswald: {
                label: 'Oswald',
                google: 'Oswald:400,700',
                'font-family': "'Oswald'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Overlock: {
                label: 'Overlock',
                google: 'Overlock:400,700,400italic,700italic',
                'font-family': "'Overlock'",
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'PT-Sans-Narrow': {
                label: 'PT Sans Narrow',
                google: 'PT+Sans+Narrow:400,700,400italic,700italic',
                'font-family': "'PT Sans Narrow'",
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Pacifico: {
                label: 'Pacifico',
                google: 'Pacifico',
                'font-family': "'Pacifico'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Parisienne: {
                label: 'Parisienne',
                google: 'Parisienne',
                'font-family': "'Parisienne'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Playfair-Display': {
                label: 'Playfair',
                google: 'Playfair+Display:400,700,400italic,700italic',
                'font-family': "'Playfair Display'",
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Poiret-One': {
                label: 'Poiret One',
                google: 'Poiret+One:400,700,400italic,700italic',
                'font-family': "'Poiret One'",
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Poppins: {
                label: 'Poppins',
                google: 'Poppins:400,700,400italic,700italic',
                'font-family': "'Poppins'",
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Prociono: {
                label: 'Prociono',
                google: 'Prociono',
                'font-family': "'Prociono'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Quattrocento: {
                label: 'Quattrocento',
                google: 'Quattrocento:400,700',
                'font-family': "'Quattrocento'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Quicksand: {
                label: 'Quicksand',
                google: 'Quicksand:700',
                'font-family': "'Quicksand'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Racing-Sans-One': {
                label: 'Racing Sans One',
                google: 'Racing+Sans+One',
                'font-family': "'Racing Sans One'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Raleway: {
                label: 'Raleway',
                google: 'Raleway:400,700',
                'font-family': "'Raleway'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Roboto: {
                label: 'Roboto',
                google: 'Roboto:400,700,400italic,700italic',
                'font-family': "'Roboto'",
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Rokkitt: {
                label: 'Rokkitt',
                google: 'Rokkitt:400,700',
                'font-family': "'Rokkitt'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Satisfy: {
                label: 'Satisfy',
                google: 'Satisfy',
                'font-family': "'Satisfy'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Signika: {
                label: 'Signika',
                google: 'Signika:400,700',
                'font-family': "'Signika'",
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Sorts-Mill-Goudy': {
                label: 'Sorts Mill Goudy',
                google: 'Sorts+Mill+Goudy:400,700,400italic,700italic',
                'font-family': "'Sorts Mill Goudy'",
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Taviraj: {
                label: 'Taviraj',
                google: 'Taviraj:300,300i,400,400i,700,700i,900,900i',
                'font-family': "'Taviraj'",
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Times-New-Roman': {
                label: 'Times New Roman',
                'font-family': 'Times New Roman',
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Ubuntu: {
                label: 'Ubuntu',
                google: 'Ubuntu:400,700,400italic,700italic',
                'font-family': "'Ubuntu'",
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Verdana: {
                label: 'Verdana',
                'font-family': 'Verdana',
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            'Work-Sans': {
                label: 'Work Sans',
                google: 'Work+Sans:400,700,400italic,700italic',
                'font-family': "'Work Sans'",
                'is-body-font': '1',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
            Yellowtail: {
                label: 'Yellowtail',
                google: 'Yellowtail',
                'font-family': "'Yellowtail'",
                'is-body-font': '',
                'is-feat-font': '1',
                'is-hdrs-font': '1',
                'is-logo-font': '1',
            },
        },
    }

    return newFonts
}

export const setupContactForm = (currentModule: CurrentModule) => {
    const contactFormData = createContactForm(currentModule.formTitle || '', currentModule.email || '')
    currentModule = {
        ...currentModule,
        contactFormData: contactFormData,
        items: [
            {
                plugin: '[gravity]',
                id: 343344,
            },
        ],
    }

    return currentModule
}

export const createStrapiButtonVars = (currentItem: ModuleItem, modRenderType: string, columns: number) => {
    if (currentItem.buttons) {
        const btn1 = currentItem.buttons[0]
        const btn2 = currentItem.buttons[1]

        // console.log('btns', currentItem.buttons)

        const btnData = {
            pagelink: btn1?.pagelink ? btn1.pagelink.toLowerCase() : '',
            weblink: btn1?.extlink ? btn1.extlink.toLowerCase() : '',
            pagelink2: btn2?.pagelink ? btn2.pagelink.toLowerCase() : '',
            weblink2: btn2?.extlink ? btn2.extlink.toLowerCase() : '',
            actionlbl: btn1?.text || '',
            actionlbl2: btn2?.text || '',
            btnSize: '',
            btnSize2: '',
            newwindow: btn1?.ext === true ? 1 : '',
            newwindow2: btn2?.ext === true ? 1 : '',
        }

        currentItem = { ...currentItem, ...btnData }

        const { linkNoBtn, twoButtons, isWrapLink, visibleButton, buttonList } = createLinkAndButtonVariables(currentItem, modRenderType, columns)

        currentItem = {
            ...currentItem,
            linkNoBtn: linkNoBtn,
            twoButtons: twoButtons,
            isWrapLink: isWrapLink,
            visibleButton: visibleButton,
            buttonList: buttonList,
        }
    }

    return currentItem
}

export const setDefaultColors = () => {
    return {
        id: 6,
        logoColor: '#2482cb',
        headingColor: '#fff',
        subHeadingColor: '#fff',
        textColor: '#fff',
        linkColor: '#0f181f',
        linkHover: '#0f181f',
        btnText: '#ffbe87',
        btnBackground: '#0f181f',
        textColorAccent: '#0f181f',
        heroSubheadline: '#0d1d24',
        heroText: '#8a6301',
        heroBtnText: '#ff7700',
        heroBtnBackground: '#ff7700',
        heroLink: '#454545',
        captionText: '#fff',
        captionBackground: '#ff7700',
        NavText: 'rgba(247,247,247,1)',
        navHover: '#3EB183',
        navCurrent: '#3EB183',
        backgroundMain: 'rgba(0,0,0,.2)',
        bckdContent: 'rgba(65,121,135,1)',
        headerBackground: 'rgba(16,37,46,1)',
        BckdHeaderSocial: '#12343d',
        accentBackgroundColor: '#5b97a6',
        backgroundHero: '#ffc83d',
        footerBackground: 'rgba(16,37,46,1)',
        footerText: '#dbf8ff',
        footerLink: '#dbf8ff',
        promoText: '#ffffff',
        promoColor: '#3eb183',
        promoColor2: '#00a4fc',
        promoColor3: '#c9b426',
        promoColor4: '#e02aa0',
        promoColor5: '#ff0000',
        promoColor6: '#ff0000',
        heroLinkHover: '#30829b',
    }
}

const createAddress = async (attributes: { city: string; zip: string; state: string; streetAddress: string; phone: Phone[]; email: Email[] }) => {
    const addy = {
        street: attributes.streetAddress || '',
        zip: attributes.zip || '',
        state: attributes.state || '',
        city: attributes.city || '',
    }
    console.log('addy', addy)
    let mapCoords
    if (addy.zip && addy.state && addy.city) {
        mapCoords = await getAddressCoords(addy)
        console.log(mapCoords)
    } else {
        mapCoords = { lat: '', long: '' }
    }

    return {
        ...addy,
        coordinates: mapCoords.lat ? [mapCoords.lat, mapCoords.long] : [],
    }
}

export const createContactInfo = async (
    attributes: { city: string; zip: string; state: string; streetAddress: string; phone: Phone[]; email: Email[] },
    siteIdentifier: string
) => {
    //create address with coordnates

    const newAddy = await createAddress(attributes)

    let contactInfo = {
        address: newAddy,
        phone: attributes.phone,
        email: [
            {
                name: 'email',
                email: attributes.email || '',
                isPrimaryEmail: true,
            },
        ],
    }

    return contactInfo
}

export const addItemExtraSettings = (item: ModuleItem) => {
    const itemExtraSettings = item.extraItemSettings
    const headSize = itemExtraSettings?.headSize ? itemExtraSettings.headSize : 'MD'
    const descSize = itemExtraSettings?.descSize ? itemExtraSettings.descSize : 'MD'
    const isFeatured = itemExtraSettings?.isFeatured ? itemExtraSettings.isFeatured : false
    const headerTagH1 = itemExtraSettings?.headerTagH1 ? itemExtraSettings.headerTagH1 : false
    const disabled = itemExtraSettings?.disabled ? itemExtraSettings.disabled : false

    return {
        ...item,
        headSize: headSize,
        descSize: descSize,
        isFeatured: isFeatured,
        headerTagH1: headerTagH1,
        disabled: disabled,
    }
}

const createAnchorLinksArr = (module: CurrentModule, anchorTags: anchorTags) => {
    let anchorLink = module.title?.replace(' ', '-') || ''
    console.log('title', module.title, 'link', anchorLink)

    //console.log('uri', encodeURI(anchorLink))

    let anchorItem = {
        title: module.title,
        url: '#' + anchorLink,
        menu_item_parent: 0,
    }

    //if duplicate url, add modId to url
    if (anchorTags.filter((e) => e.url === anchorItem.url).length > 0) {
        anchorLink = anchorLink + `_${module.id}`
        anchorItem.url = anchorItem.url + `_${module.id}`
    }

    anchorTags.push(anchorItem)

    return { anchorLink: anchorLink, transformedAnchorTags: anchorTags }
}

export const manageAnchorLinks = (
    pages: StrapiPageData,
    anchorTags: anchorTags,
    newNav: any,
    modAnchorLinks: { modId: number | string; anchorLink: string }[]
) => {
    for (const p in pages.data) {
        if (pages.data[p].attributes.homePage === true) {
            //modules loop
            for (const j in pages.data[p].attributes.Body) {
                const firstPageMods = pages.data[p].attributes.Body //change later to homepage
                console.log('the mod', firstPageMods[j])
                if (firstPageMods[j].title && firstPageMods[j].useAnchor === true) {
                    const { anchorLink, transformedAnchorTags } = createAnchorLinksArr(firstPageMods[j], anchorTags)

                    anchorTags = transformedAnchorTags
                    newNav = anchorTags

                    //create array from anchorlinks for modules, used below when updating page data
                    modAnchorLinks.push({ modId: firstPageMods[j].id, anchorLink: anchorLink })
                }
            }
        }
    }

    return { moddedAnchorTags: anchorTags, moddedNewNav: newNav, moddedModAnchorLinks: modAnchorLinks }
}

/* tires 743.67 dry routing / 
engine 34 not state inspection
cabin 43 not state inspection */

//better tires
//kelly edge(185ea) 65k limited tread no road hazard (all price 1227)
//

/* export default {
    transformStrapiNav,
    determineModRenderType,
    transformTextSize,
    determineComponentType,
    convertColumns,
    createFonts,
    createSocials,
    setupContactForm,
    createStrapiButtonVars,
    setDefaultColors,
    createContactInfo,
} */
