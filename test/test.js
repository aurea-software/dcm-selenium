var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var wd = require('wd');

describe("test", function() {
  this.timeout(10000);
  var browser;
 
  before(function(done) {
    browser = wd.promiseChainRemote('http://ahvUQrkyN7K5xqhjACepwnbRPEXEIU5J:2quJIE7mCIiZYp9pSdFfrHW6bKBKuxkn@DCM.gridlastic.com:80/wd/hub'); 

    // optional extra logging
    browser.on('status', function(info) {
      console.log(info);
    });
    browser.on('command', function(meth, path, data) {
      console.log(' > ' + meth, path, data || '');
    });

    browser
      .init({browserName:'chrome'})
      .nodeify(done);  //same as : .then(function() { done(); });
  });
 
  beforeEach(function(done) {
    browser
      .get("http://admc.io/wd/test-pages/guinea-pig.html")
      .nodeify(done);
  });
 
  after(function(done) {
    browser
      .quit()
      .nodeify(done);
  });
 
  it("should retrieve the page title", function(done) {
    browser
      .title()
      .then(function(title) {
        title.should.equal("WD Tests");
      })
      .nodeify(done);
  });
 
  it("submit element should be clicked", function(done) {
    browser
      .elementById("submit")
      .click().eval("window.location.href")
      .then(function(location) {
        location.should.include("&submit");
      })
      .nodeify(done);
  });
});