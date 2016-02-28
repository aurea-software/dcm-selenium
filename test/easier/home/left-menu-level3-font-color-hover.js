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

describe("home - left menu level 3 font color hover", function() {
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

  it("should be #ffffff", function  (done) {
    common.login(browser, url, username, password)
      .frame('navbar')
      .elementById('Party').click()
      .frame().frame('sidebar')
      .elementByCss('.sidebar ul > li > ul > li > a').click().sleep(500)
      .elementByCss('.sidebar ul > li > ul > li > ul > li > a').moveTo().sleep(500)
      .getComputedCss('color').then(function(color) {
        color.should.equal("rgba(255, 255, 255, 1)");
      })
      .nodeify(done);
  });
});
