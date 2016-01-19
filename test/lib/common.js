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
    }
  }
});