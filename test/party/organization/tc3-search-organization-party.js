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

var r1 = common.rand(3);
var r2 = common.rand(3);
var r = common.rand(5);

var t = common.rand(4);
var taxId1 = t + '1';
var taxId2 = t + '2';

console.log('r1: ' + r1);
console.log('r2: ' + r2);
console.log('r: ' + r);
console.log('taxId1: ' + taxId1);
console.log('taxId2: ' + taxId2);

var partyNamePrefix = 'PN' + r;
var partyName1 = partyNamePrefix + taxId1;
var partyName2 = partyNamePrefix + taxId2;

var city1 = 'C' + taxId1;
var city2 = 'C' + taxId2;

var dtcc1 = 'D' + r1;
var dtcc2 = 'D' + r2;

var npn1 = 'N' + r1;
var npn2 = 'N' + r2;

var stateCode = 'AZ';
var stateName = 'Arizona';

describe("/party/organization/tc3-search-organization-party", function() {
    this.timeout(90000);
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
        browser
            .frame()
            .frame('navbar')
            .elementById('Party').click()
            .nodeify(done);
    });

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

    it('should create organization party 1', function(done) {
        common.createOrganizationParty(browser, 'cacheframe0', taxId1, partyName1, dtcc1, npn1, city1, stateName).nodeify(done);
    });

    it('should create organization party 2', function(done) {
        common.createOrganizationParty(browser, 'cacheframe0', taxId2, partyName2, dtcc2, npn2, city2, stateName).nodeify(done);
    });

    it('should search party 2 by tax id', function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            // The test case description requires to search for party 2 by party id.
            // We have no control on the party id value, therefore we search by tax id instead.
            .elementById('Field_Org_Main_TaxID_Search_Value').clear().type(taxId2)
            .type(wd.SPECIAL_KEYS['Enter'])
            .waitForElementByCss('table[name=Grid_Org_Main] tbody tr:nth-child(1) td:nth-child(4)').text()
            // We intentionally create party 1 before party 2. We also setup tax id
            // 2 to be bigger than tax id 1 intentionally.
            // Hence, party ids and tax ids have the same order.
            .should.eventually.become(taxId2)
            .notify(done);
    });

    it('should clear search fields', function(done) {
        browser.elementByLinkText('Clear').click()
            // We have searched by tax id, hence we should also check tax ids when clearing
            .elementById('Field_Org_Main_TaxID_Search_Value').getAttribute('value')
            .should.eventually.become('')
            .notify(done);
    });

    it('should search party 1 by party name and tax id', function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementById('Field_Org_Main_NameUpper_Search_Value').clear().type(partyName1)
            .elementById('Field_Org_Main_TaxID_Search_Value').clear().type(taxId1)
            .type(wd.SPECIAL_KEYS['Enter'])
            .waitForElementByCss('table[name=Grid_Org_Main] tbody tr:nth-child(1) td:nth-child(2)').text().should.eventually.become(partyName1)
            .elementByCss('table[name=Grid_Org_Main] tbody tr:nth-child(1) td:nth-child(4)').text().should.eventually.become(taxId1)
            .notify(done);
    });

    it('should clear search fields 2', function(done) {
        browser
            .elementByLinkText('Clear').click()
            .elementById('Field_Org_Main_NameUpper_Search_Value').getAttribute('value')
            .should.eventually.become('')
            .elementById('Field_Org_Main_TaxID_Search_Value').getAttribute('value')
            .should.eventually.become('')
            .notify(done);
    });

    it('should search 2 parties by party name prefix', function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByLinkText('Advanced Search').click()
            .elementByCss('#Search_Org_Main_form #Field_Org_Main_NameUpper_Search_Value').clear().type(partyNamePrefix + "*")
            .type(wd.SPECIAL_KEYS['Enter'])
            .waitForElementByCss('table[name=Grid_Org_Main] tbody tr:nth-child(1) td:nth-child(2)').text()
            .should.eventually.become(partyName1)
            .waitForElementByCss('table[name=Grid_Org_Main] tbody tr:nth-child(2) td:nth-child(2)').text()
            .should.eventually.become(partyName2)
            .notify(done);
    });

    it('should search party 2 by dtcc, npn, city and state', function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('#Search_Org_Main_form #Field_Org_Main_DTCCID_Search_Value').clear().type(dtcc2)
            .elementByCss('#Search_Org_Main_form #Field_Party_Org_NPN_Search_Value').clear().type(npn2)
            .elementByCss('#Search_Org_Main_form #Field_Org_Main_City_Search_Value').clear().type(city2)
            .elementByCss('#Search_Org_Main_form #Field_Org_Main_State_Search_Value').clear().type(stateCode)
            .type(wd.SPECIAL_KEYS['Enter'])
            .waitForElementByCss('table[name=Grid_Org_Main] tbody tr:nth-child(1) td:nth-child(2)').text()
            .should.eventually.become(partyName2)
            .notify(done);
    });

    it('should clear search fields 3', function(done) {
        browser
            .elementByLinkText('Clear').click()
            .elementByCss('#Search_Org_Main_form #Field_Org_Main_DTCCID_Search_Value').getAttribute('value')
            .should.eventually.become('')
            .elementByCss('#Search_Org_Main_form #Field_Party_Org_NPN_Search_Value').getAttribute('value')
            .should.eventually.become('')
            .elementByCss('#Search_Org_Main_form #Field_Org_Main_City_Search_Value').getAttribute('value')
            .should.eventually.become('')
            .elementByCss('#Search_Org_Main_form #Field_Org_Main_State_Search_Value').getAttribute('value')
            .should.eventually.become('')
            .notify(done);
    });

    it('should sort by party ids in descending order', function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('#Search_Org_Main_form #Field_Org_Main_NameUpper_Search_Value').clear().type(partyNamePrefix + "*")
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('button[data-id=SortField1_order]').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByLinkText('Descending').click()
            .elementByCss('#Search_Org_Main_form #Field_Org_Main_NameUpper_Search_Value')
            .type(wd.SPECIAL_KEYS['Enter'])
            .waitForElementByCss('table[name=Grid_Org_Main] tbody tr:nth-child(1) td:nth-child(4)').text()
            .should.eventually.become(taxId2)
            .waitForElementByCss('table[name=Grid_Org_Main] tbody tr:nth-child(2) td:nth-child(4)').text()
            .should.eventually.become(taxId1)
            .notify(done);
    });

    it('should sort by tax ids in ascending order', function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('#Search_Org_Main_form #Field_Org_Main_NameUpper_Search_Value').clear().type(partyNamePrefix + "*")
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('#Search_Org_Main_form button[data-id=SortField1]').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByLinkText('Tax ID/SSN').click()
            .elementByCss('button[data-id=SortField1_order]').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByLinkText('Ascending').click()
            .elementByCss('#Search_Org_Main_form #Field_Org_Main_NameUpper_Search_Value')
            .type(wd.SPECIAL_KEYS['Enter'])
            .waitForElementByCss('table[name=Grid_Org_Main] tbody tr:nth-child(1) td:nth-child(4)').text()
            .should.eventually.become(taxId1)
            .waitForElementByCss('table[name=Grid_Org_Main] tbody tr:nth-child(2) td:nth-child(4)').text()
            .should.eventually.become(taxId2)
            .notify(done);
    });

    it('should clear search fields 4', function(done) {
        browser
            .elementByLinkText('Clear').click()
            .elementByCss('#Search_Org_Main_form #Field_Org_Main_NameUpper_Search_Value').getAttribute('value')
            .should.eventually.become('')
            .notify(done);
    });
});
