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
console.log('r: ' + r);

// This is the login id, name, password, confirmed password and email id
var user = 'u' + r;

// Permissions - Contract kit, Agreement and Agreement Hierarchy
describe("/user-manager/tc9-add-permission-to-create-edit-contract-kit", function() {
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

    it("should add permissions", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Button_UserManager_Users_Main_AdditionalPermissions_EditPermissions').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementByCss('button[name=AllPermissions_add]').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementById('complexField_Page_ElementSearch_search_div').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .frame('Page_ElementSearch_search_div_frame')
            .elementById('Field_ElementSearch_Search_ElementName_Search_Value').type('ContractKitPropertyPage')
            .elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .frame('Page_ElementSearch_search_div_frame')
            .elementById('Button_ElementSearch_Select').type(wd.SPECIAL_KEYS['Enter'])
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
            .elementByCss('table[name=Grid_UserManager_Users_Main_AdditionalPermissions] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become('ContractKitPropertyPage'.toUpperCase())
            .notify(done);
    });

});
