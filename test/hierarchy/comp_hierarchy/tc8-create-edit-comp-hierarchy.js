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

var r1 = common.rand(4);
var CKname = 'CONTRACTKIT_' + r1;
var CKdesc = 'CONTRACTKITDESC_' + r1;

var compHierName = 'COMPHIER_' + r1;
var compHierDesc = 'COMPHIERDESC_' + r1;

var compHierNameNew = compHierName + 'NEW';
var compHierDescNew = compHierDesc + 'NEW';

console.log('Contract kit name: ' + CKname + ', Contract kit compHierDescNewdescripton: ' + CKdesc);
console.log('Compensation Hierarchy name: ' + compHierName + ', Compensation Hierarchy descripton: ' + compHierDesc)
console.log('New Compensation Hierarchy name: ' + compHierNameNew + ', New Compensation Hierarchy descripton: ' + compHierDescNew)

describe("/hierarchy/comp-hierarchy/tc8-create-edit-comp-hierarchy", function() {
  this.timeout(100000);
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
       browser
		.frame('navbar')
		.elementById('Compensation Setup').click()
		.nodeify(done);
    });

    it("should load contract kit page", function(done) {
	   browser
		.frame()
		.frame('sidebar')
		.elementById('Contracts_sub').click()
		.nodeify(done);
    });

    it("should create contract kit", function(done) {
        common.createContractKit(browser, 'cacheframe1', CKname, CKdesc, '01/01/2016', '01/01/2300').nodeify(done);
    });
	
	it("should load comp hierarchy tab and create page", function(done) {
      browser
		.frame()
		.frame('navbar')
		.elementById('Hierarchy').click()
		.frame()
		.frame('sidebar')
		.elementById('AgrHierarchySearch_sub').click()
		.execute('scrollTo(0,2000)')
		.sleep(3000)
		.frame()
        .frame('container')
        .frame('cacheframe3')
        .frame('subpage')
		.elementById('Button_HierarchySearch_NewAgrHierarchy').type(wd.SPECIAL_KEYS['Enter'])
		.frame()
	    .frame('container')
	    .frame('cacheframe3')
	    .frame('proppage')
        .elementById('Name').type(compHierName)
        .elementById('Description').type(compHierDesc)
		.nodeify(done);
    });
	
	it("should search and add contract kit to the comp hierarchy", function(done) {
      browser
		.sleep(2000)
		.frame()
	    .frame('container')
	    .frame('cacheframe3')
	    .frame('proppage')
		.elementById('searchContractKitSearchPage_search_div').click()
		.frame('ContractKitSearchPage_search_div_frame')
		.elementById('Field_ContractKit_Name_Search_Value').type(CKname)
		.elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
		.execute('scrollTo(0,6000)')
		.elementById('Grid_ContractKit').text()
		.should.eventually.include(CKname)
		.should.eventually.include(CKdesc)
		.notify(done);			
    });
	
	it("should create and verify comp hierarchy details", function(done) {
      browser
	    .sleep(2000)
		.frame()
	    .frame('container')
	    .frame('cacheframe3')
	    .frame('proppage')
		.frame('ContractKitSearchPage_search_div_frame')
		.elementById('Button_ContractKitSearch_PP_Select').click()
		.frame()
	    .frame('container')
	    .frame('cacheframe3')
	    .frame('proppage')
		.elementById('validate').click()
		.elementById('save').click()	
		.frame()
        .frame('container')
        .frame('cacheframe3')		
        .frame('subpage')
		.elementById('Grid_AgrHierarchySearch_Main').text()
		.should.eventually.include(compHierName)
		.should.eventually.include(compHierDesc)
		.notify(done);			
    });
	
	it("should edit the comp hierarchy", function(done) {
      browser	
		.frame()
        .frame('container')
        .frame('cacheframe3')		
        .frame('subpage')
		.elementByLinkText('Edit Hierarchy Details').type(wd.SPECIAL_KEYS['Enter'])
		.frame()
	    .frame('container')
	    .frame('cacheframe3')
	    .frame('proppage')
        .elementById('Name').clear().type(compHierNameNew)
        .elementById('Description').clear().type(compHierDescNew)
		.elementById('save').click()
		.sleep(2000)
		.frame()
        .frame('container')
        .frame('cacheframe3')		
        .frame('subpage')
		.elementById('Grid_AgrHierarchySearch_Main').text()
		.should.eventually.include(compHierNameNew)
		.should.eventually.include(compHierDescNew)
		.should.eventually.include(CKname)	
        .notify(done);
    });
	
});