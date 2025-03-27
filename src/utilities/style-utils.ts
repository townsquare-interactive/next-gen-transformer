import type { LunaModule, LunaModuleItem, ThemeStyles } from '../../types'

export const createColorClasses = (themeStyles: ThemeStyles) => {
    const colorCalcArr = [
        {
            label: 'btn',
            value: themeStyles['btnBackground'],
        },
        {
            label: 'footer',
            value: themeStyles['footerBackground'],
        },
    ]
    //        ${createFlexTextColorVars(themeStyles['promoColor'], 'primary')}
    //
    const colorVars = `@use 'sass:color';
    :root {
        ${createFlexBackgroundColorVars(themeStyles['promoColor'], 'primary')}
        ${createFlexBackgroundColorVars(themeStyles['accentBackgroundColor'], 'accent')}
        ${createRegularTextColors(colorCalcArr)}

        --logo: ${themeStyles['logoColor']};
        --hd: ${themeStyles['headingColor']};
        --sh: ${themeStyles['subHeadingColor']};
        --txt: ${themeStyles['textColor']};
        --link: ${themeStyles['linkColor']};
        --link-hover: ${themeStyles['linkHover']};
        --btn-txt: ${themeStyles['btnText']};
        --btn-background: ${themeStyles['btnBackground']};
        //--txt-accent: ${themeStyles['textColorAccent']};
        --txt-accent: var(--accent-flex-text);
        --hero-sh: ${themeStyles['heroSubheadline']};
        --hero-txt: ${themeStyles['heroText']};
        --hero-btn-txt: ${themeStyles['heroBtnText']};
        --hero-btn-background: ${themeStyles['heroBtnBackground']};
        --hero-link: ${themeStyles['heroLink']};
        --hero-link-hover: ${themeStyles['heroLinkHover']};
        --caption-txt: ${themeStyles['captionText']};
        --caption-background: ${themeStyles['captionBackground']};
        --nav-txt: ${themeStyles['NavText']};
        --nav-hover: ${themeStyles['navHover']};
        --nav-current: ${themeStyles['navCurrent']};
        --main-background: ${themeStyles['backgroundMain']};
        --content-background: ${themeStyles['bckdContent']};
        --header-background: ${themeStyles['headerBackground']};
        --social-background: ${themeStyles['BckdHeaderSocial']};
        --accent-background: ${themeStyles['accentBackgroundColor']};
        //--accent-background: --complementary-primary;
        --hero-background: ${themeStyles['backgroundHero']};
        --footer-background: ${themeStyles['footerBackground']};
        //--footer-background:--dark-primary;
        --footer-txt: ${themeStyles['footerText']};
        --footer-link: ${themeStyles['footerLink']};
        --promo-txt: ${themeStyles['promoText']};
        --promo: ${themeStyles['promoColor']};
        --promo2: ${themeStyles['promoColor2']};
        --promo3: ${themeStyles['promoColor3']};
        //--promo3: var(--complementary-primary);
        //--promo3-text: var(--primary-comp-text);
        --promo4: ${themeStyles['promoColor4']};
        --promo5: ${themeStyles['promoColor5']};
        --promo6: ${themeStyles['promoColor6']};

    }
       `

    const textColors = ` body .txt-font .dsc a{ color: var(--link);}
       .accent-txt{color:var(--txt-accent);} 
       .txt-color{color:var(--txt);} 
       .txt-color-hd{color:var(--hd);} 
       .txt-color-sh{color:var(--sh);} 
       .navLink:hover{color: var(--nav-hover);} 
       .navLink{color:var(--nav-txt);} 
       .social-icon{color:var(--nav-txt);} 
       .social-icon:hover, .footer-icon:hover {background-color:var(--btn-background); color:var(--btn-txt);}
       .current-page{color:var(--nav-current);} 
       .caption-txt{color:var(--caption-txt);}
       .box-links{color:var(--link);}
       .box-links:hover{color:var(--nav-hover);}
       .testimonial-txt-color{color:var(--btn-background);}
       .testimonials-mod.well .hero, .card-mod .hero, .photogallery-mod.well .hero{
       &.item, .desc {color:var(--hero-txt);}
       .stars, .quotes, .hd, .sh {color:var(--txt-accent);}
   }
   .cta-landing {
    &:hover, &:focus, &:focus {
    box-shadow: 0.2em 0.2em darken(${themeStyles.btnBackground}, 10%) !important;
    transform: translateY(-0.25em);
    }}

    .social-landing-icon:hover{
        //background: color.complement(${themeStyles.footerText})
        background: adjust-hue(${themeStyles.footerText}, 80deg)
    }
`

    const btnStyles = ` .btn_1{color: var(--btn-txt); background-color: var(--btn-background);} 
    .btn_1:hover{color: var(--btn-background); background-color: var(--btn-txt);} 
    .btn_2{color: var(--link); border-color: var(--link);} 
    .btn_2:hover{color: var(--link-hover); border-color: var(--link-hover);} 
    .btn_alt{color: var(--promo); background-color: var(--btn-txt);} 
    .btn_alt:hover{color: var(--btn-txt); background-color: var(--promo);}
    .close-toggle {color:var(--btn-txt); background-color:var(--btn-background);}
    .close-toggle:hover {color:var(--btn-background); background-color:var(--btn-txt);}
    .btn_p4.btn_1 {background-color:var(--promo4); color:var(--btn-txt);}
    .btn_p4.btn_1:hover{color: var(--promo4); background-color: var(--btn-txt);} 
    .btn_p3.btn_1 {background-color:var(--promo3); color:var(--btn-txt);}
    .btn_p3.btn_1:hover{color: var(--promo3); background-color: var(--btn-txt);} 
    .btn_p2.btn_1 {background-color:var(--promo2); color:var(--btn-txt);}
    .btn_p2.btn_1:hover{color: var(--promo2); background-color: var(--btn-txt);} 
    .btn_p4.btn_2 {border-color:var(--promo4); color:var(--promo4);}
    .btn_p3.btn_2 {border-color:var(--promo3); color:var(--promo3);}
    .btn_p2.btn_2 {border-color:var(--promo2); color:var(--promo2);}
    .btn_p4.btn_2:hover, .btn_p3.btn_2:hover , .btn_p2.btn_2:hover  {border-color:var(--link-hover); color:var(--link-hover);}
    .hero .one-btn-w .btn_1.btn_w {color: var(--btn-txt); background-color: var(--hero-btn-background);}
    `

    const backgroundStyles = ` .border-background{background-color:var(--complementary-primary);} 
    .hero-background{background-color:var(--promo);} 
    .content-background{background-color:var(--content-background);} 
    .footer{background-color:var(--footer-background); color: ${themeStyles.footerTextOverride ? themeStyles.footerTextOverride : 'var(--footer-flex-text)'};} 
    .header-background{background-color:var(--header-background);} 
    .social-bar-background{background-color:var(--social-background);} 
    .promo-background{background-color:var(--promo);}
    .cta{background-color:var(--promo);}
    .cta:hover{background-color:var(--promo2);}
    .testimonials-mod .hero-background, .card-mod .hero-background {background-color:var(--hero-background);}
    .caption-background{background-color:var(--caption-background);}
    `

    const colorStyles = colorVars + textColors + btnStyles + backgroundStyles

    return colorStyles
}

// Function to convert RGB to HSL variables
function rgbToHSL(r: number, g: number, b: number) {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)

    let h = 0,
        s,
        l = (max + min) / 2

    if (max === min) {
        // Achromatic (gray)
        h = s = 0
    } else {
        const d: number = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0)
                break
            case g:
                h = (b - r) / d + 2
                break
            case b:
                h = (r - g) / d + 4
                break
        }

        h /= 6
    }

    // Convert hue to degrees
    h *= 360

    // Round values to integers or fractions as needed
    h = Math.round(h)
    s = Math.round(s * 100)
    l = Math.round(l * 100)

    //return `hsl(${h}, ${s}%, ${l}%)`
    return { h, s, l }
}

const hslToCssVars = (h: number, s: number, l: number, label: string) => {
    const compH = (h + 180) % 360

    return `   
    --${label}-base: hsl(${h},${s}%, ${l}%);

    /* Lighter and darker versions */
    --light-${label}: hsl(${h}, calc(${s}% + 20%), calc(${l}% + 20%));
    --dark-${label}: hsl(${h}, calc(${s}% + 10%), calc(${l}% - 15%));

    /* Complementary color */
    //--comp-color1-h: calc((${h} + 180) % 360);
    --complementary-${label}: hsl(${compH}, ${s}%, ${l}%);
    //--accent-background: hsl(${compH}, ${s}%, ${l}%);
    //--promo3:hsl(${compH}, ${s}%, ${l}%);
    //--${label}-comp-text:${caculateContrastedTextColor(compH, s, l)};
    --${label}-dark-comp: hsl(${compH}, ${s}%, ${l - 15}%);
    --${label}-tint-30: hsl(${h}, ${s}%, calc(${l}% + 30%));
    ${createTextColorVars(h, s, l, label)}

    `
}
/*  --base-h: ${h}; 
    --base-s: ${s}%;
    --base-l: ${l}%;  */
/* Accent color */
/*     --accentColor: hsl(${h}, calc(${s}% + 30%), calc(${l}% + 10%)); */

/* Tints (lighter variations with increased lightness) */
/*     --tint-10: hsl(${h}, ${s}%, calc(${l}% + 10%));
    --tint-20: hsl(${h}, ${s}%, calc(${l}% + 20%)); 
    --${label}-tint-30: hsl(${h}, ${s}%, calc(${l}% + 30%));
    --tint-60: hsl(${h}, ${s}%, calc(${l}% + 60%));*/

/* Shades (darker variations with decreased lightness) */
/*     --shade-10: hsl(${h}, ${s}%, calc(${l}% - 10%));
    --shade-20: hsl(${h}, ${s}%, calc(${l}% - 20%));
    --shade-30: hsl(${h}, ${s}%, calc(${l}% - 30%)); */

/* Tones (less saturated variations) */
/*     --tone-10: hsl(${h}, calc(${s}% - 10%), ${l}%);
    --tone-20: hsl(${h}, calc(${s}% - 20%), ${l}%);
    --tone-30: hsl(${h}, calc(${s}% - 30%), ${l}%); */

function convertColorToHsl(color: any) {
    if (color.startsWith('#')) {
        // Hex color value
        const hsl = rgbToHSL(parseInt(color.slice(1, 3), 16), parseInt(color.slice(3, 5), 16), parseInt(color.slice(5, 7), 16))
        // return hslToCssVars(hsl.h, hsl.s, hsl.l, label)
        return hsl
    } else if (color.startsWith('rgb(') && color.endsWith(')')) {
        // RGB color value
        const rgbValues = color.slice(4, -1).split(',')
        if (rgbValues.length === 3) {
            const r = parseInt(rgbValues[0])
            const g = parseInt(rgbValues[1])
            const b = parseInt(rgbValues[2])
            const hsl = rgbToHSL(r, g, b)
            // return hslToCssVars(hsl.h, hsl.s, hsl.l, label)
            return hsl
        }
    } else {
        // If the input doesn't match either format, return an error message or default value
        console.log('invalid color format')
        return color
    }
}

//converts hex or rgb to HSL
export function createFlexBackgroundColorVars(color: string, label: string) {
    // Remove whitespace and convert to lowercase for case-insensitive comparison
    color = color.replace(/\s/g, '').toLowerCase()
    const hsl = convertColorToHsl(color)
    return hslToCssVars(hsl.h, hsl.s, hsl.l, label)
}

//converts hex or rgb to HSL
export function createFlexTextColorVars(color: string, label: string) {
    // Remove whitespace and convert to lowercase for case-insensitive comparison
    color = color.replace(/\s/g, '').toLowerCase()

    if (color.startsWith('#')) {
        // Hex color value
        const hsl = rgbToHSL(parseInt(color.slice(1, 3), 16), parseInt(color.slice(3, 5), 16), parseInt(color.slice(5, 7), 16))
        return createTextColorVars(hsl.h, hsl.s, hsl.l, label)
    } else if (color.startsWith('rgb(') && color.endsWith(')')) {
        // RGB color value
        const rgbValues = color.slice(4, -1).split(',')
        if (rgbValues.length === 3) {
            const r = parseInt(rgbValues[0])
            const g = parseInt(rgbValues[1])
            const b = parseInt(rgbValues[2])
            const hsl = rgbToHSL(r, g, b)
            return createTextColorVars(hsl.h, hsl.s, hsl.l, label)
        }
    } else {
        // If the input doesn't match either format, return an error message or default value
        console.log('invalid color format')
        return color
    }
}

function hslToRgb(h: number, s: number, l: number) {
    s /= 100
    l /= 100
    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = l - c / 2
    let r = 0,
        g = 0,
        b = 0
    if (0 <= h && h < 60) {
        r = c
        g = x
        b = 0
    } else if (60 <= h && h < 120) {
        r = x
        g = c
        b = 0
    } else if (120 <= h && h < 180) {
        r = 0
        g = c
        b = x
    } else if (180 <= h && h < 240) {
        r = 0
        g = x
        b = c
    } else if (240 <= h && h < 300) {
        r = x
        g = 0
        b = c
    } else if (300 <= h && h < 360) {
        r = c
        g = 0
        b = x
    }
    r = Math.round((r + m) * 255)
    g = Math.round((g + m) * 255)
    b = Math.round((b + m) * 255)
    return [r, g, b]
}

// Function to calculate relative luminance
function getRelativeLuminance(r: number, g: number, b: number) {
    let rs = r / 255,
        gs = g / 255,
        bs = b / 255
    rs = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4)
    gs = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4)
    bs = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4)
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function createTextColorVars(h: number, s: number, l: number, label: string) {
    const primaryTextColor = caculateContrastedTextColor(h, s, l)
    const compH = (h + 180) % 360
    console.log('text compH', label, compH, s, l)

    return `
    --${label}-flex-text: ${primaryTextColor};
    --${label}-dark-text: ${caculateContrastedTextColor(h, s + 10, l - 15)};
    --${label}-light-text: ${caculateContrastedTextColor(h, s, l + 30)};
    --${label}-comp-text: ${caculateContrastedTextColor(compH, s, l)};
    `
}
interface HslColors {
    label: string
    value: string
}

function createRegularTextColors(colors: HslColors[]) {
    let colorVars = ``

    for (let i = 0; i < colors.length; i++) {
        console.log('color time', colors[i])
        const hslColor = convertColorToHsl(colors[i].value)
        console.log('hsl', hslColor)
        colorVars += `
        --${colors[i].label}-flex-text: ${caculateContrastedTextColor(hslColor.h, hslColor.s, hslColor.l)};
        `
    }
    return colorVars
}

// Function to set text color based on background luminance
function caculateContrastedTextColor(h: number, s: number, l: number) {
    const [r, g, b] = hslToRgb(h, s, l)
    const luminance = getRelativeLuminance(r, g, b)
    const textColor = luminance > 0.4 ? 'black' : 'white' //changed from .5 > .4
    return textColor
}

/*--------------------------------Inline Styles --------------------------------------------*/
export const createBtnStyles = (
    value: LunaModule,
    modType: string,
    key: string,
    themeStyles: ThemeStyles,
    currentItem: LunaModuleItem,
    itemCount: number,
    isFeatureButton?: boolean
) => {
    let btnStyles

    btnStyles = ` #id_${key} .item_${itemCount} .btn2_override {color:${themeStyles['textColorAccent']}; background-color:transparent;} `

    if (currentItem.promoColor) {
        btnStyles =
            btnStyles +
            `#id_${key} .item_${itemCount} .btn_promo {color: ${currentItem.promoColor}; background-color: ${themeStyles['promoText']};}
            #id_${key} .item_${itemCount} .btn_promo:hover{color: ${themeStyles['promoText']}; background-color: ${currentItem.promoColor};}`
    }

    if (currentItem.modColor1) {
        btnStyles =
            btnStyles +
            ` #id_${key} .item_${itemCount} .btn_override {color: ${currentItem.modColor1}; background-color: ${themeStyles['captionText']};} #id_${key} .item_${itemCount} .btn_override:hover{color: ${themeStyles['captionText']}; background-color: ${currentItem.modColor1};}
        #id_${key} .item_${itemCount} .btn2_override:hover{color: ${currentItem.modColor1}; background-color: ${themeStyles['textColorAccent']};}`
    }

    if (isFeatureButton) {
        btnStyles = btnStyles + `#id_${key} .is-wrap-link:hover .btn_1{color: var(--hero-btn-background); background-color:var(--txt-accent) ;}`
    } else if ((value.well || modType === 'Card') && modType != 'PhotoGrid' && modType != 'Parallax' && modType != 'PhotoGallery' && !isFeatureButton) {
        btnStyles = btnStyles + `#id_${key} .is-wrap-link:hover .btn_1{color: ${themeStyles['btnBackground']}; background-color: ${themeStyles['btnText']}};`
    }

    return btnStyles
}

export const createItemStyles = (items: LunaModuleItem[], well: string, modType: string, type: string) => {
    for (let i = 0; i < items.length; i++) {
        let itemStyle
        let captionStyle
        const currentItem = items[i]
        if (modType === 'Parallax') {
            if (currentItem.modColor1 && well != '1' && !currentItem.image) {
                itemStyle = { background: `${currentItem.modColor1}` }
            } else if (currentItem.modColor1 && well === '1' && !currentItem.image) {
                itemStyle = { background: `var(--accent-background)` }
            } else if (currentItem.modColor1 && well === '1') {
                itemStyle = { background: `${currentItem.modColor1}` }
            } else if (well === '1' && !currentItem.image) {
                itemStyle = {
                    backgroundImage: `linear-gradient(-45deg, ${currentItem.textureImage?.gradientColors[0]}, ${currentItem.textureImage?.gradientColors[1]})`,
                }
            } else if (!currentItem.image) {
                itemStyle = { background: `${currentItem.promoColor}` }
            } else if (currentItem.image && currentItem.modColor1 && currentItem.modOpacity) {
                const modBackground = currentItem.modColor1.replace(')', `,${currentItem.modOpacity})`)
                itemStyle = { background: modBackground }
            } else {
                itemStyle = {}
            }
        } else if (modType === 'Banner' || modType === 'PhotoGallery') {
            if (currentItem.modColor1 && !currentItem.image && !currentItem.modOpacity && modType === 'Banner') {
                itemStyle = { background: `${currentItem.modColor1}` }
            } else if (well === '1' && !currentItem.image && (modType === 'Banner' || type === 'thumbnail_gallery')) {
                itemStyle = {
                    backgroundImage: `linear-gradient(-45deg, ${currentItem.textureImage?.gradientColors[0]}, ${currentItem.textureImage?.gradientColors[1]})`,
                }
            } else if (currentItem.image && currentItem.modColor1 && currentItem.modOpacity) {
                const modBackground = currentItem.modColor1.replace(')', `,${1 - currentItem.modOpacity})`)
                captionStyle = { background: modBackground }
            } else if (currentItem.promoColor) {
                itemStyle = { background: `${currentItem.promoColor}` }
            } else {
                itemStyle = {}
            }
        }

        items[i] = { ...items[i], itemStyle: itemStyle, captionStyle: captionStyle || '' }
    }
    return items
}
