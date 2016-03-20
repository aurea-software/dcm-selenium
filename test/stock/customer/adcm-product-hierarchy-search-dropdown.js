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

describe("product hierarchy search dropdown", function() {
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

  it("should contain 'Search For Product Hierarchy' and 'Search For Product'", function(done) {
    browser
      .dcm({url: url})
      .dcmLogin(username, password)
      .dcmHierarchyTab()
      .dcmSidebar()
      .dcmProductSearchSubmenu()
      .dcmPartyHierarchyPage()
      .sleep(1000)
      .elementByCss('#Search_ProductHierarchySearch_Main_primary_display_div .bootstrap-select button').click()
      .elementByCss('#menuSelect > div > div > ul > li.selected > a > span.text').text()
      .should.eventually.become('Search For Product Hierarchy')
      .elementByCss('#menuSelect > div > div > ul > li:nth-child(2) > a > span.text').text()
      .should.eventually.become('Search For Product')
      .nodeify(done);
  });
});
