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

var r1 = common.rand(6);
console.log('r1: ' + r1);

var ckpTaxId = r1;
var ckpName = 'CKP_' + r1;
var ckpPartyId;

var prodHierName = 'PRODHIER_' + r1;
var prodHierDesc = 'PRODHIER_DESC' + r1;

var index = common.rand(3);

var c = common.rand(3);
var index1 = c + '1';
var index2 = c + '2';

console.log('index: ' + index);
console.log('index1: ' + index1);
console.log('index2: ' + index2);

var namePrefix = 'LifeContractKit' + index;
var name1 = namePrefix + index1;
var name2 = namePrefix + index2;

var descPrefix = 'LifeContractKitDesc' + index;
var desc1 = descPrefix + index1;
var desc2 = descPrefix + index2;

describe("/compensation/contract-kit/tc6-search-contract-kit", function() {
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

    it("should create contract kit 1", function(done) {
        common.createContractKit(browser, 'cacheframe3', name1, desc1, '01/01/2000', '01/01/2300', prodHierName, ckpName, ckpPartyId).nodeify(done);
    });

    it("should create contract kit 2", function(done) {
        common.createContractKit(browser, 'cacheframe3', name2, desc2, '01/01/2000', '01/01/2300', prodHierName, ckpName, ckpPartyId).nodeify(done);
    });

    it("should search by name1", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe3')
            .frame('subpage')
            .elementById('Field_Contracts_Main_Name_Search_Value').type(name1)
            .elementByLinkText('Search').click()
            .frame()
            .frame('container')
            .frame('cacheframe3')
            .frame('subpage')
            .elementByCss('table[name=Grid_Contracts_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.include(name1.toUpperCase())
            .notify(done);
    });

    var startDate;

    var storeStartDate = function(data) {
        startDate = data;
    };

    it('should extract start date', function(done) {
        browser.elementByCss('table[name=Grid_Contracts_Main] tbody tr:nth-child(1) td:nth-child(2)').text()
        .then(function(data) {
            storeStartDate(data);
        }).nodeify(done);
    });

    it('should clear search input 1', function(done) {
        browser
            .elementByLinkText('Clear').click()
            .elementById('Field_Contracts_Main_Name_Search_Value').getAttribute('value')
            .should.eventually.become('')
            .notify(done);
    });

    it('should search by product status', function(done) {
        browser
            .elementByLinkText('Advanced Search').click()
            // In test environment, we could have MANY records sharing the same product status.
            // Hence, we search by BOTH the product status and the name to limit the result
            // to what we have created.
            .elementByCss('#Search_Contracts_Main_form #Field_Contracts_Main_Name_Search_Value').type(name2)
            .elementByCss('button[data-id=Field_Contracts_Main_Search_ProdStatus_Search_Value]').click()
            .frame()
            .frame('container')
            .frame('cacheframe3')
            .frame('subpage')
            .sleep(500)
            .elementByLinkText('Working Version').click()
            .elementByLinkText('Search').click()
            .frame()
            .frame('container')
            .frame('cacheframe3')
            .frame('subpage')
            .elementByCss('table[name=Grid_Contracts_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.include(name2.toUpperCase())
            .notify(done);
    });

    it('should clear search input 2', function(done) {
        browser
            .elementByLinkText('Clear').click()
            .elementByCss('#Search_Contracts_Main_form #Field_Contracts_Main_Name_Search_Value').getAttribute('value')
            .should.eventually.become('')
            .notify(done);
    });

    it('should search by start date', function(done) {
        browser
            // In test environment, we could have MANY records sharing the same start date.
            // Hence, we search by BOTH the product status and the name prefix to limit the result
            // to what we have created.
            .elementByCss('#Search_Contracts_Main_form #Field_Contracts_Main_Name_Search_Value').type(namePrefix + "*")
            .elementByCss('#Search_Contracts_Main_form #Field_Contracts_Main_Search_StartDate_Search_Value').type(startDate)
            .elementByLinkText('Search').click()
            .frame()
            .frame('container')
            .frame('cacheframe3')
            .frame('subpage')
            .waitForElementByCss('table[name=Grid_Contracts_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.include(name1.toUpperCase())
            .elementByCss('table[name=Grid_Contracts_Main] tbody tr:nth-child(2) td:nth-child(1)').text()
            .should.eventually.include(name2.toUpperCase())
            .notify(done);
    });

    it('should clear search input 3', function(done) {
        browser
            .elementByLinkText('Clear').click()
            .elementByCss('#Search_Contracts_Main_form #Field_Contracts_Main_Name_Search_Value').getAttribute('value')
            .should.eventually.become('')
            .notify(done);
    });

    // [DCM Recording] > Contract Kit Part 2 > TC6 (Search Contract Kits) > Step 5 and 6 look incorrect.
    // Step 5 clicks Advanced Search but we are already in Advanced Search mode. Step 6 is a menu navigation,
    // which has no meaning in verifying the dcm business logic.
});
