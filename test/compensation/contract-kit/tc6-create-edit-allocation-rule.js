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
var uniqueString = common.rand(3);

var name = 'CK Name' + uniqueString;
var desc = 'CK Desc' + uniqueString;

describe("/compensation/contract-kit/tc6-create-edit-allocation-rule", function() {
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

    it("should create allocation rule", function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Tab_Contracts_Main_AllocRules_link').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Button_Contracts_Main_AllocRules_NewAllocRule').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('proppage')
            .elementById('Name').type('ARule1 ' + uniqueString)
            .elementById('Description').type('Allocation Rule test ' + uniqueString)
            // Show Formula Details
            // This is ugly & make the code hard to maintain. Unfortunately we have no better choices.
            .elementByCssSelector("div.ppBodyDiv > div > div:nth-child(6) > div:nth-child(2) > div > label:nth-child(5) > i").click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('proppage')
            .elementById('RecipientFormula.FormulaString').type('transaction.getSalesTeam()')
            .elementById('validate').click()
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Inspector_Contracts_Main_AllocRules_div_out').text()
            .should.eventually.include('ARule1 ' + uniqueString)
            .notify(done);
    });

    it('should edit allocation rule', function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Button_Contracts_Main_AllocRules_EditAllocRule').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('proppage')
            .elementById('Description').clear().type('Allocation Rule test to edit ' + uniqueString)
            .elementById('validate').click()
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Inspector_Contracts_Main_AllocRules_div_out').text()
            .should.eventually.include('Allocation Rule test to edit ' + uniqueString)
            .notify(done);
    });
});
