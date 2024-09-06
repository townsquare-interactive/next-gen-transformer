import { socialConvert, createContactForm, createLinkAndButtonVariables, fetchCoordinates, addProtocolToLink } from './utils.js';
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
            url = addProtocolToLink(url);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyYXBpLXV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9zdHJhcGktdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGFBQWEsRUFBRSxpQkFBaUIsRUFBRSw0QkFBNEIsRUFBRSxnQkFBZ0IsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLFlBQVksQ0FBQTtBQUdoSSxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLEdBQWtGLEVBQUUsRUFBRTtJQUNySCxPQUFPLENBQUMsR0FBRyxDQUFDLDZEQUE2RCxDQUFDLENBQUE7SUFDMUUsS0FBSztJQUNMLHNEQUFzRDtJQUN0RCxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUE7SUFFZixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ2xDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQztZQUN2QixNQUFNLFVBQVUsR0FBRztnQkFDZixLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUs7Z0JBQ25CLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUk7Z0JBQ3pCLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJO2dCQUM5QixFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNyQixTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMs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