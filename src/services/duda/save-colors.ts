import { ScrapedColors } from '../../schema/output-zod.js'
import { DudaColors } from '../../types/duda-api-type.js'
import { getDudaColors, updateDudaTheme } from '../duda-api.js'

function hexToRGBA(hex: string): string | null {
    // Remove the hash if present
    hex = hex.replace('#', '')

    // Handle shorthand hex (#fff)
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
    }

    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)

    // Check if the conversion was successful
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
        console.warn('Invalid hex color:', hex)
        return null
    }

    return `rgba(${r},${g},${b},1)`
}

function isValidRGBFormat(color: string): boolean {
    // Match both rgb() and rgba() formats
    const rgbRegex = /^rgb(a)?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[0-1](?:\.\d+)?)?\s*\)$/
    return rgbRegex.test(color)
}

export function transformColorsToDudaFormat(dudaColors: DudaColors, colors: ScrapedColors) {
    //transform and append new colors
    const newDudaColors: DudaColors = dudaColors

    // Helper function to find the next available null slot
    const findNextAvailableId = (): number => {
        for (let i = 1; i <= 20; i++) {
            const existingColor = dudaColors.find((color) => color.id === `color_${i}`)
            if (existingColor && existingColor.value === null) {
                return i
            }
        }
        return 21 // Return out of range if no slots available
    }

    // Helper function to add color with next available ID
    const addColor = (value: string | null, label: string) => {
        if (!value) return

        // Convert hex to rgba if needed
        const colorValue = value.startsWith('#') ? hexToRGBA(value) : value

        // Find next available slot
        const nextId = findNextAvailableId()

        // Skip if not valid RGB format or conversion failed or we've hit the limit
        if (!colorValue || !isValidRGBFormat(colorValue) || nextId > 20) {
            console.warn(`Skipping color for ${label}. No available slots or invalid format. Value: ${value}`)
            return
        }

        // Replace the null color in the array instead of pushing
        const index = dudaColors.findIndex((color) => color.id === `color_${nextId}`)
        if (index !== -1) {
            dudaColors[index] = {
                id: `color_${nextId}`,
                value: colorValue,
                label: label,
            }
        }
    }

    // Add each color type with the next available ID
    addColor(colors.primaryColor || '', 'primary-scraped')
    addColor(colors.secondaryColor || '', 'secondary-scraped')
    addColor(colors.tertiaryColor || '', 'tertiary-scraped')
    //addColor(colors.quaternary || '', 'Quaternary')
    addColor(colors.textColor || '', 'text-scraped')
    addColor(colors.mainContentBackgroundColor || '', 'background-scraped')

    return newDudaColors
}

export async function saveColorsToDuda(uploadLocation: string, colors: ScrapedColors) {
    // @ts-expect-error (ignoring because duda type is incorrect)
    const dudaColors: DudaColors = await getDudaColors(uploadLocation) //must append new colors to existing colors
    const addedDudaColors = transformColorsToDudaFormat(dudaColors, colors)

    await updateDudaTheme(uploadLocation, addedDudaColors)
    return
}
