// @ts-ignore
import { socialConvert, createContactForm, createLinkAndButtonVariables } from './utils.js';
export const transformStrapiNav = (nav) => {
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
    return `font_${size.toLowerCase()}`;
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
        const { linkNoBtn, twoButtons, isWrapLink, visibleButton, buttonList } = createLinkAndButtonVariables(currentItem, modRenderType, columns);
        currentItem = {
            ...currentItem,
            linkNoBtn: linkNoBtn,
            twoButtons: twoButtons,
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
export const createContactInfo = (attributes, siteIdentifier) => {
    let contactInfo = {
        address: {
            city: attributes.city || '',
            zip: attributes.zip || '',
            name: siteIdentifier,
            state: attributes.state || '',
            street: attributes.streetAddress || '',
        },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyYXBpLXV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3N0cmFwaS11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxhQUFhO0FBQ2IsT0FBTyxFQUFFLGFBQWEsRUFBRSxpQkFBaUIsRUFBRSw0QkFBNEIsRUFBRSxNQUFNLFlBQVksQ0FBQTtBQUczRixNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLEdBQWtGLEVBQUUsRUFBRTtJQUNySCxLQUFLO0lBQ0wsc0RBQXNEO0lBQ3RELElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQTtJQUVmLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ2pDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUU7WUFDdEIsTUFBTSxVQUFVLEdBQUc7Z0JBQ2YsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLO2dCQUNuQixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJO2dCQUN6QixHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSTtnQkFDOUIsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDckIsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUN4RixnQkFBZ0IsRUFBRSxDQUFDO2FBQ3RCLENBQUE7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUs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