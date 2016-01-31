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

// Test case desc requires fixed input values. We add some dynamic factor
// to make sure that the test data is really ours.
var uniqueString = common.rand(3);

var name = 'CK Name' + uniqueString;
var desc = 'CK Desc' + uniqueString;

var moment = require('moment');

describe("/compensation/contract-kit/tc7-create-edit-quota", function() {
    this.timeout(60000);
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
        browser.frame('navbar').elementById('Compensation Setup').click().nodeify(done);
    });

    it("should load contract kit page", function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Contracts_sub').click()
            .nodeify(done);
    });

    it("should create contract kit", function(done) {
        common.createContractKit(browser, 'cacheframe1', name, desc, '01/01/2000', '01/01/2300').nodeify(done);
    });
    
    it("should create quota", function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Tab_Contracts_Main_Quotas_link').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Button_Contracts_Main_Quotas_NewQuota').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementById('Name').type('Quota1 ' + uniqueString)
            .elementById('Description').type('Quota Desc ' + uniqueString)
            .execute('scrollTo(0, 6000)')
            .elementByCss('button[data-id=MeasureFormulaString]').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementByLinkText('allocation.getWeight()').click()
            .elementById('MeasureDescription').type('Alloc Get Weight')
            .elementById('validate').click()
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Grid_Contracts_Main_Quotas').text()
            .should.eventually.include('QUOTA1 ' + uniqueString)
            .notify(done);
    });
    
    var newStartDate;
    
    var processStartDate = function(data) {
        newStartDate = moment(data, 'mm/dd/yyyy').add(4, 'months').format('L');
    };
    
    it('should extract start date', function(done) {
        browser.elementByCss('table[name=Grid_Contracts_Main_Quotas] tbody tr:nth-child(1) td:nth-child(3)').text().then(function(data) {
            processStartDate(data);
        }).nodeify(done);
    });
    
    it('should edit quota', function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Button_Contracts_Main_Quotas_EditQuota').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementById('DurQuantity').clear().type('2')
            .elementById('Periods').clear().type('2')
            .elementById('validate').click()
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Grid_Contracts_Main_Quotas').text()
            .should.eventually.include(newStartDate)
            .notify(done);
    });
});
