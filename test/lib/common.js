if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
  return {
    rand : function(length) {
        var result = '';
        for (var i = 1; i < length; i++) {
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
            .elementByCss('form[name=LoginForm] button[type=submit]').click()
            .eval("window.location.href").then(function (location) {
                location.should.include("AppName=DMS");
            })
            .title().then(function(title) {
                title.should.equal("Distribution Channel Management");
            });
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
            .elementById('save').click()
            .frame()
            .frame('container')
            .frame('cacheframe0')
            .frame('subpage')
            .elementById('Grid_Person_Main').text()
            .should.eventually.include(taxId);
    }
  }
});