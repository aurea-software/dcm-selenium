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

var common = require('../lib/common');
var r1 = common.rand(2);
var name1 = 'SECOND_HIERARCHY' + r1;
console.log('1st Party Hierarchy: ' + name1);

var r2 = common.rand(2);
var name2 = 'FIRST_HIERARCHY' + r2;
console.log('2nd Party Hierarchy: ' + name2);

describe("Test Case 2 - Search party hierarchy", function() {
  this.timeout(30000);
    var browser;
    
    before(function (done) {
      browser = wd.promiseChainRemote(config.get("remote"));
      common.configBrowser(browser, config.get("environment")).nodeify(done);
    });
   
    after(function (done) {
      browser
        .quit()
        .nodeify(done);
    });
   
    it("should login", function (done) {
      common.login(browser, url, username, password).nodeify(done);
    });
	
	it("should load party hierarchy page", function(done) {
      browser
        .frame('navbar')
        .elementById('Hierarchy').click()
        .nodeify(done);
    });

	it("should create 1st party hierarchy", function(done) {
      common.createPartyHierarchy(browser, name1).nodeify(done);
    });
	
	it("should create 2nd party hierarchy", function(done) {
      common.createPartyHierarchy(browser, name2).nodeify(done);
    });
	
	it("should search 1st party hierarchy by name with wildcard", function(done) {
		browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
			.elementByCss('#Search_HierarchySearch_Main_primaryForm #Field_Hierarchy_Name_Search_Value').type('SECOND_HIERARCHY*')
			.elementByLinkText('Search').click()
			.elementById('Grid_HierarchySearch_Main').text()
			.should.eventually.include(name1)
            .notify(done);
    });
	
	it("should clear text in hierarchy name field", function(done) {
		browser
			.frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
			.elementByLinkText('Clear').click()
			.elementByCss('#Search_HierarchySearch_Main_primaryForm #Field_Hierarchy_Name_Search_Value').text()
            .should.eventually.become('')
            .notify(done);
    });
	
	it("should perform advanced search based on Hierarchy Type and 2nd Hierarchy Name", function(done) {
		browser
			.frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
			.elementByLinkText('Advanced Search').click()
            .elementByCss('#Search_HierarchySearch_Main_form #Field_Hierarchy_Name_Search_Value').clear().type(name2)
            .elementByCss('button[data-id=Field_Hierarchy_Type_Search_Value]').click()
			.frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByLinkText('Org Hierarchy').click()
			.elementByLinkText('Search').click()
			.elementById('Grid_HierarchySearch_Main').text()
			.should.eventually.include(name2)
            .notify(done);
    });
	
	it("should clear text in advanced search", function(done) {
		browser
			.elementByLinkText('Clear').click()
			.elementByCss('#Search_HierarchySearch_Main_primaryForm #Field_Hierarchy_Name_Search_Value').text()
            .should.eventually.become('')
            .notify(done);
    });

	it("should sort both hierarchies created in descending order", function(done) {
		var v = browser
            .refresh()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
			.elementByLinkText('Advanced Search').click()
			.elementByCss('#Search_HierarchySearch_Main_form #Field_Hierarchy_Name_Search_Value').type('*_HIERARCHY*')
			.frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
			.elementByCss('button[data-id=SortField1_order]').click()
			.frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByLinkText('Descending').click()
			.elementByLinkText('Search').click();
			
			v.waitForElementByCss('table[name=Grid_HierarchySearch_Main] tbody tr:nth-child(0) td:nth-child(3)').text()
				.should.eventually.become(name2)
            v.waitForElementByCss('table[name=Grid_HierarchySearch_Main] tbody tr:nth-child(1) td:nth-child(3)').text()
				.should.eventually.become(name1)
				.notify(done);
    });
});
	
	