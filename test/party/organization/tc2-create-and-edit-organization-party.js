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
var taxId = common.rand(5);
var partyName = "PN" + taxId;
var partyNameNew = partyName + 'New';

describe("/party/organization/tc2-create-and-edit-organization-party", function() {
    this.timeout(60000);
    var browser;

    before(function (done) {
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
            .frame('navbar')
            .elementById('Party').click()
            .nodeify(done);
    });

    it("should load create organization page", function(done) {
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
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementById('Button_Org_Main_NewOrg').click()
            .nodeify(done);
    });

    it("should create organization party", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementById('Party.Name').type(partyName)
            .elementById('Party.TaxID').type(taxId)
            .elementByCss('button[data-id=SyncPDB]').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementByLinkText('No').click()
            .elementById('DTCCID').type('1111')
            .elementById('Party.NPN').type('2222')
            .execute('scrollTo(0, 6000)')
            .elementByCss('input[id=RoleAPPOINTINGCOMPANY] ~ i').click()
            .elementByCss('input[id=RoleEMPLOYER] ~ i').click()
            .elementByCss('input[id=RoleDISTRIBUTOR] ~ i').click()
            .elementById('ContactPoint.Address.Street1').type('st1')
            .elementById('ContactPoint.Address.City').type('city2')
            .elementByCss('button[data-id=US_State]').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementByLinkText("Arizona").click()
            .elementById('ZipCode').type('4444')
            .elementById('validate').click()
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementById('Grid_Org_Main').text()
            .should.eventually.include(partyName)
            .notify(done);
    });

    it("should edit organization party", function(done) {
        browser.frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementById('Field_Org_Main_NameUpper_Search_Value').type(partyName)
            .elementByLinkText('Search').click()
            .elementById('Button_Org_Main_BasicInfo_EditGrid').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementById('Party.Name').clear().type(partyNameNew)
            .elementById('validate').click()
            .waitForElementByCss("#ppMessage", asserters.isDisplayed , 10000)
            .elementById('ppMessage').text()
            .should.eventually.include("VALIDATING...SUCCESSFUL")
            .notify(done);
    });

    it("should edit organization party", function(done) {
        browser.frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementById('Grid_Org_Main').text()
            .should.eventually.include(partyNameNew.toUpperCase())
            .notify(done);
    });
});
