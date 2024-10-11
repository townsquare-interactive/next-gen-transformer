import { createItemStyles } from './style-utils'
import {
    wrapTextWithPTags,
    isPromoButton,
    removeDuplicatesArray,
    convertSpecialTokens,
    replaceKey,
    removeFieldsFromObj,
    isLink,
    isButton,
    decideBtnCount,
    createModalPageList,
    convertUrlToApexId,
    checkApexIDInDomain,
    getPageNameFromDomain,
} from './utils'
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
        expect(convertSpecialTokens('plain text&quot;')).toBe("plain text'")
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
    const items: any = [
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

describe('stripUrl', () => {
    it('should return the unchanged value if no protocol is inside', () => {
        expect(convertUrlToApexId('taco')).toStrictEqual('taco')
    })
    it('should remove www.', () => {
        expect(convertUrlToApexId('www.taco.net')).toStrictEqual('taco')
    })
    it('should remove https://', () => {
        expect(convertUrlToApexId('https://taco.org')).toStrictEqual('taco')
    })
    it('should remove both https:// and www.', () => {
        expect(convertUrlToApexId('https://www.taco.org')).toStrictEqual('taco')
    })
    it('should remove both www. and https://', () => {
        expect(convertUrlToApexId('https://longer-one.com')).toStrictEqual('longer-one')
    })
    it('should remove the .net', () => {
        expect(convertUrlToApexId('green.net')).toStrictEqual('green')
    })
    it('should remove the slug after .com', () => {
        expect(convertUrlToApexId('https://hlbowman.com/local/heating-air-conditioning-service')).toStrictEqual('hlbowman')
    })
    it('should add "-" marks when there is a period inside of the subdomain area', () => {
        expect(convertUrlToApexId('https://go.jeosahelectric.com/optin-for-services')).toStrictEqual('go-jeosahelectric')
    })
    it('should add "-" marks when there are multiple periods inside the subdomain', () => {
        expect(convertUrlToApexId('https://sub.domain.example.com/')).toStrictEqual('sub-domain-example')
    })
})
it('should remove .production.townsquare.', () => {
    expect(convertUrlToApexId('https://clttestsiteforjoshedwards.production.townsquareinteractive.com')).toStrictEqual('clttestsiteforjoshedwards')
})

describe('checkApexIDInDomain', () => {
    it('should return true when a domain contains - followed by random characters and the postfix', () => {
        const checkingDomain = 'yo-djfdd.vercel.app'
        const domainOptions = { domain: 'yo', usingPreview: true }
        const postfix = '.vercel.app'
        expect(checkApexIDInDomain(checkingDomain, domainOptions, postfix)).toStrictEqual(true)
    })

    it('should return false when a domain does not have a - and five random characters', () => {
        const checkingDomain2 = 'yooverridevercel.app'
        const domainOptions = { domain: 'yo', usingPreview: true }
        const postfix = '.vercel.app'
        expect(checkApexIDInDomain(checkingDomain2, domainOptions, postfix)).toStrictEqual(false)
    })

    it('should return false when a domain does not have a matching postfix', () => {
        const checkingDomain3 = 'yo-djfdd.com'
        const domainOptions = { domain: 'yo', usingPreview: true }
        const postfix = '.vercel.app'
        expect(checkApexIDInDomain(checkingDomain3, domainOptions, postfix)).toStrictEqual(false)
    })
    it('should return true when -lp is added', () => {
        const checkingDomain4 = 'abc-lp.vercel.app'
        const domainOptions = { domain: 'abc', usingPreview: true }
        const postfix = '.vercel.app'
        expect(checkApexIDInDomain(checkingDomain4, domainOptions, postfix)).toStrictEqual(true)
    })
})

describe('getPageNameFromDomain', () => {
    it('should return the page name from a domain', () => {
        const domain = 'test.com/home'
        expect(getPageNameFromDomain(domain)).toBe('home')
    })
    it('should handle multiple / marks correctly', () => {
        const domainHttps = 'https://test.com/home'
        expect(getPageNameFromDomain(domainHttps)).toBe('home')
    })
    it('should return no page name when there is no /', () => {
        const domainNoPage = 'test.com'
        expect(getPageNameFromDomain(domainNoPage)).toBe('no page name')
    })
})
