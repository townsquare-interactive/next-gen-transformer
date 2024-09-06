import { createItemStyles } from './style-utils';
import { wrapTextWithPTags, isPromoButton, removeDuplicatesArray, convertSpecialTokens, replaceKey, removeFieldsFromObj, isLink, isButton, decideBtnCount, createModalPageList, convertUrlToApexId, } from './utils';
import { it, describe, expect } from 'vitest';
describe('Wrap with P Tags', () => {
    it('should wrap plain text inside of a P tag', () => {
        expect(wrapTextWithPTags('Hello There')).toBe('<p>Hello There</p>');
    });
    it('should wrap text before html tags with p tags', () => {
        expect(wrapTextWithPTags('Hello There <ul><li>Yes</li></ul>')).toBe('<p>Hello There </p><ul><li>Yes</li></ul>');
    });
    it('should wrap text before and after html tags with p tags', () => {
        expect(wrapTextWithPTags('Hello There <ul><li>Yes</li></ul>Here is some more text')).toBe('<p>Hello There </p><ul><li>Yes</li></ul><p>Here is some more text</p>');
    });
    it('should wrap text with p tags that are not inside the ol or div tags', () => {
        expect(wrapTextWithPTags('Hello There <Ol><li>Yes</li></Ol>Here is some more text<div>not this</div>but this')).toBe('<p>Hello There </p><ol><li>Yes</li></ol><p>Here is some more text</p><div>not this</div><p>but this</p>');
    });
    it('should correctly add p tags around text not including <b>', () => {
        expect(wrapTextWithPTags('Hello There <b>yes</b>helob ul')).toBe('<p>Hello There </p><b>yes</b><p>helob ul</p>');
    });
    it('should handle <i> tags the same way>', () => {
        expect(wrapTextWithPTags('Hello There <i>yes</i>helob ul')).toBe('<p>Hello There </p><i>yes</i><p>helob ul</p>');
    });
    it('should handle uppercase <B> tag', () => {
        expect(wrapTextWithPTags('Hello There <B>yes</B>helob')).toBe('<p>Hello There </p><b>yes</b><p>helob</p>');
    });
    const pText = '<p>Swamp Rabbit Home Repairs has years of experience providing <a href="/deck-repairs/">home repair</a> and improvement services to residents of Greenville, SC and surrounding areas.</p>';
    it('should ignore text that starts with </p>', () => {
        expect(wrapTextWithPTags(pText)).toBe(pText);
    });
    const divText = '<div>Swamp Rabbit Home Repairs has years of experience providing <a href="/deck-repairs/">home repair</a> and improvement services to residents of Greenville, SC and surrounding areas.</div>';
    it('should ignore text that starts with </div>', () => {
        expect(wrapTextWithPTags(divText)).toBe(divText);
    });
});
describe('Is Promo button', () => {
    const item = { image: '', modColor1: '', id: '1' };
    const modType = 'Article';
    const btnNum = 1;
    it('should return btn_1', () => {
        expect(isPromoButton(item, modType, btnNum)).toBe('btn_1');
    });
    it('should return btn_2 when changign btnNum to 2', () => {
        expect(isPromoButton(item, modType, 2)).toBe('btn_2');
    });
    it('should return promo_button because of Parallax', () => {
        expect(isPromoButton(item, 'Parallax', btnNum)).toBe('btn_promo');
    });
    it('should return btn_override with modColor and parallax', () => {
        const item2 = { ...item, modColor1: 'red' };
        expect(isPromoButton(item2, 'Parallax', btnNum)).toBe('btn_override');
    });
    it('should return btn2_override when changing to btnNum=2', () => {
        expect(isPromoButton({ ...item, modColor1: 'red' }, 'Parallax', 2)).toBe('btn2_override');
    });
});
describe('Remove Duplicates Array', () => {
    it('should remove duplicates from the array', () => {
        expect(removeDuplicatesArray(['red', 'red'])).toStrictEqual(['red']);
    });
    it('should leave array with no duplicates unchanged', () => {
        expect(removeDuplicatesArray(['red', 'blue'])).toStrictEqual(['red', 'blue']);
    });
});
describe('Convert Special Tokens', () => {
    it('should leave plain text unchanged', () => {
        expect(convertSpecialTokens('plain text')).toBe('plain text');
    });
    it('should convert [rn] to <br>', () => {
        expect(convertSpecialTokens('plain text[rn]')).toBe('plain text<br>');
    });
    it('should convert [t] to a blank space', () => {
        expect(convertSpecialTokens('plain text[t]')).toBe('plain text ');
    });
    it('should convert &quot; to a single quote', () => {
        expect(convertSpecialTokens('plain text&quot;')).toBe("plain text'");
    });
});
describe('Replace Key', () => {
    const obj = { name: 'josh' };
    it('should change the key name to firstname', () => {
        expect(replaceKey(obj, 'name', 'firstname')).toStrictEqual({ firstname: 'josh' });
    });
    it('should remain unchanged when key is not present', () => {
        const obj2 = { name: 'josh' };
        expect(replaceKey(obj2, 'job', 'ocupation')).toStrictEqual({ name: 'josh' });
    });
});
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
    ];
    it('should result in the same items', () => {
        expect(createItemStyles(items, '1', 'Parallax', '')).toStrictEqual(items);
    });
    it('should result in an accent background', () => {
        const newItems = [...items];
        newItems[0].itemStyle = { background: `var(--accent-background)` };
        items[0].image = '';
        expect(createItemStyles(items, '1', 'Parallax', '')).toStrictEqual(newItems);
    });
});
describe('Remove Fields From Object', () => {
    const fields = ['editingicon1', 'editingicon2', 'editingicon3', 'iconSelected'];
    const obj = {
        editingicon1: 'yes',
        other: 'no',
        editingicon3: 'yes',
    };
    const newObj = {
        other: 'no',
    };
    it('should result in the obj without the fields passed in the array', () => {
        expect(removeFieldsFromObj(obj, fields)).toStrictEqual(newObj);
    });
});
describe('isLink: Check if item has any link value', () => {
    const item = { image: '', modColor1: '', id: '1' };
    it('should decide the item does not have a link because of empty link values ', () => {
        expect(isLink(item)).toStrictEqual(false);
    });
    it('should decide the item has a link because of the pagelink value', () => {
        expect(isLink({ ...item, pagelink: '/home' })).toStrictEqual(true);
    });
});
describe('isButton: Check if item has label values for a button', () => {
    const item = { image: '', modColor1: '', id: '1' };
    it('should decide the item does not have a button because of empty label values ', () => {
        expect(isButton(item)).toStrictEqual(false);
    });
    it('should decide the item has a button because of the actionlbl value', () => {
        expect(isButton({ ...item, actionlbl: 'click here' })).toStrictEqual(true);
    });
    it('should decide the item has a link because of the actionlbl2 value', () => {
        expect(isButton({ ...item, actionlbl2: 'click here' })).toStrictEqual(true);
    });
});
describe('btnCount: Decide how many buttons are in an item', () => {
    const item = { image: '', modColor1: '', id: '1' };
    it('should decide 0 btns in an item without the correct fields', () => {
        expect(decideBtnCount(item)).toStrictEqual(0);
    });
    it('should decide the item has 1 button because of the actionlbl value and pagelink', () => {
        expect(decideBtnCount({ ...item, actionlbl: 'click here', pagelink: '/home' })).toStrictEqual(1);
    });
    it('should decide the item has 2 buttons because of the multiple label values and links', () => {
        expect(decideBtnCount({ ...item, actionlbl: 'btn1', actionlbl2: 'btn2', pagelink: '/home', weblink2: '/home' })).toStrictEqual(2);
    });
});
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
    ];
    const modalList = [
        {
            modalNum: 0,
            modalTitle: 'modal',
            autoOpen: false,
            openEveryTime: false,
        },
    ];
    //items: LunaModuleItem[], well: string, modType: string, type: string
    it('should result in the obj without the fields passed in the array', () => {
        expect(createModalPageList(modules)).toStrictEqual(modalList);
    });
    const modules2 = [
        [
            {
                type: 'modal_1',
                well: '1',
                title: 'modal',
                items: [{ autoOpen: false }],
            },
        ],
    ];
    const modalListAutoOpentrue = [
        {
            modalNum: 0,
            modalTitle: 'modal',
            autoOpen: true,
            openEveryTime: false,
        },
    ];
    //items: LunaModuleItem[], well: string, modType: string, type: string
    it('should result in an array with a modal that has autopen to true', () => {
        expect(createModalPageList(modules2)).toStrictEqual(modalListAutoOpentrue);
    });
    const modulesItemAutoOpentrue = [
        [
            {
                type: 'modal_1',
                well: '',
                title: 'modal',
                items: [{ autoOpen: true }], //use autoOpen in items this time
            },
        ],
    ];
    it('should result in an array with a modal that has autopen to true using items field', () => {
        expect(createModalPageList(modulesItemAutoOpentrue)).toStrictEqual(modalListAutoOpentrue);
    });
});
describe('stripUrl', () => {
    it('should return the unchanged value if no protocol is inside', () => {
        expect(convertUrlToApexId('taco')).toStrictEqual('taco');
    });
    it('should remove www.', () => {
        expect(convertUrlToApexId('www.taco.net')).toStrictEqual('taco');
    });
    it('should remove https://', () => {
        expect(convertUrlToApexId('https://taco.org')).toStrictEqual('taco');
    });
    it('should remove both https:// and www.', () => {
        expect(convertUrlToApexId('https://www.taco.org')).toStrictEqual('taco');
    });
    it('should remove both www. and https://', () => {
        expect(convertUrlToApexId('https://longer-one.com')).toStrictEqual('longer-one');
    });
    it('should remove the .net', () => {
        expect(convertUrlToApexId('green.net')).toStrictEqual('green');
    });
    it('should remove the slug after .com', () => {
        expect(convertUrlToApexId('https://hlbowman.com/local/heating-air-conditioning-service')).toStrictEqual('hlbowman');
    });
    it('should add "-" marks when there is a period inside of the subdomain area', () => {
        expect(convertUrlToApexId('https://go.jeosahelectric.com/optin-for-services')).toStrictEqual('go-jeosahelectric');
    });
    it('should add "-" marks when there are multiple periods inside the subdomain', () => {
        expect(convertUrlToApexId('https://sub.domain.example.com/')).toStrictEqual('sub-domain-example');
    });
});
it('should remove .production.townsquare.', () => {
    expect(convertUrlToApexId('https://clttestsiteforjoshedwards.production.townsquareinteractive.com')).toStrictEqual('clttestsiteforjoshedwards');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlsaXRpZXMvdXRpbHMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxlQUFlLENBQUE7QUFDaEQsT0FBTyxFQUNILGlCQUFpQixFQUNqQixhQUFhLEVBQ2IscUJBQXFCLEVBQ3JCLG9CQUFvQixFQUNwQixVQUFVLEVBQ1YsbUJBQW1CLEVBQ25CLE1BQU0sRUFDTixRQUFRLEVBQ1IsY0FBYyxFQUNkLG1CQUFtQixFQUNuQixrQkFBa0IsR0FDckIsTUFBTSxTQUFTLENBQUE7QUFDaEIsT0FBTyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE1BQU0sUUFBUSxDQUFBO0FBRTdDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7SUFDOUIsRUFBRSxDQUFDLDBDQUEwQyxFQUFFLEdBQUcsRUFBRTtRQUNoRCxNQUFNLENBQUMsaUJBQWlCLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtJQUN2RSxDQUFDLENBQUMsQ0FBQTtJQUVGLEVBQUUsQ0FBQywrQ0FBK0MsRUFBRSxHQUFHLEVBQUU7UUFDckQsTUFBTSxDQUFDLGlCQUFpQixDQUFDLG1DQUFtQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsMENBQTBDLENBQUMsQ0FBQTtJQUNuSCxDQUFDLENBQUMsQ0FBQTtJQUVGLEVBQUUsQ0FBQyx5REFBeUQsRUFBRSxHQUFHLEVBQUU7UUFDL0QsTUFBTSxDQUFDLGlCQUFpQixDQUFDLHlEQUF5RCxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQ3JGLHVFQUF1RSxDQUMxRSxDQUFBO0lBQ0wsQ0FBQyxDQUFDLENBQUE7SUFFRixFQUFFLENBQUMscUVBQXFFLEVBQUUsR0FBRyxFQUFFO1FBQzNFLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxvRkFB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