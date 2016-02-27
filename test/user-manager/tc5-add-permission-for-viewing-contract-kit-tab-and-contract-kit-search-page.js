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

var permission1;
var permission2;

// Groups - Compensation setup
describe("/user-manager/tc5-add-permission-for-viewing-contract-kit-tab-and-contract-kit-search-page", function() {
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

    it("should select permission 1", function(done) {
        common.addGroupPermission(browser, 'cacheframe1', 'View', 'Contracts').nodeify(done);
    });

    it("should select permission 2", function(done) {
        common.addGroupPermission(browser, 'cacheframe1', 'View', 'Contracts.ContractsSearch').nodeify(done);
    });

    var savePermission1 = function(data) {
        permission1 = data;
    };

    var savePermission2 = function(data) {
        permission2 = data;
    };

    it("should save and extract results", function(done) {
        browser
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
            .then(function(data) {
                savePermission1(data);
            })
            .elementByCss('table[name=Grid_UserManager_Groups_Main_AdditionalPermissions] tbody tr:nth-child(2) td:nth-child(1)').text()
            .then(function(data) {
                savePermission2(data);
            })
            .nodeify(done);
    });

    // We are not sure about the order of permissions we have selected in the page. Therefore, we verify the results separately.

    it("should verify results", function(done) {
        var permission1Exists = false;
        var permission2Exists = false;

        if (permission1 === 'CONTRACTS' || permission2 === 'CONTRACTS') {
            permission1Exists = true;
        }

        if (permission1 === 'CONTRACTS.CONTRACTSSEARCH' || permission2 === 'CONTRACTS.CONTRACTSSEARCH') {
            permission2Exists = true;
        }

        assert.ok(permission1 !== permission2);
        assert.ok(permission1Exists && permission2Exists);

        done();
    });

});
