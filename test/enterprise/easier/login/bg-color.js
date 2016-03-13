var config = require('nconf');
config.file({file: './test/lib/config.json'});

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var DCM = require('dcm-selenium-common');
var wd = DCM(require('wd'));

var url = config.get("url");

describe("login - bg color", function() {
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
 
  it("should be #313541 or rgba(49, 53, 65, 1)", function  (done) {
    browser
      .dcm({url: url})
      .elementByCss('body')
      .getComputedCss('background-color').then(function(bgcolor) {
        bgcolor.should.equal("rgba(49, 53, 65, 1)");
      })
      .nodeify(done);
  });
});
