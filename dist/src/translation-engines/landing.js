import { createLayoutFile, createPageFile } from '../controllers/landing-controller';
import { TransformError } from '../errors';
export const createLandingPageFiles = async (siteData, apexID) => {
    try {
        const layoutContents = await createLayoutFile(siteData, apexID);
        const page = createPageFile(siteData);
        let siteID = layoutContents.siteIdentifier;
        console.log('Successfully created site files:', { siteLayout: layoutContents.siteLayout, siteIdentifier: siteID, pages: [page] });
        return { siteLayout: layoutContents.siteLayout, siteIdentifier: siteID, pages: [page] };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cmFuc2xhdGlvbi1lbmdpbmVzL2xhbmRpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGdCQUFnQixFQUFFLGNBQWMsRUFBRSxNQUFNLG1DQUFtQyxDQUFBO0FBQ3BGLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxXQUFXLENBQUE7QUFFMUMsTUFBTSxDQUFDLE1BQU0sc0JBQXNCLEdBQUcsS0FBSyxFQUFFLFFBQW9CLEVBQUUsTUFBYyxFQUFFLEVBQUU7SUFDakYsSUFBSSxDQUFDO1FBQ0QsTUFBTSxjQUFjLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFDL0QsTUFBTSxJQUFJLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ3JDLElBQUksTUFBTSxHQUFHLGNBQWMsQ0FBQyxjQUFjLENBQUE7UUFDMUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQ0FBa0MsRUFBRSxFQUFFLFVBQVUsRUFBRSxjQUFjLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2pJLE9BQU8sRUFBRSxVQUFVLEVBQUUsY0FBYyxDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUE7SUFDM0YsQ0FBQztJQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLHlDQUF5QyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQzdELE1BQU0sSUFBSSxjQUFjLENBQUM7WUFDckIsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPO1lBQ3BCLFNBQVMsRUFBRSxTQUFTO1lBQ3BCLEtBQUssRUFBRTtnQkFDSCxVQUFVLEVBQUUsMENBQTBDO2FBQ3pEO1NBQ0osQ0FBQyxDQUFBO0lBQ04sQ0FBQztBQUNMLENBQUMsQ0FBQSJ9