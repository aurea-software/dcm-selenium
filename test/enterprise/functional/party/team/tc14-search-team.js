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

var prefix = common.rand(4);
var d = common.rand(3);
var dtcc1 = d + '1';
var dtcc2 = d + '2';
console.log('prefix: ' + prefix);
console.log('dtcc1: ' + dtcc1);
console.log('dtcc2: ' + dtcc2);

var namePrefix = 'T' + prefix;
var name1 = namePrefix + dtcc1;
var name2 = namePrefix + dtcc2;

var desc1 = name1 + 'Desc';
var desc2 = name2 + 'Desc';

describe("/party/team/tc14-search-team", function() {
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

    it("should load party page", function(done) {
        browser.frame()
            .frame('navbar')
            .elementById('Party').click()
            .nodeify(done);
    });

    it("should load team page", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('#Search_Person_Main_primary_display_div button').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByLinkText('Search Team').click()
            .nodeify(done);
    });

    it("should create team party 1", function(done) {
        common.createTeam(browser, 'cacheframe0', name1, desc1, dtcc1).nodeify(done);
    });

    it("should create team party 2", function(done) {
        common.createTeam(browser, 'cacheframe0', name2, desc2, dtcc2).nodeify(done);
    });

    it("should search team 1 by name", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementById('Field_Team_Main_Name_Search_Value').type(name1)
            .type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('table[name=Grid_Team_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(name1.toUpperCase())
            .notify(done);
    });

    it("should load advanced search form", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByLinkText('Advanced Search').click()
            .nodeify(done);
    });

    it("should search team 2 by dtcc", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('#Search_Team_Main_form #Field_Team_Main_Name_Search_Value').type(namePrefix + "*")
            .elementByCss('#Search_Team_Main_form #Field_Team_Main_DTCCID_Search_Value').type(dtcc2)
            .type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('table[name=Grid_Team_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(name2.toUpperCase())
            .notify(done);
    });

    it('should clear search fields', function(done) {
        browser
            .elementByLinkText('Clear').click()
            .elementByCss('#Search_Team_Main_form #Field_Team_Main_Name_Search_Value').getAttribute('value')
            .should.eventually.become('')
            .elementByCss('#Search_Team_Main_form #Field_Team_Main_DTCCID_Search_Value').getAttribute('value')
            .should.eventually.become('')
            .notify(done);
    });

    it("should sort by team id", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('#Search_Team_Main_form #Field_Team_Main_Name_Search_Value').type(namePrefix + "*")
            .elementByCss('#Search_Team_Main_form button[data-id=SortField1]').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .sleep(500)
            .elementByLinkText('Team ID').click()
            .elementByCss('#Search_Team_Main_form button[data-id=SortField1_order]').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .sleep(500)
            .elementByLinkText('Descending').click()
            .elementByCss('#Search_Team_Main_form #Field_Team_Main_Name_Search_Value')
            .type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('table[name=Grid_Team_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(name2.toUpperCase())
            .elementByCss('table[name=Grid_Team_Main] tbody tr:nth-child(2) td:nth-child(1)').text()
            .should.eventually.become(name1.toUpperCase())
            .notify(done);
    });

    it("should logout", function(done) {
        common.logout(browser)
            .elementByCss('form[name=LoginForm] input[name=LOGINNAME]').text()
            .should.eventually.become('')
            .notify(done);
    });
});
