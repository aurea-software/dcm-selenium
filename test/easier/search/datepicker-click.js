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

describe("search - datepicker click", function() {
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

  it("should make datepicker visible", function  (done) {
    common.login(browser, url, username, password)
      .frame('navbar')
      .elementById('DCM Admin').click()
      .frame()
      .frame('container')
      .frame('cacheframe0')
      .frame('subpage')
      .elementByCss('.search-container .btn.advanced-link').click().sleep(500) // open advanced form
      .elementByCss('.search-container .datepicker input').click()
      .elementByCss('.datepicker.dropdown-menu').getComputedCss('display')
      .then(function(display) {
        display.should.equal("block");
      })
      .nodeify(done);
  });
});
