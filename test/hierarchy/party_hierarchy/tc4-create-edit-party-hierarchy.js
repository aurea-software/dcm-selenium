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
var randNum = common.rand(5);

describe("/hierarchy/party_hierarchy/tc4-create-edit-party-hierarchy", function() {
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

	it("should load party hierarchy page", function(done) {
	    browser
            .frame()
            .frame('navbar')
            .elementById('Hierarchy').click()
            .nodeify(done);
    });

	it("should load create party hierarchy page", function(done) {
	    browser
            .frame()
            .frame('container')
    		.frame('cacheframe0')
            .frame('subpage')
            .elementById('Button_HierarchySearch_NewHierarchy').click()
    		.nodeify(done);
    });

	it("should create party hierarchy", function(done) {
	    browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementById('Name').type('PartyHier' + randNum)
            .elementById('Description').type('Test Org Hierarchy')
            .elementById('validate').click()
    		.elementById('save').click()
    		.frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
    		.elementById('Grid_HierarchySearch_Main').text()
            .should.eventually.include('PARTYHIER' + randNum)
            .notify(done);
    });

	it("should edit party hierarchy", function(done) {
	    browser
    		.frame()
            .frame('container')
    		.frame('cacheframe0')
            .frame('subpage')
            .elementById('Button_HierarchySearch_EditHierarchy').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
    		.elementById('Description').type('')
            .elementById('Description').type('Test Org Hierarchy New')
            .elementById('validate').click()
    		.elementById('save').click()
    		.frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
    		.elementById('Grid_HierarchySearch_Main').text()
            .should.eventually.include('TEST ORG HIERARCHY NEW')
            .notify(done);
    });
});

