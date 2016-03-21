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

describe("property page - checkbox item font color", function() {
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

  it("should be #282C37 rgba(40, 44, 55, 1)", function  (done) {
    browser
      .dcm({url: url})
      .dcmLogin(username, password)
      .dcmPartyTab()
      .dcmNewPersonPartyPage()
      .elementByCss('.form-group.checkbox .checkbox-inline span').getComputedCss('color')
      .then(function(font) {
        font.should.equal("rgba(40, 44, 55, 1)");
      })
      .nodeify(done);
  });
});
