import {
    wrapTextWithPTags,
    isPromoButton,
    removeDuplicatesArray,
    convertSpecialTokens,
    replaceKey,
    createItemStyles,
    removeFieldsFromObj,
    isLink,
    isButton,
    decideBtnCount,
    createModalPageList,
} from '../utils'
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
    const pText =
        '<p>Swamp Rabbit Home Repairs has years of experience providing <a href="/deck-repairs/">home repair</a> and improvement services to residents of Greenville, SC and surrounding areas.</p>'
    it('should ignore text that starts with </p>', () => {
        expect(wrapTextWithPTags(pText)).toBe(pText)
    })
    const divText =
        '<div>Swamp Rabbit Home Repairs has years of experience providing <a href="/deck-repairs/">home repair</a> and improvement services to residents of Greenville, SC and surrounding areas.</div>'
    it('should ignore text that starts with </div>', () => {
        expect(wrapTextWithPTags(divText)).toBe(divText)
    })
})
describe('Is Promo button', () => {
    const item = { image: '', modColor1: '', id: '1' }
    const modType = 'Article'
    const btnNum = 1
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
        const item2 = { ...item, modColor1: 'red' }
        expect(isPromoButton(item2, 'Parallax', btnNum)).toBe('btn_override')
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
        expect(convertSpecialTokens('plain text&quot;', 'desc')).toBe("plain text'")
    })
})
describe('Replace Key', () => {
    const obj = { name: 'josh' }
    it('should change the key name to firstname', () => {
        expect(replaceKey(obj, 'name', 'firstname')).toStrictEqual({ firstname: 'josh' })
    })
    it('should remain unchanged when key is not present', () => {
        const obj2 = { name: 'josh' }
        expect(replaceKey(obj2, 'job', 'ocupation')).toStrictEqual({ name: 'josh' })
    })
})
describe('Create Item Styles', () => {
    const items = [
        {
            id: '33',
            modColor1: 'red',
            image: '/yes.jpg',
            textureImage: {
                gradientColors: ['red', 'blue'],
            },
            promoColor: 'green',
            itemStyle: '',
        },
    ]
    it('should result in the same items', () => {
        expect(createItemStyles(items, '1', 'Parallax', '')).toStrictEqual(items)
    })
    it('should result in an accent background', () => {
        const newItems = [...items]
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
    const newObj = {
        other: 'no',
    }
    it('should result in the obj without the fields passed in the array', () => {
        expect(removeFieldsFromObj(obj, fields)).toStrictEqual(newObj)
    })
})
describe('isLink: Check if item has any link value', () => {
    const item = { image: '', modColor1: '', id: '1' }
    it('should decide the item does not have a link because of empty link values ', () => {
        expect(isLink(item)).toStrictEqual(false)
    })
    it('should decide the item has a link because of the pagelink value', () => {
        expect(isLink({ ...item, pagelink: '/home' })).toStrictEqual(true)
    })
})
describe('isButton: Check if item has label values for a button', () => {
    const item = { image: '', modColor1: '', id: '1' }
    it('should decide the item does not have a button because of empty label values ', () => {
        expect(isButton(item)).toStrictEqual(false)
    })
    it('should decide the item has a button because of the actionlbl value', () => {
        expect(isButton({ ...item, actionlbl: 'click here' })).toStrictEqual(true)
    })
    it('should decide the item has a link because of the actionlbl2 value', () => {
        expect(isButton({ ...item, actionlbl2: 'click here' })).toStrictEqual(true)
    })
})
describe('btnCount: Decide how many buttons are in an item', () => {
    const item = { image: '', modColor1: '', id: '1' }
    it('should decide 0 btns in an item without the correct fields', () => {
        expect(decideBtnCount(item)).toStrictEqual(0)
    })
    it('should decide the item has 1 button because of the actionlbl value and pagelink', () => {
        expect(decideBtnCount({ ...item, actionlbl: 'click here', pagelink: '/home' })).toStrictEqual(1)
    })
    it('should decide the item has 2 buttons because of the multiple label values and links', () => {
        expect(decideBtnCount({ ...item, actionlbl: 'btn1', actionlbl2: 'btn2', pagelink: '/home', weblink2: '/home' })).toStrictEqual(2)
    })
})
describe('Create modals list', () => {
    const modules = [
        [
            {
                type: 'modal_1',
                well: '',
                title: 'modal',
                items: [{ autoOpen: false }],
            },
        ],
    ]
    const modalList = [
        {
            modalNum: 0,
            modalTitle: 'modal',
            autoOpen: false,
            openEveryTime: false,
        },
    ]
    //items: LunaModuleItem[], well: string, modType: string, type: string
    it('should result in the obj without the fields passed in the array', () => {
        expect(createModalPageList(modules)).toStrictEqual(modalList)
    })
    const modules2 = [
        [
            {
                type: 'modal_1',
                well: '1',
                title: 'modal',
                items: [{ autoOpen: false }],
            },
        ],
    ]
    const modalListAutoOpentrue = [
        {
            modalNum: 0,
            modalTitle: 'modal',
            autoOpen: true,
            openEveryTime: false,
        },
    ]
    //items: LunaModuleItem[], well: string, modType: string, type: string
    it('should result in an array with a modal that has autopen to true', () => {
        expect(createModalPageList(modules2)).toStrictEqual(modalListAutoOpentrue)
    })
    const modulesItemAutoOpentrue = [
        [
            {
                type: 'modal_1',
                well: '',
                title: 'modal',
                items: [{ autoOpen: true }], //use autoOpen in items this time
            },
        ],
    ]
    it('should result in an array with a modal that has autopen to true using items field', () => {
        expect(createModalPageList(modulesItemAutoOpentrue)).toStrictEqual(modalListAutoOpentrue)
    })
})
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90ZXN0cy91dGlscy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDSCxpQkFBaUIsRUFDakIsYUFBYSxFQUNiLHFCQUFxQixFQUNyQixvQkFBb0IsRUFDcEIsVUFBVSxFQUNWLGdCQUFnQixFQUNoQixtQkFBbUIsRUFDbkIsTUFBTSxFQUNOLFFBQVEsRUFDUixjQUFjLEVBQ2QsbUJBQW1CLEdBQ3RCLE1BQU0sVUFBVSxDQUFBO0FBQ2pCLE9BQU8sRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxNQUFNLFFBQVEsQ0FBQTtBQUU3QyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO0lBQzlCLEVBQUUsQ0FBQywwQ0FBMEMsRUFBRSxHQUFHLEVBQUU7UUFDaEQsTUFBTSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUE7SUFDdkUsQ0FBQyxDQUFDLENBQUE7SUFFRixFQUFFLENBQUMsK0NBQStDLEVBQUUsR0FBRyxFQUFFO1FBQ3JELE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLDBDQUEwQyxDQUFDLENBQUE7SUFDbkgsQ0FBQyxDQUFDLENBQUE7SUFFRixFQUFFLENBQUMseURBQXlELEVBQUUsR0FBRyxFQUFFO1FBQy9ELE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyx5REFBeUQsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUNyRix1RUFBdUUsQ0FDMUUsQ0FBQTtJQUNMLENBQUMsQ0FBQyxDQUFBO0lBRUYsRUFBRSxDQUFDLHFFQUFxRSxFQUFFLEdBQUcsRUFBRTtRQUMzRSxNQUFNLENBQUMsaUJBQWlCLENBQUMsb0ZBQW9GLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FDaEgseUdBQXlHLENBQzVHLENBQUE7SUFDTCxDQUFDLENBQUMsQ0FBQTtJQUVGLEVBQUUsQ0FBQywyREFBMkQsRUFBRSxHQUFHLEVBQUU7UUFDakUsTUFBTSxDQUFDLGlCQUFpQixDQUFDLGdDQUFnQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsOENBQThDLENBQUMsQ0FBQTtJQUNwSCxDQUFDLENBQUMsQ0FBQTtJQUVGLEVBQUUsQ0FBQyxzQ0FBc0MsRUFBRSxHQUFHLEVBQUU7UUFDNUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLGdDQUFnQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsOENBQThDLENBQUMsQ0FBQTtJQUNwSCxDQUFDLENBQUMsQ0FBQTtJQUVGLEVBQUUsQ0FBQyxpQ0FBaUMsRUFBRSxHQUFHLEVBQUU7UUFDdkMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsMkNBQTJDLENBQUMsQ0FBQTtJQUM5RyxDQUFDLENBQUMsQ0FBQTtJQUVGLE1BQU0sS0FBSyxHQUNQLDRMQUE0TCxDQUFBO0lBQ2hNLEVBQUUsQ0FBQywwQ0FBMEMsRUFBRSxHQUFHLEVBQUU7UUFDaEQsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ2hELENBQUMsQ0FBQyxDQUFBO0lBRUYsTUFBTSxPQUFPLEdBQ1QsZ01BQWdNLENBQUE7SUFDcE0sRUFBRSxDQUFDLDRDQUE0QyxFQUFFLEdBQUcsRUFBRTtRQUNsRCxNQUFNLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDcEQsQ0FBQyxDQUFDLENBQUE7QUFDTixDQUFDLENBQUMsQ0FBQTtBQUVGLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUU7SUFDN0IsTUFBTSxJQUFJLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFBO0lBQ2xELE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQTtJQUN6QixNQUFNLE1BQU0sR0FBRyxDQUFDLENBQUE7SUFFaEIsRUFBRSxDQUFDLHFCQUFxQixFQUFFLEdBQUcsRUFBRTtRQUMzQixNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDOUQsQ0FBQyxDQUFDLENBQUE7SUFFRixFQUFFLENBQUMsK0NBQStDLEVBQUUsR0FBRyxFQUFFO1FBQ3JELE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUN6RCxDQUFDLENBQUMsQ0FBQTtJQUVGLEVBQUUsQ0FBQyxnREFBZ0QsRUFBRSxHQUFHLEVBQUU7UUFDdEQsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBQ3JFLENBQUMsQ0FBQyxDQUFBO0lBRUYsRUFBRSxDQUFDLHVEQUF1RCxFQUFFLEdBQUcsRUFBRTtRQUM3RCxNQUFNLEtBQUssR0FBRyxFQUFFLEdBQUcsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQTtRQUMzQyxNQUFNLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUE7SUFDekUsQ0FBQyxDQUFDLENBQUE7SUFFRixFQUFFLENBQUMsdURBQXVELEVBQUUsR0FBRyxFQUFFO1FBQzdELE1BQU0sQ0FBQyxhQUFhLENBQUMsRUFBRSxHQUFHLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFBO0lBQzdGLENBQUMsQ0FBQyxDQUFBO0FBQ04sQ0FBQyxDQUFDLENBQUE7QUFFRixRQUFRLENBQUMseUJBQXlCLEVBQUUsR0FBRyxFQUFFO0lBQ3JDLEVBQUUsQ0FBQyx5Q0FBeUMsRUFBRSxHQUFHLEVBQUU7UUFDL0MsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0lBQ3hFLENBQUMsQ0FBQyxDQUFBO0lBRUYsRUFBRSxDQUFDLGlEQUFpRCxFQUFFLEdBQUcsRUFBRTtRQUN2RCxNQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFBO0lBQ2pGLENBQUMsQ0FBQyxDQUFBO0FBQ04sQ0FBQyxDQUFDLENBQUE7QUFFRixRQUFRLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFO0lBQ3BDLEVBQUUsQ0FBQyxtQ0FBbUMsRUFBRSxHQUFHLEVBQUU7UUFDekMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFBO0lBQ2pFLENBQUMsQ0FBQyxDQUFBO0lBQ0YsRUFBRSxDQUFDLDZCQUE2QixFQUFFLEdBQUcsRUFBRTtRQUNuQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO0lBQ3pFLENBQUMsQ0FBQyxDQUFBO0lBQ0YsRUFBRSxDQUFDLHFDQUFxQyxFQUFFLEdBQUcsRUFBRTtRQUMzQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7SUFDckUsQ0FBQyxDQUFDLENBQUE7SUFDRixFQUFFLENBQUMseUNBQXlDLEVBQUUsR0FBRyxFQUFFO1FBQy9DLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBQ3hFLENBQUMsQ0FBQyxDQUFBO0FBQ04sQ0FBQyxDQUFDLENBQUE7QUFFRixRQUFRLENBQUMsYUFBYSxFQUFFLEdBQUcsRUFBRTtJQUN6QixNQUFNLEdBQUcsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQTtJQUM1QixFQUFFLENBQUMseUNBQXlDLEVBQUUsR0FBRyxFQUFFO1FBQy9DLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFBO0lBQ3JGLENBQUMsQ0FBQyxDQUFBO0lBRUYsRUFBRSxDQUFDLGlEQUFpRCxFQUFFLEdBQUcsRUFBRTtRQUN2RCxNQUFNLElBQUksR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQTtRQUM3QixNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQTtJQUNoRixDQUFDLENBQUMsQ0FBQTtBQUNOLENBQUMsQ0FBQyxDQUFBO0FBRUYsUUFBUSxDQUFDLG9CQUFvQixFQUFFLEdBQUcsRUFBRTtJQUNoQyxNQUFNLEtBQUssR0FBUTtRQUNmO1lBQ0ksRUFBRSxFQUFFLElBQUk7WUFDUixTQUFTLEVBQUUsS0FBSztZQUNoQixLQUFLLEVBQUUsVUFBVTtZQUNqQixZQUFZLEVBQUU7Z0JBQ1YsY0FBYyxFQUFFLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQzthQUNsQztZQUNELFVBQVUsRUFBRSxPQUFPO1lBQ25CLFNBQVMsRUFBRSxFQUFFO1NBQ2hCO0tBQ0osQ0FBQTtJQUVELEVBQUUsQ0FBQyxpQ0FBaUMsRUFBRSxHQUFHLEVBQUU7UUFDdkMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQzdFLENBQUMsQ0FBQyxDQUFBO0lBRUYsRUFBRSxDQUFDLHVDQUF1QyxFQUFFLEdBQUcsRUFBRTtRQUM3QyxNQUFNLFFBQVEsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUE7UUFDM0IsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxFQUFFLFVBQVUsRUFBRSwwQkFBMEIsRUFBRSxDQUFBO1FBQ2xFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFBO1FBQ25CLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUNoRixDQUFDLENBQUMsQ0FBQTtBQUNOLENBQUMsQ0FBQyxDQUFBO0FBRUYsUUFBUSxDQUFDLDJCQUEyQixFQUFFLEdBQUcsRUFBRTtJQUN2QyxNQUFNLE1BQU0sR0FBRyxDQUFDLGNBQWMsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLGNBQWMsQ0FBQyxDQUFBO0lBRS9FLE1BQU0sR0FBRyxHQUFHO1FBQ1IsWUFBWSxFQUFFLEtBQUs7UUFDbkIsS0FBSyxFQUFFLElBQUk7UUFDWCxZQUFZLEVBQUUsS0FBSztLQUN0QixDQUFBO0lBRUQsTUFBTSxNQUFNLEdBQUc7UUFDWCxLQUFLLEVBQUUsSUFBSTtLQUNkLENBQUE7SUFFRCxFQUFFLENBQUMsaUVBQWlFLEVBQUUsR0FBRyxFQUFFO1FBQ3ZFLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDbEUsQ0FBQyxDQUFDLENBQUE7QUFDTixDQUFDLENBQUMsQ0FBQTtBQUVGLFFBQVEsQ0FBQywwQ0FBMEMsRUFBRSxHQUFHLEVBQUU7SUFDdEQsTUFBTSxJQUFJLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFBO0lBRWxELEVBQUUsQ0FBQywyRUFBMkUsRUFBRSxHQUFHLEVBQUU7UUFDakYsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUM3QyxDQUFDLENBQUMsQ0FBQTtJQUVGLEVBQUUsQ0FBQyxpRUFBaUUsRUFBRSxHQUFHLEVBQUU7UUFDdkUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ3RFLENBQUMsQ0FBQyxDQUFBO0FBQ04sQ0FBQyxDQUFDLENBQUE7QUFFRixRQUFRLENBQUMsdURBQXVELEVBQUUsR0FBRyxFQUFFO0lBQ25FLE1BQU0sSUFBSSxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQTtJQUVsRCxFQUFFLENBQUMsOEVBQThFLEVBQUUsR0FBRyxFQUFFO1FBQ3BGLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDL0MsQ0FBQyxDQUFDLENBQUE7SUFFRixFQUFFLENBQUMsb0VBQW9FLEVBQUUsR0FBRyxFQUFFO1FBQzFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLElBQUksRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM5RSxDQUFDLENBQUMsQ0FBQTtJQUVGLEVBQUUsQ0FBQyxtRUFBbUUsRUFBRSxHQUFHLEVBQUU7UUFDekUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsSUFBSSxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQy9FLENBQUMsQ0FBQyxDQUFBO0FBQ04sQ0FBQyxDQUFDLENBQUE7QUFFRixRQUFRLENBQUMsa0RBQWtELEVBQUUsR0FBRyxFQUFFO0lBQzlELE1BQU0sSUFBSSxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQTtJQUVsRCxFQUFFLENBQUMsNERBQTRELEVBQUUsR0FBRyxFQUFFO1FBQ2xFLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDakQsQ0FBQyxDQUFDLENBQUE7SUFFRixFQUFFLENBQUMsaUZBQWlGLEVBQUUsR0FBRyxFQUFFO1FBQ3ZGLE1BQU0sQ0FBQyxjQUFjLENBQUMsRUFBRSxHQUFHLElBQUksRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3BHLENBQUMsQ0FBQyxDQUFBO0lBRUYsRUFBRSxDQUFDLHFGQUFxRixFQUFFLEdBQUcsRUFBRTtRQUMzRixNQUFNLENBQUMsY0FBYyxDQUFDLEVBQUUsR0FBRyxJQUFJLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDckksQ0FBQyxDQUFDLENBQUE7QUFDTixDQUFDLENBQUMsQ0FBQTtBQUVGLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLEVBQUU7SUFDaEMsTUFBTSxPQUFPLEdBQUc7UUFDWjtZQUNJO2dCQUNJLElBQUksRUFBRSxTQUFTO2dCQUNmLElBQUksRUFBRSxFQUFFO2dCQUNSLEtBQUssRUFBRSxPQUFPO2dCQUNkLEtBQUssRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDO2FBQy9CO1NBQ0o7S0FDSixDQUFBO0lBRUQsTUFBTSxTQUFTLEdBQUc7UUFDZDtZQUNJLFFBQVEsRUFBRSxDQUFDO1lBQ1gsVUFBVSxFQUFFLE9BQU87WUFDbkIsUUFBUSxFQUFFLEtBQUs7WUFDZixhQUFhLEVBQUUsS0FBSztTQUN2QjtLQUNKLENBQUE7SUFFRCxzRUFBc0U7SUFDdEUsRUFBRSxDQUFDLGlFQUFpRSxFQUFFLEdBQUcsRUFBRTtRQUN2RSxNQUFNLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUE7SUFDakUsQ0FBQyxDQUFDLENBQUE7SUFFRixNQUFNLFFBQVEsR0FBRztRQUNiO1lBQ0k7Z0JBQ0ksSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsSUFBSSxFQUFFLEdBQUc7Z0JBQ1QsS0FBSyxFQUFFLE9BQU87Z0JBQ2QsS0FBSyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUM7YUFDL0I7U0FDSjtLQUNKLENBQUE7SUFFRCxNQUFNLHFCQUFxQixHQUFHO1FBQzFCO1lBQ0ksUUFBUSxFQUFFLENBQUM7WUFDWCxVQUFVLEVBQUUsT0FBTztZQUNuQixRQUFRLEVBQUUsSUFBSTtZQUNkLGFBQWEsRUFBRSxLQUFLO1NBQ3ZCO0tBQ0osQ0FBQTtJQUVELHNFQUFzRTtJQUN0RSxFQUFFLENBQUMsaUVBQWlFLEVBQUUsR0FBRyxFQUFFO1FBQ3ZFLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO0lBQzlFLENBQUMsQ0FBQyxDQUFBO0lBRUYsTUFBTSx1QkFBdUIsR0FBRztRQUM1QjtZQUNJO2dCQUNJLElBQUksRUFBRSxTQUFTO2dCQUNmLElBQUksRUFBRSxFQUFFO2dCQUNSLEtBQUssRUFBRSxPQUFPO2dCQUNkLEtBQUssRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsaUNBQWlDO2FBQ2pFO1NBQ0o7S0FDSixDQUFBO0lBRUQsRUFBRSxDQUFDLG1GQUFtRixFQUFFLEdBQUcsRUFBRTtRQUN6RixNQUFNLENBQUMsbUJBQW1CLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO0lBQzdGLENBQUMsQ0FBQyxDQUFBO0FBQ04sQ0FBQyxDQUFDLENBQUEifQ==
