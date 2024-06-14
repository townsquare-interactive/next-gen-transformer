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
    //#1F71F3
    //#6D169A
    //#bc63e9
    //#fc0909
    //#1CB965
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGUtdXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3R5bGUtdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxXQUF3QixFQUFFLEVBQUU7SUFDM0QsTUFBTSxZQUFZLEdBQUc7UUFDakI7WUFDSSxLQUFLLEVBQUUsS0FBSztZQUNaLEtBQUssRUFBRSxXQUFXLENBQUMsZUFBZSxDQUFDO1NBQ3RDO1FBQ0Q7WUFDSSxLQUFLLEVBQUUsUUFBUTtZQUNmLEtBQUssRUFBRSxXQUFXLENBQUMsa0JBQWtCLENBQUM7U0FDekM7S0FDSixDQUFBO0lBQ0QsMEVBQTBFO0lBQzFFLEVBQUU7SUFDRixNQUFNLFNBQVMsR0FBRzs7VUFFWiw2QkFBNkIsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLEVBQUUsU0FBUyxDQUFDO1VBQ25FLDZCQUE2QixDQUFDLFdBQVcsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLFFBQVEsQ0FBQztVQUM3RSx1QkFBdUIsQ0FBQyxZQUFZLENBQUM7O2tCQUU3QixXQUFXLENBQUMsV0FBVyxDQUFDO2dCQUMxQixXQUFXLENBQUMsY0FBYyxDQUFDO2dCQUMzQixXQUFXLENBQUMsaUJBQWlCLENBQUM7aUJBQzdCLFdBQVcsQ0FBQyxXQUFXLENBQUM7a0JBQ3ZCLFdBQVcsQ0FBQyxXQUFXLENBQUM7d0JBQ2xCLFdBQVcsQ0FBQyxXQUFXLENBQUM7cUJBQzNCLFdBQVcsQ0FBQyxTQUFTLENBQUM7NEJBQ2YsV0FBVyxDQUFDLGVBQWUsQ0FBQzswQkFDOUIsV0FBVyxDQUFDLGlCQUFpQixDQUFDOztxQkFFbkMsV0FBVyxDQUFDLGlCQUFpQixDQUFDO3NCQUM3QixXQUFXLENBQUMsVUFBVSxDQUFDOzBCQUNuQixXQUFXLENBQUMsYUFBYSxDQUFDO2lDQUNuQixXQUFXLENBQUMsbUJBQW1CLENBQUM7dUJBQzFDLFdBQVcsQ0FBQyxVQUFVLENBQUM7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LEVBQUUsQ0FBQztRQUNuQixDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ0wsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNMLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDVCxDQUFDO1NBQU0sSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUM1QixDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ0wsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNMLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDVCxDQUFDO1NBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUM3QixDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ0wsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNMLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDVCxDQUFDO1NBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUM3QixDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ0wsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNMLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDVCxDQUFDO1NBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUM3QixDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ0wsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNMLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDVCxDQUFDO1NBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUM3QixDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ0wsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNMLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDVCxDQUFDO0lBQ0QsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUE7SUFDN0IsQ0FBQyxHQUFHLElB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