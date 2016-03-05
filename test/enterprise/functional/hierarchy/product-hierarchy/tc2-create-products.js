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

var common = require('../../../../lib/common');

var r = common.rand(3);
console.log('r: ' + r);

var Prod1Name = 'PROD1_' + r;
var Prod1Desc = 'PROD1_DESC' + r;

var Prod2Name = 'PROD2_' + r;
var Prod2Desc = 'PROD2_DESC' + r;

var Prod3Name = 'PROD3_' + r;
var Prod3Desc = 'PROD3_DESC' + r;

describe("/hierarchy/product-hierarchy/tc2-create-products", function() {
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

    it("should create product 1", function(done) {
        common.createProduct(browser, 'cacheframe1', Prod1Name, Prod1Desc)
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementByCss('table[name=Grid_SCCMProductSearch_SCCMProduct] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(Prod1Name.toUpperCase())
            .elementByCss('table[name=Grid_SCCMProductSearch_SCCMProduct] tbody tr:nth-child(1) td:nth-child(2)').text()
            .should.eventually.become(Prod1Desc.toUpperCase())
            .notify(done);
    });

    it("should create product 2", function(done) {
        common.createProduct(browser, 'cacheframe1', Prod2Name, Prod2Desc)
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementByCss('table[name=Grid_SCCMProductSearch_SCCMProduct] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(Prod2Name.toUpperCase())
            .elementByCss('table[name=Grid_SCCMProductSearch_SCCMProduct] tbody tr:nth-child(1) td:nth-child(2)').text()
            .should.eventually.become(Prod2Desc.toUpperCase())
            .notify(done);
    });

    it("should create product 3", function(done) {
        common.createProduct(browser, 'cacheframe1', Prod3Name, Prod3Desc)
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementByCss('table[name=Grid_SCCMProductSearch_SCCMProduct] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(Prod3Name.toUpperCase())
            .elementByCss('table[name=Grid_SCCMProductSearch_SCCMProduct] tbody tr:nth-child(1) td:nth-child(2)').text()
            .should.eventually.become(Prod3Desc.toUpperCase())
            .notify(done);
    });

});
