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

describe("search - datepicker day of month inactive font color", function() {
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

  it("should be #444444 rgba(68, 68, 68, 1)", function  (done) {
    common.login(browser, url, username, password)
      .frame('navbar')
      .elementById('DCM Admin').click()
      .frame()
      .frame('container')
      .frame('cacheframe0')
      .frame('subpage')
      .elementByCss('.datepicker.dropdown-menu .datepicker-days .day.old')
      .getComputedCss('color').then(function(color) {
        color.should.equal("rgba(68, 68, 68, 1)");
      })
      .elementByCss('.datepicker.dropdown-menu .datepicker-days .day.new')
      .getComputedCss('color').then(function(color) {
        color.should.equal("rgba(68, 68, 68, 1)");
      })
      .nodeify(done);
  });
});
