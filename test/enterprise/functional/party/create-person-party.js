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

describe("create person party", function() {
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

  it("should create new person party", function  (done) {
    var taxId = uuid.v4().substring(0, 32);
    var party = {
        firstName: 'TestParty' + taxId,
        lastName: 'LN',
        syncWithPdb: false,
        taxId: taxId,
        roles: ['distributor'],
        street: 's1',
        city: 'c1',
        zipCode: '90210'
      };
    var taxColumnElementId;

    browser
      .dcm({url: url})
      .dcmLogin(username, password)
      .dcmCreatePersonParty(party)
      .dcmPartyTab()
      .dcmPersonPartyPage()
      .dcmSearchPersonPartyByTaxId(party.taxId)
      .elementByCss('table#Grid_Person_Main thead tr th#Field_Person_Main_TaxID_Grid')
      .then(function (element) {
        taxColumnElementId = element.value;
      })
      .elementsByCss('table#Grid_Person_Main thead tr th').then(function (elements) {
        var i;
        for (i = 0; i < elements.length; ++i) {
          if (elements[i].value != taxColumnElementId) {
            continue;
          }
          break;
        }
        return browser.elementByCss('table#Grid_Person_Main tbody tr:nth-child(1) td:nth-child(' + (i + 1) +  ')')
      })
      .text()
      .should.eventually.become(party.taxId.toUpperCase())
      .nodeify(done);
  });
});
