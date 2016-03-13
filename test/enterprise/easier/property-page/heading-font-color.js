var config = require('nconf');
config.file({file: './test/lib/config.json'});

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var DCM = require('dcm-selenium-common');
var wd = DCM(require('wd'));

var url = config.get("url");
var username = config.get("username");
var password = config.get("password");

var common = require('../../../../test/lib/common');

describe("property page - heading font color", function() {
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

  it("should be #313541 rgba(49, 53, 65, 1) for main text and #23B1F7 rgba(35, 177, 247, 1) for inner span", function  (done) {
    common.login(browser, url, username, password)
      .frame('navbar')
      .elementById('Party').click()
      .frame()
      .frame('container')
      .frame('cacheframe0')
      .frame('subpage')
      .elementById('Button_Person_Main_NewPerson').click()
      .frame()
      .frame('container')
      .frame('cacheframe0')
      .frame('proppage')
      .elementByCss('.heading').getComputedCss('color')
      .then(function(font) {
        font.should.equal("rgba(49, 53, 65, 1)");
      })
      .elementByCss('.heading span').getComputedCss('color')
      .then(function(font) {
        font.should.equal("rgba(35, 177, 247, 1)");
      })
      .nodeify(done);
  });
});
