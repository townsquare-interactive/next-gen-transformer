export const createColorClasses = (themeStyles) => {
    const colorCalcArr = [
        {
            label: 'btn',
            value: themeStyles['btnBackground'],
        },
        {
            label: 'footer',
            value: themeStyles['footerBackground'],
        },
    ];
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
       `;
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
`;
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
    `;
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
    `;
    let colorStyles = colorVars + textColors + btnStyles + backgroundStyles;
    return colorStyles;
};
// Function to convert RGB to HSL variables
function rgbToHSL(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;
    if (max === min) {
        // Achromatic (gray)
        h = s = 0;
    }
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
    // Convert hue to degrees
    h *= 360;
    // Round values to integers or fractions as needed
    h = Math.round(h);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    //return `hsl(${h}, ${s}%, ${l}%)`
    return { h, s, l };
}
const hslToCssVars = (h, s, l, label) => {
    const compH = (h + 180) % 360;
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

    `;
};
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
function convertColorToHsl(color) {
    if (color.startsWith('#')) {
        // Hex color value
        const hsl = rgbToHSL(parseInt(color.slice(1, 3), 16), parseInt(color.slice(3, 5), 16), parseInt(color.slice(5, 7), 16));
        // return hslToCssVars(hsl.h, hsl.s, hsl.l, label)
        return hsl;
    }
    else if (color.startsWith('rgb(') && color.endsWith(')')) {
        // RGB color value
        const rgbValues = color.slice(4, -1).split(',');
        if (rgbValues.length === 3) {
            const r = parseInt(rgbValues[0]);
            const g = parseInt(rgbValues[1]);
            const b = parseInt(rgbValues[2]);
            const hsl = rgbToHSL(r, g, b);
            // return hslToCssVars(hsl.h, hsl.s, hsl.l, label)
            return hsl;
        }
    }
    else {
        // If the input doesn't match either format, return an error message or default value
        console.log('invalid color format');
        return color;
    }
}
//converts hex or rgb to HSL
export function createFlexBackgroundColorVars(color, label) {
    // Remove whitespace and convert to lowercase for case-insensitive comparison
    color = color.replace(/\s/g, '').toLowerCase();
    const hsl = convertColorToHsl(color);
    return hslToCssVars(hsl.h, hsl.s, hsl.l, label);
}
//converts hex or rgb to HSL
export function createFlexTextColorVars(color, label) {
    // Remove whitespace and convert to lowercase for case-insensitive comparison
    color = color.replace(/\s/g, '').toLowerCase();
    if (color.startsWith('#')) {
        // Hex color value
        const hsl = rgbToHSL(parseInt(color.slice(1, 3), 16), parseInt(color.slice(3, 5), 16), parseInt(color.slice(5, 7), 16));
        return createTextColorVars(hsl.h, hsl.s, hsl.l, label);
    }
    else if (color.startsWith('rgb(') && color.endsWith(')')) {
        // RGB color value
        const rgbValues = color.slice(4, -1).split(',');
        if (rgbValues.length === 3) {
            const r = parseInt(rgbValues[0]);
            const g = parseInt(rgbValues[1]);
            const b = parseInt(rgbValues[2]);
            const hsl = rgbToHSL(r, g, b);
            return createTextColorVars(hsl.h, hsl.s, hsl.l, label);
        }
    }
    else {
        // If the input doesn't match either format, return an error message or default value
        console.log('invalid color format');
        return color;
    }
}
function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    let m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (0 <= h && h < 60) {
        r = c;
        g = x;
        b = 0;
    }
    else if (60 <= h && h < 120) {
        r = x;
        g = c;
        b = 0;
    }
    else if (120 <= h && h < 180) {
        r = 0;
        g = c;
        b = x;
    }
    else if (180 <= h && h < 240) {
        r = 0;
        g = x;
        b = c;
    }
    else if (240 <= h && h < 300) {
        r = x;
        g = 0;
        b = c;
    }
    else if (300 <= h && h < 360) {
        r = c;
        g = 0;
        b = x;
    }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    return [r, g, b];
}
// Function to calculate relative luminance
function getRelativeLuminance(r, g, b) {
    let rs = r / 255, gs = g / 255, bs = b / 255;
    rs = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4);
    gs = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4);
    bs = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4);
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}
function createTextColorVars(h, s, l, label) {
    const primaryTextColor = caculateContrastedTextColor(h, s, l);
    const compH = (h + 180) % 360;
    console.log('text compH', label, compH, s, l);
    return `
    --${label}-flex-text: ${primaryTextColor};
    --${label}-dark-text: ${caculateContrastedTextColor(h, s + 10, l - 15)};
    --${label}-light-text: ${caculateContrastedTextColor(h, s, l + 30)};
    --${label}-comp-text: ${caculateContrastedTextColor(compH, s, l)};
    `;
}
function createRegularTextColors(colors) {
    let colorVars = ``;
    for (let i = 0; i < colors.length; i++) {
        console.log('color time', colors[i]);
        const hslColor = convertColorToHsl(colors[i].value);
        console.log('hsl', hslColor);
        colorVars += `
        --${colors[i].label}-flex-text: ${caculateContrastedTextColor(hslColor.h, hslColor.s, hslColor.l)};
        `;
    }
    return colorVars;
}
// Function to set text color based on background luminance
function caculateContrastedTextColor(h, s, l) {
    const [r, g, b] = hslToRgb(h, s, l);
    const luminance = getRelativeLuminance(r, g, b);
    const textColor = luminance > 0.4 ? 'black' : 'white'; //changed from .5 > .4
    return textColor;
}
/*--------------------------------Inline Styles --------------------------------------------*/
export const createBtnStyles = (value, modType, key, themeStyles, currentItem, itemCount, isFeatureButton) => {
    let btnStyles;
    btnStyles = ` #id_${key} .item_${itemCount} .btn2_override {color:${themeStyles['textColorAccent']}; background-color:transparent;} `;
    if (currentItem.promoColor) {
        btnStyles =
            btnStyles +
                `#id_${key} .item_${itemCount} .btn_promo {color: ${currentItem.promoColor}; background-color: ${themeStyles['promoText']};}
            #id_${key} .item_${itemCount} .btn_promo:hover{color: ${themeStyles['promoText']}; background-color: ${currentItem.promoColor};}`;
    }
    if (currentItem.modColor1) {
        btnStyles =
            btnStyles +
                ` #id_${key} .item_${itemCount} .btn_override {color: ${currentItem.modColor1}; background-color: ${themeStyles['captionText']};} #id_${key} .item_${itemCount} .btn_override:hover{color: ${themeStyles['captionText']}; background-color: ${currentItem.modColor1};}
        #id_${key} .item_${itemCount} .btn2_override:hover{color: ${currentItem.modColor1}; background-color: ${themeStyles['textColorAccent']};}`;
    }
    if (isFeatureButton) {
        btnStyles = btnStyles + `#id_${key} .is-wrap-link:hover .btn_1{color: var(--hero-btn-background); background-color:var(--txt-accent) ;}`;
    }
    else if ((value.well || modType === 'Card') && modType != 'PhotoGrid' && modType != 'Parallax' && modType != 'PhotoGallery' && !isFeatureButton) {
        btnStyles = btnStyles + `#id_${key} .is-wrap-link:hover .btn_1{color: ${themeStyles['btnBackground']}; background-color: ${themeStyles['btnText']}};`;
    }
    return btnStyles;
};
export const createItemStyles = (items, well, modType, type) => {
    for (let i = 0; i < items.length; i++) {
        let itemStyle;
        let captionStyle;
        const currentItem = items[i];
        if (modType === 'Parallax') {
            if (currentItem.modColor1 && well != '1' && !currentItem.image) {
                itemStyle = { background: `${currentItem.modColor1}` };
            }
            else if (currentItem.modColor1 && well === '1' && !currentItem.image) {
                itemStyle = { background: `var(--accent-background)` };
            }
            else if (currentItem.modColor1 && well === '1') {
                itemStyle = { background: `${currentItem.modColor1}` };
            }
            else if (well === '1' && !currentItem.image) {
                itemStyle = {
                    backgroundImage: `linear-gradient(-45deg, ${currentItem.textureImage?.gradientColors[0]}, ${currentItem.textureImage?.gradientColors[1]})`,
                };
            }
            else if (!currentItem.image) {
                itemStyle = { background: `${currentItem.promoColor}` };
            }
            else if (currentItem.image && currentItem.modColor1 && currentItem.modOpacity) {
                let modBackground = currentItem.modColor1.replace(')', `,${currentItem.modOpacity})`);
                itemStyle = { background: modBackground };
            }
            else {
                itemStyle = {};
            }
        }
        else if (modType === 'Banner' || modType === 'PhotoGallery') {
            if (currentItem.modColor1 && !currentItem.image && !currentItem.modOpacity && modType === 'Banner') {
                itemStyle = { background: `${currentItem.modColor1}` };
            }
            else if (well === '1' && !currentItem.image && (modType === 'Banner' || type === 'thumbnail_gallery')) {
                itemStyle = {
                    backgroundImage: `linear-gradient(-45deg, ${currentItem.textureImage?.gradientColors[0]}, ${currentItem.textureImage?.gradientColors[1]})`,
                };
            }
            else if (currentItem.image && currentItem.modColor1 && currentItem.modOpacity) {
                let modBackground = currentItem.modColor1.replace(')', `,${1 - currentItem.modOpacity})`);
                captionStyle = { background: modBackground };
            }
            else if (currentItem.promoColor) {
                itemStyle = { background: `${currentItem.promoColor}` };
            }
            else {
                itemStyle = {};
            }
        }
        items[i] = { ...items[i], itemStyle: itemStyle, captionStyle: captionStyle || '' };
    }
    return items;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGUtdXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL3N0eWxlLXV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE1BQU0sQ0FBQyxNQUFNLGtCQUFrQixHQUFHLENBQUMsV0FBd0IsRUFBRSxFQUFFO0lBQzNELE1BQU0sWUFBWSxHQUFHO1FBQ2pCO1lBQ0ksS0FBSyxFQUFFLEtBQUs7WUFDWixLQUFLLEVBQUUsV0FBVyxDQUFDLGVBQWUsQ0FBQztTQUN0QztRQUNEO1lBQ0ksS0FBSyxFQUFFLFFBQVE7WUFDZixLQUFLLEVBQUUsV0FBVyxDQUFDLGtCQUFrQixDQUFDO1NBQ3pDO0tBQ0osQ0FBQTtJQUNELDBFQUEwRTtJQUMxRSxFQUFFO0lBQ0YsTUFBTSxTQUFTLEdBQUc7O1VBRVosNkJBQTZCLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxFQUFFLFNBQVMsQ0FBQztVQUNuRSw2QkFBNkIsQ0FBQyxXQUFXLENBQUMsdUJBQXVCLENBQUMsRUFBRSxRQUFRLENBQUM7VUFDN0UsdUJBQXVCLENBQUMsWUFBWSxDQUFDOztrQkFFN0IsV0FBVyxDQUFDLFdBQVcsQ0FBQztnQkFDMUIsV0FBVyxDQUFDLGNBQWMsQ0FBQztnQkFDM0IsV0FBVyxDQUFDLGlCQUFpQixDQUFDO2lCQUM3QixXQUFXLENBQUMsV0FBVyxDQUFDO2tCQUN2QixXQUFXLENBQUMsV0FBVyxDQUFDO3dCQUNsQixXQUFXLENBQUMsV0FBVyxDQUFDO3FCQUMzQixXQUFXLENBQUMsU0FBUyxDQUFDOzRCQUNmLFdBQVcsQ0FBQyxlQUFlLENBQUM7MEJBQzlCLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQzs7cUJBRW5DLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQztzQkFDN0IsV0FBVyxDQUFDLFVBQVUsQ0FBQzswQkFDbkIsV0FBVyxDQUFDLGFBQWEsQ0FBQztpQ0FDbkIsV0FBVyxDQUFDLG1CQUFtQixDQUFDO3VCQUMxQyxXQUFXLENB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UUFDTCxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ0wsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUNULENBQUM7U0FBTSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQzVCLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDTCxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ0wsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUNULENBQUM7U0FBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQzdCLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDTCxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ0wsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUNULENBQUM7U0FBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQzdCLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDTCxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ0wsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUNULENBQUM7U0FBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQzdCLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDTCxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ0wsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUNULENBQUM7U0FBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQzdCLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDTCxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ0wsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUNULENBQUM7SUFDRCxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQTtJQUM3QixDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFD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