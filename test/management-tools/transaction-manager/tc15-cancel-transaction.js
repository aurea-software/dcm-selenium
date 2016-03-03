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

var prod1Name = 'PROD1_' + r;
var prod1Desc = 'PROD1_DESC' + r;

var prod2Name = 'PROD2_' + r;
var prod2Desc = 'PROD2_DESC' + r;

var prodHierName = 'PRODHIER_' + r;
var prodHierDesc = 'PRODHIER_DESC' + r;

var transaction = 'Trans' + r;

var agreementName = 'AG' + r;
var agreementDesc = agreementName + 'Desc';

var contractName = 'CK' + r;
var contractDesc = contractName + 'Desc';

describe("/management-tools/transaction-manager/tc15-cancel-transaction", function() {
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
            .sleep(1000)
            .elementByLinkText('Search Product').click()
            .nodeify(done);
    });

    it("should create product 1", function(done) {
        common.createProduct(browser, 'cacheframe2', prod1Name, prod1Desc).nodeify(done);
    });

    it("should create product 2", function(done) {
        common.createProduct(browser, 'cacheframe2', prod2Name, prod2Desc).nodeify(done);
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
        common.createContractKitInProductionStatus(browser, 'cacheframe3', contractName, contractDesc, '01/01/2000', '01/01/2300', prodHierName, ckpName, ckpPartyId).nodeify(done);
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
        common.createAgreementWithPerson(browser, 'cacheframe4', agreementName, agreementDesc, contractName, '01/01/2010', '01/01/2100', firstName).nodeify(done);
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

    // For simplicity, we create 3 transactions using 2 products.
    // First cancellation is to cancel 1 transaction (1st product).
    // Next cancellation is to cancel the other 2 (2nd product).

    it("should create transaction 1", function(done) {
        common.createTransaction(browser, 'cacheframe5', transaction, firstName, prod1Name, ckpName).nodeify(done);
    });

    it("should create transaction 2", function(done) {
        common.createTransaction(browser, 'cacheframe5', transaction, firstName, prod2Name, ckpName).nodeify(done);
    });

    it("should create transaction 3", function(done) {
        common.createTransaction(browser, 'cacheframe5', transaction, firstName, prod2Name, ckpName).nodeify(done);
    });

    it("should cancel 1 transaction", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe5')
            .frame('subpage')
            .sleep(1000)
            .elementById('TMTransactionTopGridProduct_Search_Value').type(prod1Name)
            .elementByLinkText('Search').click()
            .frame()
            .frame('container')
            .frame('cacheframe5')
            .frame('subpage')
            .elementById('TMTransactionTopGridCancelButton').click()
            .frame()
            .frame('container')
            .frame('cacheframe5')
            .frame('subpage')
            .elementByCss('#alertDialog button').click()
            .frame()
            .frame('container')
            .frame('cacheframe5')
            .frame('subpage')
            .sleep(500)
            .elementById('alertDialog').text()
            .should.eventually.include('1 Transaction(s) Cancelled Sucessfully. Please click on the Search button to view updated transaction statuses')
            .elementById('alertDialog').type(wd.SPECIAL_KEYS['Escape'])
            .frame()
            .frame('container')
            .frame('cacheframe5')
            .frame('subpage')
            .elementByLinkText('Search').click()
            .frame()
            .frame('container')
            .frame('cacheframe5')
            .frame('subpage')
            .elementByCss('table[name=TMTransactionTopGrid] tbody tr:nth-child(1) td:nth-child(4)').text()
            .should.eventually.become('CANCELLATION PENDING')
            .nodeify(done);
    });

    it("should cancel 2 transactions", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe5')
            .frame('subpage')
            .sleep(500)
            .elementById('TMTransactionTopGridProduct_Search_Value').clear().type(prod2Name)
            .elementByLinkText('Search').click()
            .frame()
            .frame('container')
            .frame('cacheframe5')
            .frame('subpage')
            // Select All
            .elementByCss('#TMTransactionTopGrid_SelectAllAcrossPages ~ i').click()
            // Cancel all
            .elementById('TMTransactionTopGridBatchCancelButton').click()
            .frame()
            .frame('container')
            .frame('cacheframe5')
            .frame('subpage')
            .elementByCss('#alertDialog button').click()
            .frame()
            .frame('container')
            .frame('cacheframe5')
            .frame('subpage')
            .sleep(1000)
            .elementById('alertDialog').text()
            .should.eventually.include('2 Transaction(s) Cancelled Sucessfully. Please click on the Search button to view updated transaction statuses')
            .elementById('alertDialog').type(wd.SPECIAL_KEYS['Escape'])
            .frame()
            .frame('container')
            .frame('cacheframe5')
            .frame('subpage')
            .elementByLinkText('Search').click()
            .frame()
            .frame('container')
            .frame('cacheframe5')
            .frame('subpage')
            .elementByCss('table[name=TMTransactionTopGrid] tbody tr:nth-child(1) td:nth-child(4)').text()
            .should.eventually.become('CANCELLATION PENDING')
            .elementByCss('table[name=TMTransactionTopGrid] tbody tr:nth-child(2) td:nth-child(4)').text()
            .should.eventually.become('CANCELLATION PENDING')
            .nodeify(done);
    });

});
