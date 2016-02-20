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

describe("/party/person/tc2-create-and-edit-new-person-party", function() {
  this.timeout(60000);
    var browser;

    before(function (done) {
      browser = wd.promiseChainRemote(config.get("remote"));
      common.configBrowser(browser, config.get("environment")).nodeify(done);
    });

    after(function (done) {
      browser
        .quit()
        .nodeify(done);
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

    it("should load create person page", function(done) {
      browser
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('subpage')
        .elementById('Button_Person_Main_NewPerson').click()
        .nodeify(done);
    });

    it("should create person party", function(done) {
      browser
        .refresh()
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('subpage')
        .elementById('Button_Person_Main_NewPerson').click()
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('proppage')
        .elementById('Party.Salutation').type('Mr')
        .elementById('Party.FirstName').type('FN2')
        .elementById('Party.PreferredName').type('PN2')
        .elementById('Party.MiddleName').type('MN2')
        .elementById('Party.LastName').type('LN2')
        .elementById('Party.BirthDate').type('01/01/1970')
        .elementById('DTCCID').type('1111')
        .elementById('Party.NPN').type('2222')
        .elementByCss('button[data-id=SyncPDB]').type(wd.SPECIAL_KEYS['Enter'])
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('proppage')
        .elementByLinkText('No').click()
        .elementById('Party.TaxID').type(taxId)
        .execute('scrollTo(0, 6000)')
        .elementByCss('input[id=RoleEMPLOYEE] ~ i').click()
        .elementByCss('input[id=RoleDISTRIBUTOR] ~ i').click()
        .elementById('ContactPoint.Address.Street1').type('st1')
        .elementById('ContactPoint.Address.City').type('city2')
        // We have to scroll down so that we can avoid the error 'Eleemnt is not clickable at this point. Another element would receive the click.'
        .execute('scrollTo(0,3000)')
        .elementByCss('button[data-id=US_State]').type(wd.SPECIAL_KEYS['Enter'])
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('proppage')
        .elementByLinkText('Arizona').click()
        .elementById('ZipCode').type('4444')
        .elementById('save').click()
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('subpage')
        .elementById('Grid_Person_Main').text()
        .should.eventually.include(taxId)
        .notify(done);
    });

    it("should edit person party", function(done) {
      var v = browser
        .refresh()
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('subpage')
        .elementById('Field_Person_Main_TaxID_Search_Value').type(taxId)
        .elementByLinkText('Search').click()
        .elementById('Button_Person_Main_BasicInfo_EditGrid').type(wd.SPECIAL_KEYS['Enter'])
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('proppage')
        .elementByCss('button[data-id=Party\\.Gender]').click()
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('proppage')
        .elementByLinkText('Male').click()
        .elementById('Party.LastName').type('LN2New')
        .elementById('Party.FirstName').type('FN2New')
        .elementById('validate').click()
        .waitForElementByCss("#ppMessage", asserters.isDisplayed , 10000)
        .elementById('ppMessage').text();

    v.should.eventually.include("VALIDATING...SUCCESSFUL");

    v.elementById('save').click()
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('subpage')
        .elementById('Grid_Person_Main').text()
        .should.eventually.include('LN2NEW')
        .should.eventually.include('FN2NEW')
        .notify(done);
    });
});
