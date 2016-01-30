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
    
    it("should search by name1", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementById('Field_Contracts_Main_Name_Search_Value').type(name1)
            .elementByLinkText('Search').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
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
        browser.elementByCss('table[name=Grid_Contracts_Main] tbody tr:nth-child(1) td:nth-child(2)').text().then(function(data) {
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
            .frame('cacheframe1')
            .frame('subpage')
            .elementByLinkText('Working Version').click()
            .elementByLinkText('Search').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
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
            .frame('cacheframe1')
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
