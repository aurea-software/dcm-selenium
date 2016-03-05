var config = require('nconf');
config.file({file: './test/lib/config.json'});

var assert = require("chai").assert;

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var wd = require('wd');
var asserters = wd.asserters;

var url = config.get("url");
var username = config.get("adminUsername");
var password = config.get("adminPassword");
var defaultUsername = config.get("username");
var defaultPassword = config.get("password");

var common = require('../../../lib/common');

var r = common.rand(4);
console.log('r: ' + r);

// This is the login id, name, password, confirmed password and email id
var user = 'u' + r;

var taxId = r;
var firstName = 'FN' + r;
var lastName = 'LN' + r;

var middleName = 'Middle Name';
var preferredName = 'Preferred Name';

var dtcc = r;
var npn = 'N' + r;

var city = 'CityZ';
var stateCode = 'AZ';
var stateName = 'Arizona';

var ckpTaxId = r;
var ckpName = 'CKP_' + r;
var ckpPartyId;

var prodHierName = 'PRODHIER_' + r;
var prodHierDesc = 'PRODHIER_DESC' + r;

var contractName = 'CK Name' + r;
var contractDesc = 'CK Desc' + r;

// Permissions - Contract kit, Agreement and Agreement Hierarchy
describe("/user-manager/tc10-create-and-edit-contract-kit", function() {
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

    it("should login as admin", function (done) {
        common.loginToUserManager(browser, url, username, password).nodeify(done);
    });

    it("should load user manager page", function(done) {
        browser
              .frame()
              .frame('navbar')
              .elementById('UserManager').click()
              .nodeify(done);
    });

    it("should create user", function(done) {
        common.createSimpleUser(browser, 'cacheframe1', user).nodeify(done);
    });

    it("should load additional permissions page", function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Tab_UserManager_Users_Main_AdditionalPermissions_link').click()
            .nodeify(done);
    });

    it("should load edit permission page", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Button_UserManager_Users_Main_AdditionalPermissions_EditPermissions').click()
            .nodeify(done);
    });

    // Add all permissions related to the Contract Kit group (see previous test suites)

    it("should select permission 1", function(done) {
        common.addUserPermission(browser, 'cacheframe1', 'Edit', 'ContractKitPropertyPage').nodeify(done);
    });

    it("should select permission 2", function(done) {
        common.addUserPermission(browser, 'cacheframe1', 'View', 'Contracts').nodeify(done);
    });

    it("should select permission 3", function(done) {
        common.addUserPermission(browser, 'cacheframe1', 'View', 'Contracts.ContractsSearch').nodeify(done);
    });

    it("should select permission 4", function(done) {
        common.addUserPermission(browser, 'cacheframe1', 'Edit', 'ContractKitCheckIn').nodeify(done);
    });

    it("should select permission 5", function(done) {
        common.addUserPermission(browser, 'cacheframe1', 'Edit', 'ContractKitCheckOut').nodeify(done);
    });

    it("should save permissions", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementById('save').click()
            .nodeify(done);
    });

    // Prepare data

    // The newly created user doesn't have permission to create party or product hiearchy. Hence we create the data using the default user.

    it("should logout", function(done) {
        common.logout(browser).nodeify(done);
    });

    it("should login as default user", function (done) {
        common.login(browser, url, defaultUsername, defaultPassword).nodeify(done);
    });

    it("should load party page", function(done) {
        browser.frame().frame('navbar').elementById('Party').click().nodeify(done);
    });

    it('should create person party', function(done) {
        common.createPersonParty(browser, 'cacheframe0', taxId, firstName, lastName, middleName, preferredName, city, stateName, dtcc, npn).nodeify(done);
    });

    var storeCkpId = function(ckpId) {
        ckpPartyId = ckpId;
    };

    it('should create contract kit provider', function(done) {
        common.createContractKitProvider(browser, 'cacheframe0', ckpName, ckpTaxId)
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('table[name=Grid_Org_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
            .then(function(data) {
                storeCkpId(data);
            })
            .nodeify(done);
    });

    it("should load hierarchy tab", function(done) {
        browser.frame().frame('navbar').elementById('Hierarchy').click().nodeify(done);
    });

    it("should load product hierarchy page", function(done) {
        browser.frame().frame('sidebar').elementById('ProductHierarchySearch_sub').click().nodeify(done);
    });

    it("should create product hierarchy", function(done) {
        common.createProductHierarchy(browser, 'cacheframe2', prodHierName, prodHierDesc).nodeify(done);
    });

    // Done preparing data

    it("should logout", function(done) {
        common.logout(browser).nodeify(done);
    });

    it("should login as newly created user", function (done) {
        common.login(browser, url, user, user).nodeify(done);
    });

    it("should load compensation setup page", function(done) {
        browser.frame().frame('navbar').elementById('Compensation Setup').click().nodeify(done);
    });

    it("should load contract kit page", function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Contracts_sub').click()
            .nodeify(done);
    });

    it("should create contract kit", function(done) {
        common.createContractKit(browser, 'cacheframe0', contractName, contractDesc, '01/01/2000', '01/01/2300', prodHierName, ckpName, ckpPartyId)
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Inspector_Contracts_Main_BasicInfo_div_out').text()
            .should.eventually.include(contractName)
            .should.eventually.include(contractDesc)
            .should.eventually.include('Working Version')
            .notify(done);
    });

    it("should edit contract kit", function(done) {
        browser
            .elementById('Button_Contracts_Main_BasicInfo_EditContractKit').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementById('Description').type('Contract kit for life insurance' + r)
            .elementById('validate').click()
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Inspector_Contracts_Main_BasicInfo_div_out').text()
            .should.eventually.include('Contract kit for life insurance' + r)
            .should.eventually.include('Working Version')
            .notify(done);
    });

});
