var config = require('nconf');
config.file({file: './test/lib/config.json'});

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var wd = require('wd');

var url = config.get("url");

describe("login - form inputs color", function() {
  this.timeout(0);
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
 
  it("should be #778086 rgba(119, 128, 134, 1)", function  (done) {
    browser
      .get(url)
      .elementByCss('form[name=LoginForm] input[name=LOGINNAME]').getComputedCss('color')
      .then(function(color) {
        color.should.equal("rgba(119, 128, 134, 1)");
      })
      .elementByCss('form[name=LoginForm] input[name=PASSWORD]').getComputedCss('color')
      .then(function(color) {
        color.should.equal("rgba(119, 128, 134, 1)");
      })
      .elementByCss('.bootstrap-select button').getComputedCss('color')
      .then(function(color) {
        color.should.equal("rgba(119, 128, 134, 1)");
      })
      .elementByCss('form[name=LoginForm] .checkbox label').getComputedCss('color')
      .then(function(color) {
        color.should.equal("rgba(119, 128, 134, 1)");
      })
      .nodeify(done);
  });
});
