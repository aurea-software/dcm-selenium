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

describe("menus - left menu level 3 font color hover", function() {
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

  it("should be #ffffff", function  (done) {
    browser
      .dcm({url: url})
      .dcmLogin(username, password)
      .dcmPartyTab()
      .dcmSidebar()
      .elementByCss('.sidebar ul > li > ul > li > a').click().sleep(500)
      .elementByCss('.sidebar ul > li > ul > li > ul > li > a').moveTo().sleep(500)
      .getComputedCss('color').then(function(color) {
        color.should.equal("rgba(255, 255, 255, 1)");
      })
      .nodeify(done);
  });
});
