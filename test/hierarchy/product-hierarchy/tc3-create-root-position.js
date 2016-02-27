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

var r = common.rand(3);
console.log('r: ' + r);

var ProdName = 'PROD1_' + r;
var ProdDesc = 'PROD1_DESC' + r;

var ProdHierName = 'PRODHIER_' + r;
var ProdHierDesc = 'PRODHIER_DESC' + r;

describe("/hierarchy/product-hierarchy/tc3-create-root-position", function() {
    this.timeout(120000);
    var browser;

    before(function (done) {
        chaiAsPromised.transferPromiseness = wd.transferPromiseness;
        browser = wd.promiseChainRemote(config.get("remote"));
        common.configBrowser(browser, config.get("environment")).nodeify(done);
    });

    after(function (done) {
        browser.quit().nodeify(done);
    });

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
       common.createProductHierarchy(browser, 'cacheframe1', ProdHierName, ProdHierDesc).nodeify(done);
    });

    it("should load product page", function(done) {
       browser
           .frame()
           .frame('container')
           .frame('cacheframe1')
           .frame('subpage')
           .elementByCss('#Search_ProductHierarchySearch_Main_primary_display_div button').click()
           .frame()
           .frame('container')
           .frame('cacheframe1')
           .frame('subpage')
           .elementByLinkText('Search Product').click()
           .nodeify(done);
    });

    it("should create product", function(done) {
        common.createProduct(browser, 'cacheframe1', ProdName, ProdDesc).nodeify(done);
    });

    it("should load product hierarchy page", function(done) {
       browser
           .frame()
           .frame('container')
           .frame('cacheframe1')
           .frame('subpage')
           .elementByCss('#Search_SCCMProductSearch_Main_primary_display_div button').click()
           .frame()
           .frame('container')
           .frame('cacheframe1')
           .frame('subpage')
           .elementByLinkText('Search Prod Hierarchy').click()
           .nodeify(done);
    });

    it("should search product hierarchy", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementById('Field_ProductHierarchySearch_Main_Name_Search_Value').type(ProdHierName)
            .elementByLinkText('Search').click()
            .nodeify(done);
    });

    it("should open root position page", function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Tab_ProductHierarchySearch_RootPosition_Main_link').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Button_ProductHierarchySearch_ProductHierarchy_RootPositions_Create').click()
            .nodeify(done);
    });

    it("should add root position", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementById('searchPage_ProductHierarchyProduct_Picker_search_div').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .frame('Page_ProductHierarchyProduct_Picker_search_div_frame')
            .elementById('Field_Product_Main_Name_Search_Value').type(ProdName)
            .elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .frame('Page_ProductHierarchyProduct_Picker_search_div_frame')
            .elementById('Button_ProductSearch_PP_Select').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementById('validate').click()
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .frame('component_iframe')
            .elementByCss('table[name=Grid_ProductHierarchy_RootPositions] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(ProdName.toUpperCase())
            .notify(done);
    });

});
