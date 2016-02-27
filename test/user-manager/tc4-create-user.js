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
describe("/user-manager/tc4-create-user", function() {
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
        common.createSimpleUser(browser, 'cacheframe1', user)
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementByCss('table[name=Grid_UserManager_Users_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(user.toUpperCase())
            .notify(done);
    });

});
