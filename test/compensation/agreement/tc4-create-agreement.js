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

var prodHierName = 'PH_' + r1;
var prodHierDesc = prodHierName + 'DESC';

var personR = common.rand(3);
var organizationR = common.rand(3);

var personTaxId = common.rand(5);
var organizationTaxId = common.rand(5);

console.log('personR: ' + personR);
console.log('organizationR: ' + organizationR);
console.log('personTaxId: ' + personTaxId);
console.log('organizationTaxId: ' + organizationTaxId);

var personFirstName = 'FN' + personTaxId;
var personLastName = 'LN' + personTaxId;

var personMiddleName = 'Middle Name';
var personPreferredName = 'Preferred Name';

var organizationPartyName = 'PN' + organizationTaxId;

var personDtcc = 'D' + personR;
var organizationDtcc = 'D' + organizationR;

var personNpn = 'N' + personR;
var organizationNpn = 'N' + organizationR;

// Common data for both person and organization
var city = 'CityZ';
var stateCode = 'AZ';
var stateName = 'Arizona';

// Test case desc requires fixed input values. We add some dynamic factor
// to make sure that the test data is really ours.
var uniqueString1 = ' - ' + common.rand(3);
var uniqueString2 = ' - ' + common.rand(3);

var c = common.rand(3);
console.log('c: ' + c);

var contractName = 'C' + c;
var contractDesc = contractName + 'Desc';

describe("/compensation/agreement/tc4-create-agreement", function() {
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

    // We need to create an organization for our test case

    it("should load organization party page", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('#Search_Person_Main_primary_display_div button').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByLinkText('Search Organization').click()
            .nodeify(done);
    });

    it('should create organization party', function(done) {
        common.createOrganizationParty(browser, 'cacheframe0', organizationTaxId, organizationPartyName, organizationDtcc, organizationNpn, city, stateName).nodeify(done);
    });

    var storeCkpId = function(ckpId) {
        ckpPartyId = ckpId;
    };

    it('should create contract kit provider', function(done) {
        common.createContractKitProviderDirectly(browser, 'cacheframe0', ckpName, ckpTaxId)
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

    it("should create agreement with organization", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('subpage')
            .elementById('Button_Agreement_Main_NewAgreement').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('proppage')
            .elementById('Name').type('AG' + uniqueString1)
            .elementById('Description').type('AGDesc' + uniqueString1)
            .elementById('EndDate').clear().type('01/01/2100')
            .elementById('searchPartySearchPage_search_div').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('proppage')
            .frame('PartySearchPage_search_div_frame')
            // Organization
            .elementByCss('#Search_Party_form > div.preset-query-header > label:nth-child(3) > i').click()
            .elementById('Field_Party_Organization_NameUpper_Search_Value').type(organizationPartyName)
            .elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
            .elementByCss('table[name=Grid_Party] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.include(organizationPartyName.toUpperCase())
            .elementById('Button_PartySearch_PP_Select').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('proppage')
            .elementById('SelectedObjTextDiv_AgreementParty_link').text()
            .should.eventually.include(organizationPartyName)
            .elementByCss('button[data-id=ContractKit]').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('proppage')
            .elementByLinkText(contractName).click()
            .elementById('validate').click()
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('subpage')
            .elementByCss('table[name=Grid_Agreement_Main] tbody tr:nth-child(1) td:nth-child(2)').text()
            .should.eventually.become('AG' + uniqueString1)
            .notify(done);
    });

    it("should create agreement with person", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('subpage')
            .elementById('Button_Agreement_Main_NewAgreement').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('proppage')
            .elementById('Name').type('AG' + uniqueString2)
            .elementById('Description').type('AGDesc' + uniqueString2)
            .elementById('EndDate').clear().type('01/01/2100')
            .elementById('searchPartySearchPage_search_div').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('proppage')
            .frame('PartySearchPage_search_div_frame')
            .elementById('Field_Party_Person_FirstName_Search_Value').type(personFirstName)
            .elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
            .elementByCss('table[name=Grid_Party] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.include(personFirstName.toUpperCase())
            .elementById('Button_PartySearch_PP_Select').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('proppage')
            .elementById('SelectedObjTextDiv_AgreementParty_link').text()
            .should.eventually.include(personFirstName)
            .elementByCss('button[data-id=ContractKit]').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('proppage')
            .elementByLinkText(contractName).click()
            .elementById('validate').click()
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('subpage')
            .elementByCss('table[name=Grid_Agreement_Main] tbody tr:nth-child(1) td:nth-child(2)').text()
            .should.eventually.become('AG' + uniqueString2)
            .notify(done);
    });
});
