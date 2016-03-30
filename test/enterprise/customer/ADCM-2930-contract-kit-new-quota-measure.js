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

describe("ADCM-2930 Contract Kit - New Quota Measure", function() {
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

  it("should not throw exception", function(done) {
    var id = uuid.v4().substring(0, 32);
    var org = {
      name: 'Org For CompHier ' + id,
      taxId: id,
      syncWithPdb: false,
      roles: ['contractKitProvider'],
      street: 's1',
      city: 'c1',
      zipCode: '90210'
    };
    var prodHier = {
      name: 'Prod Hier ' + id
    };
    var ck = {
      name: 'CK ' + id,
      contractKitProvider: org.name,
      productHierarchy: prodHier.name
    };
    var quota = {
      name: 'CK Quota ' + id,
      initialMeasure: 'allocation.getWeight()'
    };

    browser
      .dcm({url: url})
      .dcmLogin(username, password)
      .dcmCreateOrgParty(org)
      .dcmCreateProductHierarchy(prodHier)
      .dcmCreateContractKit(ck)
      .dcmCompensationTab()
      .dcmContractKitPage()
      .dcmSearchContractKitByName(ck.name)
      .dcmCreateContractKitQuota(quota)
      .dcmNewContractKitsQuotasMeasurePage()
      .elementByCss('h3.heading').text()
      .should.eventually.become('New Measure')
      .nodeify(done);
  });
});
