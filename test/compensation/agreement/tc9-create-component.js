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

var ckpTaxId = r1;
var ckpName = 'CKP_' + r1;
var ckpPartyId;

var prodHierName = 'PRODHIER_' + r1;
var prodHierDesc = 'PRODHIER_DESC' + r1;

// Test case desc requires fixed input values. We add some dynamic factor
// to make sure that the test data is really ours.
var uniqueString = common.rand(3);

var name = 'CK Name' + uniqueString;
var desc = 'CK Desc' + uniqueString;

var quotaName = 'QName' + uniqueString;
var quotaDesc = 'QDesc' + uniqueString;

var componentName = 'CName' + uniqueString;
var componentDesc = 'CDesc' + uniqueString;
var componentLabel = 'CLabel' + uniqueString;

// As per the test case desc, this belongs to the Agreements section. But it has nothing to do with Agreements.
// It should have been put to Contract Kits instead.
describe("/compensation/agreement/tc9-create-component", function() {
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

    it("should load party page", function(done) {
        browser.frame().frame('navbar').elementById('Party').click().nodeify(done);
    });

    var storeCkpId = function(ckpId) {
        ckpPartyId = ckpId;
    };

    it('should create contract kit provider', function(done) {
        common.createContractKitProvider(browser, 'cacheframe0', ckpName, ckpTaxId)
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('table[name=Grid_Org_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
            .then(function(data) {
                storeCkpId(data);
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
       common.createProductHierarchy(browser, 'cacheframe2', prodHierName, prodHierDesc).nodeify(done);
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
        common.createContractKit(browser, 'cacheframe4', name, desc, '01/01/2000', '01/01/2300', prodHierName, ckpName, ckpPartyId).nodeify(done);
    });

    it("should create quota", function(done) {
        common.createQuota(browser, 'cacheframe4', quotaName, quotaDesc).nodeify(done);
    });

    it('should create component', function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Tab_Contracts_Main_Components_link').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Button_Contracts_Main_Components_NewComponent').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('proppage')
            .elementById('Name').type(componentName)
            .elementById('Description').type(componentDesc)
            .elementByCss('button[name=Labels_add]').click()
            .sleep(2000)
            .elementById('Labels_Value_0').type(componentLabel)
            .execute('scrollTo(0, 6000)')
            .elementByCss('button[name=Quotas_add]').click()
            .sleep(2000)
            .elementById('complexField_QuotasSearch_search_div').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('proppage')
            .frame('QuotasSearch_search_div_frame')
            .elementById('Field_Quotas_Search_Name_Search_Value').type(quotaName)
            .elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
            .execute('scrollTo(0, 6000)')
            .elementById('QuotasSearchButton_PP_Select').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('proppage')
            .elementById('validate').click()
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('subpage')
            .frame('component_iframe')
            .elementByCss('table[name=Grid_Contracts_Main_Components] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(componentName.toUpperCase())
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('subpage')
            .elementById('Button_Contracts_Main_ContractKitCheckIn').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('proppage')
            .elementById('validate').click()
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('subpage')
            .elementByCss('table[name=Grid_Contracts_Main] tbody tr:nth-child(1) td:nth-child(5)').text()
            .should.eventually.become('PRODUCTION')
            .notify(done);
    });
});
