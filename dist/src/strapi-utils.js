import { socialConvert, createContactForm, createLinkAndButtonVariables, fetchCoordinates } from './utils.js';
export const transformStrapiNav = (nav) => {
    console.log('running strapi transformmmm--------------------------------');
    //nav
    //check for s3 cmsNav / check if page is already there
    let newNav = [];
    for (let i = 0; i < nav.length; i++) {
        if (nav[i].related?.slug) {
            const newNavItem = {
                title: nav[i].title,
                slug: nav[i].related.slug,
                url: '/' + nav[i].related.slug,
                id: nav[i].related.id,
                page_type: nav[i].related.homePage && nav[i].related.homePage === true ? 'homepage' : '',
                menu_item_parent: 0,
            };
            newNav.push(newNavItem);
        }
    }
    return newNav;
};
export const determineModRenderType = (type) => {
    if (type.includes('article')) {
        return 'Article';
    }
    else if (type === 'module.photogrid-module') {
        return 'PhotoGrid';
    }
    else if (type === 'module.banner-module') {
        return 'Banner';
    }
    else if (type === 'module.parallax-module') {
        return 'Parallax';
    }
    else if (type === 'module.testimonials-module') {
        return 'Testimonials';
    }
    else if (type === 'module.card-module') {
        return 'Card';
    }
    else if (type === 'module.photogallery-module') {
        return 'PhotoGallery';
    }
    else if (type === 'module.contact-form') {
        return 'ContactFormRoutes';
    }
    else if (type === 'module.map-module') {
        return 'Map';
    }
    else {
        return type;
    }
};
export const determineComponentType = (componentType, useCarousel) => {
    if (componentType === 'module.article-module') {
        return 'article_3';
    }
    else if (componentType === 'module.banner-module') {
        return 'banner_1';
    }
    else if (componentType === 'module.parallax-module') {
        return 'parallax_1';
    }
    else if (componentType === 'module.photogrid-module') {
        return 'photo_grid';
    }
    else if (componentType === 'module.photogallery-module' && useCarousel === true) {
        return 'thumbnail_gallery';
    }
    else if (componentType === 'module.photogallery-module' && useCarousel === false) {
        return 'photo_gallery_1';
    }
    else if (componentType === 'module.testimonials-module' && useCarousel === true) {
        return 'review_carousel';
    }
    else if (componentType === 'module.testimonials-module' && useCarousel === false) {
        return 'testimonials_1';
    }
    else if (componentType === 'module.card-module') {
        return 'card_1';
    }
    else {
        return 'article_3';
    }
};
export const convertColumns = (columns) => {
    if (columns === 'one') {
        return 1;
    }
    else if (columns === 'two') {
        return 2;
    }
    else if (columns === 'three') {
        return 3;
    }
    else if (columns === 'four') {
        return 4;
    }
    else if (columns === 'five') {
        return 5;
    }
    else {
        return 1;
    }
};
export const createSocials = (socialMedia) => {
    let socialMediaItems = [];
    if (socialMedia.length != 0) {
        const inputtedSocials = socialMedia || [];
        for (let m = 0; m < inputtedSocials.length; m++) {
            let url = inputtedSocials[m].url;
            if (!url.includes('http')) {
                url = 'http://' + url;
            }
            socialMediaItems.push({ url: url, icon: socialConvert(inputtedSocials[m].url) });
        }
    }
    return socialMediaItems;
};
export const transformTextSize = (size) => {
    if (size) {
        return `font_${size.toLowerCase()}`;
    }
};
export const createFonts = (fonts) => {
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
    };
    return newFonts;
};
export const setupContactForm = (currentModule) => {
    const contactFormData = createContactForm(currentModule.formTitle || '', currentModule.email || '');
    currentModule = {
        ...currentModule,
        contactFormData: contactFormData,
        items: [
            {
                plugin: '[gravity]',
                id: 343344,
            },
        ],
    };
    return currentModule;
};
export const createStrapiButtonVars = (currentItem, modRenderType, columns) => {
    if (currentItem.buttons) {
        const btn1 = currentItem.buttons[0];
        const btn2 = currentItem.buttons[1];
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
        };
        currentItem = { ...currentItem, ...btnData };
        const { linkNoBtn, btnCount, isWrapLink, visibleButton, buttonList } = createLinkAndButtonVariables(currentItem, modRenderType, columns, []);
        currentItem = {
            ...currentItem,
            linkNoBtn: linkNoBtn,
            btnCount: btnCount,
            isWrapLink: isWrapLink,
            visibleButton: visibleButton,
            buttonList: buttonList,
        };
    }
    return currentItem;
};
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
    };
};
const createAddress = async (attributes) => {
    const addy = {
        street: attributes.streetAddress || '',
        zip: attributes.zip || '',
        state: attributes.state || '',
        city: attributes.city || '',
    };
    let mapCoords;
    if (addy.zip && addy.state && addy.city) {
        mapCoords = await fetchCoordinates(addy);
        console.log(mapCoords);
    }
    else {
        mapCoords = { lat: '', long: '' };
    }
    return {
        ...addy,
        coordinates: mapCoords.lat ? [mapCoords.lat, mapCoords.long] : [],
    };
};
export const createContactInfo = async (attributes, siteIdentifier) => {
    //create address with coordnates
    const newAddy = await createAddress(attributes);
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
    };
    return contactInfo;
};
export const addItemExtraSettings = (item) => {
    const itemExtraSettings = item.extraItemSettings;
    const headSize = itemExtraSettings?.headSize ? itemExtraSettings.headSize : 'MD';
    const descSize = itemExtraSettings?.descSize ? itemExtraSettings.descSize : 'MD';
    const isFeatured = itemExtraSettings?.isFeatured ? itemExtraSettings.isFeatured : false;
    const headerTagH1 = itemExtraSettings?.headerTagH1 ? itemExtraSettings.headerTagH1 : false;
    const disabled = itemExtraSettings?.disabled ? itemExtraSettings.disabled : false;
    return {
        ...item,
        headSize: headSize,
        descSize: descSize,
        isFeatured: isFeatured,
        headerTagH1: headerTagH1,
        disabled: disabled,
    };
};
const createAnchorLinksArr = (module, anchorTags) => {
    let anchorLink = module.title?.replace(' ', '-') || '';
    console.log('title', module.title, 'link', anchorLink);
    let anchorItem = {
        title: module.title,
        url: '#' + anchorLink,
        menu_item_parent: 0,
    };
    //if duplicate url, add modId to url
    if (anchorTags.filter((e) => e.url === anchorItem.url).length > 0) {
        anchorLink = anchorLink + `_${module.id}`;
        anchorItem.url = anchorItem.url + `_${module.id}`;
    }
    anchorTags.push(anchorItem);
    return { anchorLink: anchorLink, transformedAnchorTags: anchorTags };
};
export const manageAnchorLinks = (pages, anchorTags, newNav, modAnchorLinks) => {
    for (const p in pages.data) {
        if (pages.data[p].attributes.homePage === true) {
            //modules loop
            for (const j in pages.data[p].attributes.Body) {
                const firstPageMods = pages.data[p].attributes.Body; //change later to homepage
                console.log('the mod', firstPageMods[j]);
                if (firstPageMods[j].title && firstPageMods[j].useAnchor === true) {
                    const { anchorLink, transformedAnchorTags } = createAnchorLinksArr(firstPageMods[j], anchorTags);
                    anchorTags = transformedAnchorTags;
                    newNav = anchorTags;
                    //create array from anchorlinks for modules, used below when updating page data
                    modAnchorLinks.push({ modId: firstPageMods[j].id, anchorLink: anchorLink });
                }
            }
        }
    }
    return { moddedAnchorTags: anchorTags, moddedNewNav: newNav, moddedModAnchorLinks: modAnchorLinks };
};
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyYXBpLXV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3N0cmFwaS11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsYUFBYSxFQUFFLGlCQUFpQixFQUFFLDRCQUE0QixFQUFFLGdCQUFnQixFQUFFLE1BQU0sWUFBWSxDQUFBO0FBRzdHLE1BQU0sQ0FBQyxNQUFNLGtCQUFrQixHQUFHLENBQUMsR0FBa0YsRUFBRSxFQUFFO0lBQ3JILE9BQU8sQ0FBQyxHQUFHLENBQUMsNkRBQTZELENBQUMsQ0FBQTtJQUMxRSxLQUFLO0lBQ0wsc0RBQXNEO0lBQ3RELElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQTtJQUVmLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ2pDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUU7WUFDdEIsTUFBTSxVQUFVLEdBQUc7Z0JBQ2YsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLO2dCQUNuQixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJO2dCQUN6QixHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSTtnQkFDOUIsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDckIsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUN4RixnQkFBZ0IsRUFBRSxD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