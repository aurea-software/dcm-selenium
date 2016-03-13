var config = require('nconf');
config.file({file: './test/lib/config.json'});

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var DCM = require('dcm-selenium-common');
var wd = DCM(require('wd'));

var url = config.get("url");

describe("login - form submit button bg hover", function() {
  this.timeout(60000);
  var browser;
 
  before(function (done) {
    browser = wd.promiseChainRemote(config.get("remote")); 
    browser
      .dcmInit(config.get("environment"))
      .then(function () {
        done();
      })
      .catch(function (error) {
        console.log(error);
      });
  });
 
  after(function (done) {
    browser
      .quit()
      .nodeify(done);
  });
 
  it("should be #04A675 rgba(4, 166, 117, 1)", function  (done) {
    browser
      .get(url)
      .elementByCss('form[name=LoginForm] button[type=submit]').moveTo().sleep(500) // mouse hover
      .getComputedCss('background-color')
      .then(function(color) {
        color.should.equal("rgba(4, 166, 117, 1)");
      })
      .nodeify(done);
  });
});
