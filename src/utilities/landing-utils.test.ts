import { describe, it, expect } from 'vitest'
import { createFontData, transformFonts } from './landing-utils'

describe('fontTransformation', () => {
    const fontRequest = [
        { key: '"Droid Sans"', count: 10, isFirstPlace: true },
        { key: '"Dosis"', count: 5, isFirstPlace: false },
        { key: '"Anton"', count: 2, isFirstPlace: false },
    ]

    it('should return default font data when no request is provided', () => {
        const { fonts, fontImport } = createFontData()
        expect(fonts.sections.hdrs.value).toBe('Oswald')
        expect(fontImport).toContain('Oswald')
    })

    it('should return correct transformed font data when valid font request is provided', () => {
        const { fonts, fontImport } = createFontData(fontRequest)
        //empty spaces converted to - signs
        expect(fonts.sections.body.value).toBe('Droid-Sans')
        expect(fonts.sections.hdrs.value).toBe('Dosis')

        //empty spaces converted to + signs
        expect(fontImport).toContain('Droid+Sans')
    })

    it('should handle an empty font request array', () => {
        const { fonts, fontImport } = createFontData([])
        expect(fonts.sections.hdrs.value).toBe('Oswald')
        expect(fontImport).toContain('Oswald')
    })

    it('should handle font request with unknown fonts', () => {
        const unknownFontRequest = [
            { key: 'Unknown Font', count: 10, isFirstPlace: true },
            { key: 'Another Unknown Font', count: 5, isFirstPlace: false },
        ]
        const { fonts, fontImport } = createFontData(unknownFontRequest)
        expect(fonts.sections.hdrs.value).toBe('Oswald')
        expect(fontImport).toContain('Oswald')
    })
})
