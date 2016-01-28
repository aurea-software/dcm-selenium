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

var common = require('../../lib/common');

// Test case desc requires fixed input values. We add some dynamic factor
// to make sure that the test data is really ours.
var uniqueString = ' - ' + common.rand(3);

describe("/compensation/contract-kit/tc4-create-contract-kit", function() {
    this.timeout(60000);
    var browser;

    before(function (done) {
        browser = wd.promiseChainRemote(config.get("remote"));
        common.configBrowser(browser, config.get("environment")).nodeify(done);
    });

    after(function (done) {
        browser.quit().nodeify(done);
    });

    it("should login", function (done) {
        common.login(browser, url, username, password).nodeify(done);
    });

    it("should load compensation setup page", function(done) {
        browser.frame('navbar').elementById('Compensation Setup').click().nodeify(done);
    });

    it("should load contract kit page", function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Contracts_sub').click()
            .nodeify(done);
    });

    it("should create contract kit", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementById('Button_Contracts_Main_NewContractKit').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementById('Name').type('LifeContractKit' + uniqueString)
            .elementById('Description').type('Contract kit' + uniqueString)
            .elementById('validate').click()
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Inspector_Contracts_Main_BasicInfo_div_out').text()
            .should.eventually.include('LifeContractKit' + uniqueString)
            .should.eventually.include('Contract kit' + uniqueString)
            .should.eventually.include('Working Version')
            .notify(done);
    });

    it("should edit contract kit", function(done) {
        browser
            .elementById('Button_Contracts_Main_BasicInfo_EditContractKit').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementById('Description').type('Contract kit for life insurance' + uniqueString)
            .elementById('validate').click()
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Inspector_Contracts_Main_BasicInfo_div_out').text()
            .should.eventually.include('Contract kit for life insurance' + uniqueString)
            .should.eventually.include('Working Version')
            .notify(done);
    });
});
