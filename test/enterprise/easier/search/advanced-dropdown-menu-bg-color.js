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

describe("advanced search - dropdown menu bg color", function() {
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

  it("should be #1F222D rgba(31, 34, 45, 1)", function  (done) {
    browser
      .dcm({url: url})
      .dcmLogin(username, password)
      .dcmPartyTab()
      .dcmPersonPartyPage()
      .dcmOpenPersonPartyAdvancedSearch()
      .dcmSelectPersonPartyAdvancedSearch('.bootstrap-select button').click()
      .dcmSelectPersonPartyAdvancedSearch('.bootstrap-select .dropdown-menu')
      .getComputedCss('display').then(function(display) {
        display.should.equal("block");
      })
      .dcmSelectPersonPartyAdvancedSearch('.bootstrap-select .dropdown-menu')
      .getComputedCss('background-color').then(function(bgcolor) {
        bgcolor.should.equal("rgba(31, 34, 45, 1)");
      })
      .nodeify(done);
  });
});
