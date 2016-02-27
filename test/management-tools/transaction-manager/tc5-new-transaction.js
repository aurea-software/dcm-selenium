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
var taxId = common.rand(5);

console.log('r: ' + r);
console.log('taxId: ' + taxId);

var firstName = 'FN' + taxId;
var lastName = 'LN' + taxId;

var middleName = 'Middle Name';
var preferredName = 'Preferred Name';

var dtcc = 'D' + r;
var npn = 'N' + r;

var city = 'CityZ';
var stateCode = 'AZ';
var stateName = 'Arizona';

var ckpTaxId = r;
var ckpName = 'CKP_' + r;
var ckpPartyId;

var prodName = 'PROD_' + r;
var prodDesc = 'PROD_DESC' + r;

var prodHierName = 'PRODHIER_' + r;
var prodHierDesc = 'PRODHIER_DESC' + r;

var transaction = 'Trans' + r;

var agreementName = 'AG' + r;
var agreementDesc = agreementName + 'Desc';

var contractName = 'CK' + r;
var contractDesc = contractName + 'Desc';

describe("/management-tools/transaction-manager/tc5-new-transaction", function() {
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

    // We need to create a person for our test case

    it("should load party page", function(done) {
        browser
            .frame()
            .frame('navbar')
            .elementById('Party').click()
            .nodeify(done);
    });

    it('should create person party', function(done) {
        common.createPersonParty(browser, 'cacheframe0', taxId, firstName, lastName, middleName, preferredName, city, stateName, dtcc, npn).nodeify(done);
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

    it("should load product page", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe2')
            .frame('subpage')
            .elementByCss('#Search_ProductHierarchySearch_Main_primary_display_div button').click()
            .frame()
            .frame('container')
            .frame('cacheframe2')
            .frame('subpage')
            .elementByLinkText('Search Product').click()
            .nodeify(done);
    });

    it("should create product", function(done) {
        browser
           .frame()
           .frame('container')
           .frame('cacheframe2')
           .frame('subpage')
           .elementById('Button_SCCMProductSearch_SCCMProduct_NewSCCMProduct').click()
           .frame()
           .frame('container')
           .frame('cacheframe2')
           .frame('proppage')
           .elementById('Name').type(prodName)
           .elementById('Description').type(prodDesc)
           .frame()
           .frame('container')
           .frame('cacheframe2')
           .frame('proppage')
           .elementById('validate').click()
           .elementById('save').click()
           .nodeify(done);
    });

    // We need to create a contract kit in production status for our test case

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

    it("should create contract kit in production status", function(done) {
        common.createContractKitInProductionStatus(browser, 'cacheframe4', contractName, contractDesc, '01/01/2000', '01/01/2300', prodHierName, ckpName, ckpPartyId).nodeify(done);
    });

    // We need to create an agreement for our test case

    it("should load agreement page", function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Agreement_sub').click()
            .nodeify(done);
    });

    it('should create agreement with person', function(done) {
        common.createAgreementWithPerson(browser, 'cacheframe5', agreementName, agreementDesc, contractName, '01/01/2010', '01/01/2100', firstName).nodeify(done);
    });

    it("should load management tools page", function(done) {
        browser
          	.frame()
            .frame('navbar')
            .elementById('Management Tools').click()
            .nodeify(done);
    });

    it("should load transaction manager page", function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('TransManager_sub').click()
            .nodeify(done);
    });

    it("should create transaction", function(done) {
      	browser
	        .frame()
	        .frame('container')
	        .frame('cacheframe7')
	        .frame('subpage')
	        .elementById('TMTransactionTopGridNewButton').click()
	        .frame()
	        .frame('container')
	        .frame('cacheframe7')
	        .frame('proppage')
	        .elementById('TMTransactionPPType').type(transaction)

	        .execute('scrollTo(0, 3000)')
	        .elementById('searchTMTransactionPPSearchAP_search_div').click()
            .frame()
            .frame('container')
            .frame('cacheframe7')
            .frame('proppage')
            .frame('TMTransactionPPSearchAP_search_div_frame')
            .elementById('Field_Party_Person_FirstName_Search_Value').type(firstName)
            .elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe7')
            .frame('proppage')
            .frame('TMTransactionPPSearchAP_search_div_frame')
            .elementById('TMTransactionPPAPButton_PP_Select').type(wd.SPECIAL_KEYS['Enter'])

            .frame()
            .frame('container')
            .frame('cacheframe7')
            .frame('proppage')
            .execute('scrollTo(0, 3000)')
            .elementById('searchTMTransactionPPSearchPR_search_div').click()
            .frame()
            .frame('container')
            .frame('cacheframe7')
            .frame('proppage')
            .frame('TMTransactionPPSearchPR_search_div_frame')
            .elementById('TMTransactionPPPRName_Search_Value').type(prodName)
            .elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe7')
            .frame('proppage')
            .frame('TMTransactionPPSearchPR_search_div_frame')
            .elementById('TMTransactionPPPRButton_PP_Select').type(wd.SPECIAL_KEYS['Enter'])

            .frame()
            .frame('container')
            .frame('cacheframe7')
            .frame('proppage')
            .execute('scrollTo(0, 3000)')
            .elementById('searchTMTransactionPPSearchCS_search_div').click()
            .frame()
            .frame('container')
            .frame('cacheframe7')
            .frame('proppage')
            .frame('TMTransactionPPSearchCS_search_div_frame')
            .elementById('TMTransactionPPCSNameUpper_Search_Value').type(ckpName)
            .elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe7')
            .frame('proppage')
            .frame('TMTransactionPPSearchCS_search_div_frame')
            .elementById('TMTransactionPPCSButton_PP_Select').type(wd.SPECIAL_KEYS['Enter'])

            .frame()
            .frame('container')
            .frame('cacheframe7')
            .frame('proppage')
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe7')
            .frame('subpage')
            .elementByCss('table[name=TMTransactionTopGrid] tbody tr:nth-child(1) td:nth-child(3)').text()
            .should.eventually.become(transaction.toUpperCase())
	        .notify(done);
    });

});
