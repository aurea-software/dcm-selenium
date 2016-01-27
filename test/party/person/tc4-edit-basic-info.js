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
var firstName = 'FN' + taxId;
var lastName = 'LN' + taxId;
var middleName = 'MN' + taxId;
var preferredName = 'PN' + taxId;
var city = 'C' + taxId;
var dtcc = taxId;
var npn = taxId;
var stateName = 'Arizona';
var newNumber = '9';
var newString = 'New';

console.log('taxId: ' + taxId);

describe("/party/person/tc4-edit-basic-info", function() {
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
    
    it("should create person party", function(done) {
        common.createPersonParty(browser, taxId, firstName, lastName, middleName, preferredName, city, stateName, dtcc, npn).nodeify(done);
    });
    
    it("should edit basic info", function(done) {
      var v = browser
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('subpage')
        .elementById('Field_Person_Main_LastNameUpper_Search_Value').type(lastName)
        .elementByLinkText('Search').click()
        .frame()
        .frame('sidebar')
        .elementById('Tab_Person_Main_BasicInfo_link').click()
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('subpage')
        .frame('component_iframe')
        .elementById('Button_Person_Main_BasicInfo_Edit').click()
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('proppage')
        .elementById('Party.MiddleName').clear().type(middleName + newString)
        .elementById('Party.PreferredName').clear().type(preferredName + newString)
        .elementById('Party.TaxID').clear().type(taxId + newNumber)
        .elementById('Party.NPN').clear().type(npn + newNumber)
        .elementById('save').click()
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('subpage')
        .frame('component_iframe')
        .elementById('Inspector_Person_Main_BasicInfo_rollup_div').text();
    
      v.should.eventually.include(middleName + newString)
        .should.eventually.include(preferredName + newString)
        .should.eventually.include(taxId + newNumber)
        .should.eventually.include(npn + newNumber);
    
      v = v.elementById('Button_Person_Main_BasicInfo_Edit').click()
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('proppage')
        .elementById('DTCCID').clear().type(dtcc + newNumber)
        .elementById('save').click()
        .elementById('ppError_div').text();
      
      v.should.eventually.include('Input for property: DTCCID is too long, the maximum size is 4.');
      
      v = v.elementById('cancel').click()
        .frame()
        .frame('sidebar')
        .elementById('Tab_Person_Main_BasicInfo_Comments_link').click()
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('subpage')
        .frame('component_iframe')
        .elementById('Button_Person_Main_BasicInfo_NewComment').click()
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('proppage')
        .elementByCssSelector('button[data-id=PredefinedCommentCode]').click()
        .elementByCssSelector('button[data-id=PredefinedCommentCode] ~ div');
      
      v.getAttribute('innerHTML')
        .should.eventually.contains('(00) - New')
        .should.eventually.contains('(01) - Comment 1')
        .should.eventually.contains('(02) - Another Comment')
        .should.eventually.contains('(03) - One more comment');
      
      v = v.frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('proppage')
        .elementByLinkText('(00) - New').click()
        .elementById('Comment').clear().type('this is a new comment')
        .elementById('validate').click()
        .waitForElementByCss("#ppMessage", asserters.isDisplayed , 10000)
        .elementById('ppMessage').text();
    
      v.should.eventually.include("VALIDATING...SUCCESSFUL");
      
      v = v.elementById('save').click()
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('subpage')
        .frame('component_iframe')
        .elementById('Grid_Person_Main_BasicInfo_PartyComments').text();
      
      v.should.eventually.include('THIS IS A NEW COMMENT');
        
      v = v.frame()
        .frame('sidebar')
        .elementById('Tab_Person_Main_BasicInfo_Status_link').click()
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('subpage')
        .frame('component_iframe')
        .elementById('Button_Person_Main_BasicInfo_UpdatePartyStatus').click()
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('proppage')
        .elementByCssSelector('button[data-id=NewStatus\\.StatusCode]').click()
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('proppage')
        .elementByLinkText('Not Recontractable').click()
        .elementById('NewStatus.StartDate').clear().type('01/01/2015')
        .elementById('validate').click()
        .elementById('ppError_div').text();
      
      v.should.eventually.include('Warning:The new status completely overlaps one or more existing statuses');
      
      // Click twice due to the warning
      v.elementById('save').click()
        .elementById('save').click()
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('subpage')
        .frame('component_iframe')
        .elementById('Grid_Person_Main_BasicInfo_Status_div').text()
        .should.eventually.include('NOT RECONTRACTABLE')
        .notify(done);
    });
});
