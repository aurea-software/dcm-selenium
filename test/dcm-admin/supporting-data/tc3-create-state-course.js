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

var c = common.rand(3);
console.log('c: ' + c);

var courseName = 'HealthPolicy' + c;

describe("/dcm-admin/supporting-data/tc3-create-state-course", function() {
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

    it("should create new course", function(done) {
      browser
        .frame()
        .frame('container')
        .frame('cacheframe1')
        .frame('subpage')
        .elementById('Button_CourseManagement_Main_New').click()
        .frame()
        .frame('container')
        .frame('cacheframe1')
        .frame('proppage')
        .elementById('Name').type(courseName)
        // This is not really necessary as the default value is already Yes
        .elementByCss('button[data-id=StateSpecific]').click()
        .frame()
        .frame('container')
        .frame('cacheframe1')
        .frame('proppage')
        .elementByLinkText('Yes').click()
        .elementByCss('button[name=StateReciprocities_add]').click()
        .frame()
        .frame('container')
        .frame('cacheframe1')
        .frame('proppage')
        .execute('scrollTo(0, 6000)')
        .elementByCss('button[name=CourseSources_add]').click()
        .frame()
        .frame('container')
        .frame('cacheframe1')
        .frame('proppage')
        .execute('scrollTo(0, 6000)')
        .elementByCss('button[data-id=CourseSources_Source_0]').click()
        .frame()
        .frame('container')
        .frame('cacheframe1')
        .frame('proppage')
        .elementByLinkText('Pearson Professional Centers').click()
        .elementById('validate').click()
        .elementById('save').click()
        .frame()
        .frame('sidebar')
        .elementById('Tab_CourseManagement_Main_CurrentData_link').click()
        .frame()
        .frame('container')
        .frame('cacheframe1')
        .frame('subpage')
        .elementByCss('table[name=Grid_CourseManagement_Main] tbody tr:nth-child(1) td:nth-child(2)').text()
        .should.eventually.become(courseName.toUpperCase())
        .frame()
        .frame('container')
        .frame('cacheframe1')
        .frame('subpage')
        .frame('component_iframe')
        .elementByCss('table[name=Grid_CourseManagement_CourseSource_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
        .should.eventually.become('PEARSON PROFESSIONAL CENTERS')
        .elementByCss('table[name=Grid_CourseManagement_CourseSource_Main] tbody tr:nth-child(1) td:nth-child(2)').text()
        .should.eventually.become('ALABAMA')
        .elementByCss('table[name=Grid_CourseManagement_CourseReciprocity_Main] tbody tr:nth-child(1) td:nth-child(1)').text()
        .should.eventually.become('ALABAMA')
        .nodeify(done);
    });
});
