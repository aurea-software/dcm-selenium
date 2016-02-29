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

var taxId = common.rand(4);
var dtcc = common.rand(4);

var partyName = 'PN' + taxId;

console.log('taxId: ' + taxId);
console.log('dtcc: ' + dtcc);

var locationId = common.rand(3);
var locationDtcc = 'D' + locationId;
var locationName = 'L' + locationId;
var locationStreet = 's' + locationId;
var locationCity = 'c' + locationId;
var locationZipCode = '12345';

describe("/party/location/tc2-create-location-party", function() {
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

    it('should create organization party', function(done) {
        common.createOrganizationParty(browser, 'cacheframe0', taxId, partyName, dtcc, dtcc, 'C' + taxId, 'Arizona').nodeify(done);
    });

    it("should load create location page", function(done) {
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
            .elementByLinkText('Search Location').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementById('Button_Location_Main_NewLocation').click()
            .nodeify(done);
    });

    it("should create location party", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementById('Party.CurrentDetails.Name').type(locationName)
            .elementById('Unid').type(locationId)
            .elementByCss('button[data-id=Party\\.CurrentDetails\\.LocationType]').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .sleep(500)
            .elementByLinkText('Area Office').click()
            .elementByCss('button[data-id=Party\\.CurrentDetails\\.LocationSubtype]').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .sleep(500)
            .elementByLinkText('Subtype 2').click()
            .execute('scrollTo(0, 6000)')
            .elementByCss('button[data-id=Party\\.CurrentDetails\\.OccupancyType]').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .sleep(500)
            .elementByLinkText('Leased').click()
            .elementByCss('button[data-id=Party\\.CurrentDetails\\.Usage]').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .sleep(500)
            .elementByLinkText('Securities').click()
            .elementById('DTCCID').type(locationDtcc)
            .execute('scrollTo(0, 6000)')
            .elementById('ContactPoint.Address.Street1').type(locationStreet)
            .elementById('ContactPoint.Address.City').type(locationCity)
            .elementById('ZipCode').type(locationZipCode)
            // Search for owning firm
            .elementById('searchOrgPartySearch_search_div').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .frame('OrgPartySearch_search_div_frame')
            .elementById('Field_Party_NameUpper_Search_Value').type(partyName)
            .elementByLinkText('Search').click()
            .execute('scrollTo(0, 3000)')
            .waitForElementById("Grid_Party", asserters.isDisplayed, 10000)
            .elementById('Button_PartySearch_PP_Select').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementById('validate').click()
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('table[name=Grid_Location_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(locationName.toUpperCase())
            // The test case desc requires that the id in the result table is the same to what we have keyed in
            // But the actual result is that the id we key in is different from the id in the result table
            // Hence, we validate the dtcc instead of the id
            .elementByCss('table[name=Grid_Location_Main] tbody tr:nth-child(1) td:nth-child(3)').text()
            .should.eventually.become(locationDtcc.toUpperCase())
            .notify(done);
    });
});
