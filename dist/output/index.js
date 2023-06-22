var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//const { addAssetFromSiteToS3, addFileS3 } = require('../s3Functions')
import { addAssetFromSiteToS3, addFileS3 } from '../s3Functions';
const publish = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { siteIdentifier, siteLayout, pages, assets, globalStyles } = data;
    yield addFileS3(siteLayout, `${siteIdentifier}/layout`);
    let pageList = [];
    //adding each page to s3
    for (let i = 0; i < pages.length; i++) {
        //rewrite page list every time to passed page
        pageList.push({ name: pages[i].data.name, slug: pages[i].data.slug, url: pages[i].data.url, id: pages[i].data.id });
        yield addFileS3(pages[i], `${siteIdentifier}/pages/${pages[i].data.slug}`);
    }
    yield addFileS3({ pages: pageList }, `${siteIdentifier}/pages/page-list`);
    if (assets.length != 0) {
        assets.forEach((asset) => __awaiter(void 0, void 0, void 0, function* () {
            yield addAssetFromSiteToS3(asset.content, siteIdentifier + '/assets/' + asset.name);
        }));
    }
    yield addFileS3(globalStyles, `${siteIdentifier}/global`, 'css');
});
module.exports = {
    publish,
};
//# sourceMappingURL=index.js.map