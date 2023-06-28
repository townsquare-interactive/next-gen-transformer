const transformStrapiNav = (newPage, oldNav) => {
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
}

const determineModRenderType = (type) => {
    if (type.includes('article')) {
        return 'Article'
    } else if (type === 'photo_grid') {
        return 'PhotoGrid'
    } else if (type === 'banner_1') {
        return 'Banner'
    } else if (type === 'parallax_1') {
        return 'Parallax'
    } else if (type === 'testimonials_1' || type === 'testimonials_2') {
        return 'Testimonials'
    } else if (type === 'card_1' || type === 'card_2') {
        return 'Card'
    } else if (type === 'photo_gallery_1' || type === 'photo_gallery_2') {
        return 'PhotoGallery'
    } else if (type === 'plugin') {
        return 'ContactFormRoutes'
    } else {
        return type
    }
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
}
