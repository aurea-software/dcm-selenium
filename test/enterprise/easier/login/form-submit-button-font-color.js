var config = require('nconf');
config.file({file: './test/lib/config.json'});

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var DCM = require('../../../../test/lib/dcm');
var wd = DCM(require('wd'));

var url = config.get("url");

describe("login - form submit button font color", function() {
  this.timeout(30000);
  var browser;
 
  before(function (done) {
    browser = wd.promiseChainRemote(config.get("remote"));
    browser
      .dcmInit(config.get("environment"))
      .nodeify(done);  //same as : .then(function() { done(); });
  });
 
  after(function (done) {
    browser
      .quit()
      .nodeify(done);
  });
 
  it("should be #ffffff rgba(255, 255, 255, 1)", function  (done) {
    browser
      .get(url)
      .elementByCss('form[name=LoginForm] button[type=submit]').getComputedCss('color')
      .then(function(font) {
        font.should.equal("rgba(255, 255, 255, 1)");
      })
      .nodeify(done);
  });
});
