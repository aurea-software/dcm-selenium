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

// Groups - Compensation setup
describe("/user-manager/tc6-add-permission-for-creating-allocation-rule", function() {
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

    it("should add permission", function(done) {
        common.addGroupPermission(browser, 'cacheframe1', 'Edit', 'AllocRulePropertyPage')
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
            .elementByCss('table[name=Grid_UserManager_Groups_Main_AdditionalPermissions] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become('ALLOCRULEPROPERTYPAGE')
            .notify(done);
    });

});
