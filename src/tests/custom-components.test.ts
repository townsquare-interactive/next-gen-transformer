import { getFloatingReviewButtons, extractIframeSrc } from '../customComponentsUtils'
import { it, describe, expect } from 'vitest'

describe('Get Floating Review Buttons', () => {
    const ex = `sdfdsfds<script src="https://kit.fontawesome.com/9bf0e924ac.js" crossorigin="anonymous"></script>
    <script>jQuery(document).ready(function(){jQuery("body").append('<div class="social_items_flex"><a href="facebook.com" target="_blank"><div class="social_button facebook_button"><div class="floating_icon"><i class="fab fa-facebook-f"></i></div> <span>Review Us On Facebook!</span></div></a><a href="google.com" target="_blank"><div class="social_button google_button"><div class="floating_icon"><i class="fab fa-google"></i></div> <span>Review Us On Google!</span></div></a></div>');});</script>sdfsdfsdf`
    it('should extract a fb and google button', () => {
        expect(getFloatingReviewButtons(ex)).toStrictEqual([
            {
                content: 'Review Us On Facebook!',
                link: 'http://facebook.com',
                type: 'facebook',
            },
            {
                content: 'Review Us On Google!',
                link: 'http://google.com',
                type: 'google',
            },
        ])
    })

    const fb = `sdfdsfds<script src="https://kit.fontawesome.com/9bf0e924ac.js" crossorigin="anonymous"></script>
    <script>jQuery(document).ready(function(){jQuery("body").append('<div class="social_items_flex"><a href="facebook.com" target="_blank"><div class="social_button facebook_button"><div class="floating_icon"><i class="fab fa-facebook-f"></i></div> <span>Review Us On Facebook!</span></div></a>/div>');});</script>sdfsdfsdf`
    it('should extract just a fb button', () => {
        expect(getFloatingReviewButtons(fb)).toStrictEqual([
            {
                content: 'Review Us On Facebook!',
                link: 'http://facebook.com',
                type: 'facebook',
            },
        ])
    })

    const google = `sdfdsfds<script src="https://kit.fontawesome.com/9bf0e924ac.js" crossorigin="anonymous"></script>
    <script>jQuery(document).ready(function(){jQuery("body").append('<div class="social_items_flex"><a href="google.com" target="_blank"><div class="social_button google_button"><div class="floating_icon"><i class="fab fa-google"></i></div> <span>Review Us On Google!</span></div></a>/div>');});</script>sdfsdfsdf`
    it('should extract just a google button', () => {
        expect(getFloatingReviewButtons(google)).toStrictEqual([
            {
                content: 'Review Us On Google!',
                link: 'http://google.com',
                type: 'google',
            },
        ])
    })

    const nobtn = `sdfdsfds<script src="https://kit.fontawesome.com/9bf0e924ac.js" crossorigin="anonymous"></script>
    <script>jQuery(document).ready(function(){jQuery("body").append('<div class="new-class"><a href="google.com" target="_blank"><div class="social_button google_button"><div class="floating_icon"><i class="fab fa-google"></i></div> <span>Review Us On Google!</span></div></a>/div>');});</script>sdfsdfsdf`
    it('should extract nothing because of className', () => {
        expect(getFloatingReviewButtons(nobtn)).toBe(null)
    })

    const multiple = `sdfdsfds<script src="https://kit.fontawesome.com/9bf0e924ac.js" crossorigin="anonymous"></script>
    <script>jQuery(document).ready(function(){jQuery("body").append('<div class="social_items_flex"><a href="facebook.com" target="_blank"><div class="social_button facebook_button"><div class="floating_icon"><i class="fab fa-facebook-f"></i></div> <span>Review Us On Facebook!</span></div></a><a href="google.com" target="_blank"><div class="social_button google_button"><div class="floating_icon"><i class="fab fa-google"></i></div> <span>Review Us On Google!</span></div></a></div><div class="social_items_flex"><a href="facebook.com" target="_blank"><div class="social_button facebook_button"><div class="floating_icon"><i class="fab fa-facebook-f"></i></div> <span>Review Us On Facebook!</span></div></a><a href="google.com" target="_blank"><div class="social_button google_button"><div class="floating_icon"><i class="fab fa-google"></i></div> <span>Review Us On Google!</span></div></a></div>');});</script>sdfsdfsdf`
    it('should extract a fb and google button', () => {
        expect(getFloatingReviewButtons(multiple)).toStrictEqual([
            {
                content: 'Review Us On Facebook!',
                link: 'http://facebook.com',
                type: 'facebook',
            },
            {
                content: 'Review Us On Google!',
                link: 'http://google.com',
                type: 'google',
            },
            {
                content: 'Review Us On Facebook!',
                link: 'http://facebook.com',
                type: 'facebook',
            },
            {
                content: 'Review Us On Google!',
                link: 'http://google.com',
                type: 'google',
            },
        ])
    })
})

//extractIframeSrc
describe('Extract video details', () => {
    const videoEx = `<iframe width='100%' height='315' src="https://www.youtube.com/embed/dK-TzjZ2mgk?si=D3stIiV7NKyegPsS" title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' allowfullscreen></iframe><br><a name='reviews'></a>`

    it('should extract a video src from a youtube url', () => {
        expect(extractIframeSrc(videoEx)).toStrictEqual({
            srcValue: 'https://www.youtube.com/embed/dK-TzjZ2mgk?si=D3stIiV7NKyegPsS',
            newDesc: "<br><a name='reviews'></a>",
        })
    })

    const videoNoYoutubeOrVimeo = `<iframe width='100%' height='315' src="https://www.google.com/embed/dK-TzjZ2mgk?si=D3stIiV7NKyegPsS" title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' allowfullscreen></iframe><br><a name='reviews'></a>`

    it('should not extract a src because it is not yt or vimeo', () => {
        expect(extractIframeSrc(videoNoYoutubeOrVimeo)).toStrictEqual(null)
    })

    const extraDesc = `So Here is the beginnging stuff let us see what happends. Lets add a tag <br> <b>stuff</b><iframe width='100%' height='315' src="https://www.youtube.com/embed/dK-TzjZ2mgk?si=D3stIiV7NKyegPsS" title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' allowfullscreen></iframe><br><a name='reviews'></a>`

    it('should extract a video src', () => {
        expect(extractIframeSrc(extraDesc)).toStrictEqual({
            srcValue: 'https://www.youtube.com/embed/dK-TzjZ2mgk?si=D3stIiV7NKyegPsS',
            newDesc: "So Here is the beginnging stuff let us see what happends. Lets add a tag <br> <b>stuff</b><br><a name='reviews'></a>",
        })
    })

    const vimeoDesc = `So Here is the beginnging stuff let us see what happends. Lets add a tag <br> <b>stuff</b><iframe width='100%' height='315' src="https://vimeo.com/clairesanford/violetgavewillingly" title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' allowfullscreen></iframe><br><a name='reviews'></a>`

    it('should extract a video src from a vimeo url', () => {
        expect(extractIframeSrc(vimeoDesc)).toStrictEqual({
            srcValue: 'https://vimeo.com/clairesanford/violetgavewillingly',
            newDesc: "So Here is the beginnging stuff let us see what happends. Lets add a tag <br> <b>stuff</b><br><a name='reviews'></a>",
        })
    })
})
