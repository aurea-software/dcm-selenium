var config = require('nconf');
config.file({file: './test/lib/config.json'});

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();

var wd = require('wd');

var url = config.get("url");

describe("login - form bg color", function() {
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
 
  it("should be #ffffff or rgba(255, 255, 255, 1)", function  (done) {
    browser
      .get(url)
      .elementByCss('.modal-content').getComputedCss('background-color').then(function(bgcolor) {
        bgcolor.should.equal("rgba(255, 255, 255, 1)");
      })
      .nodeify(done);
  });
});
