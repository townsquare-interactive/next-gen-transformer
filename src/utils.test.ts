import { wrapTextWithPTags } from './utils'
import { it, describe, expect, test } from 'vitest'

describe('Wrap with P Tags', () => {
    it('should wrap plain text inside of a P tag', () => {
        expect(wrapTextWithPTags('Hello There')).toBe('<p>Hello There</p>')
    })
    it('should wrap text before html tags with p tags', () => {
        expect(wrapTextWithPTags('Hello There <ul><li>Yes</li></ul>')).toBe('<p>Hello There </p><ul><li>Yes</li></ul>')
    })
    it('should wrap text before and after html tags with p tags', () => {
        expect(wrapTextWithPTags('Hello There <ul><li>Yes</li></ul>Here is some more text')).toBe(
            '<p>Hello There </p><ul><li>Yes</li></ul><p>Here is some more text</p>'
        )
    })
    it('should wrap text with p tags that are not inside the ul or div tags', () => {
        expect(wrapTextWithPTags('Hello There <ul><li>Yes</li></ul>Here is some more text<div>not this</div>but this')).toBe(
            '<p>Hello There </p><ul><li>Yes</li></ul><p>Here is some more text</p><div>not this</div><p>but this</p>'
        )
    })
    it('should correctly add p tags around <b>', () => {
        expect(wrapTextWithPTags('Hello There <b>yes</b>helob ul')).toBe('<p>Hello There </p><b>yes</b><p>helob ul</p>')
    })
})
