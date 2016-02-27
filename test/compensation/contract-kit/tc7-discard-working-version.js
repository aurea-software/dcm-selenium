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

describe("/compensation/contract-kit/tc7-discard-working-version", function() {
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

    it("should load contract kit page", function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Contracts_sub').click()
            .nodeify(done);
    });

    it("should create contract kit 1", function(done) {
        common.createContractKit(browser, 'cacheframe4', name1, desc1, '01/01/2000', '01/01/2300', prodHierName, ckpName, ckpPartyId).nodeify(done);
    });

    it("should create contract kit 2", function(done) {
        common.createContractKit(browser, 'cacheframe4', name2, desc2, '01/01/2000', '01/01/2300', prodHierName, ckpName, ckpPartyId).nodeify(done);
    });

    it("should search by name prefix", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('subpage')
            .elementById('Field_Contracts_Main_Name_Search_Value').type(namePrefix + "*")
            .elementByLinkText('Search').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('subpage')
            .elementByCss('table[name=Grid_Contracts_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.include(name1.toUpperCase())
            .elementByCss('table[name=Grid_Contracts_Main] tbody tr:nth-child(2) td:nth-child(1)').text()
            .should.eventually.include(name2.toUpperCase())
            .elementByCss('table[name=Grid_Contracts_Main] tbody tr:nth-child(1) td:nth-child(5)').text()
            .should.eventually.include('WORKING VERSION')
            .elementByCss('table[name=Grid_Contracts_Main] tbody tr:nth-child(2) td:nth-child(5)').text()
            .should.eventually.include('WORKING VERSION')
            .notify(done);
    });

    // [DCM Recording] > Contract Kit Part 2 > TC7 (Discard Working Version) looks incorrect..
    // the whole test case description has nothing to do with the test case title 'Discard Working Version'.
    // Moreover, step 2 can't go to step 3. But if we insert a step between step 2 and step 3
    // to click 'Discard Working Version' button then the whole test case becomes correct.
    it('should discard working version', function(done) {
        browser
            .elementByCss('table[name=Grid_Contracts_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
            .elementById('Button_Contracts_Main_ContractKitRevert').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('proppage')
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('subpage')
            .elementByLinkText('Search').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('subpage')
            .elementByCss('table[name=Grid_Contracts_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.include(name2.toUpperCase())
            .notify(done);
    });

    // No need to test step 5 / 6 as we already verify the Production status after creating the two contract kits above.
});
