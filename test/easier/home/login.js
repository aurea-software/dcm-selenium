var config = require('nconf');
config.file({file: './test/lib/config.json'});

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var wd = require('wd');

var url = config.get("url");
var username = config.get("username");
var password = config.get("password");

  describe("login", function() {
    this.timeout(120000);
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
   
    after(function (done) {
      browser
        .quit()
        .nodeify(done);
    });
   
    it("should load login page", function (done) {
      browser
        .get(url)
        .nodeify(done);
    });

    it("should retrieve the page title", function (done) {
      browser
        .title()
        .then(function(title) {
          title.should.include("Distribution Channel Management");
        })
        .nodeify(done);
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
  });
