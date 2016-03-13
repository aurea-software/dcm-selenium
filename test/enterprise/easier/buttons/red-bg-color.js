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

describe("buttons - red bg color", function() {
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

  it("should be #EA5A5A rgba(234, 90, 90, 1)", function  (done) {
    browser
      .dcm({url: url})
      .dcmLogin(username, password)
      .dcmPartyTab()
      .dcmNewPersonPartyPage()
      .dcmSelectRedButton()
      .getComputedCss('background-color').then(function(bgcolor) {
        bgcolor.should.equal("rgba(234, 90, 90, 1)");
      })
      .nodeify(done);
  });
});
