import { getFloatingReviewButtons, extractIframeSrc } from '../customComponentsUtils';
import { it, describe, expect } from 'vitest';
describe('Get Floating Review Buttons', () => {
    const ex = `sdfdsfds<script src="https://kit.fontawesome.com/9bf0e924ac.js" crossorigin="anonymous"></script>
    <script>jQuery(document).ready(function(){jQuery("body").append('<div class="social_items_flex"><a href="facebook.com" target="_blank"><div class="social_button facebook_button"><div class="floating_icon"><i class="fab fa-facebook-f"></i></div> <span>Review Us On Facebook!</span></div></a><a href="google.com" target="_blank"><div class="social_button google_button"><div class="floating_icon"><i class="fab fa-google"></i></div> <span>Review Us On Google!</span></div></a></div>');});</script>sdfsdfsdf`;
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
        ]);
    });
    const fb = `sdfdsfds<script src="https://kit.fontawesome.com/9bf0e924ac.js" crossorigin="anonymous"></script>
    <script>jQuery(document).ready(function(){jQuery("body").append('<div class="social_items_flex"><a href="facebook.com" target="_blank"><div class="social_button facebook_button"><div class="floating_icon"><i class="fab fa-facebook-f"></i></div> <span>Review Us On Facebook!</span></div></a>/div>');});</script>sdfsdfsdf`;
    it('should extract just a fb button', () => {
        expect(getFloatingReviewButtons(fb)).toStrictEqual([
            {
                content: 'Review Us On Facebook!',
                link: 'http://facebook.com',
                type: 'facebook',
            },
        ]);
    });
    const google = `sdfdsfds<script src="https://kit.fontawesome.com/9bf0e924ac.js" crossorigin="anonymous"></script>
    <script>jQuery(document).ready(function(){jQuery("body").append('<div class="social_items_flex"><a href="google.com" target="_blank"><div class="social_button google_button"><div class="floating_icon"><i class="fab fa-google"></i></div> <span>Review Us On Google!</span></div></a>/div>');});</script>sdfsdfsdf`;
    it('should extract just a google button', () => {
        expect(getFloatingReviewButtons(google)).toStrictEqual([
            {
                content: 'Review Us On Google!',
                link: 'http://google.com',
                type: 'google',
            },
        ]);
    });
    const nobtn = `sdfdsfds<script src="https://kit.fontawesome.com/9bf0e924ac.js" crossorigin="anonymous"></script>
    <script>jQuery(document).ready(function(){jQuery("body").append('<div class="new-class"><a href="google.com" target="_blank"><div class="social_button google_button"><div class="floating_icon"><i class="fab fa-google"></i></div> <span>Review Us On Google!</span></div></a>/div>');});</script>sdfsdfsdf`;
    it('should extract nothing because of className', () => {
        expect(getFloatingReviewButtons(nobtn)).toBe(null);
    });
    const multiple = `sdfdsfds<script src="https://kit.fontawesome.com/9bf0e924ac.js" crossorigin="anonymous"></script>
    <script>jQuery(document).ready(function(){jQuery("body").append('<div class="social_items_flex"><a href="facebook.com" target="_blank"><div class="social_button facebook_button"><div class="floating_icon"><i class="fab fa-facebook-f"></i></div> <span>Review Us On Facebook!</span></div></a><a href="google.com" target="_blank"><div class="social_button google_button"><div class="floating_icon"><i class="fab fa-google"></i></div> <span>Review Us On Google!</span></div></a></div><div class="social_items_flex"><a href="facebook.com" target="_blank"><div class="social_button facebook_button"><div class="floating_icon"><i class="fab fa-facebook-f"></i></div> <span>Review Us On Facebook!</span></div></a><a href="google.com" target="_blank"><div class="social_button google_button"><div class="floating_icon"><i class="fab fa-google"></i></div> <span>Review Us On Google!</span></div></a></div>');});</script>sdfsdfsdf`;
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
        ]);
    });
});
//extractIframeSrc
describe('Extract video details', () => {
    const videoEx = `<iframe width='100%' height='315' src="https://www.youtube.com/embed/dK-TzjZ2mgk?si=D3stIiV7NKyegPsS" title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' allowfullscreen></iframe><br><a name='reviews'></a>`;
    it('should extract a video src from a youtube url', () => {
        expect(extractIframeSrc(videoEx)).toStrictEqual({
            srcValue: 'https://www.youtube.com/embed/dK-TzjZ2mgk?si=D3stIiV7NKyegPsS',
            newDesc: "<br><a name='reviews'></a>",
        });
    });
    const videoNoYoutubeOrVimeo = `<iframe width='100%' height='315' src="https://www.google.com/embed/dK-TzjZ2mgk?si=D3stIiV7NKyegPsS" title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' allowfullscreen></iframe><br><a name='reviews'></a>`;
    it('should not extract a src because it is not yt or vimeo', () => {
        expect(extractIframeSrc(videoNoYoutubeOrVimeo)).toStrictEqual(null);
    });
    const extraDesc = `So Here is the beginnging stuff let us see what happends. Lets add a tag <br> <b>stuff</b><iframe width='100%' height='315' src="https://www.youtube.com/embed/dK-TzjZ2mgk?si=D3stIiV7NKyegPsS" title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' allowfullscreen></iframe><br><a name='reviews'></a>`;
    it('should extract a video src', () => {
        expect(extractIframeSrc(extraDesc)).toStrictEqual({
            srcValue: 'https://www.youtube.com/embed/dK-TzjZ2mgk?si=D3stIiV7NKyegPsS',
            newDesc: "So Here is the beginnging stuff let us see what happends. Lets add a tag <br> <b>stuff</b><br><a name='reviews'></a>",
        });
    });
    const vimeoDesc = `So Here is the beginnging stuff let us see what happends. Lets add a tag <br> <b>stuff</b><iframe width='100%' height='315' src="https://vimeo.com/clairesanford/violetgavewillingly" title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' allowfullscreen></iframe><br><a name='reviews'></a>`;
    it('should extract a video src from a vimeo url', () => {
        expect(extractIframeSrc(vimeoDesc)).toStrictEqual({
            srcValue: 'https://vimeo.com/clairesanford/violetgavewillingly',
            newDesc: "So Here is the beginnging stuff let us see what happends. Lets add a tag <br> <b>stuff</b><br><a name='reviews'></a>",
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tLWNvbXBvbmVudHMudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90ZXN0cy9jdXN0b20tY29tcG9uZW50cy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDBCQUEwQixDQUFBO0FBQ3JGLE9BQU8sRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUU3QyxRQUFRLENBQUMsNkJBQTZCLEVBQUUsR0FBRyxFQUFFO0lBQ3pDLE1BQU0sRUFBRSxHQUFHOzZmQUM4ZSxDQUFBO0lBQ3pmLEVBQUUsQ0FBQyx1Q0FBdUMsRUFBRSxHQUFHLEVBQUU7UUFDN0MsTUFBTSxDQUFDLHdCQUF3QixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDO1lBQy9DO2dCQUNJLE9BQU8sRUFBRSx3QkFBd0I7Z0JBQ2pDLElBQUksRUFBRSxxQkFBcUI7Z0JBQzNCLElBQUksRUFBRSxVQUFVO2FBQ25CO1lBQ0Q7Z0JBQ0ksT0FBTyxFQUFFLHNCQUFzQjtnQkFDL0IsSUFBSSxFQUFFLG1CQUFtQjtnQkFDekIsSUFBSSxFQUFFLFFBQVE7YUFDakI7U0FDSixDQUFDLENBQUE7SUFDTixDQUFDLENBQUMsQ0FBQTtJQUVGLE1BQU0sRUFBRSxHQUFHO29VQUNxVCxDQUFBO0lBQ2hVLEVBQUUsQ0FBQyxpQ0FBaUMsRUFBRSxHQUFHLEVBQUU7UUFDdkMsTUFBTSxDQUFDLHdCQUF3QixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDO1lBQy9DO2dCQUNJLE9BQU8sRUFBRSx3QkFBd0I7Z0JBQ2pDLElBQUksRUFBRSxxQkFBcUI7Z0JBQzNCLElBQUksRUFBRSxVQUFVO2FBQ25CO1NBQ0osQ0FBQyxDQUFBO0lBQ04sQ0FBQyxDQUFDLENBQUE7SUFFRixNQUFNLE1BQU0sR0FBRzswVEFDdVMsQ0FB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