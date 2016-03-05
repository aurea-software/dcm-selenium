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

var taxId = common.rand(4);
var firstName = 'FN' + taxId;
var lastName = 'LN' + taxId;
var middleName = 'MN' + taxId;
var preferredName = 'PN' + taxId;
var city = 'C' + taxId;
var dtcc = taxId;
var npn = taxId;
var stateName = 'Arizona';
var newNumber = '9';
var newString = 'New';

console.log('taxId: ' + taxId);

var clientId = 'CI' + taxId;
var clientName = 'CN' + taxId;

describe("/party/client/tc1-create-client", function() {
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
        browser
            .frame()
            .frame('navbar')
            .elementById('Party').click()
            .nodeify(done);
    });

    it("should create person party", function(done) {
        common.createPersonParty(browser, 'cacheframe0', taxId, firstName, lastName, middleName, preferredName, city, stateName, dtcc, npn).nodeify(done);
    });

    it("should load create client page", function(done) {
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
            .sleep(1000)
            .elementByLinkText('Search Client').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementById('Button_Client_Main_NewClient').click()
            .nodeify(done);
    });

    it("should create client", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementById('ClientID').type(clientId)
            .elementById('ClientName').type(clientName)
            .elementById('searchPage_Party_Picker_search_div').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .frame('Page_Party_Picker_search_div_frame')
            .elementById('Field_Person_Picker_FirstName_Search_Value').type(firstName)
            .elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .frame('Page_Party_Picker_search_div_frame')
            .elementById('Button_Select').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementById('validate').click()
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('table[name=Grid_Client_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(clientId.toUpperCase())
            .elementByCss('table[name=Grid_Client_Main] tbody tr:nth-child(1) td:nth-child(2)').text()
            .should.eventually.become(clientName.toUpperCase())
            .notify(done);
    });

    // Step 12 and 13 look incorrect. We are already in 'Search Client' page.

    it("should create client", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementById('Field_Client_Main_ClientName_Search_Value').type(clientName)
            .elementByLinkText('Search').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('table[name=Grid_Client_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(clientId.toUpperCase())
            .elementByCss('table[name=Grid_Client_Main] tbody tr:nth-child(1) td:nth-child(2)').text()
            .should.eventually.become(clientName.toUpperCase())
            .notify(done);
    });
});
