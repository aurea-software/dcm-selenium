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

var common = require('../lib/common');

var r = common.rand(4);
var groupName = 'G' + r;

console.log('r: ' + r);

// This is the login id, name, password, confirmed password and email id
var user = 'u' + r;

// Groups - Compensation setup
describe("/user-manager/tc12-add-contract-kit-group", function() {
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

    it("should create group", function(done) {
        common.createGroup(browser, 'cacheframe1', groupName).nodeify(done);
    });

    it("should load permission page", function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Tab_UserManager_Groups_Main_AdditionalPermissions_link').click()
            .nodeify(done);
    });

    it("should load edit permission page", function(done) {
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

    it("should select permission 1", function(done) {
        common.addPermission(browser, 'cacheframe1', 'Edit', 'ContractKitPropertyPage').nodeify(done);
    });

    it("should select permission 2", function(done) {
        common.addPermission(browser, 'cacheframe1', 'View', 'Contracts').nodeify(done);
    });

    it("should select permission 3", function(done) {
        common.addPermission(browser, 'cacheframe1', 'View', 'Contracts.ContractsSearch').nodeify(done);
    });

    it("should select permission 4", function(done) {
        common.addPermission(browser, 'cacheframe1', 'Edit', 'AllocRulePropertyPage').nodeify(done);
    });

    it("should select permission 5", function(done) {
        common.addPermission(browser, 'cacheframe1', 'Edit', 'ContractKitCheckIn').nodeify(done);
    });

    it("should select permission 6", function(done) {
        common.addPermission(browser, 'cacheframe1', 'Edit', 'ContractKitCheckOut').nodeify(done);
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

    it("should load user page", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .execute('scrollTo(0, 6000)')
            .elementByCss('#Search_UserManager_Groups_Main_primary_display_div button').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementByLinkText('Search Users').click()
            .nodeify(done);
    });

    it("should create user", function(done) {
        common.createSimpleUser(browser, 'cacheframe1', user).nodeify(done);
    });

    it("should load edit membership page", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Button_UserManager_Users_Main_GroupMemberships_EditUserMemberships').click()
            .nodeify(done);
    });

    it("should edit membership", function(done) {
        common.addMembership(browser, 'cacheframe1', groupName)
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .frame('component_iframe')
            .elementByCss('table[name=Grid_UserManager_Users_Main_GroupMemberships] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(groupName.toUpperCase())
            .notify(done);
    });

    it("should logout", function(done) {
        browser
            .frame()
            .frame('navbar')
            // The 'Logout' link is hidden. User needs to hoover the cursor to show the link.
            // We change the CSS to make sure that the element is visible to click.
            .execute('document.querySelector(\'#session > div:nth-child(2)\').style.left = \'0%\';')
            .elementByCss('#session > div:nth-child(2) > a').type(wd.SPECIAL_KEYS['Enter'])
            .elementByCss('form[name=LoginForm] input[name=LOGINNAME]').text()
            .should.eventually.become('')
            .notify(done);
    });

});
