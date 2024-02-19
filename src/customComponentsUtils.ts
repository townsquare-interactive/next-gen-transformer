import { addProtocolToLink } from "./utils.js";

function getATags(substring:string){
    //const count = (substring.match(/<a\b[^>]*>/g) || []).length;

    // Extract href attributes from <a> tags
    const hrefs: string[] = [];
    const hrefRegex = /href="([^"]*)"/g;
    let match;
    while ((match = hrefRegex.exec(substring)) !== null) {
        hrefs.push(match[1]);
    }

    return { hrefs };
}


function parseSocialItemsFlex(inputString: string): { hrefs: string[] } | null {
    
    //check for className
    const startIndex = inputString.indexOf(`'<div class="social_items_flex"`);
    if (startIndex === -1) {
        console.log('first not found')
        return null;
    }

    // Find the single quote ending the statement
    const closingQuoteIndex = inputString.indexOf("'", startIndex + 1);
    if (closingQuoteIndex === -1) {
        console.log('end not found')
        return null;
    }

    // Extract the code from the beginning div to the end of the code
    const substring = inputString.substring(startIndex, closingQuoteIndex);
    console.log('sub', substring)

    // Count the number of <a> tags
    const tagInfo = getATags(substring)
    console.log('tags', tagInfo)
    return tagInfo

}

export const getFloatingReviewButtons = (code:string)=>{
    const parsedResult = parseSocialItemsFlex(code);

    if (parsedResult !== null) {

        const buttons = []

        for (let x = 0; x<parsedResult.hrefs.length; x++){

            let socialType = null
            const href = parsedResult.hrefs[x]
            if (href.includes('facebook')){
                socialType = 'facebook'
            } else if(href.includes('google') || href.includes('g.co') ){
                socialType='google'
            } else {
                socialType = null
            }
            if (socialType != null){
            buttons.push({
                    type:socialType,
                    link:addProtocolToLink (parsedResult.hrefs[x]), 
                    content: socialType === 'google' ? 'Review Us On Google!' : 'Review Us On Facebook!'
                })
            }
        }

        return buttons
    } else {
        //social button code not found
        return null
    }
}



    export const createCustomComponents = (code:{footer:string, header:string})=> {
        const customComponents = []

        if (code){
            const floatingReviewButtons = getFloatingReviewButtons(code.footer || '' + code.header || '')
            
            if (floatingReviewButtons){
                customComponents.push({
                    type:'FloatingReviewButtons',
                    btns:floatingReviewButtons
                })
            }
        
        }

        return customComponents
    }
