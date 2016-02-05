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

var c = common.rand(3);
console.log('c: ' + c);

var templateName = 'T' + c;
var templateDesc = templateName + 'Desc';
var templateDescNew = templateDesc + 'New';

describe("/dcm-admin/supporting-data/tc14-create-party-template", function() {
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
        .frame('navbar')
        .elementById('Party').click()
        .nodeify(done);
    });
    
    it("should create person party", function(done) {
        common.createPersonParty(browser, taxId, firstName, lastName, middleName, preferredName, city, stateName, dtcc, npn).nodeify(done);
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
    
    it("should load search template page", function(done) {
    	browser
			.frame()
			.frame('container')
			.frame('cacheframe2')
			.frame('subpage')
			.elementByCss("button[title='Search Course']").click()
			.frame()
			.frame('container')
			.frame('cacheframe2')
			.frame('subpage')
			.elementByLinkText('Search Party Template').click()
			.nodeify(done);
    });
    
    it("should create new template", function(done) {
      	browser
	        .frame()
	        .frame('container')
	        .frame('cacheframe2')
	        .frame('subpage')
	        .elementById('Button_Rules_Party_Person_NewTemplate').click()
	        .frame()
	        .frame('container')
	        .frame('cacheframe2')
	        .frame('proppage')
	        .elementById('Name').type(templateName)
	        .elementById('Description').type(templateDesc)
	        .elementById('searchPersonPartySearch_search_div').click()
	        .frame()
	        .frame('container')
	        .frame('cacheframe2')
	        .frame('proppage')
	        .frame('PersonPartySearch_search_div_frame')
	        .elementById('Field_Person_FirstName_Search_Value').type(firstName)
	        .elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
	        .elementById('Button_PartySearch_PP_Select').type(wd.SPECIAL_KEYS['Enter'])
	        .frame()
	        .frame('container')
	        .frame('cacheframe2')
	        .frame('proppage')
	        // Overridable Properties - Suffix
	        .elementByCss('#ppBody > div > div:nth-child(3) > div > div > table > tbody > tr:nth-child(1) > td:nth-child(1) > label > i').click()
	        .elementById('validate').click()
	        .elementById('save').click()
	        .frame()
	        .frame('container')
	        .frame('cacheframe2')
	        .frame('subpage')
	        .elementByCss('table[name=Grid_Rules_Party_PersonTemplate] tbody tr:nth-child(1) td:nth-child(1)').text()
	        .should.eventually.become(templateName.toUpperCase())
	        .elementByCss('table[name=Grid_Rules_Party_PersonTemplate] tbody tr:nth-child(1) td:nth-child(2)').text()
	        .should.eventually.become(templateDesc.toUpperCase())
	        .nodeify(done);
    });
    
    it("should edit template", function(done) {
      	browser
	        .frame()
	        .frame('container')
	        .frame('cacheframe2')
	        .frame('subpage')
	        .elementById('Button_Rules_Party_Person_EditTemplate').click()
	        .frame()
	        .frame('container')
	        .frame('cacheframe2')
	        .frame('proppage')
	        .elementById('Description').clear().type(templateDescNew)
	        .elementById('validate').click()
	        .elementById('save').click()
	        .frame()
	        .frame('container')
	        .frame('cacheframe2')
	        .frame('subpage')
	        .elementByCss('table[name=Grid_Rules_Party_PersonTemplate] tbody tr:nth-child(1) td:nth-child(2)').text()
	        .should.eventually.become(templateDescNew.toUpperCase())
	        .nodeify(done);
    });
});
