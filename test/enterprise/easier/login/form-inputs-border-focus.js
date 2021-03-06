var config = require('nconf');
config.file({file: './test/lib/config.json'});

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var DCM = require('dcm-selenium-common');
var wd = DCM(require('wd'));

var url = config.get("url");

describe("login - form inputs in focus border", function() {
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
 
  it("should be bottom 1px solid #28bd8b rgb(40, 189, 139)", function  (done) {
    browser
      .dcm({url: url})
      .dcmSelectLoginForm('input[name=LOGINNAME]').type("").sleep(150) // wait for border color transition
      .getComputedCss('border-bottom').then(function(border) {
        border.should.equal("1px solid rgb(40, 189, 139)");
      })
      .dcmSelectLoginForm('input[name=PASSWORD]').type("").sleep(150) // wait for border color transition
      .getComputedCss('border-bottom').then(function(border) {
        border.should.equal("1px solid rgb(40, 189, 139)");
      })
      .dcmSelectLoginForm('.bootstrap-select button').click().sleep(150) // wait for border color transition
      .getComputedCss('border-bottom').then(function(border) {
        border.should.equal("1px solid rgb(40, 189, 139)");
      })
      .nodeify(done);
  });
});
