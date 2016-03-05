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

var common = require('../../../lib/common');

var r = common.rand(4);
var groupName = 'G' + r;

console.log('r: ' + r);

// This is the login id, name, password, confirmed password and email id
var user = 'u' + r;

// Groups - Compensation setup
describe("/user-manager/tc11-create-user-and-add-agreement-group", function() {
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

    // Add all permissions related to the Agreement group (see previous test suites)

    it("should select permission 1", function(done) {
        common.addGroupPermission(browser, 'cacheframe1', 'Edit', 'NewAgreement').nodeify(done);
    });

    it("should select permission 2", function(done) {
        common.addGroupPermission(browser, 'cacheframe1', 'View', 'Agreement').nodeify(done);
    });

    it("should select permission 3", function(done) {
        common.addGroupPermission(browser, 'cacheframe1', 'View', 'Agreement.AgreementSearch').nodeify(done);
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
            .elementByCss('#Search_UserManager_Groups_Main_primary_display_div button').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementByLinkText('Search Users').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementById('Button_UserManager_Users_Main_CreateUser').click()
            .nodeify(done);
    });

    it("should create user", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementById('LoginName').type(user)
            .elementById('Name').type(user)
            .elementById('Password').type(user)
            .elementById('ConfirmPassword').type(user)
            .elementById('EmailAddress').type(user + '@gmail.com')
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementByCss('table[name=Grid_UserManager_Users_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(user.toUpperCase())
            .notify(done);
    });

    it("should edit membership", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Button_UserManager_Users_Main_GroupMemberships_EditUserMemberships').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementByCss('button[name=AllGroupContainers_add]').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementById('complexField_Page_GroupSearch_search_div').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .frame('Page_GroupSearch_search_div_frame')
            .elementById('Field_GroupSearch_Search_GroupName_Search_Value').type(groupName)
            .elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .frame('Page_GroupSearch_search_div_frame')
            .elementById('Button_GroupSearch_Select').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .frame('component_iframe')
            .elementByCss('table[name=Grid_UserManager_Users_Main_GroupMemberships] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(groupName.toUpperCase())
            .notify(done);
    });

});
