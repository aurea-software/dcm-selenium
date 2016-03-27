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

var uuid = require('node-uuid');

describe("create product hierarchy", function() {
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

  it("should create new product hierarchy", function  (done) {
    var id = uuid.v4().substring(0, 32);
    var hier = {
        name: 'ProdHier' + id
      };
    var columnElementId;

    browser
      .dcm({url: url})
      .dcmLogin(username, password)
      .dcmCreateProductHier(hier)
      .dcmHierarchyTab()
      .dcmProductHierarchyPage()
      .dcmSearchProductHierarchyByName(hier.name)
      .elementByCss('table#Grid_ProductHierarchySearch_ProductHierarchy thead tr th#Field_ProductHierarchySearch_Main_Name_Grid')
      .then(function (element) {
        columnElementId = element.value;
      })
      .elementsByCss('table#Grid_ProductHierarchySearch_ProductHierarchy thead tr th').then(function (elements) {
        var i;
        for (i = 0; i < elements.length; ++i) {
          if (elements[i].value != columnElementId) {
            continue;
          }
          break;
        }
        return browser.elementByCss('table#Grid_ProductHierarchySearch_ProductHierarchy tbody tr:nth-child(1) td:nth-child(' + (i + 1) +  ')')
      })
      .text()
      .should.eventually.become(hier.name.toUpperCase())
      .nodeify(done);
  });
});
