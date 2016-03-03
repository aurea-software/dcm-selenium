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

var c = common.rand(4);
var locationNamePrefix = 'L' + c;

console.log('c: ' + c);

var taxId = common.rand(4);
var dtcc = common.rand(4);

var partyName = 'PN' + taxId;

console.log('taxId: ' + taxId);
console.log('dtcc: ' + dtcc);

var r = common.rand(3);
var locationId1 = r + '1';
console.log('locationId1: ' + locationId1);

var locationDtcc1 = locationId1;
var locationName1 = locationNamePrefix + locationId1;
var locationStreet1 = 's' + locationId1;
var locationCity1 = 'c' + locationId1;
var locationZipCode1 = '12345';

var locationId2 = r + '2';
console.log('locationId2: ' + locationId2);

var locationDtcc2 = locationId2;
var locationName2 = locationNamePrefix + locationId2;
var locationStreet2 = 's' + locationId2;
var locationCity2 = 'c' + locationId2;
var locationZipCode2 = '12346';

describe("/party/location/tc12-search-location-party", function() {
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
        browser.frame()
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
            .sleep(500)
            .elementByLinkText('Search Location').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementById('Button_Location_Main_NewLocation').click()
            .nodeify(done);
    });

    var storeLocationId1 = function(locationId) {
        locationId1 = locationId;
    };

    it("should create location party 1", function(done) {
        common.createLocationParty(browser, 'cacheframe0', locationName1, locationId1, locationDtcc1, locationStreet1, locationCity1, locationZipCode1, 'Subtype 2', partyName)
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('table[name=Grid_Location_Main] tbody tr:nth-child(1) td:nth-child(2)').text().then(function(data) {
                // The id in the result table may be DIFFERENT from the id that we key in when creating a location party.
                // Hence, we need to fetch the new id after the party has been created.
                storeLocationId1(data);
            })
            .nodeify(done);
    });

    // We need the status of location party 1 to be different
    it("should close location party 1", function(done) {
        common.closeLocationParty(browser, 'cacheframe0').nodeify(done);
    });

    it("should load create location page 2", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementById('Button_Location_Main_NewLocation').click()
            .nodeify(done);
    });

    it("should create location party 2", function(done) {
        common.createLocationParty(browser, 'cacheframe0', locationName2, locationId2, locationDtcc2, locationStreet2, locationCity2, locationZipCode2, 'Subtype 2', partyName).nodeify(done);
    });

    it("should search location 2 by name", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementById('Field_Location_Main_LocationNameUpper_Search_Value').type(locationName2)
            .elementByLinkText('Search').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('table[name=Grid_Location_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(locationName2.toUpperCase())
            .notify(done);
    });

    it('should clear search input 1', function(done) {
        browser
            .elementByLinkText('Clear').click()
            .elementByCss('#Search_Location_Main_primaryForm #Field_Location_Main_LocationNameUpper_Search_Value').getAttribute('value')
            .should.eventually.become('')
            .notify(done);
    });

    it("should search location 1 by id", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementById('Field_Location_Main_PartyID_Search_Value').type(locationId1)
            .elementByLinkText('Search').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('table[name=Grid_Location_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(locationName1.toUpperCase())
            .notify(done);
    });

    it('should clear search input 2', function(done) {
        browser
            .elementByLinkText('Clear').click()
            .elementByCss('#Search_Location_Main_primaryForm #Field_Location_Main_PartyID_Search_Value').getAttribute('value')
            .should.eventually.become('')
            .notify(done);
    });

    it('should search location 2 in advanced search mode', function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByLinkText('Advanced Search').click()
            .elementByCss('#Search_Location_Main_form #Field_Location_Main_LocationNameUpper_Search_Value').clear().type(locationNamePrefix + "*")
            .execute('scrollTo(0, 6000)')
            .elementByCss('#Search_Location_Main_form button[data-id=Field_Location_Main_LocationSubtype_Search_Value]').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .sleep(500)
            .elementByLinkText('Subtype 2').click()
            .elementByCss('#Search_Location_Main_form button[data-id=Field_Location_Main_Status_Search_Value]').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .sleep(500)
            .elementByLinkText('New').click()
            .elementById('Field_Location_Main_OwnerName_Search_Value').type(partyName)
            .elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
            .sleep(2000)
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('table[name=Grid_Location_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(locationName2.toUpperCase())
            .notify(done);
    });

    it('should search locations in advanced search mode', function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('button[data-id=Field_Location_Main_Status_Search_Value]').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .sleep(500)
            .elementByLinkText('Any').click()
            .elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
            .sleep(2000)
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            // Verify by the name prefix only as the order of records might not be fixed
            .elementByCss('table[name=Grid_Location_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.include(locationNamePrefix.toUpperCase())
            .elementByCss('table[name=Grid_Location_Main] tbody tr:nth-child(2) td:nth-child(1)').text()
            .should.eventually.include(locationNamePrefix.toUpperCase())
            .notify(done);
    });

    it('should sort locations', function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('button[data-id=SortField1]').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .sleep(500)
            .elementByLinkText('Name').click()
            .elementByCss('button[data-id=SortField1_order]').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .sleep(500)
            .elementByLinkText('Descending').click()
            .elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
            .sleep(2000)
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('table[name=Grid_Location_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(locationName2.toUpperCase())
            .elementByCss('table[name=Grid_Location_Main] tbody tr:nth-child(2) td:nth-child(1)').text()
            .should.eventually.become(locationName1.toUpperCase())
            .notify(done);
    });
});
