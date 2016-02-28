var config = require('nconf');
config.file({file: './test/lib/config.json'});

var assert = require("chai").assert;

var wd = require('wd');
var asserters = wd.asserters;

var url = config.get("url");
var username = config.get("username");
var password = config.get("password");

var common = require('../../lib/common');

var taxId = common.rand(4);
console.log('taxId: ' + taxId);

var result = {};

result.workAddressQty = 0;
result.residenceAddressQty = 0;
result.workIndex = -1;
result.residenceIndex = -1;
result.textData = '';
result.usageIndex = -1;

describe("/party/person/tc5-add-edit-contact-info", function() {
    this.timeout(90000);
    var browser;

    var assertAddressDisabled = function(data) {
        assert.ok(data.indexOf(' disabled ') > -1);
    };

    var assertAddressValue = function(data) {
        result.textData = data;
        assert.ok(data.indexOf('Work Address') > -1 || data.indexOf('Residence Address') > -1);

        if (data.indexOf('Work Address') > -1) {
            ++result.workAddressQty;
        }

        if (data.indexOf('Residence Address') > -1) {
            ++result.residenceAddressQty;
        }
    };

    var onData = function(data) {
        result.textData = data;
    };

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
        browser
            .frame()
            .frame('navbar')
            .elementById('Party').click()
            .nodeify(done);
    });

    it("should create person party", function(done) {
        common.createPersonParty(browser, 'cacheframe0', taxId, 'FN' + taxId, 'LN' + taxId, 'MN' + taxId, 'PN' + taxId, 'C' + taxId, 'California', taxId, taxId)
            .nodeify(done);
    });

    it("should create and edit basic info", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementById('Field_Person_Main_TaxID_Search_Value').type(taxId)
            .elementByLinkText('Search').click()
            .frame()
            .frame('sidebar')
            .elementById('Tab_Person_Main_ContactPoints_link').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Button_Person_Main_ContactPoint_Create').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementByCssSelector('button[data-id=ContactType]').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .sleep(500)
            .elementByLinkText('Work Address').click()
            .elementById('Address.Street1').type('Street123')
            .elementById('Address.City').type('City123')
            .elementByCssSelector('button[data-id=US_State]').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .sleep(500)
            .elementByLinkText('California').click()
            .elementById('ZipCode').type('123')
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Button_Person_Main_ContactPoint_Edit').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementById('Address.Street1').clear().type('abc')
            .elementById('Address.City').clear().type('abc')
            .elementByCssSelector('button[data-id=US_State]').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .sleep(500)
            .elementByLinkText('Florida').click()
            .elementById('validate').click()
            .elementById('save').click()
            .nodeify(done);
    });

    it("should get contact type 0", function(done) {
        browser.frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Button_Person_Main_ContactPoint_CreateEditMultipleContactPoints').click()
            // The order of contact points don't seem to be consistent! Sometimes
            // Residence Address appears before Work Address, sometimes the order is
            // reversed.
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementByCssSelector('button[data-id=AllContactPointsCreate_ContactType_0]').text()
            .then(function(data) {
                onData(data);
            }).nodeify(done);
    });

    it("should verify contact type 0", function(done) {
        assert.ok(result.textData.indexOf('Residence Address') > -1 || result.textData.indexOf('Work Address') > -1);

        if (result.textData.indexOf('Residence Address') > -1) {
            result.workIndex = 1;
        } else {
            result.workIndex = 0;
        }

        result.residenceIndex = 1 - result.workIndex;

        done();
    });

    it("should get contact type 1", function(done) {
        browser.elementByCssSelector('button[data-id=AllContactPointsCreate_ContactType_1]').text().then(function(data) {
            onData(data);
        }).nodeify(done);
    });

    it("should verify contact type 1", function(done) {
        if (result.workIndex == 0) {
            assert.ok(result.textData.indexOf('Residence Address') > -1);
        } else {
            assert.ok(result.textData.indexOf('Work Address') > -1);
        }

        done();
    });

    var editContactPoint = function(instance, index, usageType, startDate, endDate) {
        // Do not clear the street
        return instance.elementById('AllContactPointsCreate_Address.Street1_' + index).type('New')
            .elementByCssSelector('button[data-id=AllContactPointsCreate_UsageType_' + index + ']').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .sleep(500)
            .elementByLinkText(usageType).click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementById('AllContactPointsCreate_UsageStartDate_' + index).clear().type(startDate)
            .elementById('AllContactPointsCreate_UsageEndDate_' + index).clear().type(endDate);
    }

    it("should edit multi contact points", function(done) {
        // Due to the inconsistency of the order between the work address and the residence address, we are not sure which address comes first.
        // Hence, we process from top down.
        var instance;

        if (result.workIndex == 0) {
            instance = editContactPoint(browser, result.workIndex, 'PRIMARY', '01/01/2015', '01/01/2030');
            instance = editContactPoint(instance, result.residenceIndex, 'MAILING', '01/01/2015', '01/01/2030');
        } else {
            instance = editContactPoint(browser, result.residenceIndex, 'MAILING', '01/01/2015', '01/01/2030');
            instance = editContactPoint(instance, result.workIndex, 'PRIMARY', '01/01/2015', '01/01/2030');
        }

        instance.elementByName('AllContactPoints_add').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementByCssSelector('button[data-id=AllContactPointsCreate_ContactType_0]').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .sleep(500)
            .elementByLinkText('Work Address').click()
            .elementByCssSelector('button[data-id=AllContactPointsCreate_CommMode_0]').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .sleep(500)
            .elementByLinkText('Mailing').click()
            .elementById('AllContactPointsCreate_Address.Street1_0').clear().type('s1')
            .elementById('AllContactPointsCreate_Address.City_0').clear().type('c1')
            .elementById('AllContactPointsCreate_Address.ZipCode_0').clear().type('111')
            // Test case description requires the usage type to be MAILING. We
            // change to LICENSINGINFO to avoid the error on overlapping periods of
            // two MAILING contact points.
            .elementByCssSelector('button[data-id=AllContactPointsCreate_UsageType_0]').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .sleep(500)
            .elementByLinkText('LICENSINGINFO').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementById('AllContactPointsCreate_UsageStartDate_0').clear().type('01/01/2015')
            .elementById('AllContactPointsCreate_UsageEndDate_0').clear().type('01/01/2030')
            .elementById('save').click()
            .nodeify(done);
    });

    it("should assert disabled addresses", function(done) {
        browser.frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Button_Person_Main_ContactPoint_ViewMultipleContactPoints').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            // Verify that we have 3 contact points, and they are not editable.
            // Notice that the order is not consistent (looks like error).
            .elementByCssSelector('button[data-id=AllContactPointsView_ContactType_0]')
            .getAttribute('class').then(assertAddressDisabled)
            .elementByCssSelector('button[data-id=AllContactPointsView_ContactType_0]')
            .text().then(assertAddressValue)
            .elementByCssSelector('button[data-id=AllContactPointsView_ContactType_1]')
            .getAttribute('class').then(assertAddressDisabled)
            .elementByCssSelector('button[data-id=AllContactPointsView_ContactType_1]')
            .text().then(assertAddressValue)
            .elementByCssSelector('button[data-id=AllContactPointsView_ContactType_2]')
            .getAttribute('class').then(assertAddressDisabled)
            .elementByCssSelector('button[data-id=AllContactPointsView_ContactType_2]')
            .text().then(assertAddressValue)
            .nodeify(done);
    });

    it("should open contact point usages", function(done) {
        assert.equal(result.residenceAddressQty, 1);
        assert.equal(result.workAddressQty, 2);

        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementById('cancel').click()
            .frame()
            .frame('sidebar')
            .elementById('Tab_Person_Main_ContactPoints_Main_ContactPointUsages_link').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .frame('component_iframe')
            // Edit Usage button
            .elementById('Button_Person_Main_ContactPointUsage').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .nodeify(done);
    });

    it("should try contact point usage 1", function(done) {
        browser.elementByCssSelector('button[data-id=Usages_UsageType_0]').text().then(function(data) {
            if (data.indexOf('Mailing') > -1) {
                result.usageIndex = 0;
            }
        }).nodeify(done);
    });

    it("should try contact point usage 2", function(done) {
        browser.elementByCssSelector('button[data-id=Usages_UsageType_1]').text().then(function(data) {
            if (data.indexOf('Mailing') > -1) {
                result.usageIndex = 1;
            }
        }).nodeify(done);
    });

    it("should try contact point usage 3", function(done) {
        browser.elementByCssSelector('button[data-id=Usages_UsageType_2]').text().then(function(data) {
            if (data.indexOf('Mailing') > -1) {
                result.usageIndex = 2;
            }
        }).nodeify(done);
    });

    it("should edit contact point usages", function(done) {
        browser.elementByCssSelector('button[data-id=Usages_UsageType_' + result.usageIndex + ']').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementByLinkText('Settlement').click()
            .nodeify(done);
    });

    it("should save contact usages", function(done) {
        browser.elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Grid_Person_Main_ContactPointUsages_Main_div').text().then(function(data) {
                onData(data);
            }).nodeify(done);
    });

    it("should verify contact usages", function(done) {
        assert.ok(result.textData.indexOf('LICENSING INFORMATION') > -1);
        assert.ok(result.textData.indexOf('PRIMARY') > -1);
        assert.ok(result.textData.indexOf('SETTLEMENT') > -1);

        done();
    });
});
