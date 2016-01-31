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

var r = common.rand(3);
var taxId = common.rand(5);

console.log('r: ' + r);
console.log('taxId: ' + taxId);

var firstName = 'FN' + taxId;
var lastName = 'LN' + taxId;

var middleName = 'Middle Name';
var preferredName = 'Preferred Name';

var dtcc = 'D' + r;
var npn = 'N' + r;

var city = 'CityZ';
var stateCode = 'AZ';
var stateName = 'Arizona';

var uniqueString = ' - ' + common.rand(3);
console.log('uniqueString: [' + uniqueString + ']');

var agreementName = 'AG' + uniqueString;
var agreementDesc = 'AGDesc' + uniqueString;

var c = common.rand(3);
console.log('c: ' + c);

var contractName = 'C' + c;
var contractDesc = contractName + 'Desc';

describe("/compensation/agreement/tc5-edit-and-view-basic-info", function() {
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
    
    // We need to create a person for our test case

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
    
    it('should create person party', function(done) {
        common.createPersonParty(browser, taxId, firstName, lastName, middleName, preferredName, city, stateName, dtcc, npn).nodeify(done);
    });

    // We need to create a contract kit in production status for our test case

    it("should load compensation setup page", function(done) {
        browser.refresh().frame().frame('navbar').elementById('Compensation Setup').click().nodeify(done);
    });

    it("should load contract kit page", function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Contracts_sub').click()
            .nodeify(done);
    });

    it("should create contract kit in production status", function(done) {
        common.createContractKitInProductionStatus(browser, 'cacheframe2', contractName, contractDesc, '01/01/2000', '01/01/2300').nodeify(done);
    });
    
    // We need to create an agreement for our test case

    it("should load agreement page", function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Agreement_sub').click()
            .nodeify(done);
    });

    it('should create agreement with person', function(done) {
        common.createAgreementWithPerson(browser, wd.SPECIAL_KEYS['Enter'], 'cacheframe3', agreementName, agreementDesc, contractName, '01/01/2010', '01/01/2100', firstName).nodeify(done);
    });
    
    it('should search agreement', function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe3')
            .frame('subpage')
            .elementByLinkText('Advanced Search').click()
            .elementByCss('#Search_Agreement_Main_form #Field_Agreement_Main_NameUpper_Search_Value').type(agreementName)
            .elementByLinkText('Search').click()
            .frame()
            .frame('container')
            .frame('cacheframe3')
            .frame('subpage')
            .elementByCss('table[name=Grid_Agreement_Main] tbody tr:nth-child(1) td:nth-child(2)').text()
            .should.eventually.become(agreementName.toUpperCase())
            .notify(done);
    })
    
    it('should edit basic info', function(done) {
        browser
            .elementById('Button_Agreement_Main_EditAgreement').click()
            .frame()
            .frame('container')
            .frame('cacheframe3')
            .frame('proppage')
            .elementById('Name').clear().type(agreementName + 'New')
            .elementById('Description').clear().type(agreementDesc + 'New')
            .elementById('ComponentGroupLabel').type('Life contract kit')
            .elementById('validate').click()
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe3')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Inspector_Agreement_Main_BasicInfo_div_out').text()
            .should.eventually.include(agreementName + 'New')
            .should.eventually.include(agreementDesc + 'New')
            .should.eventually.include('Life contract kit')
            .notify(done);
    });
    
    // Skipping step 4 - 6 because it's not necessary to verify the Create / View basic info (we have done it in step 1 - 3)
});
