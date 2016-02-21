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

var r1 = common.rand(4);

var PersonTaxId = common.rand(6);
var firstName1 = 'FIRST_NAME_' + r1;
var lastName1 = 'LAST_NAME_' + r1;

var CKPTaxId = common.rand(6);
var CKPName = 'CKP_' + r1;
var CKPPartyId;

var ProdHierName = 'PRODHIER_' + r1;
var ProdHierDesc = 'PRODHIER_DESC' + r1;

var CKname = 'CONTRACT_KIT' + r1;
var CKdesc = 'CONTRACTKIT_DESC' + r1;

var compHierName = 'COMP_HIER_' + r1;
var compHierDesc = 'COMPHIERDESC_' + r1;

var agreementName = 'AGR_' + r1;
var agreementDesc = 'AGRDESC_' + r1;

var RootPositionName = 'ROOT_POSITION_' + r1;
var RootPositionDesc = 'ROOT_POSITION DESC_' + r1;

describe("/hierarchy/comp-hierarchy/tc9-create-root-position", function() {
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

	it("should load party page", function(done) {
		browser.frame('navbar').elementById('Party').click().nodeify(done);
    });

	it('should create person party ', function(done) {
        common.createPersonParty(browser, PersonTaxId, firstName1, lastName1, 'MIDDLE_NAME', 'PREFERRED_NAME', 'CITY', 'Alaska', '1234', '123456').nodeify(done);
    });

	var CKPId1 = function(ckpid) {
        CKPPartyId = ckpid;
    };

	it('should create contract kit provider', function(done) {
        browser
			.refresh()
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
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementById('Button_Org_Main_NewOrg').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementById('Party.Name').type(CKPName)
            .elementById('Party.TaxID').type(CKPTaxId)
            .elementByCss('button[data-id=SyncPDB]').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementByLinkText('No').click()
			.execute('scrollTo(0, 6000)')
            .elementByCss('input[id=RoleFINANCIAL_SERVICES] ~ i').click()
            .elementById('ContactPoint.Address.Street1').type('street1')
            .elementById('ContactPoint.Address.City').type('city1')
            .elementByCss('button[data-id=US_State]').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementById('ZipCode').type('4444')
            .elementById('validate').click()
            .elementById('save').click()
			.frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
			.elementByCss('table[name=Grid_Org_Main] tbody tr:nth-child(1) td:nth-child(1)').text().then(function(data) {
                CKPId1(data);
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
       common.createProductHierarchy(browser, 'cacheframe2', wd.SPECIAL_KEYS['Enter'], ProdHierName, ProdHierDesc).nodeify(done);
    });

	it("should load compensation tab", function(done) {
        browser.frame().frame('navbar').elementById('Compensation Setup').click().nodeify(done);
    });

	it("should load Contract kit page", function(done) {
       browser.frame().frame('sidebar').elementById('Contracts_sub').click().nodeify(done);
    });

    it("should create contract kit", function(done) {
        common.createContractKitWithHierAndCKP(browser, 'cacheframe4', CKname, CKdesc, '01/01/2016', '01/01/2300', ProdHierName, CKPName, CKPPartyId).nodeify(done);
    });

	it("should checkin contract kit", function(done) {
		browser
			.frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('subpage')
            .elementById('Button_Contracts_Main_ContractKitCheckIn').click()
            .frame()
            .frame('container')
            .frame('cacheframe4')
            .frame('proppage')
            .elementById('save').click()
			.nodeify(done);
	});

	it("should load agreement tab", function(done) {
        browser.frame().frame('sidebar').elementById('Agreement_sub').click().nodeify(done);
    });

	it("should create agreement", function(done) {
		common.createAgreementWithPerson(browser, wd.SPECIAL_KEYS['Enter'], 'cacheframe5', agreementName, agreementDesc, CKname, '01/01/2016', '01/01/2300', firstName1).nodeify(done);
    });

	it("should load hierarchy tab", function(done) {
      browser
		.frame()
		.frame('navbar')
		.elementById('Hierarchy').click()
		.nodeify(done);
    });

	it("should load comp hierarchy tab", function(done) {
      browser
		.frame()
		.frame('sidebar')
		.elementById('AgrHierarchySearch_sub').click()
		.nodeify(done);
    });

	it("should create comp hierarchy", function(done) {
      common.createCompHierarchy(browser, 'cacheframe6', compHierName , compHierDesc, CKname).nodeify(done);
    });

	it("should add position holder (participant)", function(done) {
		 browser
			.frame()
			.frame('sidebar')
			.elementById('Tab_AgrHierarchySearch_RootPosition_Main_link').click()
			.frame()
			.frame('container')
			.frame('cacheframe6')
			.frame('subpage')
			.frame('component_iframe')
			.elementById('Button_AddAgrHierRootPosition').click()
			.frame()
            .frame('container')
            .frame('cacheframe6')
            .frame('proppage')
            .execute('scrollTo(0, 6000)')
			.elementById('searchParticipantSearchPage_search_div').click()
			.frame('ParticipantSearchPage_search_div_frame')
			.elementById('Field_Party_Person_FirstName_Search_Value').type(firstName1)
			.elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
			.elementById('Grid_Participant').text()
			.should.eventually.include(firstName1 + ' ' + lastName1)
			.notify(done);
    });

	it("should create root position", function(done) {
		browser
			.frame()
            .frame('container')
            .frame('cacheframe6')
            .frame('proppage')
			.frame('ParticipantSearchPage_search_div_frame')
			.elementById('Grid_Participant_GridName').click()
			.elementById('Button_ParticipantSearch_PP_Select').type(wd.SPECIAL_KEYS['Enter'])
			.frame()
            .frame('container')
            .frame('cacheframe6')
            .frame('proppage')
			.elementById('Name').clear().type(RootPositionName)
			.elementById('Description').clear().type(RootPositionDesc)
			.elementById('save').click()
			.frame()
            .frame('container')
            .frame('cacheframe6')
            .frame('subpage')
			.frame('component_iframe')
			.elementById('Grid_AgrRootPosition_Main').text()
			.should.eventually.include(compHierName)
			.should.eventually.include(RootPositionName)
			.notify(done);
		});
});