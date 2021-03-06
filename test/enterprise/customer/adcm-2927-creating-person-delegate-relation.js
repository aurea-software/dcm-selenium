var config = require('nconf');
config.file({file: './test/lib/config.json'});

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();
var expect = chai.expect;

var DCM = require('dcm-selenium-common');
var wd = DCM(require('wd'));

var url = config.get("url");
var username = config.get("username");
var password = config.get("password");

var uuid = require('node-uuid');

describe("ADCM-2927 creating person delegate relation", function() {
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

  it("should not throw exception", function(done) {
    var taxId = uuid.v4().substring(0, 32);
    var party = {
      firstName: 'DelegatorParty' + taxId,
      lastName: 'LN',
      syncWithPdb: false,
      taxId: taxId,
      roles: ['distributor'],
      street: 's1',
      city: 'c1',
      zipCode: '90210'
    };

    browser
      .dcm({url: url})
      .dcmLogin(username, password)
      .dcmCreatePersonParty(party)
      .dcmPartyTab()
      .dcmPersonPartyPage()
      .dcmSearchPersonPartyByTaxId(party.taxId)
      .dcmNewPersonPartyDelegatePage()
      .elementByCss('a#cancel').click()
      .elementByCssOrNull('h3.heading').then(function (value) {
        expect(value).to.be.null;
      })
      .nodeify(done);
  });
});
