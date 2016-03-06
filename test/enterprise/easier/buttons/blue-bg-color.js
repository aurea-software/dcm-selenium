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

describe("buttons - blue bg color", function() {
  this.timeout(0);
  var browser;

  before(function (done) {
    browser = wd.promiseChainRemote(config.get("remote"));

    // optional extra logging
    browser.on('status', function(info) {
      console.log(info);
    });
    browser.on('command', function(meth, path, data) {
      console.log(' > ' + meth, path, data || '');
    });

    browser
      .init(config.get("environment"))
      .nodeify(done);  //same as : .then(function() { done(); });
  });

  after(function (done) {
    browser
      .quit()
      .nodeify(done);
  });

  it("should be #23B1F7 rgba(35, 177, 247, 1)", function  (done) {
    browser
      .dcm({url: url})
      .dcmLogin(username, password)
      .dcmPartyTab()
      .dcmPartyMainFrame()
      .elementByCss('.result-div .btn.btn-blue:not(.pass)').getComputedCss('background-color')
      .then(function(bgcolor) {
        bgcolor.should.equal("rgba(35, 177, 247, 1)");
      })
      .nodeify(done);
  });
});
