import { describe, it, expect } from 'vitest'
import { domainsMatch, normalizeUrl } from './page-list-scrape.js'

describe('domainsMatch', () => {
    it('should return true for matching URLs', () => {
        expect(domainsMatch('https://example.com', 'https://example.com')).toBe(true)
    })
    it('should return true for matching URLs with www', () => {
        expect(domainsMatch('https://example.com', 'https://www.example.com')).toBe(true)
    })
    it('should return true for different paths', () => {
        expect(domainsMatch('https://example.com', 'https://example.com/test')).toBe(true)
    })
    it('should return false for non-matching URLs', () => {
        expect(domainsMatch('https://example2.com', 'https://example.com/test')).toBe(false)
    })
})

describe('normalizeUrl', () => {
    it('should remove trailing slashes and convert to lowercase', () => {
        expect(normalizeUrl('https://example.com/')).toBe('https://example.com')
    })
    it('should handle trailing slashes with a path', () => {
        expect(normalizeUrl('https://example.com/test/')).toBe('https://example.com/test')
    })
    it('should handle mult path URLs', () => {
        expect(normalizeUrl('https://example.com/test/second')).toBe('https://example.com/test/second')
    })
})
