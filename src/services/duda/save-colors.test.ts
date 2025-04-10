import { describe, it, expect } from 'vitest'
import mockBusinessInfoObject from './mocks/mock-business-info-object.json'
import { transformColorsToDudaFormat } from './save-colors.js'
import { DudaColors } from '../../types/duda-api-type.js'

describe('transformColorsToDudaFormat', () => {
    it('should transform colors to Duda format', () => {
        const mockDudaColors: DudaColors = [
            { id: 'color_1', value: '#000000', label: 'Primary' },
            { id: 'color_2', value: '#FFFFFF', label: 'Secondary' },
            { id: 'color_3', value: null, label: 'Secondary' },
            { id: 'color_4', value: null, label: 'Secondary' },
            { id: 'color_5', value: null, label: 'Secondary' },
            { id: 'color_6', value: null, label: 'Secondary' },
            { id: 'color_7', value: null, label: 'Secondary' },
            { id: 'color_8', value: null, label: 'Secondary' },
        ]

        const transformedColorsResult = [
            { id: 'color_1', value: '#000000', label: 'Primary' },
            { id: 'color_2', value: '#FFFFFF', label: 'Secondary' },
            { id: 'color_3', value: 'rgba(204,0,0,1)', label: 'primary-scraped' },
            { id: 'color_4', label: 'secondary-scraped', value: 'rgba(255,255,255,1)' },
            { id: 'color_5', label: 'tertiary-scraped', value: 'rgba(245,245,245,1)' },
            { id: 'color_6', label: 'text-scraped', value: 'rgba(0,0,0,1)' },
            { id: 'color_7', label: 'background-scraped', value: 'rgba(237,221,194,1)' },
            { id: 'color_8', value: null, label: 'Secondary' },
        ]
        const result = transformColorsToDudaFormat(mockDudaColors, mockBusinessInfoObject.styles.colors)
        expect(result).toEqual(transformedColorsResult)
    })
    it('should skip adding when a color is not hex or rgba', () => {
        const mockDudaColors: DudaColors = [
            { id: 'color_1', value: '#000000', label: 'Primary' },
            { id: 'color_2', value: '#FFFFFF', label: 'Secondary' },
            { id: 'color_3', value: null, label: 'yes' },
        ]

        const scrapedColors = {
            primaryColor: 'random',
            secondaryColor: '#000000',
        }

        const mockDudaColorsResult: DudaColors = [
            { id: 'color_1', value: '#000000', label: 'Primary' },
            { id: 'color_2', value: '#FFFFFF', label: 'Secondary' },
            { id: 'color_3', value: 'rgba(0,0,0,1)', label: 'secondary-scraped' },
        ]

        const result = transformColorsToDudaFormat(mockDudaColors, scrapedColors)
        expect(result).toStrictEqual(mockDudaColorsResult)
    })
}) //
