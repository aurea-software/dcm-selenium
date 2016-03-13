var config = require('nconf');
config.file({file: './test/lib/config.json'});

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var DCM = require('dcm-selenium-common');
var wd = DCM(require('wd'));

var url = config.get("url");

describe("login - form header font size", function() {
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
 
  it("should be 25px", function  (done) {
    browser
      .dcm({url: url})
      .dcmSelectLoginForm('.modal-title')
      .getComputedCss('font-size').then(function(font) {
        font.should.equal("25px");
      })
      .nodeify(done);
  });
});
