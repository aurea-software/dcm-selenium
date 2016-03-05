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

var c = common.rand(3);
console.log('c: ' + c);

var enumId = 'E' + c;
var subsetId = 'S' + c;

var namePrefix = 'N' + c;
var valuePrefix = 'V' + c;

var name1 = namePrefix + '1';
var value1 = valuePrefix + '1';

var name2 = namePrefix + '2';
var value2 = valuePrefix + '2';

var name3 = namePrefix + '3';
var value3 = valuePrefix + '3';

// The test case desc requires 2 values for the enum subset. Because the order of UI element is not fixed,
// we create an enum with just 1 value so that there is no 'order' to worry about.
// Notice that looping thru UI elements to find the correct enum values makes the code very hard to maintain.

describe("/dcm-admin/supporting-data/tc16-create-subset", function() {
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

    it("should load search enum page", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementByCss("button[title='Search Course']").click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .sleep(500)
            .elementByLinkText('Search Enums').click()
            .nodeify(done);
    });

    it("should create new enum", function(done) {
        common.createEnum(browser, 'cacheframe1', enumId, name1, value1, name2, value2, name3, value3).nodeify(done);
    });

    it("should search for enum", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementById('Field_EnumManager_Enums_Main_ID_Search_Value').type(enumId)
            .elementByLinkText('Search').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementByCss('table[name=Grid_EnumManager_Enums_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(enumId.toUpperCase())
            .notify(done);
    });

    it("should create subset", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementById('Button_EnumManager_Enums_Main_CreateSubset').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementById('Id').type(subsetId)
            .execute('scrollTo(0, 3000)')
            // Default to subitem 1
            .elementByCss('#DefEntry0 > label.panel-checkbox-label > i').click()
            .execute('scrollTo(0, 3000)')
            // Include subitem 1
            .elementByCss('#IsEnable0 > label.panel-checkbox-label > i').click()
            // Include subitem 2
            .elementByCss('#IsEnable1 > label.panel-checkbox-label > i').click()
            .elementById('validate').click()
            .elementById('save').click()
            .elementById('save').click()
            .nodeify(done);
    });

    // The menu item 'subsets' is not displayed after creating an enum.
    // The test case desc requires to click this menu item. Skip it for now
    // as it is not necessary.

    it("should load search enum subset page", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementByCss("button[title='Search Enums']").click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .sleep(500)
            .elementByLinkText('Search Enum Subsets').click()
            .nodeify(done);
    });

    it("should search enum subset", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementById('Field_EnumManager_Enums_Main_Subset_ID_Search_Value').type(subsetId)
            .elementByLinkText('Search').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            // The order is not fixed, so we validate by the prefix only
            .elementByCss('table[name=Grid_Enums_Subsets_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.become(subsetId.toUpperCase())
            .elementByCss('table[name=Grid_Enums_Subsets_Main] tbody tr:nth-child(1) td:nth-child(2)').text()
            .should.eventually.include(namePrefix.toUpperCase())
            .notify(done);
    });

    it("should display enum subset entries", function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Tab_Enums_Subset_Main_Entries_link').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .frame('component_iframe')
            .elementByCss('table[name=Grid_Enums_Subset_Entries] tbody tr:nth-child(1) td:nth-child(1)').text()
            .should.eventually.include(namePrefix.toUpperCase())
            .elementByCss('table[name=Grid_Enums_Subset_Entries] tbody tr:nth-child(2) td:nth-child(1)').text()
            .should.eventually.include(namePrefix.toUpperCase())
            .notify(done);
    });
});
