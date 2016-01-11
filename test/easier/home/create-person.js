var config = require('nconf');
config.file({file: './test/lib/config.json'});

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var wd = require('wd');
var asserters = wd.asserters; // commonly used asserters

var url = config.get("url");
var username = config.get("username");
var password = config.get("password");

describe("DCM Easier", function() {
  this.timeout(120000);

  describe("login", function() {
    var browser;
   
    before(function (done) {
      browser = wd.promiseChainRemote(config.get("remote")); 

      // optional extra logging
      browser.on('status', function(info) {
        console.log(info);
      });
      browser.on('command', function(meth, path, data) {
        console.log(' > ' + meth, path, data || '');
      });

      browser
        .init(config.get("environment"))
        .nodeify(done);  //same as : .then(function() { done(); });
    });
   
    /*after(function (done) {
      browser
        .quit()
        .nodeify(done);
    });*/
   
    it("should load login page", function (done) {
      browser
        .get(url)
        .nodeify(done);
    });

    it("should assert page title using chai", function (done) {
      browser
        .title()
        .then(function(title) {
          title.should.include("Distribution Channel Management");
        })
        .nodeify(done);
    });

    it("should assert page title using chai-as-promised", function (done) {
      browser
        // First difference! Notice the 'eventually'
        .title().should.eventually.include("Distribution Channel Management")
        // Second difference! Notice that we use 'notify' instead of 'nodeify'.
        .notify(done);
    });
   
    it("should enter username/password and submit", function  (done) {
      browser
        .elementByCss('form[name=LoginForm] input[name=LOGINNAME]').type(username)
        .elementByCss('form[name=LoginForm] input[name=PASSWORD]').type(password)
        .elementByCss('form[name=LoginForm] button[type=submit]').click()
        .eval("window.location.href").then(function (location) {
          location.should.include("AppName=DMS");
        })
        .title().then(function(title) {
          title.should.equal("Distribution Channel Management");
        })
        .nodeify(done);
    });
    
    it("Should load Party page", function(done) {
      browser
        .frame('navbar')
        .elementById('Party').click()
        .nodeify(done);
    });
    
    it("Should load Create Person page", function(done) {
      browser
        // MUST select the whole page again by calling frame() with no arguments
        // because after the call to frame(frameName), subsequent calls will just
        // focus on that frame.
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('subpage')
        .elementById('Button_Person_Main_NewPerson').click()
        .nodeify(done);
    });
    
    it("Should submit Create Person form", function(done) {
      browser
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('proppage')
        .waitForElementByCss("#validate", asserters.isDisplayed , 10000)
        .elementById('Party.FirstName').type('FN1')
        .elementById('Party.LastName').type('LN1')
        /*.selectByVisibleText('button[data-id=SyncPDB]', 'Yes')*/
        .elementById('Party.TaxID').type('12345')
        //.elementById('RoleDISTRIBUTOR').click()
        .elementById('validate').click()
        .nodeify(done);
    });
    
    it("Should fail validation", function(done) {
      browser
        .frame()
        .frame('container')
        .frame('cacheframe0')
        .frame('proppage')
        // Notice: ppError_div contains several <li> elements
        // We don't want to differentiate them. We just want to validate
        // that the expected error messages are there.
        .elementById('ppError_div').text()
        .should.eventually.include("Mailing Communications Mode requires that at least Street1 be specified")
        .should.eventually.include("Mailing Communications Mode requires that the City be specified")
        .should.eventually.include("Mailing Communications Mode requires that the Zip Code/Postal Code be specified")
        .notify(done);
    });
  });
});
