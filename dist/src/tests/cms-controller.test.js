import { getPageData } from '../controllers/cms-controller';
import { it, describe, expect } from 'vitest';
describe('Get Page Data', () => {
    const key = 774341;
    const pages = {
        774341: {
            id: key,
            title: 'Home',
            post_type: 'page',
            post_status: 'publish',
            page_type: 'homepage',
            published: '04/16/2014 14:04:12',
            post_name: 'home',
            slug: 'home',
            url: '/',
            seo: {
                title: 'homepage',
                descr: null,
                selectedImages: null,
                imageOverride: null,
            },
        },
    };
    it('should extract the variables from the page data', () => {
        expect(getPageData(pages, key)).toStrictEqual({
            pageId: key,
            pageTitle: 'Home',
            pageSlug: 'home',
            pageType: 'homepage',
            url: '/',
            seo: {
                title: 'homepage',
                descr: '',
                selectedImages: '',
                imageOverride: '',
            },
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY21zLWNvbnRyb2xsZXIudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90ZXN0cy9jbXMtY29udHJvbGxlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQTtBQUMzRCxPQUFPLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxRQUFRLENBQUE7QUFFN0MsUUFBUSxDQUFDLGVBQWUsRUFBRSxHQUFHLEVBQUU7SUFDM0IsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFBO0lBQ2xCLE1BQU0sS0FBSyxHQUFHO1FBQ1YsTUFBTSxFQUFFO1lBQ0osRUFBRSxFQUFFLEdBQUc7WUFDUCxLQUFLLEVBQUUsTUFBTTtZQUNiLFNBQVMsRUFBRSxNQUFNO1lBQ2pCLFdBQVcsRUFBRSxTQUFTO1lBQ3RCLFNBQVMsRUFBRSxVQUFVO1lBQ3JCLFNBQVMsRUFBRSxxQkFBcUI7WUFDaEMsU0FBUyxFQUFFLE1BQU07WUFDakIsSUFBSSxFQUFFLE1BQU07WUFDWixHQUFHLEVBQUUsR0FBRztZQUNSLEdBQUcsRUFBRTtnQkFDRCxLQUFLLEVBQUUsVUFBVTtnQkFDakIsS0FBSyxFQUFFLElBQUk7Z0JBQ1gsY0FBYyxFQUFFLElBQUk7Z0JBQ3BCLGFBQWEsRUFBRSxJQUFJO2FBQ3RCO1NBQ0o7S0FDSixDQUFBO0lBRUQsRUFBRSxDQUFDLGlEQUFpRCxFQUFFLEdBQUcsRUFBRTtRQUN2RCxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQztZQUMxQyxNQUFNLEVBQUUsR0FBRztZQUNYLFNBQVMsRUFBRSxNQUFNO1lBQ2pCLFFBQVEsRUFBRSxNQUFNO1lBQ2hCLFFBQVEsRUFBRSxVQUFVO1lBQ3BCLEdBQUcsRUFBRSxHQUFHO1lBQ1IsR0FBRyxFQUFFO2dCQUNELEtBQUssRUFBRSxVQUFVO2dCQUNqQixLQUFLLEVBQUUsRUFBRTtnQkFDVCxjQUFjLEVBQUUsRUFBRTtnQkFDbEIsYUFBYSxFQUFFLEVBQUU7YUFDcEI7U0FDSixDQUFDLENBQUE7SUFDTixDQUFDLENBQUMsQ0FBQTtBQUNOLENBQUMsQ0FBQyxDQUFBIn0=