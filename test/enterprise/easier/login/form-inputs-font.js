var config = require('nconf');
config.file({file: './test/lib/config.json'});

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var DCM = require('dcm-selenium-common');
var wd = DCM(require('wd'));

var url = config.get("url");

describe("login - form inputs font", function() {
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
 
  it("should be SourceSansProLight", function  (done) {
    browser
      .dcm({url: url})
      .dcmSelectLoginForm('input[name=LOGINNAME]').getComputedCss('font-family')
      .then(function(font) {
        font.should.equal("SourceSansProLight");
      })
      .dcmSelectLoginForm('input[name=PASSWORD]').getComputedCss('font-family')
      .then(function(font) {
        font.should.equal("SourceSansProLight");
      })
      .dcmSelectLoginForm('.bootstrap-select button span').getComputedCss('font-family')
      .then(function(font) {
        font.should.equal("SourceSansProLight");
      })      
      .dcmSelectLoginForm('.checkbox label').getComputedCss('font-family')
      .then(function(font) {
        font.should.equal("SourceSansProLight");
      })
      .nodeify(done);
  });
});
