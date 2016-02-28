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

var commissionName = 'CommName' + uniqueString;
var commissionDesc = 'CommDesc' + uniqueString

var directPaymentName = 'DPayName' + uniqueString;
var directPaymentDesc = 'DPayDesc' + uniqueString;
var directPaymentLabel = 'DPayLabel' + uniqueString;

// As per the test case desc, this belongs to the Agreements section. But it has nothing to do with Agreements.
// It should have been put to Contract Kits instead.
describe("/compensation/agreement/tc12-create-commission-direct-payment", function() {
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

    it("should create contract kit", function(done) {
        common.createContractKit(browser, 'cacheframe3', name, desc, '01/01/2000', '01/01/2300', prodHierName, ckpName, ckpPartyId).nodeify(done);
    });

    // Skipping step 3 - 4 in the test case (create working version) as our contract kit is 100% new
    // and the test case's logic has been covered in
    // /compensation/contract-kit/tc5-create-working-version-checkin-export-contract-kit

    it("should load quota page", function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Tab_Contracts_Main_Quotas_link').click()
            .nodeify(done);
    });

    it("should create quota", function(done) {
        common.createQuota(browser, 'cacheframe3', quotaName, quotaDesc).nodeify(done);
    });

    it('should load component page', function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Tab_Contracts_Main_Components_link').click()
            .nodeify(done);
    })

    it('should create component', function(done) {
        common.createComponent(browser, 'cacheframe3', componentName, componentDesc, componentLabel, quotaName).nodeify(done);
    });

    it('should load commission page', function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Tab_Contracts_Main_Components_DirectPromotions_link').click()
            .elementById('Tab_Contracts_Main_Components_DirectPromotions_ValueFormula_link').click()
            .nodeify(done);
    });

    it('should create commission', function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe3')
            .frame('subpage')
            .frame('component_parentframe_2')
            .elementById('Button_Contracts_Main_Components_DirectPromotions_NewDirectPromotion').click()
            .frame()
            .frame('container')
            .frame('cacheframe3')
            .frame('proppage')
            .elementById('Name').type(commissionName)
            .elementById('Description').type(commissionDesc)
            .elementByCss('button[data-id=ValueFormulaPerformanceString]').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe3')
            .frame('proppage')
            .elementByLinkText('allocation.getWeight()').click()
            .elementById('validate').click()
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe3')
            .frame('subpage')
            .frame('component_parentframe_2')
            .elementByCss('table[name=Grid_Contracts_Main_Components_DirectPromotions] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(commissionName.toUpperCase())
            .notify(done);
    });

    it('should create direct payment', function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Tab_Contracts_Main_DirectPayments_link').click()
            .elementById('Tab_Contracts_Main_DirectPayments_DirectPaymentDetails_link').click()
            .frame()
            .frame('container')
            .frame('cacheframe3')
            .frame('subpage')
            .frame('component_parentframe_1')
            .elementById('Button_Contracts_Main_DirectPayments_NewDirectPayment').click()
            .frame()
            .frame('container')
            .frame('cacheframe3')
            .frame('proppage')
            .elementById('Name').type(directPaymentName)
            .elementById('Description').type(directPaymentDesc)
            .elementByCss('button[name=Labels_add]').click()
            .frame()
            .frame('container')
            .frame('cacheframe3')
            .frame('proppage')
            .elementById('Labels_Value_0').type(directPaymentLabel)
            .elementById('validate').click()
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe3')
            .frame('subpage')
            .frame('component_parentframe_1')
            .elementByCss('table[name=Grid_Contracts_Main_DirectPayments] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(directPaymentName.toUpperCase())
            .elementByCss('table[name=Grid_Contracts_Main_DirectPayments] tbody tr:nth-child(1) td:nth-child(2)').text()
            .should.eventually.become(directPaymentLabel.toUpperCase())
            .notify(done);
    });

    it('should check in working version', function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe3')
            .frame('subpage')
            .elementById('Button_Contracts_Main_ContractKitCheckIn').click()
            .frame()
            .frame('container')
            .frame('cacheframe3')
            .frame('proppage')
            .elementById('validate').click()
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe3')
            .frame('subpage')
            .elementByCss('table[name=Grid_Contracts_Main] tbody tr:nth-child(1) td:nth-child(5)').text()
            .should.eventually.become('PRODUCTION')
            .notify(done);
    });
});
