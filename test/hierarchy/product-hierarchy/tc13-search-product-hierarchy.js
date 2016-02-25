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
var c1 = c + '1';
var c2 = c + '2';

console.log('c: ' + c);
console.log('c1: ' + c1);
console.log('c2: ' + c2);

var prodHierNamePrefix = 'PH' + common.rand(3);
console.log('prodHierNamePrefix: ' + prodHierNamePrefix);

var prodHier1Name = prodHierNamePrefix + c1;
var prodHier1Desc = prodHier1Name + 'Desc';

var prodHier2Name = prodHierNamePrefix + c2;
var prodHier2Desc = prodHier2Name + 'Desc';

describe("/hierarchy/product-hierarchy/tc13-search-product-hierarchy", function() {
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

    it("should create product hierarchy 1", function(done) {
       common.createProductHierarchy(browser, 'cacheframe1', wd.SPECIAL_KEYS['Enter'], prodHier1Name, prodHier1Desc).nodeify(done);
    });

    it("should create product hierarchy 2", function(done) {
       common.createProductHierarchy(browser, 'cacheframe1', wd.SPECIAL_KEYS['Enter'], prodHier2Name, prodHier2Desc).nodeify(done);
    });

    it("should do simple search", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementById('Field_ProductHierarchySearch_Main_Name_Search_Value').type(prodHier1Name)
            .type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementByCss('table[name=Grid_ProductHierarchySearch_ProductHierarchy] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(prodHier1Name.toUpperCase())
            .notify(done);
    });

    it('should clear search input', function(done) {
        browser
            .elementByLinkText('Clear').click()
            .elementById('Field_ProductHierarchySearch_Main_Name_Search_Value').getAttribute('value')
            .should.eventually.become('')
            .notify(done);
    });

    it("should do advanced search 1", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementByLinkText('Advanced Search').click()
            // Step 3 looks incorrect. We must key in *H* in order to search for the two hierarchies.
            .elementByCss('#Search_ProductHierarchySearch_Main_form #Field_ProductHierarchySearch_Main_Name_Search_Value').type(prodHierNamePrefix + '*')
            .type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            // For simplicity, we only validate the prefix
            .elementByCss('table[name=Grid_ProductHierarchySearch_ProductHierarchy] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.include(prodHierNamePrefix.toUpperCase())
            .elementByCss('table[name=Grid_ProductHierarchySearch_ProductHierarchy] tbody tr:nth-child(2) td:nth-child(1)').text()
            .should.eventually.include(prodHierNamePrefix.toUpperCase())
            .notify(done);
    });

    it("should do advanced search 2", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementByCss('button[data-id=SortField1_order]').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementByLinkText('Descending').click()
            .elementByCss('#Search_ProductHierarchySearch_Main_form #Field_ProductHierarchySearch_Main_Name_Search_Value').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            // For simplicity, we only validate the prefix
            .elementByCss('table[name=Grid_ProductHierarchySearch_ProductHierarchy] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(prodHier2Name.toUpperCase())
            .elementByCss('table[name=Grid_ProductHierarchySearch_ProductHierarchy] tbody tr:nth-child(2) td:nth-child(1)').text()
            .should.eventually.become(prodHier1Name.toUpperCase())
            .notify(done);
    });
});
