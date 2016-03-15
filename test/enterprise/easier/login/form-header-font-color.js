var config = require('nconf');
config.file({file: './test/lib/config.json'});

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var DCM = require('dcm-selenium-common');
var wd = DCM(require('wd'));

var url = config.get("url");

describe("login - form header font color", function() {
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
 
  it("should be #23b1f7 rgba(35, 177, 247, 1) and #ffffff rgba(255, 255, 255, 1)", function  (done) {
    browser
      .dcm({url: url})
      .dcmSelectLoginBox('.modal-title')
      .getComputedCss('color').then(function(color) {
        color.should.equal("rgba(255, 255, 255, 1)");
      })
      .dcmSelectLoginBox('.modal-title span')
      .getComputedCss('color').then(function(color) {
        color.should.equal("rgba(35, 177, 247, 1)");
      })
      .nodeify(done);
  });
});
