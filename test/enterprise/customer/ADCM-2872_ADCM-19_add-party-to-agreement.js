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

var r1 = common.rand(6);
console.log('r1: ' + r1);

var ckpTaxId = r1;
var ckpName = 'CKP_' + r1;
var ckpPartyId;

var prodHierName = 'PH_' + r1;
var prodHierDesc = prodHierName + 'DESC';

var personR = common.rand(3);
var personTaxId = common.rand(5);

console.log('personR: ' + personR);
console.log('personTaxId: ' + personTaxId);

var personFirstName = 'FN' + personTaxId;
var personLastName = 'LN' + personTaxId;

var personMiddleName = 'Middle Name';
var personPreferredName = 'Preferred Name';

var personDtcc = 'D' + personR;
var personNpn = 'N' + personR;

var personR2 = common.rand(3);
var personTaxId2 = common.rand(5);

console.log('personR2: ' + personR2);
console.log('personTaxId2: ' + personTaxId2);

var personFirstName2 = 'FN' + personTaxId2;
var personLastName2 = 'LN' + personTaxId2;

var personMiddleName2 = 'Middle Name';
var personPreferredName2 = 'Preferred Name';

var personDtcc2 = 'D' + personR2;
var personNpn2 = 'N' + personR2;

// Common data for both person and organization
var city = 'CityZ';
var stateCode = 'AZ';
var stateName = 'Arizona';

var contractName = 'C' + personTaxId;
var contractDesc = contractName + 'Desc';

var agreementName = 'AG' + personTaxId;
var agreementDesc = agreementName + 'Desc';

var startDate = '01/01/2000';
var endDate = '12/31/2049';

var agreementId;

var moment = require('moment');
var startDate = moment().add(1, 'months').format('L');

//Selenium ticket: ADCM-2871, Maint ticket: ADCM-17
describe("/enterprise/customer/ADCM-2872_ADCM-19_add-party-to-agreement", function() {
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
        common.createPersonParty(browser, 'cacheframe0', personTaxId, personFirstName, personLastName, personMiddleName, personPreferredName, city, stateName, personDtcc, personNpn).nodeify(done);
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

    // We need to create a contract kit in production status for our test case

    it("should create contract kit in production status", function(done) {
        common.createContractKitInProductionStatus(browser, 'cacheframe3', contractName, contractDesc, '01/01/2000', '01/01/2300', prodHierName, ckpName, ckpPartyId).nodeify(done);
    });

    it("should load agreement page", function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Agreement_sub').click()
            .nodeify(done);
    });

    var storeAgreementId = function(id) {
        agreementId = id;
    };

    it('should create agreement with person', function(done) {
        common.createAgreementWithPerson(browser, 'cacheframe4', agreementName, agreementDesc, contractName, startDate, endDate, personFirstName)
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('subpage')
            .elementByCss('table[name=Grid_Agreement_Main] tbody tr:nth-child(1) td:nth-child(1)').text().then(function(data) {
                storeAgreementId(data);
            })
            .nodeify(done);
    });

    // We need to create a person for our test case

    it("should load party page again", function(done) {
        browser
            .frame()
            .frame('navbar')
            .elementById('Party').click()
            .nodeify(done);
    });

    it("should load person party page again", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('#Search_Org_Main_primary_display_div button').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .sleep(1000)
            .elementByLinkText('Search Person').click()
            .nodeify(done);
    });

    it('should create person party again', function(done) {
        common.createPersonParty(browser, 'cacheframe0', personTaxId2, personFirstName2, personLastName2, personMiddleName2, personPreferredName2, city, stateName, personDtcc2, personNpn2).nodeify(done);
    });

    it('should load party agreements page', function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Tab_Person_Main_Agreements_link').click()
            .nodeify(done);
    });

    it('should load add person to agr page', function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Button_Person_AddPartyToAgreement').click()
            .nodeify(done);
    });

    it('should validate agreement', function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementByCss('button[data-id=Agreement]').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .sleep(1000)
            .elementByLinkText(agreementName + ' [Agr.ID: ' + agreementId + ']').click()
            .elementById('MasterStartDate').clear().type(startDate)
            .elementById('MasterEndDate').clear().type('01/01/2300')
            .elementById('validate').click()
            .waitForElementByCss("#ppMessage", asserters.isDisplayed , 10000)
            .elementById('ppMessage').text()
            .should.eventually.include("VALIDATING...SUCCESSFUL")
            .nodeify(done);
    });
});
