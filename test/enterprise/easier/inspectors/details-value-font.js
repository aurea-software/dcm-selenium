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

describe("details inspector - value font", function() {
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

  it("should be SourceSansProRegular", function  (done) {
    browser
      .dcm({url: url})
      .dcmLogin(username, password)
      .dcmPartyTab()
      .dcmPersonPartyComponentsPage()
      .dcmSelectTableCellBold()
      .getComputedCss('font-family').then(function(font) {
        font.should.equal("SourceSansProRegular");
      })
      .nodeify(done);
  });
});
