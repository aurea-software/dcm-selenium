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

var r1 = common.rand(3);
var taxId1 = common.rand(6);
var firstName1 = 'FN' + taxId1;
var lastName1 = 'LN' + taxId1;
var middleName1 = 'MN' + r1;
var preferredName1 = 'PN' + r1;
var city1 = 'C' + r1;
var dtcc1 = 'D' + r1;
var npn1 = 'N' + r1;
var rootPositionForPerson = 'ROOT POS FOR PERSON' + r1;

var r2 = common.rand(3);
var taxId2 = common.rand(6);
var partyName2 = 'ORG' + taxId2;
var city2 = 'C' + r2;
var dtcc2 = 'D' + r2;
var npn2 = 'N' + r2;
var rootPositionForOrg = 'ROOT POS FOR ORG' + r2;
var stateName = 'Arizona';

var r3 = common.rand(3);
var hiername = 'PARTY_HIERARCHY_' + r3;

console.log('Person party: Tax Id: ' + taxId1 + ', First Name: ' + firstName1  + ', Last Name: ' + lastName1);
console.log('Organization party: Tax Id: ' + taxId2 + ', Organization Name: ' + partyName2);
console.log('Party Hierarchy name: ' + hiername);

describe("/hierarchy/party_hierarchy/tc7-create-root-position-person-org", function() {
    this.timeout(90000);
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
        browser
            .frame()
            .frame('navbar')
            .elementById('Party').click()
            .nodeify(done);
    });

    it('should create person party ', function(done) {
        common.createPersonParty(browser, 'cacheframe0', taxId1, firstName1, lastName1, middleName1, preferredName1, city1, stateName, dtcc1, npn1).nodeify(done);
    });

    it("should load organization party page", function(done) {
        browser
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByCss('#Search_Person_Main_primary_display_div button').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementByLinkText('Search Organization').click()
            .nodeify(done);
    });

    it('should create organization party', function(done) {
        common.createOrganizationParty(browser, 'cacheframe0', taxId2, partyName2, dtcc2, npn2, city2, stateName).nodeify(done);
    });

    it("should load party hierarchy page", function(done) {
        browser
            .frame()
            .frame('navbar')
            .elementById('Hierarchy').click()
            .nodeify(done);
    });

    it("should create party hierarchy", function(done) {
        common.createPartyHierarchy(browser, 'cacheframe1', hiername, hiername + ' Description').nodeify(done);
    });

    it("should search party hierarchy by name", function(done) {
        browser
            .frame()
            .frame('navbar')
            .elementById('Hierarchy').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .elementByCss('#Search_HierarchySearch_Main_primaryForm #Field_Hierarchy_Name_Search_Value').type(hiername)
            .elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
            .elementById('Grid_HierarchySearch_Main').text()
            .should.eventually.include(hiername)
            .notify(done);
    });

    it("should add person party as root position", function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Tab_HierarchySearch_RootPosition_Main_link').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Button_AddRootPosition').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementById('Name').clear().type(rootPositionForPerson)
            .elementById('Description').type('DESC ' + rootPositionForPerson)
            .execute('scrollTo(0, 6000)')
            .elementById('searchPartySearchPage_search_div').click()
            .frame('PartySearchPage_search_div_frame')
            .elementById('Field_Party_Person_FirstName_Search_Value').type(firstName1)
            .elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
            .elementById('Grid_Party').text()
            .should.eventually.include(firstName1 + ' ' + lastName1)
            .elementById('Grid_Party_GridName').click()
            .elementById('Button_PartySearch_PP_Select').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementByCss('span.picker-field-textParty_GID').text()
            .should.eventually.include(firstName1 + ' ' + lastName1)
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Grid_RootPosition_Main').text()
            .should.eventually.include(hiername)
            .should.eventually.include(rootPositionForPerson)
            .notify(done);
    });

    it("should add organization party as root position", function(done) {
        browser
            .frame()
            .frame('sidebar')
            .elementById('Tab_HierarchySearch_RootPosition_Main_link').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Button_AddRootPosition').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementById('Name').clear().type(rootPositionForOrg)
            .elementById('Description').clear().type('DESC ' + rootPositionForOrg)
            .execute('scrollTo(0, 6000)')
            .elementById('searchPartySearchPage_search_div').click()
            .frame('PartySearchPage_search_div_frame')
            .elementByCss('#Search_Party_form > div.preset-query-header > label:nth-child(3) > i').click()
            .elementById('Field_Party_Organization_NameUpper_Search_Value').type(partyName2)
            .elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
            .elementById('Grid_Party').text()
            .should.eventually.include(partyName2)
            .elementById('Grid_Party_GridName').click()
            .elementById('Button_PartySearch_PP_Select').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('proppage')
            .elementByCss('span.picker-field-textParty_GID').text()
            .should.eventually.include(partyName2)
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe1')
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Grid_RootPosition_Main').text()
            .should.eventually.include(hiername)
            .should.eventually.include(rootPositionForOrg)
            .notify(done);
    });
});