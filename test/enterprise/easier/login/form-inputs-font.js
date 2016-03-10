var config = require('nconf');
config.file({file: './test/lib/config.json'});

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var DCM = require('../../../../test/lib/dcm');
var wd = DCM(require('wd'));

var url = config.get("url");

describe("login - form inputs font", function() {
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
 
  it("should be SourceSansProLight", function  (done) {
    browser
      .get(url)
      .elementByCss('form[name=LoginForm] input[name=LOGINNAME]').getComputedCss('font-family')
      .then(function(font) {
        font.should.equal("SourceSansProLight");
      })
      .elementByCss('form[name=LoginForm] input[name=PASSWORD]').getComputedCss('font-family')
      .then(function(font) {
        font.should.equal("SourceSansProLight");
      })
      .elementByCss('form[name="LoginForm"] .bootstrap-select button span').getComputedCss('font-family')
      .then(function(font) {
        font.should.equal("SourceSansProLight");
      })      
      .elementByCss('form[name=LoginForm] .checkbox label').getComputedCss('font-family')
      .then(function(font) {
        font.should.equal("SourceSansProLight");
      })
      .nodeify(done);
  });
});
