import {
    getFloatingReviewButtons,createCustomComponents,
} from '../customComponentsUtils'
import { it, describe, expect } from 'vitest'

describe('Get Floating Review Buttons', () => {

        const ex = `sdfdsfds<script src="https://kit.fontawesome.com/9bf0e924ac.js" crossorigin="anonymous"></script>
    <script>jQuery(document).ready(function(){jQuery("body").append('<div class="social_items_flex"><a href="facebook.com" target="_blank"><div class="social_button facebook_button"><div class="floating_icon"><i class="fab fa-facebook-f"></i></div> <span>Review Us On Facebook!</span></div></a><a href="google.com" target="_blank"><div class="social_button google_button"><div class="floating_icon"><i class="fab fa-google"></i></div> <span>Review Us On Google!</span></div></a></div>');});</script>sdfsdfsdf`; 
    it('should wrap plain text inside of a P tag', () => {
        expect(getFloatingReviewButtons(ex)).toStrictEqual([
                {
                   content: "Review Us On Facebook!",
                   link: "http://facebook.com",
                   type: "facebook",
                },
                {
                    content: "Review Us On Google!",
                    link: "http://google.com",
                    type: "google",
                 }
            ])
    })

})

