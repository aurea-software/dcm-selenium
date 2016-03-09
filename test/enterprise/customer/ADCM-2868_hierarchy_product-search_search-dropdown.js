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

var common = require('../../lib/common.js');

//Selenium ticket: ADCM-2868, Maint ticket: N/A
describe("/enterprise/customer/ADCM-2868_hierarchy_product-search_search-dropdown", function() {
    this.timeout(60000);
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
           .sleep(1000)
           .elementByCss('#menuSelect > div > div > ul > li.selected > a > span.text').text()
           .should.eventually.become('Search Prod Hierarchy')
           .elementByCss('#menuSelect > div > div > ul > li:nth-child(2) > a > span.text').text()
           .should.eventually.become('Search Product')
           .nodeify(done);
    });
});
