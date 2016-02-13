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

var f = common.rand(3);
var f1 = common.rand(3);
var f2 = '' + (parseInt(f1, 10) + 1);

console.log('f: [' + f + ']');
console.log('f1: [' + f1 + ']');
console.log('f2: [' + f2 + ']');

var agreementNamePrefix = 'AG' + f;
var agreementName1 = agreementNamePrefix + f1;
var agreementName2 = agreementNamePrefix + f2;

var agreementDesc1 = agreementName1 + 'Desc';
var agreementDesc2 = agreementName2 + 'Desc';

var startDate1 = '01/01/2000';
var endDate1 = '12/31/2049';

var startDate2 = '01/01/2050';
var endDate2 = '12/31/2100';

var agreementId1;

var c = common.rand(3);
console.log('c: ' + c);

var contractName = 'C' + c;
var contractDesc = contractName + 'Desc';

describe("/compensation/agreement/tc6-search-agreement", function() {
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
        .frame('navbar')
        .elementById('Party').click()
        .nodeify(done);
    });

    it("should load create person page", function(done) {
      browser
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('subpage')
        .elementById('Button_Person_Main_NewPerson').click()
        .nodeify(done);
    });

    it('should create person party', function(done) {
        common.createPersonParty(browser, taxId, firstName, lastName, middleName, preferredName, city, stateName, dtcc, npn).nodeify(done);
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

    // We need to create a contract kit in production status for our test case

    it("should load compensation setup page", function(done) {
        browser.refresh().frame().frame('navbar').elementById('Compensation Setup').click().nodeify(done);
    });

    it("should load contract kit page", function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Contracts_sub').click()
            .nodeify(done);
    });

    it("should create contract kit in production status", function(done) {
        common.createContractKitWithHierAndCKPInProductionStatus(browser, 'cacheframe2', contractName, contractDesc, '01/01/2000', '01/01/2300', ProdHierName, CKPName, CKPPartyId).nodeify(done);
    });

    // We need to create two agreements for our test case

    it("should load agreement page", function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Agreement_sub').click()
            .nodeify(done);
    });

    var storeAgreementId1 = function(agreementId) {
        agreementId1 = agreementId;
    };

    it('should create agreement 1 with person', function(done) {
        common.createAgreementWithPerson(browser, wd.SPECIAL_KEYS['Enter'], 'cacheframe3', agreementName1, agreementDesc1, contractName, startDate1, endDate1, firstName)
            .frame()
            .frame('container')
            .frame('cacheframe3')
            .frame('subpage')
            .elementByCss('table[name=Grid_Agreement_Main] tbody tr:nth-child(1) td:nth-child(1)').text().then(function(data) {
                storeAgreementId1(data);
            })
            .nodeify(done);
    });

    it('should create agreement 2 with person', function(done) {
        common.createAgreementWithPerson(browser, wd.SPECIAL_KEYS['Enter'], 'cacheframe3', agreementName2, agreementDesc2, contractName, startDate2, endDate2, firstName).nodeify(done);
    });

    it('should search agreement 1 by id', function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe3')
            .frame('subpage')
            .elementByCss('#Search_Agreement_Main_primaryForm #Field_Agreement_Main_Unid_Search_Value').type(agreementId1)
            .elementByLinkText('Search').click()
            .frame()
            .frame('container')
            .frame('cacheframe3')
            .frame('subpage')
            .elementByCss('table[name=Grid_Agreement_Main] tbody tr:nth-child(1) td:nth-child(2)').text()
            .should.eventually.become(agreementName1.toUpperCase())
            .notify(done);
    });

    it('should clear search input 1', function(done) {
        browser
            .elementByLinkText('Clear').click()
            .elementByCss('#Search_Agreement_Main_primaryForm #Field_Agreement_Main_Unid_Search_Value').getAttribute('value')
            .should.eventually.become('')
            .notify(done);
    });

    it('should search agreements by name prefix', function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe3')
            .frame('subpage')
            .elementByLinkText('Advanced Search').click()
            .elementByCss('#Search_Agreement_Main_form #Field_Agreement_Main_NameUpper_Search_Value').type(agreementNamePrefix + "*")
            .elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe3')
            .frame('subpage')
            .elementByCss('table[name=Grid_Agreement_Main] tbody tr:nth-child(1) td:nth-child(2)').text()
            .should.eventually.become(agreementName1.toUpperCase())
            .elementByCss('table[name=Grid_Agreement_Main] tbody tr:nth-child(2) td:nth-child(2)').text()
            .should.eventually.become(agreementName2.toUpperCase())
            .notify(done);
    });

    it('should clear search input 2', function(done) {
        browser
            .elementByLinkText('Clear').click()
            .elementByCss('#Search_Agreement_Main_form #Field_Agreement_Main_NameUpper_Search_Value').getAttribute('value')
            .should.eventually.become('')
            .notify(done);
    });

    it('should search agreement 1 by start date', function(done) {
        // Because we could have may agreements sharing the same start date, we search by *both* name prefix and start date to limit the result to agreement 1 only.
        browser
            .elementByCss('#Search_Agreement_Main_form #Field_Agreement_Main_NameUpper_Search_Value').type(agreementNamePrefix + "*")
            .elementByCss('#Search_Agreement_Main_form #Field_Agreement_Main_Search_EndDate_Search_Value').type(endDate1)
            .elementByLinkText('Search').click()
            .frame()
            .frame('container')
            .frame('cacheframe3')
            .frame('subpage')
            .elementByCss('table[name=Grid_Agreement_Main] tbody tr:nth-child(1) td:nth-child(2)').text()
            .should.eventually.become(agreementName1.toUpperCase())
            .notify(done);
    });

    it('should clear search input 3', function(done) {
        browser
            .elementByLinkText('Clear').click()
            .elementByCss('#Search_Agreement_Main_form #Field_Agreement_Main_NameUpper_Search_Value').getAttribute('value')
            .should.eventually.become('')
            .elementByCss('#Search_Agreement_Main_form #Field_Agreement_Main_Search_EndDate_Search_Value').getAttribute('value')
            .should.eventually.become('')
            .notify(done);
    });

    it('should sort by end date in descending order', function(done) {
        // Step 6 looks incorrect. Between 'click clear' and 'sort by', we must key in the search term.
        // In our case, the search term should be the name prefix.
        browser
            .elementByCss('#Search_Agreement_Main_form #Field_Agreement_Main_NameUpper_Search_Value').type(agreementNamePrefix + "*")
            .elementByCss('button[data-id=SortField1]').click()
            .frame()
            .frame('container')
            .frame('cacheframe3')
            .frame('subpage')
            .elementByLinkText('Effective Before').click()
            .elementByCss('button[data-id=SortField1_order]').click()
            .frame()
            .frame('container')
            .frame('cacheframe3')
            .frame('subpage')
            .elementByLinkText('Descending').click()
            .elementByLinkText('Search').click()
            .frame()
            .frame('container')
            .frame('cacheframe3')
            .frame('subpage')
            .elementByCss('table[name=Grid_Agreement_Main] tbody tr:nth-child(1) td:nth-child(2)').text()
            .should.eventually.become(agreementName2.toUpperCase())
            .elementByCss('table[name=Grid_Agreement_Main] tbody tr:nth-child(2) td:nth-child(2)').text()
            .should.eventually.become(agreementName1.toUpperCase())
            .notify(done);
    });

    // Step 7 looks incorrect. It requires to click 'Advanced Search' while we are in Advanced Search mode. Skip for now.
});
