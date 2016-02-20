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

var r1 = common.rand(6);
console.log('r1: ' + r1);

var CKPTaxId = r1;
var CKPName = 'CKP_' + r1;
var CKPPartyId;

var ProdHierName = 'PRODHIER_' + r1;
var ProdHierDesc = 'PRODHIER_DESC' + r1;

// Test case desc requires fixed input values. We add some dynamic factor
// to make sure that the test data is really ours.
var uniqueString = ' - ' + common.rand(3);

var name = 'CK Name' + uniqueString;
var desc = 'CK Desc' + uniqueString;

describe("/compensation/contract-kit/tc5-create-working-version-checkin-export-contract-kit", function() {
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

    it("should load party page", function(done) {
        browser.frame('navbar').elementById('Party').click().nodeify(done);
    });

    var CKPId1 = function(ckpid) {
        CKPPartyId = ckpid;
    };

    it('should create contract kit provider', function(done) {
        common.createContractKitProvider(browser, 'cacheframe0', CKPName, CKPTaxId)
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('table[name=Grid_Org_Main] tbody tr:nth-child(1) td:nth-child(1)').text().then(function(data) {
                CKPId1(data);
                })
            .nodeify(done);
    });

    it("should load hierarchy tab", function(done) {
       browser.frame().frame('navbar').elementById('Hierarchy').click().nodeify(done);
    });

    it("should load product hierarchy page", function(done) {
       browser.frame().frame('sidebar').elementById('ProductHierarchySearch_sub').click().nodeify(done);
    });

    it("should create product hierarchy", function(done) {
       common.createProductHierarchy(browser, 'cacheframe2', wd.SPECIAL_KEYS['Enter'], ProdHierName, ProdHierDesc).nodeify(done);
    });

    it("should load compensation setup page", function(done) {
        browser.frame().frame('navbar').elementById('Compensation Setup').click().nodeify(done);
    });

    it("should load contract kit page", function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Contracts_sub').click()
            .nodeify(done);
    });

    it("should create contract kit", function(done) {
        common.createContractKitWithHierAndCKP(browser, 'cacheframe4', name, desc, '01/01/2000', '01/01/2300', ProdHierName, CKPName, CKPPartyId).nodeify(done);
    });

    it("should check in working version", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('subpage')
            .elementById('Button_Contracts_Main_ContractKitCheckIn').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('proppage')
            .elementById('Description').type('Promotion comment 1')
            .elementById('validate').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('proppage')
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
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
            .frame('cacheframe4')
            .frame('subpage')
            .elementByCss('#alertDialog .modal-body').text()
            .should.eventually.include('This contract kit and its contents cannot be modified because the contract kit is not checked out')
            .notify(done);
    });

    it("should create working version", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('subpage')
            .elementByCss('#alertDialog button').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('subpage')
            .elementById('Button_Contracts_Main_ContractKitCheckOut').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('proppage')
            .elementById('Description').type('Editing Kit')
            .elementById('validate').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('proppage')
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Inspector_Contracts_Main_BasicInfo_div_out').text()
            .should.eventually.match(/Production Status.*Working\sVersion/)
            .notify(done);
    });

    it("should edit basic info", function(done) {
        browser.elementById('Button_Contracts_Main_BasicInfo_EditContractKit').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('proppage')
            .elementById('cancel').click()
            .nodeify(done);
    });

    it("should export as XML", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('subpage')
            .elementById('Button_Contracts_Main_ContractKitExport').click()
            .nodeify(done);
        // Test case desc requires a message "The LifeContractKit.xml
        // download has completed". This is a browser's behavior, so no
        // assertion.
    });
});
