import { createLayoutFile, createPageFile } from '../controllers/landing-controller.js';
import { TransformError } from '../utilities/errors.js';
export const createLandingPageFiles = async (siteData, apexID) => {
    try {
        const { siteLayout, siteIdentifier } = await createLayoutFile(siteData, apexID);
        const page = createPageFile(siteData, siteLayout);
        let siteID = siteIdentifier;
        console.log('Successfully created site files:', { siteLayout: siteLayout, siteIdentifier: siteID, pages: [page] });
        return { siteLayout: null, siteIdentifier: siteID, pages: [page], siteType: 'landing' };
    }
    catch (err) {
        console.error('Caught error in createLandingPageFiles:', err);
        throw new TransformError({
            message: err.message,
            errorType: 'GEN-003',
            state: {
                siteStatus: 'Process stopped when creating site files',
            },
        });
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cmFuc2xhdGlvbi1lbmdpbmVzL2xhbmRpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGdCQUFnQixFQUFFLGNBQWMsRUFBRSxNQUFNLHNDQUFzQyxDQUFBO0FBQ3ZGLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUV2RCxNQUFNLENBQUMsTUFBTSxzQkFBc0IsR0FBRyxLQUFLLEVBQUUsUUFBb0IsRUFBRSxNQUFjLEVBQUUsRUFBRTtJQUNqRixJQUFJO1FBQ0EsTUFBTSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsR0FBRyxNQUFNLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQTtRQUMvRSxNQUFNLElBQUksR0FBRyxjQUFjLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFBO1FBQ2pELElBQUksTUFBTSxHQUFHLGNBQWMsQ0FBQTtRQUMzQixPQUFPLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxFQUFFLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNsSCxPQUFPLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsQ0FBQTtLQUMxRjtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyx5Q0FBeUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUM3RCxNQUFNLElBQUksY0FBYyxDQUFDO1lBQ3JCLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTztZQUNwQixTQUFTLEVBQUUsU0FBUztZQUNwQixLQUFLLEVBQUU7Z0JBQ0gsVUFBVSxFQUFFLDBDQUEwQzthQUN6RDtTQUNKLENBQUMsQ0FBQTtLQUNMO0FBQ0wsQ0FBQyxDQUFBIn0=