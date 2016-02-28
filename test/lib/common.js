var wd = require('wd');
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
    return {
        rand : function(length) {
            var result = '';
            for (var i = 0; i < length; i++) {
                result += Math.floor(Math.random()*9);
            }
            return result;
        },

        configBrowser : function(browser, environment) {
            browser.on('status', function(info) {
                console.log(info);
            });

            browser.on('command', function(meth, path, data) {
                console.log(' > ' + meth, path, data || '');
            });

            browser.setImplicitWaitTimeout(30000);
            browser.setAsyncScriptTimeout(30000);
            browser.setPageLoadTimeout(30000);

            return browser.init(environment);
        },

        login : function(browser, url, username, password) {
            return browser
                .get(url)
                .setWindowSize(1280, 687)
                .elementByCss('form[name=LoginForm] input[name=LOGINNAME]').type(username)
                .elementByCss('form[name=LoginForm] input[name=PASSWORD]').type(password)
                .elementByCss('form[name=LoginForm] button[type=submit]').click();
        },

        loginToUserManager : function(browser, url, username, password) {
            return browser
                .get(url)
                .setWindowSize(1280, 687)
                .elementByCss('form[name=LoginForm] input[name=LOGINNAME]').type(username)
                .elementByCss('form[name=LoginForm] input[name=PASSWORD]').type(password)
                .elementByCss('form[name=LoginForm] button[data-id=APPGROUP]').type(wd.SPECIAL_KEYS['Enter'])
                // Wait for the element to appear
                .sleep(100)
                .elementByCss('form[name=LoginForm] ul > li:nth-child(2) > a').click()
                .elementByCss('form[name=LoginForm] button[type=submit]').click();
        },

        logout : function(browser) {
            return browser
                .frame()
                .frame('navbar')
                // The 'Logout' link is hidden. User needs to hoover the cursor to show the link.
                // We change the CSS to make sure that the element is visible to click.
                // FIXME consider using moveTo() instead of modifying the CSS.
                .execute('document.querySelector(\'#session > div:nth-child(2)\').style.left = \'0%\';')
                // Wait for the element to slide in
                .sleep(500)
                .elementByCss('#session > div:nth-child(2) > a').type(wd.SPECIAL_KEYS['Enter']);
        },

        createPersonParty : function(browser, cacheFrameName, taxId, firstName, lastName, middleName, preferredName, city, stateName, dtcc, npn) {
            return browser
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
                .sleep(500)
                .elementByLinkText('No').click()
                .elementById('Party.TaxID').type(taxId)
                .execute('scrollTo(0, 6000)')
                .elementByCss('input[id=RoleEMPLOYEE] ~ i').click()
                .elementByCss('input[id=RoleDISTRIBUTOR] ~ i').click()
                .elementById('ContactPoint.Address.Street1').type('Street 1')
                .elementById('ContactPoint.Address.City').type(city)
                // We have to scroll down so that we can avoid the error 'Eleemnt is not clickable at this point. Another element would receive the click.'
                .execute('scrollTo(0,3000)')
                .elementByCss('button[data-id=US_State]').type(wd.SPECIAL_KEYS['Enter'])
                .frame()
                .frame('container')
                .frame('cacheframe0')
                .frame('proppage')
                .sleep(500)
                .elementByLinkText(stateName).click()
                .elementById('ZipCode').type('4444')
                .elementById('save').click();
        },

        createOrganizationParty : function(browser, cacheFrameName, taxId, partyName, dtcc, npn, city, stateName) {
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
                .elementById('Party.Name').type(partyName)
                .elementById('Party.TaxID').type(taxId)
                .elementByCss('button[data-id=SyncPDB]').type(wd.SPECIAL_KEYS['Enter'])
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .sleep(500)
                .elementByLinkText('No').click()
                .elementById('DTCCID').type(dtcc)
                .elementById('Party.NPN').type(npn)
    			.execute('scrollTo(0, 6000)')
                .elementByCss('input[id=RoleAPPOINTINGCOMPANY] ~ i').click()
                .elementByCss('input[id=RoleEMPLOYER] ~ i').click()
                .elementByCss('input[id=RoleDISTRIBUTOR] ~ i').click()
                .elementById('ContactPoint.Address.Street1').type('st1')
                .elementById('ContactPoint.Address.City').type(city)
                .elementByCss('button[data-id=US_State]').type(wd.SPECIAL_KEYS['Enter'])
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .sleep(500)
                .elementByLinkText(stateName).click()
                .elementById('ZipCode').type('4444')
                .elementById('validate').click()
                .elementById('save').click();
        },

    	createPartyHierarchy : function(browser, cacheFrameName, name, desc) {
    		return browser
    			.frame()
    			.frame('container')
    			.frame(cacheFrameName)
    			.frame('subpage')
    			.elementById('Button_HierarchySearch_NewHierarchy').type(wd.SPECIAL_KEYS['Enter'])
    			.frame()
    			.frame('container')
    			.frame(cacheFrameName)
    			.frame('proppage')
    			.elementById('Name').type(name)
    			.elementById('Description').type('Description ' + desc)
    			.elementById('save').click()
        },

        createAgreementWithPerson : function(browser, cacheFrameName, agreementName, agreementDesc, contractName, startDate, endDate, personFirstName) {
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
                .elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
                .elementById('Button_PartySearch_PP_Select').type(wd.SPECIAL_KEYS['Enter'])
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .elementByCss('button[data-id=ContractKit]').type(wd.SPECIAL_KEYS['Enter'])
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .sleep(500)
                .elementByLinkText(contractName).click()
                .elementById('validate').click()
                .elementById('save').click();
        },

        createQuota: function(browser, cacheFrameName, name, desc) {
            return browser
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
                .sleep(500)
                .elementByLinkText('allocation.getWeight()').click()
                .elementById('MeasureDescription').type('Alloc Get Weight')
                .elementById('validate').click()
                .elementById('save').click();
        },

        createProduct : function(browser, cacheFrameName, name, desc) {
            return browser
               .frame()
               .frame('container')
               .frame(cacheFrameName)
               .frame('subpage')
               .elementById('Button_SCCMProductSearch_SCCMProduct_NewSCCMProduct').click()
               .frame()
               .frame('container')
               .frame(cacheFrameName)
               .frame('proppage')
               .elementById('Name').type(name)
               .elementById('Description').type(desc)
               .frame()
               .frame('container')
               .frame(cacheFrameName)
               .frame('proppage')
               .execute('scrollTo(0, 6000)')
               .elementById('validate').click()
               .elementById('save').click();
        },

        addRootPosition : function(browser, cacheFrameName, productName) {
            return browser
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .elementById('searchPage_ProductHierarchyProduct_Picker_search_div').click()
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .frame('Page_ProductHierarchyProduct_Picker_search_div_frame')
                .elementById('Field_Product_Main_Name_Search_Value').type(productName)
                .elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .frame('Page_ProductHierarchyProduct_Picker_search_div_frame')
                .elementById('Button_ProductSearch_PP_Select').type(wd.SPECIAL_KEYS['Enter'])
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .elementById('validate').click()
                .elementById('save').click();
        },

        createComponent : function(browser, cacheFrameName, name, desc, label, quotaName) {
            return browser
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
                .elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
                .execute('scrollTo(0, 6000)')
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
                .sleep(500)
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
                .sleep(500)
                .elementByLinkText('Pearson Professional Centers').click()
                .elementById('validate').click()
                .elementById('save').click();
        },

    	createProductHierarchy : function(browser, cacheFrameName, name, desc) {
    		return browser
    			.frame()
    			.frame('container')
    			.frame(cacheFrameName)
    			.frame('subpage')
    			.execute('scrollTo(0,2000)')
    			.elementById('Button_ProductHierarchySearch_ProductHierarchy_NewProductHierarchy').type(wd.SPECIAL_KEYS['Enter'])
    			.frame()
    			.frame('container')
    			.frame(cacheFrameName)
    			.frame('proppage')
    			.elementById('Name').type(name)
    			.elementById('Description').type(desc)
    			.frame()
    			.frame('container')
    			.frame(cacheFrameName)
    			.frame('proppage')
    			.elementById('validate').click()
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
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

        createContractKit : function(browser, cacheFrameName, name, description, startDate, endDate, prodHier, contractKitProvider, contractKitProviderId) {
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
    			.elementByLinkText(prodHier).click()
    			.elementByCss('form[name=spartacus] button[data-id=Party]').type(wd.SPECIAL_KEYS['Enter'])
    			.sleep(500)
    			.elementByLinkText(contractKitProvider + ' [Party ID: ' + contractKitProviderId + ']').click()
                .elementById('validate').click()
                .elementById('save').click();
    	},

    	createContractKitInProductionStatus : function(browser, cacheFrameName, name, description, startDate, endDate, prodHier, contractKitProvider, contractKitProviderId) {
            return this.createContractKit(browser, cacheFrameName, name, description, startDate, endDate, prodHier, contractKitProvider, contractKitProviderId)
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
                .elementByCss('button[data-id=SyncPDB]').type(wd.SPECIAL_KEYS['Enter'])
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .sleep(500)
                .elementByLinkText('No').click()
                .execute('scrollTo(0, 3000)')
                .elementByCss('input[id=RoleFINANCIAL_SERVICES] ~ i').click()
                .elementById('ContactPoint.Address.Street1').type('street1')
                .elementById('ContactPoint.Address.City').type('city1')
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
                .elementByCss('button[data-id=SyncPDB]').type(wd.SPECIAL_KEYS['Enter'])
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .sleep(500)
                .elementByLinkText('No').click()
                .execute('scrollTo(0, 3000)')
                .elementByCss('input[id=RoleFINANCIAL_SERVICES] ~ i').click()
                .elementById('ContactPoint.Address.Street1').type('street1')
                .elementById('ContactPoint.Address.City').type('city1')
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .elementById('ZipCode').type('4444')
                .elementById('validate').click()
                .elementById('save').click();
    	},

    	// Check in contract kit a.k.a check in working version
    	checkinContractKit : function(browser, cacheFrameName, checkinComment) {
            return browser
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('subpage')
                .elementById('Button_Contracts_Main_ContractKitCheckIn').click()
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .elementById('Description').type(checkinComment)
                .elementById('validate').click()
                .elementById('save').click();
    	},

    	// Checkout contract kit a.k.a create working version
    	checkoutContractKit : function(browser, cacheFrameName, checkoutComment) {
            return browser
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('subpage')
                .elementById('Button_Contracts_Main_ContractKitCheckOut').click()
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .elementById('Description').type(checkoutComment)
                .elementById('validate').click()
                .elementById('save').click();
    	},

    	createAllocationRule : function(browser, cacheFrameName, name, desc, agreementHierarchy, recipientFormula) {
            return browser
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('subpage')
                .frame('component_iframe')
                .elementById('Button_Contracts_Main_AllocRules_NewAllocRule').click()
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .elementById('Name').type(name)
                .elementById('Description').type(desc)
                .elementByCss('button[data-id=Tree]').click()
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .sleep(500)
                .elementByLinkText(agreementHierarchy).click()
                .execute('scrollTo(0, 6000)')
                // Show Formula Details
                // This is ugly & make the code hard to maintain. Unfortunately we have no better choices.
                .elementByCssSelector("div.ppBodyDiv > div > div:nth-child(6) > div:nth-child(2) > div > label:nth-child(5) > i").click()
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .elementById('RecipientFormula.FormulaString').type(recipientFormula)
                .elementById('validate').click()
                .elementById('save').click();
    	},

        createEnum : function(browser, cacheFrameName, enumId, name1, value1, name2, value2, name3, value3) {
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

                .execute('scrollTo(0, 3000)')

                .elementByCss('button[name=Entries_add]').click()
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .elementById('Entries_Name_0').type(name2)
                .elementById('Entries_Value_0').type(value2)

                .execute('scrollTo(0, 6000)')

                .elementByCss('button[name=Entries_add]').click()
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .elementById('Entries_Name_0').type(name3)
                .elementById('Entries_Value_0').type(value3)

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
                .sleep(500)
                .elementByLinkText('Area Office').click()
                .elementByCss('button[data-id=Party\\.CurrentDetails\\.LocationSubtype]').click()
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .sleep(500)
                .elementByLinkText(subType).click()
                .execute('scrollTo(0, 6000)')
                .elementByCss('button[data-id=Party\\.CurrentDetails\\.OccupancyType]').click()
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .sleep(500)
                .elementByLinkText('Leased').click()
                .elementByCss('button[data-id=Party\\.CurrentDetails\\.Usage]').click()
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .sleep(500)
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
                .execute('scrollTo(0, 10000)')
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
                .elementByCss('button[data-id=NewStatus\\.StatusReason]').type(wd.SPECIAL_KEYS['Enter'])
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .sleep(500)
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
                .frame('cacheframe1')
                .frame('subpage')
                .elementById('Button_UserManager_Groups_Main_CreateGroup').click()
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                // Group  name can only contain upper case characters
                .elementById('Name').type(groupName.toUpperCase())
                .elementById('validate').click()
                .elementById('save').click();
        },

        addGroupPermission : function(browser, cacheFrameName, permissionType, permissionName) {
            return browser
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .elementByCss('button[name=AllPermissions_add]').type(wd.SPECIAL_KEYS['Enter'])
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .elementByCss('button[data-id=GroupPermissions_PermissionType_0]').click()
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .sleep(500)
                .elementByLinkText(permissionType).click()
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
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

        addUserPermission : function(browser, cacheFrameName, permissionType, permissionName) {
            return browser
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .elementByCss('button[name=AllPermissions_add]').type(wd.SPECIAL_KEYS['Enter'])
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .elementByCss('button[data-id=UserPermissions_PermissionType_0]').click()
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .sleep(500)
                .elementByLinkText(permissionType).click()
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
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

        // loginId is also the name, password and email id (hence the term 'simple').
        createSimpleUser : function(browser, cacheFrameName, loginId) {
            return browser
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('subpage')
                .elementById('Button_UserManager_Users_Main_CreateUser').click()
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .elementById('LoginName').type(loginId)
                .elementById('Name').type(loginId)
                .elementById('Password').type(loginId)
                .elementById('ConfirmPassword').type(loginId)
                .elementById('EmailAddress').type(loginId + '@gmail.com')
                .elementById('save').click();
        },

        addMembership : function(browser, cacheFrameName, groupName) {
            return browser
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .elementByCss('button[name=AllGroupContainers_add]').click()
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .elementById('complexField_Page_GroupSearch_search_div').click()
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .frame('Page_GroupSearch_search_div_frame')
                .elementById('Field_GroupSearch_Search_GroupName_Search_Value').type(groupName)
                .elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .frame('Page_GroupSearch_search_div_frame')
                .elementById('Button_GroupSearch_Select').type(wd.SPECIAL_KEYS['Enter'])
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .elementById('save').click();
        },

        createTransaction : function(browser, cacheFrameName, transactionType, partyFirstName, productName, providerName) {
            return browser
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('subpage')
                .elementById('TMTransactionTopGridNewButton').click()
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .elementById('TMTransactionPPType').type(transactionType)

                .execute('scrollTo(0, 3000)')
                .elementById('searchTMTransactionPPSearchAP_search_div').click()
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .frame('TMTransactionPPSearchAP_search_div_frame')
                .elementById('Field_Party_Person_FirstName_Search_Value').type(partyFirstName)
                .elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .frame('TMTransactionPPSearchAP_search_div_frame')
                .elementById('TMTransactionPPAPButton_PP_Select').type(wd.SPECIAL_KEYS['Enter'])

                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .execute('scrollTo(0, 3000)')
                .elementById('searchTMTransactionPPSearchPR_search_div').click()
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .frame('TMTransactionPPSearchPR_search_div_frame')
                .elementById('TMTransactionPPPRName_Search_Value').type(productName)
                .elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .frame('TMTransactionPPSearchPR_search_div_frame')
                .elementById('TMTransactionPPPRButton_PP_Select').type(wd.SPECIAL_KEYS['Enter'])

                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .execute('scrollTo(0, 3000)')
                .elementById('searchTMTransactionPPSearchCS_search_div').click()
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .frame('TMTransactionPPSearchCS_search_div_frame')
                .elementById('TMTransactionPPCSNameUpper_Search_Value').type(providerName)
                .elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .frame('TMTransactionPPSearchCS_search_div_frame')
                .elementById('TMTransactionPPCSButton_PP_Select').type(wd.SPECIAL_KEYS['Enter'])

                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .elementById('save').click();
        },

        createCompEvent : function(browser, cacheFrameName, transactionDate, partyFirstName, productName) {
            return browser
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('subpage')
                .elementById('CompEventTopGridNewButton').click()
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .elementById('TMTransactionPPDate').clear().type(transactionDate)

                .execute('scrollTo(0, 3000)')
                .elementById('searchTMTransactionPPSearchAP_search_div').click()
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .frame('TMTransactionPPSearchAP_search_div_frame')
                .elementById('Field_Party_Person_FirstName_Search_Value').type(partyFirstName)
                .elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .frame('TMTransactionPPSearchAP_search_div_frame')
                .elementById('TMTransactionPPAPButton_PP_Select').type(wd.SPECIAL_KEYS['Enter'])

                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .execute('scrollTo(0, 3000)')
                .elementById('searchTMTransactionPPSearchPR_search_div').click()
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .frame('TMTransactionPPSearchPR_search_div_frame')
                .elementById('TMTransactionPPPRName_Search_Value').type(productName)
                .elementByLinkText('Search').type(wd.SPECIAL_KEYS['Enter'])
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .frame('TMTransactionPPSearchPR_search_div_frame')
                .elementById('TMTransactionPPPRButton_PP_Select').type(wd.SPECIAL_KEYS['Enter'])

                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .execute('scrollTo(0, 6000)')
                .elementByCss('button[data-id=TransactionType]').click()
                .frame()
                .frame('container')
                .frame(cacheFrameName)
                .frame('proppage')
                .sleep(500)
                .elementByLinkText('Initial Purchase').click()
                .elementById('SplitPercentage').clear().type(50)
                .elementById('Amount').clear().type(1000)

                .elementById('save').click();
        }
    }
});