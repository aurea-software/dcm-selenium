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

// Test case desc requires fixed input values. We add some dynamic factor
// to make sure that the test data is really ours.
var uniqueString = ' - ' + common.rand(3);

var name = 'CK Name' + uniqueString;
var desc = 'CK Desc' + uniqueString;

describe("/compensation/agreement/tc8-create-working-version-and-create-quota", function() {
    this.timeout(60000);
    var browser;

    before(function (done) {
        browser = wd.promiseChainRemote(config.get("remote"));
        common.configBrowser(browser, config.get("environment")).nodeify(done);
    });

    after(function (done) {
        browser.quit().nodeify(done);
    });

    it("should login", function (done) {
        common.login(browser, url, username, password).nodeify(done);
    });

    it("should load compensation setup page", function(done) {
        browser.frame('navbar').elementById('Compensation Setup').click().nodeify(done);
    });

    it("should load contract kit page", function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Contracts_sub').click()
            .nodeify(done);
    });

    it("should create contract kit", function(done) {
        common.createContractKit(browser, 'cacheframe1', name, desc, '01/01/2000', '01/01/2300').nodeify(done);
    });
    
    it("should check in working version", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementById('Button_Contracts_Main_ContractKitCheckIn').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementById('Description').type('Promotion comment 1')
            .elementById('validate').click()
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Inspector_Contracts_Main_BasicInfo_div_out').text()
            .should.eventually.match(/Production Status.*Production/)
            .notify(done);
    });
    
    it("should not edit contract kit", function(done) {
        browser.elementById('Button_Contracts_Main_BasicInfo_EditContractKit').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementByCss('#alertDialog .modal-body').text()
            .should.eventually.include('This contract kit and its contents cannot be modified because the contract kit is not checked out')
            .notify(done);
    });
    
    it("should create working version", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementByCss('#alertDialog button').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementById('Button_Contracts_Main_ContractKitCheckOut').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementById('Description').type('Editing Kit')
            .elementById('validate').click()
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Inspector_Contracts_Main_BasicInfo_div_out').text()
            .should.eventually.match(/Production Status.*Working\sVersion/)
            .notify(done);
    });
    
    it("should create quota", function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Tab_Contracts_Main_Quotas_link').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Button_Contracts_Main_Quotas_NewQuota').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementById('Name').type('Quota1' + uniqueString)
            .elementById('Description').type('Quota Desc ' + uniqueString)
            .execute('scrollTo(0, 6000)')
            .elementByCss('button[data-id=MeasureFormulaString]').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementByLinkText('allocation.getWeight()').click()
            .elementById('MeasureDescription').type('Alloc Get Weight')
            .elementById('validate').click()
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Grid_Contracts_Main_Quotas').text()
            .should.eventually.include('QUOTA1' + uniqueString)
            .notify(done);
    });
});