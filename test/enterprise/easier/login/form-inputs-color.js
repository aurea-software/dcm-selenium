var config = require('nconf');
config.file({file: './test/lib/config.json'});

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var DCM = require('dcm-selenium-common');
var wd = DCM(require('wd'));

var url = config.get("url");

describe("login - form inputs color", function() {
  this.timeout(30000);
  var browser;
 
  before(function (done) {
    browser = wd.promiseChainRemote(config.get("remote")); 
    browser
      .dcmInit(config.get("environment"))
      .nodeify(done);
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
      .elementByCss('form[name="LoginForm"] .bootstrap-select button span').getComputedCss('color')
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
