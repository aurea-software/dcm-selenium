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

describe("search - datepicker month font color", function() {
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

  it("should be #EEEEEE rgba(238, 238, 238, 1)", function  (done) {
    browser
      .dcm({url: url})
      .dcmLogin(username, password)
      .dcmAdminTab()
      .dcmAuditAdminPage()
      .elementByCss('.datepicker.dropdown-menu .datepicker-days .switch')
      .getComputedCss('color').then(function(font) {
        font.should.equal("rgba(238, 238, 238, 1)");
      })
      .nodeify(done);
  });
});
