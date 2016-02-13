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

describe("/user-manager/tc1-create-agreement-group", function() {
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
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementById('Button_UserManager_Groups_Main_CreateGroup').click()
            .nodeify(done);
    });

    it("should create group", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            // Group  name can only contain upper case characters
            .elementById('Name').type(groupName.toUpperCase())
            .elementById('validate').click()
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementByCss('table[name=Grid_UserManager_Groups_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(groupName.toUpperCase())
            .notify(done);
    });
});
