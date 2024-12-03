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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cmFuc2xhdGlvbi1lbmdpbmVzL2xhbmRpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGdCQUFnQixFQUFFLGNBQWMsRUFBRSxNQUFNLHNDQUFzQyxDQUFBO0FBQ3ZGLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUV2RCxNQUFNLENBQUMsTUFBTSxzQkFBc0IsR0FBRyxLQUFLLEVBQUUsUUFBb0IsRUFBRSxNQUFjLEVBQUUsRUFBRTtJQUNqRixJQUFJLENBQUM7UUFDRCxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxHQUFHLE1BQU0sZ0JBQWdCLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFBO1FBQy9FLE1BQU0sSUFBSSxHQUFHLGNBQWMsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUE7UUFDakQsSUFBSSxNQUFNLEdBQUcsY0FBYyxDQUFBO1FBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLEVBQUUsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2xILE9BQU8sRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxDQUFBO0lBQzNGLENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQyx5Q0FBeUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUM3RCxNQUFNLElBQUksY0FBYyxDQUFDO1lBQ3JCLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTztZQUNwQixTQUFTLEVBQUUsU0FBUztZQUNwQixLQUFLLEVBQUU7Z0JBQ0gsVUFBVSxFQUFFLDBDQUEwQzthQUN6RDtTQUNKLENBQUMsQ0FBQTtJQUNOLENBQUM7QUFDTCxDQUFDLENBQUEifQ==