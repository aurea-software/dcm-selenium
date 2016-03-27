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

describe("create contract kit", function() {
  this.timeout(300000);
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

  it("should create new contract kit", function  (done) {
    var id = uuid.v4().substring(0, 32);
    var hier = {
        name: 'CK Prod Hier ' + id
      };
    var party = {
        name: 'CK Org Party ' + id,
        taxId: id,
        syncWithPdb: false,
        roles: ['contractKitProvider'],
        street: 's1',
        city: 'c1',
        zipCode: '90210'
      };
    var ck = {
      name: 'CK ' + id,
      contractKitProvider: party.name,
      productHierarchy: hier.name
    }
    var columnElementId;

    browser
      .dcm({url: url})
      .dcmLogin(username, password)
      .dcmCreateOrgParty(party)
      .dcmCreateProductHierarchy(hier)
      .dcmCreateContractKit(ck)
      .dcmCompensationTab()
      .dcmContractKitPage()
      .dcmSearchContractKitByName(ck.name)
      .elementByCss('table#Grid_Contracts_Main thead tr th#Field_Contracts_Main_Name_Grid')
      .then(function (element) {
        columnElementId = element.value;
      })
      .elementsByCss('table#Grid_Contracts_Main thead tr th').then(function (elements) {
        var i;
        for (i = 0; i < elements.length; ++i) {
          if (elements[i].value != columnElementId) {
            continue;
          }
          break;
        }
        return browser.elementByCss('table#Grid_Contracts_Main tbody tr:nth-child(1) td:nth-child(' + (i + 1) +  ')')
      })
      .text()
      .should.eventually.become(ck.name.toUpperCase())
      .nodeify(done);
  });
});
