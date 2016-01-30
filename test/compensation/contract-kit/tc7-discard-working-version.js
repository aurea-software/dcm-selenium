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

var index = common.rand(3);

var index1 = common.rand(3);
var index2 = '' + (parseInt(index1, 10) + 1);

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

    it("should load compensation setup page", function(done) {
        browser.frame('navbar').elementById('Compensation Setup').click().nodeify(done);
    });

    it("should load contract kit page", function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Contracts_sub').click()
            .nodeify(done);
    });

    it("should create contract kit 1", function(done) {
        common.createContractKit(browser, name1, desc1).nodeify(done);
    });

    it("should create contract kit 2", function(done) {
        common.createContractKit(browser, name2, desc2).nodeify(done);
    });
    
    it("should search by name prefix", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementById('Field_Contracts_Main_Name_Search_Value').type(namePrefix + "*")
            .elementByLinkText('Search').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
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
            .frame('cacheframe1')
            .frame('proppage')
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementByLinkText('Search').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementByCss('table[name=Grid_Contracts_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.include(name2.toUpperCase())
            .notify(done);
    });
    
    // No need to test step 5 / 6 as we already verify the Production status after creating the two contract kits above.
});
