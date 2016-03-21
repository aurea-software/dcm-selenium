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

describe("property page - inputs rollover border", function() {
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

  it("should be 1px solid #28BD8B rgb(40, 189, 139)", function  (done) {
    browser
      .dcm({url: url})
      .dcmLogin(username, password)
      .dcmPartyTab()
      .dcmNewPersonPartyPage()
      .elementByCss('.heading').click().sleep(150) // move focus out
      .elementByCss('input.form-control').moveTo().sleep(150).getComputedCss('border-bottom')
      .then(function(border) {
        border.should.equal("1px solid rgb(40, 189, 139)");
      })
      .nodeify(done);
  });
});
