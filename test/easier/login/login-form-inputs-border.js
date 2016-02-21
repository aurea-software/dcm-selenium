var config = require('nconf');
config.file({file: './test/lib/config.json'});

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var wd = require('wd');

var url = config.get("url");

describe("login - form inputs border", function() {
  this.timeout(30000);
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
 
  it("should be bottom 1px solid #778086 rgb(119, 128, 134) and #28bd8b rgb(40, 189, 139) for the first input in focus", function  (done) {
    browser
      .get(url)
      .elementByCss('form[name=LoginForm] input[name=LOGINNAME]').getComputedCss('border-bottom')
      .then(function(border) {
        border.should.equal("1px solid rgb(40, 189, 139)");
      })
      .elementByCss('form[name=LoginForm] input[name=PASSWORD]').getComputedCss('border-bottom')
      .then(function(border) {
        border.should.equal("1px solid rgb(119, 128, 134)");
      })
      .elementByCss('.bootstrap-select button').getComputedCss('border-bottom')
      .then(function(border) {
        border.should.equal("1px solid rgb(119, 128, 134)");
      })
      .nodeify(done);
  });
});
