var config = require('nconf');
config.file({file: './test/lib/config.json'});

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var wd = require('wd');

var url = config.get("url");

describe("login - form inputs font size", function() {
  this.timeout(30000);
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
 
  it("should be 16px for main inputs and 14px for checkbox and forget password link", function  (done) {
    browser
      .get(url)
      .elementByCss('form[name=LoginForm] input[name=LOGINNAME]').getComputedCss('font-size')
      .then(function(font) {
        font.should.equal("16px");
      })
      .elementByCss('form[name=LoginForm] input[name=PASSWORD]').getComputedCss('font-size')
      .then(function(font) {
        font.should.equal("16px");
      })
      .elementByCss('.bootstrap-select button').getComputedCss('font-size')
      .then(function(font) {
        font.should.equal("16px");
      })
      .elementByCss('form[name=LoginForm] .checkbox label').getComputedCss('font-size')
      .then(function(font) {
        font.should.equal("14px");
      })
      .elementByCss('form[name=LoginForm]').getComputedCss('font-size') // forget password link
      .then(function(font) {
        font.should.equal("14px");
      })
      .nodeify(done);
  });
});