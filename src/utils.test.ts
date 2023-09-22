import { wrapTextWithPTags, isPromoButton, removeDuplicatesArray, convertSpecialTokens, replaceKey, createItemStyles, removeFieldsFromObj } from './utils'
import { it, describe, expect } from 'vitest'

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
    it('should wrap text with p tags that are not inside the ol or div tags', () => {
        expect(wrapTextWithPTags('Hello There <Ol><li>Yes</li></Ol>Here is some more text<div>not this</div>but this')).toBe(
            '<p>Hello There </p><ol><li>Yes</li></ol><p>Here is some more text</p><div>not this</div><p>but this</p>'
        )
    })
    it('should correctly add p tags around text not including <b>', () => {
        expect(wrapTextWithPTags('Hello There <b>yes</b>helob ul')).toBe('<p>Hello There </p><b>yes</b><p>helob ul</p>')
    })
    it('should handle <i> tags the same way>', () => {
        expect(wrapTextWithPTags('Hello There <i>yes</i>helob ul')).toBe('<p>Hello There </p><i>yes</i><p>helob ul</p>')
    })
    it('should handle uppercase <B> tag', () => {
        expect(wrapTextWithPTags('Hello There <B>yes</B>helob')).toBe('<p>Hello There </p><b>yes</b><p>helob</p>')
    })
})

describe('Is Promo button', () => {
    let item = { image: '', modColor1: '', id: '1' }
    let modType = 'Article'
    let btnNum = 1
    it('should return btn_1', () => {
        expect(isPromoButton(item, modType, btnNum)).toBe('btn_1')
    })
    it('should return btn_2 when changign btnNum to 2', () => {
        expect(isPromoButton(item, modType, 2)).toBe('btn_2')
    })
    it('should return promo_button because of Parallax', () => {
        expect(isPromoButton(item, 'Parallax', btnNum)).toBe('btn_promo')
    })
    it('should return btn_override with modColor and parallax', () => {
        item = { ...item, modColor1: 'red' }
        expect(isPromoButton(item, 'Parallax', btnNum)).toBe('btn_override')
    })
    it('should return btn2_override when changing to btnNum=2', () => {
        expect(isPromoButton({ ...item, modColor1: 'red' }, 'Parallax', 2)).toBe('btn2_override')
    })
})

describe('Remove Duplicates Array', () => {
    it('should remove duplicates from the array', () => {
        expect(removeDuplicatesArray(['red', 'red'])).toStrictEqual(['red'])
    })
    it('should leave array with no duplicates unchanged', () => {
        expect(removeDuplicatesArray(['red', 'blue'])).toStrictEqual(['red', 'blue'])
    })
})

describe('Convert Special Tokens', () => {
    it('should leave plain text unchanged', () => {
        expect(convertSpecialTokens('plain text')).toBe('plain text')
    })
    it('should convert [rn] to <br>', () => {
        expect(convertSpecialTokens('plain text[rn]')).toBe('plain text<br>')
    })
    it('should convert [t] to a blank space', () => {
        expect(convertSpecialTokens('plain text[t]')).toBe('plain text ')
    })
    it('should convert &quot; to a single quote', () => {
        expect(convertSpecialTokens('plain text&quot;')).toBe("plain text'")
    })
})

describe('Replace Key', () => {
    const obj = { name: 'josh' }
    it('should change the key name to firstname', () => {
        expect(replaceKey({ name: 'josh' }, 'name', 'firstname')).toStrictEqual({ firstname: 'josh' })
    })

    it('should remain unchanged when key is not present', () => {
        expect(replaceKey({ name: 'josh' }, 'job', 'ocupation')).toStrictEqual({ name: 'josh' })
    })
})

//itemStyles createItemStyles
describe('Create Item Styles', () => {
    const items: any = [
        {
            id: '33',
            modColor1: 'red',
            image: '/yes.jpg',
            textureImage: {
                gradientColors: ['red', 'blue'],
            },
            promoColor: 'green',
            //modOpacity: 0,
            itemStyle: '',
        },
    ]

    //items: LunaModuleItem[], well: string, modType: string, type: string
    it('should result in the same items', () => {
        expect(createItemStyles(items, '1', 'Parallax', '')).toStrictEqual(items)
    })
    it('should result in an accent background', () => {
        let newItems = [...items]
        newItems[0].itemStyle = { background: `var(--accent-background)` }
        items[0].image = ''
        expect(createItemStyles(items, '1', 'Parallax', '')).toStrictEqual(newItems)
    })
})

describe('Remove Fields From Object', () => {
    const fields = ['editingicon1', 'editingicon2', 'editingicon3', 'iconSelected']

    const obj = {
        editingicon1: 'yes',
        other: 'no',
        editingicon3: 'yes',
    }

    let newObj = {
        other: 'no',
    }

    //items: LunaModuleItem[], well: string, modType: string, type: string
    it('should result in the obj without the fields passed in the array', () => {
        expect(removeFieldsFromObj(obj, fields)).toStrictEqual(newObj)
    })
})
