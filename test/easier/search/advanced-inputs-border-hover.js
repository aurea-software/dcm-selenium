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

describe("advanced search - inputs border focus", function() {
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

  it("should be 1px solid #28BD8B rgb(40, 189, 139)", function  (done) {
    common.login(browser, url, username, password)
      .frame('navbar')
      .elementById('Party').click()
      .frame()
      .frame('container')
      .frame('cacheframe0')
      .frame('subpage')
      .elementByCss('.search-container .btn.advanced-link').click().sleep(500) // open advanced form
      .elementByCss('.search-container .advanced-form input.form-control').moveTo().sleep(150).getComputedCss('border-bottom')
      .then(function(border) {
        border.should.equal("1px solid rgb(40, 189, 139)");
      })
      .nodeify(done);
  });
});
