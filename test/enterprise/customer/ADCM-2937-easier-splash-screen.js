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

describe("ADCM-2937 easier splash screen", function() {
  this.timeout(60000);
  var browser;

  before(function (done) {
    chaiAsPromised.transferPromiseness = wd.transferPromiseness;
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

  it("should has heading 'Welcome to Aurea Distribution Channel Management(TM)' and sub-headings should not have colons", function(done) {
    browser
      .dcm({url: url})
      .dcmLogin(username, password)
      .dcmHomePage()
      .elementByCss('.welcome-body h2').text()
      .should.eventually.become('Welcome to Aurea Distribution Channel Management(TM)')
      .elementByCss('.welcome-body ul li:nth-child(1) span').text()
      .should.not.eventually.contain(':')
      .elementByCss('.welcome-body ul li:nth-child(2) span').text()
      .should.not.eventually.contain(':')
      .elementByCss('.welcome-body ul li:nth-child(3) span').text()
      .should.not.eventually.contain(':')
      .elementByCss('.welcome-body ul li:nth-child(4) span').text()
      .should.not.eventually.contain(':')
      .elementByCss('.welcome-body ul li:nth-child(5) span').text()
      .should.not.eventually.contain(':')
      .nodeify(done);
  });
});
