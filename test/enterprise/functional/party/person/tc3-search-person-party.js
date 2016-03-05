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

var common = require('../../../../lib/common');

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

var firstNamePrefix = 'FN' + r;
var firstName1 = firstNamePrefix + taxId1;
var firstName2 = firstNamePrefix + taxId2;

var lastNamePrefix = 'LN' + r;
var lastName1 = lastNamePrefix + taxId1;
var lastName2 = lastNamePrefix + taxId2;

var middleName = 'Middle Name';
var preferredName = 'Preferred Name';

var city1 = 'C' + taxId1;
var city2 = 'C' + taxId2;

var dtcc1 = 'D' + r1;
var dtcc2 = 'D' + r2;

var npn1 = 'N' + r1;
var npn2 = 'N' + r2;

var stateCode = 'AZ';
var stateName = 'Arizona';

describe("/party/person/tc3-search-person-party", function() {
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

    it('should create person party 1', function(done) {
        common.createPersonParty(browser, 'cacheframe0', taxId1, firstName1, lastName1, middleName, preferredName, city1, stateName, dtcc1, npn1).nodeify(done);
    });

    it('should create person party 2', function(done) {
        common.createPersonParty(browser, 'cacheframe0', taxId2, firstName2, lastName2, middleName, preferredName, city2, stateName, dtcc2, npn2).nodeify(done);
    });

    it('should search party 2 by first name and last name', function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('#Search_Person_Main_primaryForm #Field_Person_Main_FirstName_Search_Value').type(firstName2)
            .elementByCss('#Search_Person_Main_primaryForm #Field_Person_Main_LastNameUpper_Search_Value').type(lastName2)
            .type(wd.SPECIAL_KEYS['Enter'])
            .elementByCss('table[name=Grid_Person_Main] tbody tr:nth-child(1) td:nth-child(2)').text()
            .should.eventually.become(lastName2)
            .elementByCss('table[name=Grid_Person_Main] tbody tr:nth-child(1) td:nth-child(3)').text()
            .should.eventually.become(firstName2)
            .elementByCss('table[name=Grid_Person_Main] tbody tr:nth-child(1) td:nth-child(5)').text()
            .should.eventually.become(taxId2)
            .notify(done);
    });

    it('should search party 1 by first name, last name and tax id', function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('#Search_Person_Main_primaryForm #Field_Person_Main_FirstName_Search_Value').clear().type(firstName1)
            .elementByCss('#Search_Person_Main_primaryForm #Field_Person_Main_LastNameUpper_Search_Value').clear().type(lastName1)
            .elementByCss('#Search_Person_Main_primaryForm #Field_Person_Main_TaxID_Search_Value').clear().type(taxId1)
            .type(wd.SPECIAL_KEYS['Enter'])
            .elementByCss('table[name=Grid_Person_Main] tbody tr:nth-child(1) td:nth-child(2)').text()
            .should.eventually.become(lastName1)
            .elementByCss('table[name=Grid_Person_Main] tbody tr:nth-child(1) td:nth-child(3)').text()
            .should.eventually.become(firstName1)
            .elementByCss('table[name=Grid_Person_Main] tbody tr:nth-child(1) td:nth-child(5)').text()
            .should.eventually.become(taxId1)
            .notify(done);
    });

    it('should load advanced search form', function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementById('Search_Person_Main_ShowHideSearchLink').click()
            .nodeify(done);
    });

    it('should search by first name prefix and last name prefix', function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('#Search_Person_Main_form #Field_Person_Main_FirstName_Search_Value').clear().type(firstNamePrefix + '*')
            .elementByCss('#Search_Person_Main_form #Field_Person_Main_LastNameUpper_Search_Value').clear().type(lastNamePrefix + '*')
            .type(wd.SPECIAL_KEYS['Enter'])
            .elementByCss('table[name=Grid_Person_Main] tbody tr:nth-child(1) td:nth-child(2)').text()
            .should.eventually.become(lastName1)
            .elementByCss('table[name=Grid_Person_Main] tbody tr:nth-child(1) td:nth-child(3)').text()
            .should.eventually.become(firstName1)
            .elementByCss('table[name=Grid_Person_Main] tbody tr:nth-child(1) td:nth-child(5)').text()
            .should.eventually.become(taxId1)
            .elementByCss('table[name=Grid_Person_Main] tbody tr:nth-child(2) td:nth-child(2)').text()
            .should.eventually.become(lastName2)
            .elementByCss('table[name=Grid_Person_Main] tbody tr:nth-child(2) td:nth-child(3)').text()
            .should.eventually.become(firstName2)
            .elementByCss('table[name=Grid_Person_Main] tbody tr:nth-child(2) td:nth-child(5)').text()
            .should.eventually.become(taxId2)
            .notify(done);
    });

    it('should search by DTCC, NPN, City and state', function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('#Search_Person_Main_form #Field_Person_Main_DTCCID_Search_Value').clear().type(dtcc1)
            .elementByCss('#Search_Person_Main_form #Field_Person_Main_NPN_Search_Value').clear().type(npn1)
            .elementByCss('#Search_Person_Main_form #Field_Person_Main_City_Search_Value').clear().type(city1)
            .elementByCss('#Search_Person_Main_form #Field_Person_Main_State_Search_Value').clear().type(stateCode)
            .type(wd.SPECIAL_KEYS['Enter'])
            .elementByCss('table[name=Grid_Person_Main] tbody tr:nth-child(1) td:nth-child(2)').text()
            .should.eventually.become(lastName1)
            .elementByCss('table[name=Grid_Person_Main] tbody tr:nth-child(1) td:nth-child(3)').text()
            .should.eventually.become(firstName1)
            .elementByCss('table[name=Grid_Person_Main] tbody tr:nth-child(1) td:nth-child(5)').text()
            .should.eventually.become(taxId1)
            .notify(done);
    });

    it('should load basic search form', function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementById('Search_Person_Main_ShowHideSearchLink').click()
            .nodeify(done);
    });

    it('should sort by party id', function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByLinkText('Clear').click()
            .sleep(1000)
            .elementByCss('#Search_Person_Main_primaryForm #Field_Person_Main_FirstName_Search_Value').clear().type(firstNamePrefix + '*')
            .type(wd.SPECIAL_KEYS['Enter'])
            // By default the table is sorted by party id in ascending order. Click
            // once to turn the order to descending.
            .elementByCssSelector('#Field_Person_Main_PartyID_Grid > span.column-text').click()
            .waitForElementByCss('table[name=Grid_Person_Main] tbody tr:nth-child(1) td:nth-child(5)').text()
            // We intentionally create party 1 before party 2. We also setup tax id
            // 2 to be bigger than tax id 1 intentionally.
            // Hence, party ids and tax ids have the same order.
            .should.eventually.become(taxId2)
            .waitForElementByCss('table[name=Grid_Person_Main] tbody tr:nth-child(2) td:nth-child(5)').text()
            .should.eventually.become(taxId1)
            .notify(done);
    });

    it('should sort by tax id', function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('#Search_Person_Main_primaryForm #Field_Person_Main_FirstName_Search_Value').clear().type(firstNamePrefix + '*')
            .type(wd.SPECIAL_KEYS['Enter'])
            // Click twice to turn the order to descending.
            .elementByCssSelector('#Field_Person_Main_TaxID_Grid > span.column-text').click()
            .elementByCssSelector('#Field_Person_Main_TaxID_Grid > span.column-text').click()
            .waitForElementByCss('table[name=Grid_Person_Main] tbody tr:nth-child(1) td:nth-child(5)').text()
            .should.eventually.become(taxId2)
            .waitForElementByCss('table[name=Grid_Person_Main] tbody tr:nth-child(2) td:nth-child(5)').text()
            .should.eventually.become(taxId1)
            .notify(done);
    });
});
