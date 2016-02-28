var config = require('nconf');
config.file({file: './test/lib/config.json'});

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var wd = require('wd');

var url = config.get("url");
var username = config.get("username");
var password = config.get("password");

var common = require('../../lib/common');

describe("search - datepicker day of week font color", function() {
  this.timeout(60000);
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

  it("should be #EA5A5A rgba(234, 90, 90, 1)", function  (done) {
    common.login(browser, url, username, password)
      .frame('navbar')
      .elementById('DCM Admin').click()
      .frame()
      .frame('container')
      .frame('cacheframe0')
      .frame('subpage')
      .elementByCss('.datepicker.dropdown-menu .datepicker-days .dow')
      .getComputedCss('color').then(function(font) {
        font.should.equal("rgba(234, 90, 90, 1)");
      })
      .nodeify(done);
  });
});
