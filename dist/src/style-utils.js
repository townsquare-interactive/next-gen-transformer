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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGUtdXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3R5bGUtdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxXQUF3QixFQUFFLEVBQUU7SUFDM0QsTUFBTSxZQUFZLEdBQUc7UUFDakI7WUFDSSxLQUFLLEVBQUUsS0FBSztZQUNaLEtBQUssRUFBRSxXQUFXLENBQUMsZUFBZSxDQUFDO1NBQ3RDO1FBQ0Q7WUFDSSxLQUFLLEVBQUUsUUFBUTtZQUNmLEtBQUssRUFBRSxXQUFXLENBQUMsa0JBQWtCLENBQUM7U0FDekM7S0FDSixDQUFBO0lBQ0QsMEVBQTBFO0lBQzFFLEVBQUU7SUFDRixNQUFNLFNBQVMsR0FBRzs7VUFFWiw2QkFBNkIsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLEVBQUUsU0FBUyxDQUFDO1VBQ25FLDZCQUE2QixDQUFDLFdBQVcsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLFFBQVEsQ0FBQztVQUM3RSx1QkFBdUIsQ0FBQyxZQUFZLENBQUM7O2tCQUU3QixXQUFXLENBQUMsV0FBVyxDQUFDO2dCQUMxQixXQUFXLENBQUMsY0FBYyxDQUFDO2dCQUMzQixXQUFXLENBQUMsaUJBQWlCLENBQUM7aUJBQzdCLFdBQVcsQ0FBQyxXQUFXLENBQUM7a0JBQ3ZCLFdBQVcsQ0FBQyxXQUFXLENBQUM7d0JBQ2xCLFdBQVcsQ0FBQyxXQUFXLENBQUM7cUJBQzNCLFdBQVcsQ0FBQyxTQUFTLENBQUM7NEJBQ2YsV0FBVyxDQUFDLGVBQWUsQ0FBQzswQkFDOUIsV0FBVyxDQUFDLGlCQUFpQixDQUFDOztxQkFFbkMsV0FBVyxDQUFDLGlCQUFpQixDQUFDO3NCQUM3QixXQUFXLENBQUMsVUFBVSxDQUFDOzBCQUNuQixXQUFXLENBQUMsYUFBYSxDQUFDO2lDQUNuQixXQUFXLENBQUMsbUJBQW1CLENBQUM7dUJBQzFDLFdBQVcsQ0FBQyxVQUFVLENBQUM7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RyxDQUFDLENBQUE7UUFDTCxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ1QsQ0FBQztTQUFNLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDNUIsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNMLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDTCxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ1QsQ0FBQztTQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDN0IsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNMLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDTCxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ1QsQ0FBQztTQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDN0IsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNMLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDTCxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ1QsQ0FBQztTQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDN0IsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNMLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDTCxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ1QsQ0FBQztTQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDN0IsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUNMLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDTCxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ1QsQ0FBQztJQUNELENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFBO0lBQzdCLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdB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