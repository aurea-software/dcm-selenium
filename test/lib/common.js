var wd = require('wd');
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
  return {
    rand : function(length) {
        var result = '';
        for (var i = 0; i < length; i++) {
        	// Avoid the digit 0 as we might need to parse the result back to int
        	// and perform some mathematical operations on it, which may result in
        	// a string having a smaller length if the original string starts with 0.
            result += [1,2,3,4,5,6,7,8,9][Math.floor(Math.random()*9)];
        }
        return result;
    },

    configBrowser : function(browser, environment) {
        // optional extra logging
        browser.on('status', function(info) {
            console.log(info);
        });

        browser.on('command', function(meth, path, data) {
            console.log(' > ' + meth, path, data || '');
        });

        return browser.init(environment);
    },

    login : function(browser, url, username, password) {
        return browser
            .get(url)
            .elementByCss('form[name=LoginForm] input[name=LOGINNAME]').type(username)
            .elementByCss('form[name=LoginForm] input[name=PASSWORD]').type(password)
            .elementByCss('form[name=LoginForm] button[type=submit]').click();
    },

    loginToUserManager : function(browser, url, username, password) {
        return browser
            .get(url)
            .elementByCss('form[name=LoginForm] input[name=LOGINNAME]').type(username)
            .elementByCss('form[name=LoginForm] input[name=PASSWORD]').type(password)
            .elementByCss('form[name=LoginForm] button[data-id=APPGROUP]').type(wd.SPECIAL_KEYS['Enter'])
            .sleep(100)
            .elementByCss('form[name=LoginForm] ul > li:nth-child(2) > a').click()
            .elementByCss('form[name=LoginForm] button[type=submit]').click();
    },

    // FIXME cache frame names are not fixed in DCM. It should be passed in as a parameter. Otherwise, using the fixed value
    // cacheframe0 would require to create a person party in the 1st step in each test case.
    createPersonParty : function(browser, taxId, firstName, lastName, middleName, preferredName, city, stateName, dtcc, npn) {
        return browser
            .refresh()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementById('Button_Person_Main_NewPerson').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementById('Party.Salutation').type('Mr')
            .elementById('Party.FirstName').type(firstName)
            .elementById('Party.PreferredName').type(preferredName)
            .elementById('Party.MiddleName').type(middleName)
            .elementById('Party.LastName').type(lastName)
            .elementById('Party.BirthDate').type('01/01/1970')
            .elementById('DTCCID').type(dtcc)
            .elementById('Party.NPN').type(npn)
            .elementByCss('button[data-id=SyncPDB]').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementByLinkText('No').click()
            .elementById('Party.TaxID').type(taxId)
            .elementByCss('input[id=RoleEMPLOYEE] ~ i').click()
            .elementByCss('input[id=RoleDISTRIBUTOR] ~ i').click()
            .elementById('ContactPoint.Address.Street1').type('Street 1')
            .elementById('ContactPoint.Address.City').type(city)
            // We have to scroll down so that we can avoid the error 'Eleemnt is not clickable at this point. Another element would receive the click.'
            .execute('scrollTo(0,3000)')
            .elementByCss('button[data-id=US_State]').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementByLinkText(stateName).click()
            .elementById('ZipCode').type('4444')
            .elementById('save').click();
    },

    // FIXME cache frame names are not fixed in DCM. It should be passed in as a parameter. Otherwise, using the fixed value
    // cacheframe0 would require to create an organization party in the 1st step in each test case.
    createOrganizationParty : function(browser, taxId, partyName, dtcc, npn, city, stateName) {
        return browser
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
            .elementById('Party.Name').type(partyName)
            .elementById('Party.TaxID').type(taxId)
            .elementByCss('button[data-id=SyncPDB]').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementByLinkText('No').click()
            .elementById('DTCCID').type(dtcc)
            .elementById('Party.NPN').type(npn)
			//FIXME: checkbox seletion was failing in some cases
			.execute('scrollTo(0, 3000)')
            .elementByCss('input[id=RoleAPPOINTINGCOMPANY] ~ i').click()
            .elementByCss('input[id=RoleEMPLOYER] ~ i').click()
            .elementByCss('input[id=RoleDISTRIBUTOR] ~ i').click()
            .elementById('ContactPoint.Address.Street1').type('st1')
            .elementById('ContactPoint.Address.City').type(city)
            .elementByCss('button[data-id=US_State]').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementByLinkText(stateName).click()
            .elementById('ZipCode').type('4444')
            .elementById('validate').click()
            .elementById('save').click();
    },

    // Deprecated. This method will fail if the db is clean - no hiearchy, no provider.
    // Should use createContractKitWithHierAndCKP instead.
    createContractKit : function(browser, cacheFrameName, name, description, startDate, endDate) {
        return browser
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('subpage')
            .elementById('Button_Contracts_Main_NewContractKit').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementById('Name').type(name)
            .elementById('Description').type(description)
            .elementById('StartDate').clear().type(startDate)
            .elementById('EndDate').clear().type(endDate)
            .elementById('validate').click()
            .elementById('save').click();
    },

    // Deprecated. This method will fail if the db is clean - no hiearchy, no provider.
    // Should use createContractKitWithHierAndCKPInProductionStatus instead.
	createContractKitInProductionStatus : function(browser, cacheFrameName, name, description, startDate, endDate) {
        return this.createContractKit(browser, cacheFrameName, name, description, startDate, endDate)
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('subpage')
            .elementById('Button_Contracts_Main_ContractKitCheckIn').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementById('save').click();
    },

	//FIXME: Added cacheFrameName and enterKey parameters
	createPartyHierarchy : function(browser, cacheFrameName, enterKey, hiername) {
		return browser
			.frame()
			.frame('container')
			.frame(cacheFrameName)
			.frame('subpage')
			.elementById('Button_HierarchySearch_NewHierarchy').type(enterKey)
			.frame()
			.frame('container')
			.frame(cacheFrameName)
			.frame('proppage')
			.elementById('Name').type(hiername)
			.elementById('Description').type('Description ' + hiername)
			.elementById('save').click()
    },

    createAgreementWithPerson : function(browser, enterKey, cacheFrameName, agreementName, agreementDesc, contractName, startDate, endDate, personFirstName) {
        return browser
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('subpage')
            .elementById('Button_Agreement_Main_NewAgreement').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementById('Name').type(agreementName)
            .elementById('Description').type(agreementDesc)
            .elementById('StartDate').clear().type(startDate)
            .elementById('EndDate').clear().type(endDate)
            .elementById('searchPartySearchPage_search_div').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .frame('PartySearchPage_search_div_frame')
            .elementById('Field_Party_Person_FirstName_Search_Value').type(personFirstName)
            .elementByLinkText('Search').type(enterKey)
            .elementById('Button_PartySearch_PP_Select').type(enterKey)
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementByCss('button[data-id=ContractKit]').type(enterKey)
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementByLinkText(contractName).click()
            .elementById('validate').click()
            .elementById('save').click();
    },

    createQuota: function(browser, cacheFrameName, name, desc) {
        return browser
            .frame()
            .frame('sidebar')
            .elementById('Tab_Contracts_Main_Quotas_link').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Button_Contracts_Main_Quotas_NewQuota').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementById('Name').type(name)
            .elementById('Description').type(desc)
            .execute('scrollTo(0, 6000)')
            .elementByCss('button[data-id=MeasureFormulaString]').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementByLinkText('allocation.getWeight()').click()
            .elementById('MeasureDescription').type('Alloc Get Weight')
            .elementById('validate').click()
            .elementById('save').click();
    },

    createComponent : function(browser, enterKey, cacheFrameName, name, desc, label, quotaName) {
        return browser
            .frame()
            .frame('sidebar')
            .elementById('Tab_Contracts_Main_Components_link').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Button_Contracts_Main_Components_NewComponent').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementById('Name').type(name)
            .elementById('Description').type(desc)
            .elementByCss('button[name=Labels_add]').click()
            .elementById('Labels_Value_0').type(label)
            .execute('scrollTo(0, 6000)')
            .elementByCss('button[name=Quotas_add]').click()
            .execute('scrollTo(0, 3000)')
            .elementById('complexField_QuotasSearch_search_div').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .frame('QuotasSearch_search_div_frame')
            .elementById('Field_Quotas_Search_Name_Search_Value').type(quotaName)
            .elementByLinkText('Search').type(enterKey)
            .elementById('QuotasSearchButton_PP_Select').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementById('validate').click()
            .elementById('save').click();
    },

    createCourse : function(browser, cacheFrameName, name, stateSpecificValue) {
        return browser
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('subpage')
            .elementById('Button_CourseManagement_Main_New').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementById('Name').type(name)
            // This is not really necessary as the default value is already Yes
            .elementByCss('button[data-id=StateSpecific]').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementByLinkText(stateSpecificValue).click()
            .execute('scrollTo(0, 6000)')
            .elementByCss('button[name=CourseSources_add]').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementByCss('button[data-id=CourseSources_Source_0]').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementByLinkText('Pearson Professional Centers').click()
            .elementById('validate').click()
            .elementById('save').click();
    },

	createPartyHierarchyRootPosition : function(browser, cacheFrameName, enterKey, firstname1, rootPosition, rootPositionDesc) {
        return browser
            .frame()
            .frame('sidebar')
            .elementById('Tab_HierarchySearch_RootPosition_Main_link').click()
			.frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('subpage')
			.frame('component_iframe')
			.elementById('Button_AddRootPosition').click()
			.frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
			.elementById('Name').clear().type(rootPosition)
			.elementById('Description').type(rootPositionDesc)
			.elementById('searchPartySearchPage_search_div').click()
			.frame('PartySearchPage_search_div_frame')
			.elementById('Field_Party_Person_FirstName_Search_Value').type(firstname1)
			.elementByLinkText('Search').type(enterKey)
			.elementById('Grid_Party_GridName').click()
			.elementById('Button_PartySearch_PP_Select').type(enterKey)
			.frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
			.elementById('save').click();
    },

	createProductHierarchy : function(browser, cacheFrameName, enterKey, hiername, hierdesc) {
		return browser
			.frame()
			.frame('container')
			.frame(cacheFrameName)
			.frame('subpage')
			.execute('scrollTo(0,2000)')
			.elementById('Button_ProductHierarchySearch_ProductHierarchy_NewProductHierarchy').type(enterKey)
			.frame()
			.frame('container')
			.frame(cacheFrameName)
			.frame('proppage')
			.elementById('Name').type(hiername)
			.elementById('Description').type(hierdesc)
			.frame()
			.frame('container')
			.frame(cacheFrameName)
			.frame('proppage')
			.elementById('validate').click()
			.elementById('save').click()
    },

	createCompHierarchy : function(browser, cacheFrameName, hiername, hierdesc, CKname) {
		return browser
			.frame()
			.frame('container')
			.frame(cacheFrameName)
			.frame('subpage')
			.execute('scrollTo(0,2000)')
			.elementById('Button_HierarchySearch_NewAgrHierarchy').type(wd.SPECIAL_KEYS['Enter'])
			.frame()
			.frame('container')
			.frame(cacheFrameName)
			.frame('proppage')
			.elementById('Name').type(hiername)
			.elementById('Description').type(hierdesc)
			.elementById('searchContractKitSearchPage_search_div').click()
			.frame('ContractKitSearchPage_search_div_frame')
			.elementById('Field_ContractKit_Name_Search_Value').type(CKname)
			.elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
			.execute('scrollTo(0,2000)')
			.sleep(1000)
			.elementById('Button_ContractKitSearch_PP_Select').click()
			.frame()
			.frame('container')
			.frame(cacheFrameName)
			.frame('proppage')
			.elementById('validate').click()
			.elementById('save').click()
    },

	createContractKitWithHierAndCKP : function(browser, cacheFrameName, name, description, startDate, endDate, prodhier, CKP, CKPId) {
        return browser
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('subpage')
            .elementById('Button_Contracts_Main_NewContractKit').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementById('Name').type(name)
            .elementById('Description').type(description)
            .elementById('StartDate').clear().type(startDate)
            .elementById('EndDate').clear().type(endDate)
			.frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
			.elementByCss('form[name=spartacus] button[data-id=Products]').type(wd.SPECIAL_KEYS['Enter'])
			.sleep(500)
			.elementByLinkText(prodhier).click()
			.elementByCss('form[name=spartacus] button[data-id=Party]').type(wd.SPECIAL_KEYS['Enter'])
			.sleep(500)
			.elementByLinkText(CKP + ' [Party ID: ' + CKPId + ']').click()
            .elementById('validate').click()
            .elementById('save').click();
	},

	createContractKitWithHierAndCKPInProductionStatus : function(browser, cacheFrameName, name, description, startDate, endDate, prodhier, CKP, CKPId) {
        return this.createContractKitWithHierAndCKP(browser, cacheFrameName, name, description, startDate, endDate, prodhier, CKP, CKPId)
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('subpage')
            .elementById('Button_Contracts_Main_ContractKitCheckIn').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementById('save').click();
    },

    createContractKitProviderDirectly : function(browser, cacheFrameName, name, taxId) {
        return browser
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('subpage')
            .elementById('Button_Org_Main_NewOrg').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementById('Party.Name').type(name)
            .elementById('Party.TaxID').type(taxId)
            .elementByCss('button[data-id=SyncPDB]').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementByLinkText('No').click()
            .execute('scrollTo(0, 3000)')
            .elementByCss('input[id=RoleFINANCIAL_SERVICES] ~ i').click()
            .elementById('ContactPoint.Address.Street1').type('street1')
            .elementById('ContactPoint.Address.City').type('city1')
            .elementByCss('button[data-id=US_State]').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementById('ZipCode').type('4444')
            .elementById('validate').click()
            .elementById('save').click();
    },

	createContractKitProvider : function(browser, cacheFrameName, name, taxId) {
        return browser
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('subpage')
            .elementByCss('#Search_Person_Main_primary_display_div button').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('subpage')
            .elementByLinkText('Search Organization').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('subpage')
            .elementById('Button_Org_Main_NewOrg').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementById('Party.Name').type(name)
            .elementById('Party.TaxID').type(taxId)
            .elementByCss('button[data-id=SyncPDB]').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementByLinkText('No').click()
            .execute('scrollTo(0, 3000)')
            .elementByCss('input[id=RoleFINANCIAL_SERVICES] ~ i').click()
            .elementById('ContactPoint.Address.Street1').type('street1')
            .elementById('ContactPoint.Address.City').type('city1')
            .elementByCss('button[data-id=US_State]').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementById('ZipCode').type('4444')
            .elementById('validate').click()
            .elementById('save').click();
	},

    createEnum : function(browser, cacheFrameName, enumId, name1, value1) {
        return browser
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('subpage')
            .elementById('Button_EnumManager_Enums_Main_CreateEnum').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementById('Id').type(enumId)
            .elementByCss('button[name=Entries_add]').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementById('Entries_Name_0').type(name1)
            .elementById('Entries_Value_0').type(value1)
            .elementById('validate').click()
            .elementById('save').click()
            .elementById('save').click();
    },

    createLocationParty : function(browser, cacheFrameName, locationName, locationId, locationDtcc, locationStreet, locationCity, locationZipCode, subType, orgPartyName) {
        return browser
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementById('Party.CurrentDetails.Name').type(locationName)
            .elementById('Unid').type(locationId)
            .elementByCss('button[data-id=Party\\.CurrentDetails\\.LocationType]').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementByLinkText('Area Office').click()
            .elementByCss('button[data-id=Party\\.CurrentDetails\\.LocationSubtype]').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementByLinkText(subType).click()
            .elementByCss('button[data-id=Party\\.CurrentDetails\\.OccupancyType]').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementByLinkText('Leased').click()
            .elementByCss('button[data-id=Party\\.CurrentDetails\\.Usage]').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementByLinkText('Securities').click()
            .elementById('DTCCID').type(locationDtcc)
            .execute('scrollTo(0, 6000)')
            .elementById('ContactPoint.Address.Street1').type(locationStreet)
            .elementById('ContactPoint.Address.City').type(locationCity)
            .elementById('ZipCode').type(locationZipCode)
            // Search for owning firm
            .elementById('searchOrgPartySearch_search_div').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .frame('OrgPartySearch_search_div_frame')
            .elementById('Field_Party_NameUpper_Search_Value').type(orgPartyName)
            .elementByLinkText('Search').click()
            .execute('scrollTo(0, 6000)')
            .elementById('Button_PartySearch_PP_Select').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementById('validate').click()
            .elementById('save').click();
    },

    closeLocationParty : function(browser, cacheFrameName) {
        return browser
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('subpage')
            .frame('component_iframe')
            .elementById('Button_Location_Main_BasicInfo_CloseLocation').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementByCss('button[data-id=NewStatus\\.StatusReason]').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementByLinkText('Registered Contact Left').click()
            .elementById('validate').click()
            .elementById('save').click()
            .elementById('save').click();
    },

    createTeam : function(browser, cacheFrameName, name, desc, dtcc) {
        return browser
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('subpage')
            .elementById('Button_Team_Main_NewTeam').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementById('Party.Name').type(name)
            .elementById('Party.Description').type(desc)
            .elementById('DTCCID').type(dtcc)
            .elementById('validate').click()
            .elementById('save').click();
    },

    createGroup : function(browser, cacheFrameName, groupName) {
        return browser
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            // Group  name can only contain upper case characters
            .elementById('Name').type(groupName.toUpperCase())
            .elementById('validate').click()
            .elementById('save').click();
    },

    addPermission : function(browser, cacheFrameName, permissionType, permissionName) {
        return browser
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementByCss('button[name=AllPermissions_add]').type(wd.SPECIAL_KEYS['Enter'])
            .elementByCss('button[data-id=GroupPermissions_PermissionType_0]').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .elementByLinkText(permissionType).click()
            .elementById('complexField_Page_ElementSearch_search_div').click()
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .frame('Page_ElementSearch_search_div_frame')
            .elementById('Field_ElementSearch_Search_ElementName_Search_Value').type(permissionName)
            .elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
            .frame()
            .frame('container')
            .frame(cacheFrameName)
            .frame('proppage')
            .frame('Page_ElementSearch_search_div_frame')
            .elementById('Button_ElementSearch_Select').type(wd.SPECIAL_KEYS['Enter']);
    },

    currentDateInString : function() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();

        if (dd < 10) {
            dd = '0' + dd;
        }

        if (mm < 10) {
            mm = '0' + mm;
        }

        return mm + '/' + dd + '/' + yyyy;
    }
  }
});