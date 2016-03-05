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

var taxId = common.rand(5);
var dtcc = common.rand(4);

console.log('taxId: ' + taxId);
console.log('dtcc: ' + dtcc);

var newAddressIndex = -1;
var newAddressType = 'Work Address';

describe("/party/organization/tc5-add-edit-contact-info", function() {
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
        common.createOrganizationParty(browser, 'cacheframe0', taxId, 'PN' + taxId, dtcc, dtcc, 'C' + taxId, 'Arizona').nodeify(done);
    });

    it('should create contact point', function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementByLinkText('Contact Information').click()
            .elementByLinkText('Contact Points').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Button_Org_Main_ContactPoint_Create').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementByCss('button[data-id=ContactType]').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .sleep(500)
            .elementByLinkText(newAddressType).click()
            .elementById('Address.Street1').type('Street123')
            .elementById('Address.City').type('City123')
            .elementByCss('button[data-id=US_State]').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .sleep(500)
            .elementByLinkText('California').click()
            // Test case desc requires 123. We change to 321 for easy validation.
            .elementById('ZipCode').type('321')
            .elementById('save').click()
            .nodeify(done);
    });

    var checkWorkAddress = function(data, index) {
        if (newAddressType.toUpperCase() === data) {
            newAddressIndex = index;
        }
    };

    var checkRow = function(rowIndex) {
        return browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .frame('component_iframe')
            .elementByCss('table[id=Grid_Org_Main_ContactPoints_Main] tbody tr:nth-child(' + rowIndex + ') td:nth-child(1)').text()
            .then(function(data) {
                checkWorkAddress(data, rowIndex);
            });
    }

    it('should check first row', function(done) {
        checkRow(1).nodeify(done);
    });

    it('should check second row', function(done) {
        checkRow(2).nodeify(done);
    });

    it('should validate new contact point', function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .frame('component_iframe')
            .elementByCss('table[id=Grid_Org_Main_ContactPoints_Main] tbody tr:nth-child(' + newAddressIndex + ') td:nth-child(1)').click()
            .sleep(2000)
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Inspector_Org_Main_ContactPointDetails_rollup_div').text()
            .should.eventually.include('Street123')
            .should.eventually.include('City123')
            .should.eventually.include('CA')
            .should.eventually.include('321')
            .notify(done);
    });

    it('should edit contact point', function(done) {
        browser
            .elementById('Button_Org_Main_ContactPoint_Edit').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementByCss('button[data-id=ContactType]').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .sleep(500)
            .elementByLinkText(newAddressType).click()
            .elementById('Address.Street1').clear().type('abc')
            // Test case desc requires abc. We change to def for easy validation.
            .elementById('Address.City').clear().type('def')
            .elementByCss('button[data-id=US_State]').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .sleep(500)
            .elementByLinkText('Florida').click()
            .elementById('save').click()
            .nodeify(done);
    });

    it('should check first row - 2', function(done) {
        checkRow(1).nodeify(done);
    });

    it('should check second row - 2', function(done) {
        checkRow(2).nodeify(done);
    });

    it('should validate modified contact point', function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .frame('component_iframe')
            .elementByCss('table[id=Grid_Org_Main_ContactPoints_Main] tbody tr:nth-child(' + newAddressIndex + ') td:nth-child(1)').click()
            .sleep(2000)
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Inspector_Org_Main_ContactPointDetails_rollup_div').text()
            .should.eventually.include('abc')
            .should.eventually.include('def')
            .should.eventually.include('FL')
            .notify(done);
    });
});
