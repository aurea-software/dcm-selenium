var config = require('nconf');
config.file({file: './test/lib/config.json'});

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();
var expect = chai.expect;
var request = require('supertest');

var address = config.get("address");

describe("ADCM-2920 feature API", function() {
  this.timeout(30000);

  it("should contain Easier feature after installation", function(done) {
    request(address)
      .get('/DMS/feature/list')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) return done(err);
        expect(res.body).to.deep.include.members([{"feature": "EASIER", "enabled": "true"}]);
        done();
      });
  });
});
