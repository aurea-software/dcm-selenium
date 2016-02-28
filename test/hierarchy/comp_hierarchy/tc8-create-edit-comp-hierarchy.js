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

var ckpTaxId = r1;
var ckpName = 'CKP_' + r1;
var ckpPartyId;

var prodHierName = 'PH_' + r1;
var prodHierDesc = prodHierName + 'DESC';

var ckName = 'CONTRACTKIT_' + r1;
var ckDesc = 'CONTRACTKITDESC_' + r1;

var compHierName = 'COMPHIER_' + r1;
var compHierDesc = 'COMPHIERDESC_' + r1;

var compHierNameNew = compHierName + 'NEW';
var compHierDescNew = compHierDesc + 'NEW';

console.log('Contract kit name: ' + ckName + ', Contract kit compHierDescNewdescripton: ' + ckDesc);
console.log('Compensation Hierarchy name: ' + compHierName + ', Compensation Hierarchy descripton: ' + compHierDesc)
console.log('New Compensation Hierarchy name: ' + compHierNameNew + ', New Compensation Hierarchy descripton: ' + compHierDescNew)

describe("/hierarchy/comp_hierarchy/tc8-create-edit-comp-hierarchy", function() {
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

    it("should load party page", function(done) {
        browser.frame().frame('navbar').elementById('Party').click().nodeify(done);
    });

    var storeCkpId = function(ckpId) {
        ckpPartyId = ckpId;
    };

    it('should create contract kit provider', function(done) {
        common.createContractKitProvider(browser, 'cacheframe0', ckpName, ckpTaxId)
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('table[name=Grid_Org_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
            .then(function(data) {
                storeCkpId(data);
            })
            .nodeify(done);
    });

    it("should load hierarchy tab", function(done) {
        browser.frame().frame('navbar').elementById('Hierarchy').click().nodeify(done);
    });

    it("should load product hierarchy page", function(done) {
        browser.frame().frame('sidebar').elementById('ProductHierarchySearch_sub').click().nodeify(done);
    });

    it("should create product hierarchy", function(done) {
        common.createProductHierarchy(browser, 'cacheframe2', prodHierName, prodHierDesc).nodeify(done);
    });

    it("should load compensation setup page", function(done) {
        browser.frame().frame('navbar').elementById('Compensation Setup').click().nodeify(done);
    });

    it("should create contract kit", function(done) {
        common.createContractKit(browser, 'cacheframe3', ckName, ckDesc, '01/01/2000', '01/01/2300', prodHierName, ckpName, ckpPartyId).nodeify(done);
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
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('subpage')
            .elementById('Button_HierarchySearch_NewAgrHierarchy').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('proppage')
            .elementById('Name').type(compHierName)
            .elementById('Description').type(compHierDesc)
            .nodeify(done);
    });

    it("should search and add contract kit to the comp hierarchy", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('proppage')
            .elementById('searchContractKitSearchPage_search_div').click()
            .frame('ContractKitSearchPage_search_div_frame')
            .elementById('Field_ContractKit_Name_Search_Value').type(ckName)
            .elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
            .execute('scrollTo(0,6000)')
            .elementById('Grid_ContractKit').text()
            .should.eventually.include(ckName)
            .should.eventually.include(ckDesc)
            .notify(done);
    });

    it("should create and verify comp hierarchy details", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('proppage')
            .frame('ContractKitSearchPage_search_div_frame')
            .elementById('Button_ContractKitSearch_PP_Select').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('proppage')
            .elementById('validate').click()
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
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
            .frame('cacheframe4')
            .frame('subpage')
            .elementByLinkText('Edit Hierarchy Details').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('proppage')
            .elementById('Name').clear().type(compHierNameNew)
            .elementById('Description').clear().type(compHierDescNew)
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('subpage')
            .elementById('Grid_AgrHierarchySearch_Main').text()
            .should.eventually.include(compHierNameNew)
            .should.eventually.include(compHierDescNew)
            .should.eventually.include(ckName)
            .notify(done);
    });

});