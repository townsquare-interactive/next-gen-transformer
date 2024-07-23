import { describe, it, expect } from 'vitest';
import { createFontData } from './landing-utils';
describe('fontTransformation', () => {
    const fontRequest = [
        { key: '"Droid Sans"', count: 10, isFirstPlace: true },
        { key: '"Dosis"', count: 5, isFirstPlace: false },
        { key: '"Anton"', count: 2, isFirstPlace: false },
    ];
    it('should return default font data when no request is provided', () => {
        const { fonts, fontImport } = createFontData();
        expect(fonts.sections.hdrs.value).toBe('Oswald');
        expect(fontImport).toContain('Oswald');
    });
    it('should return correct transformed font data when valid font request is provided', () => {
        const { fonts, fontImport } = createFontData(fontRequest);
        //empty spaces converted to - signs
        expect(fonts.sections.body.value).toBe('Droid-Sans');
        expect(fonts.sections.hdrs.value).toBe('Dosis');
        //empty spaces converted to + signs
        expect(fontImport).toContain('Droid+Sans');
    });
    it('should handle an empty font request array', () => {
        const { fonts, fontImport } = createFontData([]);
        expect(fonts.sections.hdrs.value).toBe('Oswald');
        expect(fontImport).toContain('Oswald');
    });
    it('should handle font request with unknown fonts', () => {
        const unknownFontRequest = [
            { key: 'Unknown Font', count: 10, isFirstPlace: true },
            { key: 'Another Unknown Font', count: 5, isFirstPlace: false },
        ];
        const { fonts, fontImport } = createFontData(unknownFontRequest);
        expect(fonts.sections.hdrs.value).toBe('Oswald');
        expect(fontImport).toContain('Oswald');
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZGluZy11dGlscy50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xhbmRpbmctdXRpbHMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsTUFBTSxRQUFRLENBQUE7QUFDN0MsT0FBTyxFQUFFLGNBQWMsRUFBa0IsTUFBTSxpQkFBaUIsQ0FBQTtBQUVoRSxRQUFRLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxFQUFFO0lBQ2hDLE1BQU0sV0FBVyxHQUFHO1FBQ2hCLEVBQUUsR0FBRyxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUU7UUFDdEQsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRTtRQUNqRCxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFO0tBQ3BELENBQUE7SUFFRCxFQUFFLENBQUMsNkRBQTZELEVBQUUsR0FBRyxFQUFFO1FBQ25FLE1BQU0sRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLEdBQUcsY0FBYyxFQUFFLENBQUE7UUFDOUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUNoRCxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQzFDLENBQUMsQ0FBQyxDQUFBO0lBRUYsRUFBRSxDQUFDLGlGQUFpRixFQUFFLEdBQUcsRUFBRTtRQUN2RixNQUFNLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxHQUFHLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUN6RCxtQ0FBbUM7UUFDbkMsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtRQUNwRCxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBRS9DLG1DQUFtQztRQUNuQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFBO0lBQzlDLENBQUMsQ0FBQyxDQUFBO0lBRUYsRUFBRSxDQUFDLDJDQUEyQyxFQUFFLEdBQUcsRUFBRTtRQUNqRCxNQUFNLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxHQUFHLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUNoRCxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ2hELE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDMUMsQ0FBQyxDQUFDLENBQUE7SUFFRixFQUFFLENBQUMsK0NBQStDLEVBQUUsR0FBRyxFQUFFO1FBQ3JELE1BQU0sa0JBQWtCLEdBQUc7WUFDdkIsRUFBRSxHQUFHLEVBQUUsY0FBYyxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRTtZQUN0RCxFQUFFLEdBQUcsRUFBRSxzQkFBc0IsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUU7U0FDakUsQ0FBQTtRQUNELE1BQU0sRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLEdBQUcsY0FBYyxDQUFDLGtCQUFrQixDQUFDLENBQUE7UUFDaEUsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUNoRCxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQzFDLENBQUMsQ0FBQyxDQUFBO0FBQ04sQ0FBQyxDQUFDLENBQUEifQ==