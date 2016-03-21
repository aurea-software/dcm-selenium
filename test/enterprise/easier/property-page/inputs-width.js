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

describe("property page - inputs width", function() {
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

  it("should be 100%", function  (done) {
    var inputWidth = 0;
    browser
      .dcm({url: url})
      .dcmLogin(username, password)
      .dcmPartyTab()
      .dcmNewPersonPartyPage()
      .elementByCss('.form-group').getComputedCss('width')
      .then(function(width) {
        inputWidth = width;
      })
      .elementByCss('.form-group input.form-control').getComputedCss('width')
      .then(function(width) {
        width.should.equal(inputWidth);
      })
      .nodeify(done);
  });
});
