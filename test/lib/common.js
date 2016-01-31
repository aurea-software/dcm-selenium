if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
  return {
    rand : function(length) {
        var result = '';
        for (var i = 0; i < length; i++) {
            result += Math.floor((Math.random() * 10) );
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
            .elementByCss('button[data-id=SyncPDB]').click()
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
            .elementByCss('button[data-id=SyncPDB]').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('proppage')
            .elementByLinkText('No').click()
            .elementById('DTCCID').type(dtcc)
            .elementById('Party.NPN').type(npn)
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
	
	createPartyHierarchy : function(browser, name) {
		return browser
			.frame()
			.frame('container')
			.frame('cacheframe0')
			.frame('subpage')
			.elementById('Button_HierarchySearch_NewHierarchy').click()
			.frame()
			.frame('container')
			.frame('cacheframe0')
			.frame('proppage')
			.elementById('Name').type(name)
			.elementById('Description').type('Description ' + name)	
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
            .frame('cacheframe3')
            .frame('proppage')
            .elementByLinkText(contractName).click()
            .elementById('validate').click()
            .elementById('save').click();
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