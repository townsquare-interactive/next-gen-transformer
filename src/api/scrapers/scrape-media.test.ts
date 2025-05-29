import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { scrapeMediaFromPage } from './scrape-media.ts'
import type { Page, Response } from 'playwright'
import * as utils from './utils.js'

describe('scrapeMediaFromPage', () => {
    beforeEach(() => {
        // Mock fetch download function
        global.fetch = vi.fn().mockImplementation(() =>
            Promise.resolve({
                ok: true,
                arrayBuffer: () => Promise.resolve(new ArrayBuffer(2 * 1024)), // 2KB buffer (above MIN_MEDIA_SIZE)
            })
        )

        // Mock utility functions
        vi.spyOn(utils, 'isStockImage').mockReturnValue(false)
        vi.spyOn(utils, 'getImageDimensions').mockResolvedValue({ width: 800, height: 600 })
        vi.spyOn(utils, 'isTrackingOrGoogle').mockReturnValue(false)
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })
    // Mock page setup helper
    const createMockPage = () => {
        const mockPage = {
            on: vi.fn(),
            waitForLoadState: vi.fn(),
            isClosed: vi.fn(() => false),
            url: vi.fn(() => 'https://example.com'),
        }

        return mockPage as unknown as Page
    }

    // Mock response setup helper
    const createMockResponse = (options: { url: string; contentType: string; resourceType: string; status?: number }) => {
        return {
            url: vi.fn(() => options.url),
            headers: vi.fn(() => ({ 'content-type': options.contentType })),
            request: vi.fn(() => ({ resourceType: () => options.resourceType })),
            status: vi.fn(() => options.status || 200),
            body: vi.fn().mockResolvedValue(Buffer.alloc(1024)), // 1KB buffer (above MIN_SIZE for images)
        } as unknown as Response
    }

    it('should process valid video media', async () => {
        const mockPage = createMockPage()
        //manually triggering the page.on response
        let responseHandler: (response: Response) => Promise<void>

            // Store the response handler when page.on is called
        ;(mockPage.on as any).mockImplementation((event: string, handler) => {
            if (event === 'response') {
                responseHandler = handler
            }
        })

        // Start the scraping process
        const scrapePromise = scrapeMediaFromPage(mockPage, 'Test Page')

        // Simulate a video response
        const mockVideoResponse = createMockResponse({
            url: 'https://example.com/video.mp4',
            contentType: 'video/mp4',
            resourceType: 'media',
        })

        // Trigger the response handler
        await responseHandler!(mockVideoResponse)

        // Wait for networkidle
        await mockPage.waitForLoadState('networkidle')

        const result = await scrapePromise

        expect(result).toHaveLength(1)
        expect(result[0]).toMatchObject({
            type: 'video',
            fileExtension: '.mp4',
            pageTitle: 'Test Page',
        })
    })

    it('should process valid image media', async () => {
        const mockPage = createMockPage()
        let responseHandler: (response: Response) => Promise<void>
        ;(mockPage.on as any).mockImplementation((event: string, handler) => {
            if (event === 'response') {
                responseHandler = handler
            }
        })

        const scrapePromise = scrapeMediaFromPage(mockPage, 'Test Page')

        const mockImageResponse = createMockResponse({
            url: 'https://example.com/image.jpg',
            contentType: 'image/jpeg',
            resourceType: 'image',
        })

        await responseHandler!(mockImageResponse)
        await mockPage.waitForLoadState('networkidle')

        const result = await scrapePromise

        expect(result).toHaveLength(1)
        expect(result[0]).toMatchObject({
            type: 'image',
            fileExtension: '.jpg',
            pageTitle: 'Test Page',
        })
    })

    it('should skip redirected responses', async () => {
        const mockPage = createMockPage()
        let responseHandler: (response: Response) => Promise<void>
        ;(mockPage.on as any).mockImplementation((event: string, handler) => {
            if (event === 'response') {
                responseHandler = handler
            }
        })

        const scrapePromise = scrapeMediaFromPage(mockPage, 'Test Page')

        const mockRedirectResponse = createMockResponse({
            url: 'https://example.com/video.mp4',
            contentType: 'video/mp4',
            resourceType: 'media',
            status: 302,
        })

        await responseHandler!(mockRedirectResponse)
        await mockPage.waitForLoadState('networkidle')

        const result = await scrapePromise

        expect(result).toHaveLength(0)
    })

    it('should skip duplicate URLs', async () => {
        const mockPage = createMockPage()
        let responseHandler: (response: Response) => Promise<void>
        ;(mockPage.on as any).mockImplementation((event: string, handler) => {
            if (event === 'response') {
                responseHandler = handler
            }
        })

        const scrapePromise = scrapeMediaFromPage(mockPage, 'Test Page')

        // Create a spy to track URL processing
        const processedUrls = new Set<string>()
        const urlSpy = vi.fn((url: string) => {
            processedUrls.add(url)
        })

        const mockResponse = createMockResponse({
            url: 'https://example.com/video.mp4',
            contentType: 'video/mp4',
            resourceType: 'media',
        })

        // First call - should process the URL
        await responseHandler!(mockResponse)
        urlSpy(mockResponse.url())

        // Second call with same URL - should skip processing
        await responseHandler!(mockResponse)
        urlSpy(mockResponse.url())

        await mockPage.waitForLoadState('networkidle')

        const result = await scrapePromise

        // Verify the behavior
        expect(result).toHaveLength(1) // Only one file in results
        expect(urlSpy).toHaveBeenCalledTimes(2) // URL was seen twice
        expect(processedUrls.size).toBe(1)
        expect(processedUrls.has('https://example.com/video.mp4')).toBe(true)
    })

    it('should skip invalid content types', async () => {
        const mockPage = createMockPage()
        let responseHandler: (response: Response) => Promise<void>
        ;(mockPage.on as any).mockImplementation((event: string, handler) => {
            if (event === 'response') {
                responseHandler = handler
            }
        })

        const scrapePromise = scrapeMediaFromPage(mockPage, 'Test Page')

        const mockInvalidResponse = createMockResponse({
            url: 'https://example.com/file.txt',
            contentType: 'text/plain',
            resourceType: 'media',
        })

        await responseHandler!(mockInvalidResponse)
        await mockPage.waitForLoadState('networkidle')

        const result = await scrapePromise

        expect(result).toHaveLength(0)
    })

    it('should handle closed page gracefully', async () => {
        const mockPage = createMockPage()
        ;(mockPage.isClosed as any).mockReturnValue(true)

        let responseHandler: (response: Response) => Promise<void>
        ;(mockPage.on as any).mockImplementation((event: string, handler) => {
            if (event === 'response') {
                responseHandler = handler
            }
        })

        const scrapePromise = scrapeMediaFromPage(mockPage, 'Test Page')

        const mockResponse = createMockResponse({
            url: 'https://example.com/video.mp4',
            contentType: 'video/mp4',
            resourceType: 'media',
        })

        await responseHandler!(mockResponse)
        await mockPage.waitForLoadState('networkidle')

        const result = await scrapePromise

        expect(result).toHaveLength(0)
    })
})
