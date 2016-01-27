var config = require('nconf');
config.file({file: './test/lib/config.json'});

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var wd = require('wd');
var asserters = wd.asserters; // commonly used asserters

var url = config.get("url");
var username = config.get("username");
var password = config.get("password");

var common = require('../../lib/common');

describe("/party/person/tc1-validate-new-person-party-data", function() {
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

    it("should assert page title using chai", function (done) {
      browser
        .title()
        .then(function(title) {
          title.should.include("Distribution Channel Management");
        })
        .nodeify(done);
    });

    it("should assert page title using chai-as-promised", function (done) {
      browser
        // First difference! Notice the 'eventually'
        .title().should.eventually.include("Distribution Channel Management")
        // Second difference! Notice that we use 'notify' instead of 'nodeify'.
        .notify(done);
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
    
    it("should validate blank create person form", function(done) {
      browser
        .refresh()
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('subpage')
        .elementById("Button_Person_Main_NewPerson").click()
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('proppage')
        .elementById('validate').click()
        .waitForElementByCss("#ppError_div", asserters.isDisplayed , 10000)
        .elementById('ppError_div').text()
        .should.eventually.include("Enter TaxID, It is required to fetch NPN from PDB")
        .should.eventually.include("Mailing Communications Mode requires that at least Street1 be specified")
        .should.eventually.include("Mailing Communications Mode requires that the City be specified")
        .should.eventually.include("Mailing Communications Mode requires that the Zip Code/Postal Code be specified")
        .should.eventually.include("New Parties must play at least one role")
        .notify(done);
    });
    
    it("should validate half blank create person form", function(done) {
      browser
        .refresh()
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('subpage')
        .elementById("Button_Person_Main_NewPerson").click()
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('proppage')
        .elementById('Party.FirstName').type('FN1')
        .elementById('Party.LastName').type('LN1')
        .elementByCss('button[data-id=SyncPDB]').click()
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('proppage')
        .elementByLinkText('No').click()
        .elementById('Party.TaxID').type(common.rand(5))
        .elementByCss('input[id=RoleDISTRIBUTOR] ~ i').click()
        .elementById('validate').click()
        .waitForElementByCss("#ppError_div", asserters.isDisplayed , 10000)
        .elementById('ppError_div').text()
        .should.eventually.include("Mailing Communications Mode requires that at least Street1 be specified")
        .should.eventually.include("Mailing Communications Mode requires that the City be specified")
        .should.eventually.include("Mailing Communications Mode requires that the Zip Code/Postal Code be specified")
        .notify(done);
    });
    
    it("should validate valid create person form", function(done) {
      var taxId = common.rand(5);
      var v = browser
        .refresh()
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('subpage')
        .elementById("Button_Person_Main_NewPerson").click()
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('proppage')
        .elementById('Party.FirstName').type('FN1')
        .elementById('Party.LastName').type('LN1')
        .elementByCss('button[data-id=SyncPDB]').click()
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('proppage')
        .elementByLinkText('No').click()
        .elementById('Party.TaxID').type(taxId)
        //.elementByCss('input[id=RoleEMPLOYEE] ~ i').click()
        //.elementByCss('input[id=RoleDISTRIBUTOR] ~ i').click()
        .elementById('ContactPoint.Address.Street1').type('street1')
        .elementById('ContactPoint.Address.City').type('city1')
        .elementById('ZipCode').type('12347')
        .elementById('validate').click()
        .waitForElementByCss("#ppMessage", asserters.isDisplayed , 10000)
        .elementById('ppMessage').text();
    
    v.should.eventually.include("VALIDATING...SUCCESSFUL");
    
    v = v.elementById('Party.TaxID').clear()
        .elementById('validate').click()
        .waitForElementByCss("#ppError_div", asserters.isDisplayed , 10000)
        .elementById('ppError_div').text();
    
    v.should.eventually.include("No SSN specified");
    
    v = v.elementById('Party.TaxID').type(taxId)
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
        // As per the test case description, we need to validate by first name
        // and last name. These values are not necessarily to be unique. Hence,
        // we validate by SSN / Tax instead.
        .should.eventually.include(taxId)
        .notify(done);
    });
});
