var config = require('nconf');
config.file({file: './test/lib/config.json'});

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var wd = require('wd');
var asserters = wd.asserters;

var url = config.get("url");
var username = config.get("username");
var password = config.get("password");

var common = require('../../lib/common');

var c = common.rand(3);
console.log('c: ' + c);

var r1 = common.rand(4);

var prodHierName = 'PH' + c;
var prodHierDesc = prodHierName + 'Desc';

var prodHierNameNew = prodHierName + 'New';
var prodHierDescNew = prodHierDesc + 'New';

describe("/hierarchy/product-hierarchy/tc1-create-edit-product-hierarchy", function() {
    this.timeout(60000);
    var browser;

    before(function (done) {
        chaiAsPromised.transferPromiseness = wd.transferPromiseness;
        browser = wd.promiseChainRemote(config.get("remote"));
        common.configBrowser(browser, config.get("environment")).nodeify(done);
    });
/*
    after(function (done) {
        browser.quit().nodeify(done);
    });
*/
    it("should login", function (done) {
        common.login(browser, url, username, password).nodeify(done);
    });

    it("should load hierarchy tab", function(done) {
       browser.frame().frame('navbar').elementById('Hierarchy').click().nodeify(done);
    });

    it("should load product hierarchy page", function(done) {
       browser.frame().frame('sidebar').elementById('ProductHierarchySearch_sub').click().nodeify(done);
    });

    it("should create product hierarchy", function(done) {
       common.createProductHierarchy(browser, 'cacheframe1', wd.SPECIAL_KEYS['Enter'], prodHierName, prodHierDesc)
           .frame()
           .frame('container')
           .frame('cacheframe1')
           .frame('subpage')
           .elementByCss('table[name=Grid_ProductHierarchySearch_ProductHierarchy] tbody tr:nth-child(1) td:nth-child(1)').text()
           .should.eventually.become(prodHierName.toUpperCase())
           .elementByCss('table[name=Grid_ProductHierarchySearch_ProductHierarchy] tbody tr:nth-child(1) td:nth-child(2)').text()
           .should.eventually.become(prodHierDesc.toUpperCase())
           .notify(done);
    });

    it("should edit product hierarchy", function(done) {
        return browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .execute('scrollTo(0, 2000)')
            .elementById('Button_ProductHierarchySearch_ProductHierarchy_EditProductHierarchy').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementById('Name').clear().type(prodHierNameNew)
            .elementById('Description').clear().type(prodHierDescNew)
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementById('validate').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementByCss('table[name=Grid_ProductHierarchySearch_ProductHierarchy] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(prodHierNameNew.toUpperCase())
            .elementByCss('table[name=Grid_ProductHierarchySearch_ProductHierarchy] tbody tr:nth-child(1) td:nth-child(2)').text()
            .should.eventually.become(prodHierDescNew.toUpperCase())
            .notify(done);
    });

    // Step 10 and 11 are redundant
});
