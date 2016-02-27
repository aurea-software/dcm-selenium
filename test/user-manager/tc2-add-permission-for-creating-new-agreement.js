var config = require('nconf');
config.file({file: './test/lib/config.json'});

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

// Groups - Compensation setup
describe("/user-manager/tc2-add-permission-for-creating-new-agreement", function() {
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

    it("should add permission", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Button_UserManager_Groups_Main_AdditionalPermissions_EditPermissions').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementByCss('button[name=AllPermissions_add]').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .execute('scrollTo(0, 3000)')
            .elementByCss('button[data-id=GroupPermissions_PermissionType_0]').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            // #PermissionType0 > div > div > ul > li:nth-child(2) > a
            .elementByLinkText('Edit').click()
            .elementById('complexField_Page_ElementSearch_search_div').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .frame('Page_ElementSearch_search_div_frame')
            .elementById('Field_ElementSearch_Search_ElementName_Search_Value').type('NewAgreement')
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
            .elementByCss('table[name=Grid_UserManager_Groups_Main_AdditionalPermissions] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become('NEWAGREEMENT')
            .elementByCss('table[name=Grid_UserManager_Groups_Main_AdditionalPermissions] tbody tr:nth-child(1) td:nth-child(2)').text()
            .should.eventually.become('EDIT')
            .notify(done);
    });


});
