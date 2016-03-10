var config = require('nconf');
config.file({file: './test/lib/config.json'});

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var DCM = require('../../../../test/lib/dcm');
var wd = DCM(require('wd'));

var url = config.get("url");
var username = config.get("username");
var password = config.get("password");

var common = require('../../../../test/lib/common');

describe("menus - left menu level 2 bg color", function() {
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

  it("should be #1F222D rgba(31, 34, 45, 1)", function  (done) {
    common.login(browser, url, username, password)
      .frame('navbar')
      .elementById('Party').click()
      .frame().frame('sidebar')
      .elementByCss('.sidebar ul li ul').getComputedCss('background-color').then(function(bgcolor) {
        bgcolor.should.equal("rgba(31, 34, 45, 1)");
      })
      .nodeify(done);
  });
});
