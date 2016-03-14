var config = require('nconf');
config.file({file: './test/lib/config.json'});

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var DCM = require('dcm-selenium-common');
var wd = DCM(require('wd'));

var url = config.get("url");

describe("login - form inputs font size", function() {
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
 
  it("should be 16px for main inputs and 14px for checkbox and forget password link", function  (done) {
    browser
      .dcm({url: url})
      .dcmSelectLoginForm('input[name=LOGINNAME]').getComputedCss('font-size')
      .then(function(font) {
        font.should.equal("16px");
      })
      .dcmSelectLoginForm('input[name=PASSWORD]').getComputedCss('font-size')
      .then(function(font) {
        font.should.equal("16px");
      })
      .dcmSelectLoginForm('.bootstrap-select button span').getComputedCss('font-size')
      .then(function(font) {
        font.should.equal("16px");
      })
      .dcmSelectLoginForm('.checkbox label').getComputedCss('font-size')
      .then(function(font) {
        font.should.equal("14px");
      })
      .dcmSelectLoginForm('#fgButton').getComputedCss('font-size') // forget password link
      .then(function(font) {
        font.should.equal("14px");
      })
      .nodeify(done);
  });
});
