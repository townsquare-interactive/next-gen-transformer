import { addProtocolToLink } from "./utils.js";
function getATags(substring) {
    //const count = (substring.match(/<a\b[^>]*>/g) || []).length;
    // Extract href attributes from <a> tags
    const hrefs = [];
    const hrefRegex = /href="([^"]*)"/g;
    let match;
    while ((match = hrefRegex.exec(substring)) !== null) {
        hrefs.push(match[1]);
    }
    return { hrefs };
}
function parseSocialItemsFlex(inputString) {
    //check for className
    const startIndex = inputString.indexOf(`'<div class="social_items_flex"`);
    if (startIndex === -1) {
        return null;
    }
    // Find the single quote ending the statement
    const closingQuoteIndex = inputString.indexOf("'", startIndex + 1);
    if (closingQuoteIndex === -1) {
        return null;
    }
    // Extract the code from the beginning div to the end of the code
    const substring = inputString.substring(startIndex, closingQuoteIndex);
    // Count the number of <a> tags
    const tagInfo = getATags(substring);
    return tagInfo;
}
export const getFloatingReviewButtons = (code) => {
    // Example usage
    /*     const ex = `sdfdsfds<script src="https://kit.fontawesome.com/9bf0e924ac.js" crossorigin="anonymous"></script>
        <script>jQuery(document).ready(function(){jQuery("body").append('<div class="social_items_flex"><a href="#fb" target="_blank"><div class="social_button facebook_button"><div class="floating_icon"><i class="fab fa-facebook-f"></i></div> <span>Review Us On Facebook!</span></div></a><a href="g1" target="_blank"><div class="social_button google_button"><div class="floating_icon"><i class="fab fa-google"></i></div> <span>Review Us On Google!</span></div></a></div>');});</script>sdfsdfsdf`; */
    const parsedResult = parseSocialItemsFlex(code);
    if (parsedResult !== null) {
        const buttons = [];
        for (let x = 0; x < parsedResult.hrefs.length; x++) {
            let socialType = null;
            const href = parsedResult.hrefs[x];
            if (href.includes('facebook')) {
                socialType = 'facebook';
            }
            else if (href.includes('google') || href.includes('g.co')) {
                socialType = 'google';
            }
            else {
                socialType = null;
            }
            if (socialType != null) {
                buttons.push({
                    type: socialType,
                    link: addProtocolToLink(parsedResult.hrefs[x]),
                    content: socialType === 'google' ? 'Review Us On Google!' : 'Review Us On Facebook!'
                });
            }
        }
        return buttons;
    }
    else {
        //social button code not found
        return null;
    }
};
export const createCustomComponents = (code) => {
    const customComponents = [];
    if (code) {
        const floatingReviewButtons = getFloatingReviewButtons(code.footer || '' + code.header || '');
        if (floatingReviewButtons) {
            customComponents.push({
                type: 'FloatingReviewButtons',
                btns: floatingReviewButtons
            });
        }
    }
    return customComponents;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tQ29tcG9uZW50c1V0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2N1c3RvbUNvbXBvbmVudHNVdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFL0MsU0FBUyxRQUFRLENBQUMsU0FBZ0I7SUFDOUIsOERBQThEO0lBRTlELHdDQUF3QztJQUN4QyxNQUFNLEtBQUssR0FBYSxFQUFFLENBQUM7SUFDM0IsTUFBTSxTQUFTLEdBQUcsaUJBQWlCLENBQUM7SUFDcEMsSUFBSSxLQUFLLENBQUM7SUFDVixPQUFPLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUU7UUFDakQsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN4QjtJQUVELE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUNyQixDQUFDO0FBR0QsU0FBUyxvQkFBb0IsQ0FBQyxXQUFtQjtJQUU3QyxxQkFBcUI7SUFDckIsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO0lBQzFFLElBQUksVUFBVSxLQUFLLENBQUMsQ0FBQyxFQUFFO1FBQ25CLE9BQU8sSUFBSSxDQUFDO0tBQ2Y7SUFFRCw2Q0FBNkM7SUFDN0MsTUFBTSxpQkFBaUIsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDbkUsSUFBSSxpQkFBaUIsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUMxQixPQUFPLElBQUksQ0FBQztLQUNmO0lBRUQsaUVBQWlFO0lBQ2pFLE1BQU0sU0FBUyxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLGlCQUFpQixDQUFDLENBQUM7SUFFdkUsK0JBQStCO0lBQy9CLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUNuQyxPQUFPLE9BQU8sQ0FBQTtBQUVsQixDQUFDO0FBRUQsTUFBTSxDQUFDLE1BQU0sd0JBQXdCLEdBQUcsQ0FBQyxJQUFXLEVBQUMsRUFBRTtJQUN2RCxnQkFBZ0I7SUFDaEI7b2ZBQ2dmO0lBQzVlLE1BQU0sWUFBWSxHQUFHLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBRWhELElBQUksWUFBWSxLQUFLLElBQUksRUFBRTtRQUV2QixNQUFNLE9BQU8sR0FBQyxFQUFFLENBQUE7UUFFaEIsS0FBSyxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFDO1lBQzNDLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQTtZQUNyQixNQUFNLElBQUksR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2xDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBQztnQkFDMUIsVUFBVSxHQUFHLFVBQVUsQ0FBQTthQUMxQjtpQkFBTSxJQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDdkQsVUFBVSxHQUFDLFFBQVEsQ0FBQTthQUN0QjtpQkFBTTtnQkFDSCxVQUFVLEdBQUcsSUFBSSxDQUFBO2FBQ3BCO1lBQ0QsSUFBSSxVQUFVLElBQUcsSUFBSSxFQUFDO2dCQUN0QixPQUFPLENBQUMsSUFBSSxDQUFDO29CQUNMLElBQUksRUFBQyxVQUFVO29CQUNmLElBQUksRUFBQyxpQkFBaUIsQ0FBRSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM5QyxPQUFPLEVBQUUsVUFBVSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLHdCQUF3QjtpQkFDdkYsQ0FBQyxDQUFBO2FBQ0w7U0FDSjtRQUVELE9BQU8sT0FBTyxDQUFBO0tBQ2pCO1NBQU07UUFDSCw4QkFBOEI7UUFDOUIsT0FBTyxJQUFJLENBQUE7S0FDZDtBQUNMLENBQUMsQ0FBQTtBQUlHLE1BQU0sQ0FBQyxNQUFNLHNCQUFzQixHQUFHLENBQUMsSUFBbUMsRUFBQyxFQUFFO0lBQ3pFLE1BQU0sZ0JBQWdCLEdBQUcsRUFBRSxDQUFBO0lBRTNCLElBQUksSUFBSSxFQUFDO1FBQ0wsTUFBTSxxQkFBcUIsR0FBRyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxDQUFBO1FBQzdGLElBQUkscUJBQXFCLEVBQUM7WUFDdEIsZ0JBQWdCLENBQUMsSUFBSSxDQUFDO2dCQUNsQixJQUFJLEVBQUMsdUJBQXVCO2dCQUM1QixJQUFJLEVBQUMscUJBQXFCO2FBQzdCLENBQUMsQ0FBQTtTQUNMO0tBRUo7SUFFRCxPQUFPLGdCQUFnQixDQUFBO0FBQzNCLENBQUMsQ0FBQSJ9