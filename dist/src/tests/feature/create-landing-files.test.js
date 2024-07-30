import { describe, it, expect } from 'vitest';
import { validateLandingRequestData } from '../../controllers/landing-controller';
import { TransformError } from '../../errors';
import { createLandingPageFiles } from '../../translation-engines/landing';
import { CMSPagesSchema, SiteDataSchema } from '../../../schema/output-zod';
const validExampleData = {
    siteName: 'Example Site',
    url: 'https://example.com',
    email: 'example@example.com',
    colors: {
        primary: '#000000',
        accent: '#FFFFFF',
    },
    page: {
        sections: [
            {
                headline: 'Example Headline',
                reviews: [
                    {
                        text: 'Great service!',
                    },
                ],
            },
        ],
    },
};
/* const validExampleData = {
    url: 'https://www.onenetwork2.com/',
    s3Folder: 'onenetwork.com',
    pageName: 'Home',
    pageUri: 'home',
    landingPageUrl: '',
    siteName: 'One Network',
    title: 'The Digital Supply Chain Network | Autonomous Supply Chain Management',
    description: '',
    logo: 'https://townsquareignite.s3.us-east-1.amazonaws.com/landing-pages/clients/onenetwork.com/images/selected/logo-one-red_horizontal_compact-L-256x91-1.png',
    favicon: '',
    phoneNumber: '1.866.302.1936',
    email: '',
    colors: {
        primary: '#304151',
        accent: '#990000',
        tertiary: '#2da2bf',
        headerBackground: '#ffffff',
        footerText: '#333333',
        footerBackground: '#E0E0E0',
    },
    seo: {
        global: {
            aiosp_home_title: 'Professional HVAC Services for Homeowners',
            aiosp_google_verify: '[google_verify]',
            aiosp_home_description: 'Reliable HVAC solutions for homeowners. Get your heating and cooling needs met by experts.',
            aiosp_page_title_format: '%page_title% | One Network',
            aiosp_description_format: '%description%',
            aiosp_404_title_format: 'Nothing found for %request_words%',
        },
    },
    analytics: {
        gtmId: 'ga-test',
    },
    customComponents: [
        {
            type: 'Webchat',
            apiKey: '',
        },
        {
            type: 'ScheduleEngine',
            apiKey: '',
        },
        {
            type: 'BMP',
            apiKey: '',
        },
    ],
    page: {
        sections: [
            {
                headline: 'Top HVAC Services',
                subheader: 'Reliable and Affordable',
                ctaText: 'Get a Quote',
                ctaLink: '',
                image: 'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                components: [
                    {
                        type: 'coupon',
                        image: 'https://townsquareignite.s3.us-east-1.amazonaws.com/landing-pages/clients/onenetwork.com/images/selected/logos-one-network-enterprises-customers.png',
                    },
                    {
                        type: 'form',
                        embed: '',
                    },
                ],
            },
            {
                headline: 'Our HVAC Solutions',
                subheader: 'Expert Heating and Cooling',
                desc: "At One Network, we offer an array of HVAC services tailored to meet the unique needs of homeowners. Whether you're looking to install, repair, or maintain your heating and cooling systems, our experienced team is here to help. We pride ourselves on delivering top-notch customer service, ensuring your comfort all year long.",
                desc2: 'At One Network, our team of HVAC experts is committed to providing the best in class services for all your heating and cooling needs. We understand the critical role that a functioning HVAC system plays in maintaining the comfort of your home. Our services are designed to ensure that your system operates optimally, providing you with peace of mind.',
                ctaText: 'Learn More',
                ctaLink: '',
                components: [
                    {
                        type: 'video',
                        videoUrl: '',
                    },
                ],
                descLessText:
                    "At One Network, we offer an array of HVAC services tailored to meet the unique needs of homeowners. Whether you're looking to install, repair, or maintain your heating and cooling systems, our experienced team is here to help. We pride ourselves on delivering top-notch customer service, ensuring your comfort all year long.",
                descMoreText:
                    "When you choose One Network for your HVAC needs, you're choosing a partner dedicated to your home's comfort. We offer comprehensive heating and cooling services, including installation of energy-efficient systems, routine maintenance to keep your units running smoothly, and repairs to fix any issues promptly. Our team of certified technicians employs the latest technology and methods to ensure your HVAC system operates at peak efficiency. We understand the importance of a reliable HVAC system, especially during extreme weather conditions. That’s why we offer emergency services to address any urgent issues, ensuring you and your family remain comfortable no matter the circumstances.",
                descMaxText:
                    "At One Network, our mission is to provide homeowners with the best HVAC solutions available. We start by assessing your home's heating and cooling needs, recommending the most efficient systems that fit your budget. Our installation services are designed to be quick and minimally disruptive, allowing you to enjoy your new system as soon as possible. Regular maintenance is key to prolonging the life of your HVAC system, and our maintenance plans are designed to catch potential issues before they become major problems. In the event of a breakdown, our repair services are available 24/7. Our technicians are equipped with the tools and parts needed to fix most issues on the spot, ensuring minimal downtime for your system. Beyond just technical expertise, we are committed to making the entire process as hassle-free as possible, from the initial consultation to ongoing maintenance. We believe in clear communication, transparent pricing, and delivering on our promises.",
                desc2LessText:
                    'At One Network, our team of HVAC experts is committed to providing the best in class services for all your heating and cooling needs. We understand the critical role that a functioning HVAC system plays in maintaining the comfort of your home. Our services are designed to ensure that your system operates optimally, providing you with peace of mind.',
                desc2MoreText:
                    'Choosing One Network means choosing reliability and excellence in HVAC services. Our comprehensive offerings include installation, repair, and maintenance services for a wide range of heating and cooling systems. We prioritize energy efficiency and cost-effectiveness in all our solutions, helping you save on energy bills while keeping your home comfortable. Our team is comprised of certified professionals who stay updated with the latest advancements in HVAC technology and techniques. We offer customized solutions tailored to your specific needs. Whether you need a new system installation, emergency repairs, or routine maintenance, we have the expertise to handle it all. Our goal is to provide you with a seamless experience, from the initial consultation to the completion of the project, ensuring your complete satisfaction.',
                desc2MaxText:
                    "One Network is more than just an HVAC service provider; we are a partner in ensuring your home's comfort and efficiency. From the moment you contact us, our team works diligently to understand your needs and recommend appropriate solutions. Our installation services focus on providing systems that align with your home's requirements and your budget. Once the system is installed, we offer comprehensive maintenance plans designed to keep it running smoothly year-round. In the event of a system failure, our 24/7 repair services mean that you won't have to wait long for a fix. Our technicians arrive promptly, equipped with the necessary tools and parts to resolve most issues within a single visit. We also provide comprehensive duct cleaning and air quality improvement services to ensure that the air you breathe is clean and healthy. Every aspect of our service is designed with your convenience and satisfaction in mind. We strive to build long-term relationships with our clients based on trust, reliability, and outstanding service.",
            },
            {
                headline: 'Contact Us Today!',
                ctaText: 'Get Started',
                ctaLink: '',
                reviewHeadline: '',
                reviews: [],
            },
        ],
    },
    socials: [
        'https://www.facebook.com/OneNetworkEnterprises',
        'https://twitter.com/onenetwork',
        'https://www.linkedin.com/company/one-network-enterprises',
        'https://www.youtube.com/user/onemediareach/',
        'https://www.linkedin.com/company/one-network-enterprises/',
        'https://twitter.com/onenetwork?lang=en',
        'https://www.facebook.com/OneNetworkEnterprises/',
    ],
    address: {
        zip: '',
        city: '',
        name: '',
        state: '',
        street: '',
    },
} */
describe('createLandingPageFiles', () => {
    const req = { body: validExampleData };
    const { apexID, siteData } = validateLandingRequestData(req);
    it('should return a value conforming to SiteDataType', async () => {
        //You can swap out siteData with any valid req
        const result = await createLandingPageFiles(siteData, apexID);
        expect(result.siteLayout).toBeTruthy();
        expect(result.siteIdentifier).toBeTruthy();
        expect(result.pages).toBeTruthy();
        expect(result.siteLayout.styles.global).toBeTruthy();
        expect(() => SiteDataSchema.parse(result.siteLayout)).not.toThrow();
    });
    it('should return the correct siteIdentifier', async () => {
        const customNameSiteData = { ...siteData, url: 'https://example.com' };
        const result = await createLandingPageFiles(customNameSiteData, apexID);
        expect(result.siteIdentifier).toBeTruthy();
        expect(result.siteIdentifier).toBe('example');
        expect(() => SiteDataSchema.parse(result.siteLayout)).not.toThrow();
    });
    it('should return a valid site layout object conforming to the SiteData zod schema', async () => {
        const resultLayout = await createLandingPageFiles(siteData, apexID);
        expect(() => SiteDataSchema.parse(resultLayout.siteLayout)).not.toThrow();
    });
    it('should return a valid pages array conforming to the CMSPage zod schema', async () => {
        const resultPages = await createLandingPageFiles(siteData, apexID);
        expect(() => CMSPagesSchema.parse(resultPages.pages)).not.toThrow();
    });
    it('should throw a TransformError if an error occurs', async () => {
        // @ts-ignore (ignoring because we are causing an error on purpose here)
        siteData.colors = null; //change required value to null to cause error
        // Additional check to ensure the TransformError details
        try {
            await createLandingPageFiles(siteData, apexID);
        }
        catch (error) {
            expect(error).toBeInstanceOf(TransformError);
            expect(error.message).toBe("Cannot read properties of null (reading 'accent')");
            expect(error.errorType).toBe('GEN-003');
            expect(error.state.siteStatus).toBe('Process stopped when creating site files');
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLWxhbmRpbmctZmlsZXMudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy90ZXN0cy9mZWF0dXJlL2NyZWF0ZS1sYW5kaW5nLWZpbGVzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFNLE1BQU0sUUFBUSxDQUFBO0FBQ2pELE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLHNDQUFzQyxDQUFBO0FBRWpGLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxjQUFjLENBQUE7QUFDN0MsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sbUNBQW1DLENBQUE7QUFDMUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQTtBQUUzRSxNQUFNLGdCQUFnQixHQUFlO0lBQ2pDLFFBQVEsRUFBRSxjQUFjO0lBQ3hCLEdBQUcsRUFBRSxxQkFBcUI7SUFDMUIsS0FBSyxFQUFFLHFCQUFxQjtJQUM1QixNQUFNLEVBQUU7UUFDSixPQUFPLEVBQUUsU0FBUztRQUNsQixNQUFNLEVBQUUsU0FBUztLQUNwQjtJQUNELElBQUksRUFBRTtRQUNGLFFBQVEsRUFBRTtZQUNOO2dCQUNJLFFBQVEsRUFBRSxrQkFBa0I7Z0JBQzVCLE9BQU8sRUFBRTtvQkFDTDt3QkFDSSxJQUFJLEVBQUUsZ0JBQWdCO3FCQUN6QjtpQkFDSjthQUNKO1NBQ0o7S0FDSjtDQUNKLENBQUE7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQXNISTtBQUVKLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxHQUFHLEVBQUU7SUFDcEMsTUFBTSxHQUFHLEdBQUcsRUFBRSxJQUFJLEVB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