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

describe("ADCM-2923 product hierarchy search dropdown", function() {
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

  it("should contain 'Search Prod Hierarchy' and 'Search Product'", function(done) {
    browser
      .dcm({url: url})
      .dcmLogin(username, password)
      .dcmHierarchyTab()
      .dcmSidebar()
      .dcmProductSearchSubmenu()
      .dcmPartyHierarchyPage()
      .elementByCss('#Search_ProductHierarchySearch_Main_primary_display_div .bootstrap-select button').click()
      .sleep(1000)
      .elementByCss('#Search_ProductHierarchySearch_Main_primary_display_div .bootstrap-select .dropdown-menu li > a > span.text').text()
      .should.eventually.become('Search Prod Hierarchy')
      .elementByCss('#Search_ProductHierarchySearch_Main_primary_display_div .bootstrap-select .dropdown-menu li:nth-child(2) > a > span.text').text()
      .should.eventually.become('Search Product')
      .nodeify(done);
  });
});
