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

var taxIdNew = taxId + '9';
var dtccNew = dtcc + '9';

var partyName = 'PN' + taxId;
var partyNameNew = partyName + 'New';

console.log('taxId: ' + taxId);
console.log('dtcc: ' + dtcc);

var locationId = common.rand(3);
var locationDtcc = 'D' + locationId;
var locationName = 'L' + locationId;
var locationStreet = 's' + locationId;
var locationCity = 'c' + locationId;
var locationZipCode = '12345';

var c = common.rand(3);
var locationDtccNew = 'D' + c;
var locationNameNew = locationName + 'New';

var c2 = common.rand(3);
var locationDtccNew2 = 'D' + c2;

describe("/party/location/tc3-edit-basic-info", function() {
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
    	common.createLocationParty(browser, 'cacheframe0', locationName, locationId, locationDtcc, locationStreet, locationCity, locationZipCode, 'Subtype 2', partyName).nodeify(done);
    });

    it("should edit location party", function(done) {
    	browser
    		.frame()
    		.frame('container')
    		.frame('cacheframe0')
    		.frame('subpage')
    		.elementById('Button_Location_Main_EditLocation').click()
    		.frame()
    		.frame('container')
    		.frame('cacheframe0')
    		.frame('proppage')
    		.elementById('Party.CurrentDetails.Name').clear().type(locationNameNew)
            .elementById('DTCCID').clear().type(locationDtccNew)
            .elementByCss('button[data-id=Party\\.CurrentDetails\\.UpdateReason]').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementByLinkText('Name Changed').click()
            .elementByCss('button[data-id=Party\\.CurrentDetails\\.LocationType]').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementByLinkText('Branch Office').click()
            .elementByCss('button[data-id=Party\\.CurrentDetails\\.LocationSubtype]').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementByLinkText('Subtype 1').click()
            .elementById('validate').click()
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('table[name=Grid_Location_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(locationNameNew.toUpperCase())
            .elementByCss('table[name=Grid_Location_Main] tbody tr:nth-child(1) td:nth-child(3)').text()
            .should.eventually.become(locationDtccNew.toUpperCase())
            .elementByCss('table[name=Grid_Location_Main] tbody tr:nth-child(1) td:nth-child(4)').text()
            .should.eventually.become('BRANCH OFFICE')
            .elementByCss('table[name=Grid_Location_Main] tbody tr:nth-child(1) td:nth-child(5)').text()
            .should.eventually.become('SUBTYPE 1')
            // The test case desc requires to validate the change reason as well. But the change reason
            // is not displayed in the result table. Skip for now.
            .notify(done);
    });

    it("should refuse too long dtcc id", function(done) {
    	browser
    		.frame()
    		.frame('sidebar')
    		.elementById('Tab_Location_Main_BasicInfo_link').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Button_Location_Main_BasicInfo_Edit').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            // Don't clear. Type whatever to increase the length to more than 4.
            .elementById('DTCCID').type('Whatever')
            .elementById('validate').click()
            .elementById('ppError_div').text()
            .should.eventually.include('DTCC ID has a value longer than the allowed limit of 4')
            .notify(done);
    });

    it("should accept valid dtcc id", function(done) {
    	browser
			.frame()
			.frame('container')
			.frame('cacheframe0')
			.frame('proppage')
	        .elementById('DTCCID').clear().type(locationDtccNew2)
	        .elementById('validate').click()
	        .elementById('save').click()
	        .frame()
	        .frame('container')
	        .frame('cacheframe0')
	        .frame('subpage')
	        .elementByCss('table[name=Grid_Location_Main] tbody tr:nth-child(1) td:nth-child(3)').text()
	        .should.eventually.become(locationDtccNew2.toUpperCase())
	        .notify(done);
    });

    it("should close location", function(done) {
    	browser
    		.frame()
    		.frame('container')
    		.frame('cacheframe0')
    		.frame('subpage')
    		.frame('component_iframe')
    		.elementById('Button_Location_Main_BasicInfo_CloseLocation').click()
			.frame()
			.frame('container')
			.frame('cacheframe0')
			.frame('proppage')
			.elementByCss('button[data-id=NewStatus\\.StatusReason]').type(wd.SPECIAL_KEYS['Enter'])
			.frame()
			.frame('container')
			.frame('cacheframe0')
			.frame('proppage')
			.elementByLinkText('Registered Contact Left').click()
			.elementById('validate').click()
			.elementById('save').click()
			.elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .frame('component_iframe')
            .elementByCss('table[name=Grid_Location_Main_BasicInfo_Status] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become('CLOSED'.toUpperCase())
            .elementByCss('table[name=Grid_Location_Main_BasicInfo_Status] tbody tr:nth-child(1) td:nth-child(4)').text()
            .should.eventually.become('REGISTERED CONTACT LEFT'.toUpperCase())
            .notify(done);
    });

    it("should open location", function(done) {
    	browser
			.frame()
			.frame('container')
			.frame('cacheframe0')
			.frame('subpage')
			.frame('component_iframe')
			.elementById('Button_Location_Main_BasicInfo_OpenLocation').click()
			.frame()
			.frame('container')
			.frame('cacheframe0')
			.frame('proppage')
			.elementByCss('button[data-id=NewStatus\\.StatusReason]').type(wd.SPECIAL_KEYS['Enter'])
			.frame()
			.frame('container')
			.frame('cacheframe0')
			.frame('proppage')
			.elementByLinkText('New Registered Contact').click()
			.elementById('validate').click()
			.elementById('save').click()
			.elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .frame('component_iframe')
            .elementByCss('table[name=Grid_Location_Main_BasicInfo_Status] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become('OPEN'.toUpperCase())
            .elementByCss('table[name=Grid_Location_Main_BasicInfo_Status] tbody tr:nth-child(1) td:nth-child(4)').text()
            .should.eventually.become('NEW REGISTERED CONTACT'.toUpperCase())
            .notify(done);
    });
});
