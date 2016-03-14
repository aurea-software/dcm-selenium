var config = require('nconf');
config.file({file: './test/lib/config.json'});

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var DCM = require('dcm-selenium-common');
var wd = DCM(require('wd'));

var url = config.get("url");

describe("login - form inputs border", function() {
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
 
  it("should be bottom 1px solid #778086 rgb(119, 128, 134)", function  (done) {
    browser
      .dcm({url: url})
      .dcmSelectLoginForm('.checkbox label').click().sleep(150) // move focus out
      .dcmSelectLoginForm('input[name=LOGINNAME]').getComputedCss('border-bottom')
      .then(function(border) {
        border.should.equal("1px solid rgb(119, 128, 134)");
      })
      .dcmSelectLoginForm('input[name=PASSWORD]').getComputedCss('border-bottom')
      .then(function(border) {
        border.should.equal("1px solid rgb(119, 128, 134)");
      })
      .dcmSelectLoginForm('.bootstrap-select button').getComputedCss('border-bottom')
      .then(function(border) {
        border.should.equal("1px solid rgb(119, 128, 134)");
      })
      .nodeify(done);
  });
});
