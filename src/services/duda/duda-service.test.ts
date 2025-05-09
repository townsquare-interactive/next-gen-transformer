import { describe, expect, it, vi } from 'vitest'
import { saveGeneratedContent } from './duda-service.js'
import { ValidationError } from '../../utilities/errors.js'

describe('saveGeneratedContent', () => {
    const requestExample = {
        gpid: 'TI TESTWA001',
        homepage_content: 'Homepage content',
        service_1_name: 'Contact Us',
        service_1_content: 'Content for page 1',
        service_2_name: 'About Us',
        service_2_content: 'Content for page 2',
        service_3_name: 'Services',
        service_3_content: 'Content for page 3',
        service_4_name: 'Hours',
        service_4_content: '',
        service_5_name: '',
        service_5_content: '',
        service_6_name: '',
        service_6_content: '',
    }

    it('should transform content into Duda format and save it', async () => {
        const dudaSiteId = '1234567890'
        const mockSaveContentToDuda = vi.fn()
        const mockGetDudaSiteId = vi.fn().mockResolvedValue(dudaSiteId)

        const functions = {
            saveContentToDuda: mockSaveContentToDuda,
            getDudaSiteId: mockGetDudaSiteId,
        }
        const result = await saveGeneratedContent(requestExample, functions)

        const newContent = {
            site_texts: {
                custom: [
                    { label: 'Home AI', text: 'Homepage content' },
                    { label: 'Contact Us AI', text: 'Content for page 1' },
                    { label: 'About Us AI', text: 'Content for page 2' },
                    { label: 'Services AI', text: 'Content for page 3' },
                ],
            },
        }

        expect(mockSaveContentToDuda).toHaveBeenCalledWith(dudaSiteId, newContent)

        expect(result).toEqual('Content uploaded to 1234567890')
    })

    it('should throw an error if the Duda site is not found', async () => {
        const mockGetDudaSiteId = vi.fn().mockRejectedValue(new Error('Duda site not found'))
        const functions = {
            getDudaSiteId: mockGetDudaSiteId,
        }

        await expect(saveGeneratedContent(requestExample, functions)).rejects.toThrow('Duda site not found')
    })

    it('should throw an error if we are unable to save the content', async () => {
        const mockGetDudaSiteId = vi.fn().mockResolvedValue('1234567890')
        const mockSaveContentToDuda = vi.fn().mockRejectedValue(new Error('Unable to save content'))
        const functions = {
            getDudaSiteId: mockGetDudaSiteId,
            saveContentToDuda: mockSaveContentToDuda,
        }

        await expect(saveGeneratedContent(requestExample, functions)).rejects.toThrow('Unable to save content')
    })
})
