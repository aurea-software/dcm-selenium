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

var dtcc = common.rand(4);
console.log('dtcc: ' + dtcc);

var name = 'L' + dtcc;
var desc = name + 'Desc';
var nameNew = name + 'New';

describe("/party/team/tc13-create-team", function() {
    this.timeout(90000);
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
        browser
            .frame()
            .frame('navbar')
            .elementById('Party').click()
            .nodeify(done);
    });

    it("should load create team page", function(done) {
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
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementById('Button_Team_Main_NewTeam').click()
            .nodeify(done);
    });

    it("should create team party", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementById('Party.Name').type(name)
            .elementById('Party.Description').type(desc)
            .elementById('validate').click()
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('table[name=Grid_Team_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(name.toUpperCase())
            .notify(done);
    });

    // Step 4 looks incorrect. We are already in the Party page.
    // Step 5 looks incorrect. The button to click should be Edit Team.

    it("should edit team party", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementById('Button_Team_Main_EditTeam').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementById('Party.Name').clear().type(nameNew)
            .elementById('DTCCID').type(dtcc)
            .execute('scrollTo(0, 10000)')
            .elementByCss('button[data-id=NewStatus\\.StatusCode]').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .sleep(500)
            .elementByLinkText('Terminated').click()
            .elementById('validate').click()
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('table[name=Grid_Team_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(nameNew.toUpperCase())
            .notify(done);
    });

    // Step 7 looks incorrect / redundant
});
