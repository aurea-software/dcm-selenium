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

var common = require('../lib/common');

var r = common.rand(4);
var agreementGroupName = 'G' + r + 'Agreement';
var contractKitGroupName = 'G' + r + 'ContractKit';

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

var agreementName = 'AG' + r;
var agreementDesc = 'AGDesc' + r;

var ckpTaxId = r;
var ckpName = 'CKP_' + r;
var ckpPartyId;

var prodHierName = 'PRODHIER_' + r;
var prodHierDesc = 'PRODHIER_DESC' + r;

var contractName = 'CK Name' + r;
var contractDesc = 'CK Desc' + r;

// Groups - Compensation setup
describe("/user-manager/tc16-create-contract-kit-and-agreement-and-checkin-contract-kit", function() {
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

    // Setup begins

    it("should load group page", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementByCss('#Search_UserManager_Users_Main_primary_display_div button').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementByLinkText('Search Groups').click()
            .nodeify(done);
    });

    it("should create agreement group", function(done) {
        common.createGroup(browser, 'cacheframe1', agreementGroupName).nodeify(done);
    });

    it("should load permission page for agreement group", function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Tab_UserManager_Groups_Main_AdditionalPermissions_link').click()
            .nodeify(done);
    });

    it("should load edit permission page for agreement group", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Button_UserManager_Groups_Main_AdditionalPermissions_EditPermissions').click()
            .nodeify(done);
    });

    // Add all permissions related to the Agreement group (see previous test suites)

    it("should select permission 1 for agreement group", function(done) {
        common.addGroupPermission(browser, 'cacheframe1', 'Edit', 'NewAgreement').nodeify(done);
    });

    it("should select permission 2 for agreement group", function(done) {
        common.addGroupPermission(browser, 'cacheframe1', 'View', 'Agreement').nodeify(done);
    });

    it("should select permission 3 for agreement group", function(done) {
        common.addGroupPermission(browser, 'cacheframe1', 'View', 'Agreement.AgreementSearch').nodeify(done);
    });

    it("should save permissions for agreement group", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementById('save').click()
            .nodeify(done);
    });

    it("should create contract kit group", function(done) {
        common.createGroup(browser, 'cacheframe1', contractKitGroupName).nodeify(done);
    });

    it("should load permission page for contract kit group", function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Tab_UserManager_Groups_Main_AdditionalPermissions_link').click()
            .nodeify(done);
    });

    it("should load edit permission page for contract kit group", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Button_UserManager_Groups_Main_AdditionalPermissions_EditPermissions').click()
            .nodeify(done);
    });

    // Add all permissions related to the Contract Kit group (see previous test suites)

    it("should select permission 1 for contract kit group", function(done) {
        common.addGroupPermission(browser, 'cacheframe1', 'Edit', 'ContractKitPropertyPage').nodeify(done);
    });

    it("should select permission 2 for contract kit group", function(done) {
        common.addGroupPermission(browser, 'cacheframe1', 'View', 'Contracts').nodeify(done);
    });

    it("should select permission 3 for contract kit group", function(done) {
        common.addGroupPermission(browser, 'cacheframe1', 'View', 'Contracts.ContractsSearch').nodeify(done);
    });

    it("should select permission 4 for contract kit group", function(done) {
        common.addGroupPermission(browser, 'cacheframe1', 'Edit', 'AllocRulePropertyPage').nodeify(done);
    });

    it("should select permission 5 for contract kit group", function(done) {
        common.addGroupPermission(browser, 'cacheframe1', 'Edit', 'ContractKitCheckIn').nodeify(done);
    });

    it("should select permission 6 for contract kit group", function(done) {
        common.addGroupPermission(browser, 'cacheframe1', 'Edit', 'ContractKitCheckOut').nodeify(done);
    });

    it("should save permissions for contract kit group", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementById('save').click()
            .nodeify(done);
    });

    it("should load user page", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementByCss('#Search_UserManager_Groups_Main_primary_display_div button').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .sleep(1000)
            .elementByLinkText('Search Users').click()
            .nodeify(done);
    });

    it("should create user", function(done) {
        common.createSimpleUser(browser, 'cacheframe1', user).nodeify(done);
    });

    it("should load edit membership page for agreement group", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Button_UserManager_Users_Main_GroupMemberships_EditUserMemberships').click()
            .nodeify(done);
    });

    it("should edit membership for agreement group", function(done) {
        common.addMembership(browser, 'cacheframe1', agreementGroupName).nodeify(done)
    });

    it("should load edit membership page for contract kit group", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Button_UserManager_Users_Main_GroupMemberships_EditUserMemberships').click()
            .nodeify(done);
    });

    it("should edit membership for contract kit group", function(done) {
        common.addMembership(browser, 'cacheframe1', contractKitGroupName).nodeify(done)
    });

    // Done setup

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
        common.createContractKit(browser, 'cacheframe0', contractName, contractDesc, '01/01/2000', '01/01/2300', prodHierName, ckpName, ckpPartyId).nodeify(done);
    });

    it("should check in working version", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementById('Button_Contracts_Main_ContractKitCheckIn').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementById('Description').type('Promotion comment 1')
            .elementById('validate').click()
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Inspector_Contracts_Main_BasicInfo_div_out').text()
            .should.eventually.match(/Production Status.*Production/)
            .notify(done);
    });

    it("should load agreement page", function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Agreement_sub').click()
            .nodeify(done);
    });

    it('should create agreement with person', function(done) {
        common.createAgreementWithPerson(browser, 'cacheframe1', agreementName, agreementDesc, contractName, '01/01/2010', '01/01/2100', firstName).nodeify(done);
    });

});
