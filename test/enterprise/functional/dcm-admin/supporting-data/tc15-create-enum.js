var config = require('nconf');
config.file({file: './test/lib/config.json'});

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var wd = require('wd');
var asserters = wd.asserters;

var url = config.get("url");
var username = config.get("username");
var password = config.get("password");

var common = require('../../../../lib/common');

var c = common.rand(3);
console.log('c: ' + c);

var enumId = 'E' + c;

describe("/dcm-admin/supporting-data/tc15-create-enum", function() {
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

    it("should login", function (done) {
        common.login(browser, url, username, password).nodeify(done);
    });

    it("should load dcm admin page", function(done) {
        browser
            .frame()
            .frame('navbar')
            .elementById('DCM Admin').click()
            .nodeify(done);
    });

    it("should load supporting data page", function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('SupportingData_sub').click()
            .nodeify(done);
    });

    it("should load search enum page", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementByCss("button[title='Search Course']").click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .sleep(500)
            .elementByLinkText('Search Enums').click()
            .nodeify(done);
    });

    it("should create new enum", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementById('Button_EnumManager_Enums_Main_CreateEnum').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementById('Id').type(enumId)
            .elementByCss('button[name=Entries_add]').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementById('Entries_Name_0').type('E1')
            .elementById('Entries_Value_0').type('value 1')
            .execute('scrollTo(0, 3000)')
            .elementByCss('button[name=Entries_add]').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementById('Entries_Name_0').type('E2')
            .elementById('Entries_Value_0').type('value 2')
            .execute('scrollTo(0, 3000)')
            .elementByCss('button[name=Entries_add]').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementById('Entries_Name_0').type('E3')
            .elementById('Entries_Value_0').type('value 3')
            .elementById('validate').click()
            .elementById('save').click()
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementByCss('table[name=Grid_EnumManager_Enums_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(enumId.toUpperCase())
            .notify(done);
    });

    it("should logout", function(done) {
        common.logout(browser)
            .elementByCss('form[name=LoginForm] input[name=LOGINNAME]').text()
            .should.eventually.become('')
            .notify(done);
    });
});
