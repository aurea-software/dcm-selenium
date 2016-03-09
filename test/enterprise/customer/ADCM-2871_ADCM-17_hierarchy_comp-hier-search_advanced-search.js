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

// Selenium ticket: ADCM-2871, Maint ticket: ADCM-17
describe("/enterprise/customer/ADCM-2871_ADCM-17_hierarchy_comp-hier-search_advanced-search", function() {
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

    it("should load comp hierarchy page", function(done) {
       browser.frame().frame('sidebar').elementById('AgrHierarchySearch_sub').click().nodeify(done);
    });

    it("should load hier member page", function(done) {
       browser
           .frame()
           .frame('container')
           .frame('cacheframe1')
           .frame('subpage')
           .elementByCss('#Search_AgrHierarchySearch_Main_primary_display_div button').click()
           .frame()
           .frame('container')
           .frame('cacheframe1')
           .frame('subpage')
           .elementByLinkText('Search Hier Member').click()
           .nodeify(done);
    });

    it("should validate advanced search page", function(done) {
       browser
           .frame()
           .frame('container')
           .frame('cacheframe1')
           .frame('subpage')
           .elementByLinkText('Advanced Search').click()
           .frame()
           .frame('container')
           .frame('cacheframe1')
           .frame('subpage')
           .sleep(1000)
           // Search for Organization
           .elementByCss('#Search_AgrMemberSearch_Main_form > div.preset-query-header > label:nth-child(4) > i').click()
           .sleep(1000)
           .elementById('PresetQuerySetItem_Party_All_display_div')
           .getComputedCss('display').then(function(display) {
               display.should.equal("none");
           })
           .elementById('PresetQuerySetItem_Party_Person_display_div')
           .getComputedCss('display').then(function(display) {
               display.should.equal("none");
           })
           .elementById('PresetQuerySetItem_Party_Organization_display_div')
           .getComputedCss('display').then(function(display) {
               display.should.equal("block");
           })
           .elementById('PresetQuerySetItem_Party_Location_display_div')
           .getComputedCss('display').then(function(display) {
               display.should.equal("none");
           })
           .elementById('PresetQuerySetItem_Party_Team_display_div')
           .getComputedCss('display').then(function(display) {
               display.should.equal("none");
           })
           .nodeify(done);
    });
});
