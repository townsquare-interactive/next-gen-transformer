/* const transformStrapiNav = (newPage, oldNav) => {
    //nav
    //check for s3 cmsNav / check if page is already there
    let newNav
    const newNavItem = {
        title: newPage.name,
        slug: newPage.slug,
        url: newPage.url || `/${newPage.slug}`,
        id: newPage.id,
        page_type: '',
        menu_item_parent: 0,
    }

    if (oldNav) {
        const theNav = oldNav
        //console.log('old nav', oldSiteData.cmsNav)
        if (theNav.filter((e) => e.slug === newPage.slug).length === 0) {
            theNav.push(newNavItem)
            newNav = theNav
            //console.log('new page added:')
        }
    } else {
        //console.log('new nav created')
        newNav = [newNavItem]
    }

    return newNav
} */

const transformStrapiNav = (nav) => {
    //nav
    //check for s3 cmsNav / check if page is already there
    let newNav = []

    for (let i = 0; i < nav.length; i++) {
        const newNavItem = {
            title: nav[i].title,
            slug: nav[i].related.slug,
            url: '/' + nav[i].related.slug,
            id: nav[i].related.id,
            page_type: '',
            menu_item_parent: 0,
        }
        newNav.push(newNavItem)
    }

    /*     if (oldNav) {
        const theNav = oldNav
        //console.log('old nav', oldSiteData.cmsNav)
        if (theNav.filter((e) => e.slug === newPage.slug).length === 0) {
            theNav.push(newNavItem)
            newNav = theNav
            //console.log('new page added:')
        }
    } else {
        //console.log('new nav created')
        newNav = [newNavItem]
    } */

    return newNav
}

const determineModRenderType = (type) => {
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
    } else {
        return type
    }
}

const determineComponentType = (componentType, useCarousel) => {
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

const convertColumns = (columns) => {
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

const transformTextSize = (size) => {
    return `font_${size.toLowerCase()}`
}

/* tires 743.67 dry routing / 
engine 34 not state inspection
cabin 43 not state inspection */

//better tires
//kelly edge(185ea) 65k limited tread no road hazard (all price 1227)
//

module.exports = {
    transformStrapiNav,
    determineModRenderType,
    transformTextSize,
    determineComponentType,
    convertColumns,
}
