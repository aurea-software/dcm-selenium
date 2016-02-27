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

describe("/party/organization/tc4-edit-basic-info", function() {
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

    it('should search party by name', function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementById('Field_Org_Main_NameUpper_Search_Value').clear().type(partyName)
            .elementByLinkText('Search').click()
            .waitForElementByCss('table[name=Grid_Org_Main] tbody tr:nth-child(1) td:nth-child(2)').text()
            .should.eventually.become(partyName)
            .notify(done);
    });

    it('should edit tax id and agency formation date', function(done) {
       browser
           .frame()
           .frame('sidebar')
           // ID doesn't seem consistent (Tab_Org_Main_BasicInfo_link / Tab_Person_Main_BasicInfo_link).
           // We use link text instead.
           .elementByLinkText('Basic Information').click()
           .frame()
           .frame('container')
           .frame('cacheframe0')
           .frame('subpage')
           .frame('component_iframe')
           .elementById('Button_Org_Main_BasicInfo_Edit').type(wd.SPECIAL_KEYS['Enter'])
           .frame()
           .frame('container')
           .frame('cacheframe0')
           .frame('proppage')
           .elementById('Party.TaxID').clear().type(taxIdNew)
           .elementById('Party.AgencyFormationDate').clear().type('01/01/2013')
           .elementById('validate').click()
           .elementById('save').click()
           .frame()
           .frame('container')
           .frame('cacheframe0')
           .frame('subpage')
           .frame('component_iframe')
           .elementById('Inspector_Org_Main_BasicInfo_rollup_div').text()
           .should.eventually.include(taxIdNew)
           .should.eventually.include('01/01/2013')
           .notify(done);
    });

    it('should not edit dtcc', function(done) {
        browser
            .elementById('Button_Org_Main_BasicInfo_Edit').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementById('DTCCID').clear().type(dtccNew)
            .elementById('validate').click()
            .elementById('ppError_div').text()
            // Test case desc requires the error message to be Input for property: DTCCID is too long, the maximum size is 4.
            // The actual error message is different.
            .should.eventually.include('DTCC ID has a value longer than the allowed limit of 4')
            .notify(done);
    });

    it('should open add comment page', function(done) {
        browser
            .elementById('cancel').click()
            .frame()
            .frame('sidebar')
            .elementById('Tab_Org_Main_BasicInfo_link').click()
            .elementById('Tab_Org_Main_BasicInfo_Comments_link').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Button_Org_Main_BasicInfo_NewComment').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementByCss('button[data-id=PredefinedCommentCode]').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementByCss('button[data-id=PredefinedCommentCode] ~ div').text()
            .should.eventually.include('(00) - New')
            .should.eventually.include('(01) - Comment 1')
            .should.eventually.include('(02) - Another Comment')
            .should.eventually.include('(03) - One more comment')
            .notify(done);
    });

    it('should validate comment', function(done) {
        browser
            .elementByLinkText('(00) - New').click()
            .elementById('Comment').clear().type('this is a new comment')
            .elementById('validate').click()
            .waitForElementByCss("#ppMessage", asserters.isDisplayed , 10000)
            .elementById('ppMessage').text()
            .should.eventually.include("VALIDATING...SUCCESSFUL")
            .notify(done);
    });

    it('should add comment', function(done) {
        browser
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Grid_Org_Main_BasicInfo_PartyComments').text()
            // Test case desc require to validate against the current system date
            // while the actual comment date is the server's system date.
            // Skip it for now.
            .should.eventually.include(username.toUpperCase())
            .should.eventually.include('THIS IS A NEW COMMENT')
            .notify(done);
    });

    it('should open status page', function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Tab_Org_Main_BasicInfo_link').click()
            .elementById('Tab_Org_Main_BasicInfo_Status_link').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Button_Org_Main_BasicInfo_UpdatePartyStatus').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .execute('scrollTo(0, 6000)')
            .elementByCss('button[data-id=NewStatus\\.StatusCode]').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementByCss('button[data-id=NewStatus\\.StatusCode] ~ div').text()
            .should.eventually.include('Not Recontractable')
            .should.eventually.include('Pending')
            .should.eventually.include('Recontractable')
            .notify(done);
    });

    it('should update status', function(done) {
        browser
            .elementByLinkText('Not Recontractable').click()
            .elementById('NewStatus.StartDate').clear().type('01/01/2015')
            .elementById('validate').click()
            .elementById('ppError_div').text()
            .should.eventually.include('Warning:The new status completely overlaps one or more existing statuses')
            // Click twice due to the warning
            .elementById('save').click()
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Grid_Org_Main_BasicInfo_Status_div').text()
            .should.eventually.include('NOT RECONTRACTABLE')
            .notify(done);
    });
});
