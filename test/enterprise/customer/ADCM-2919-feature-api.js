var config = require('nconf');
config.file({file: './test/lib/config.json'});

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();
var expect = chai.expect;
var request = require('supertest');

var address = config.get("address");

describe("ADCM-2919 feature API", function() {
  this.timeout(30000);

  it("should be available by the URL /DMS/feature/list", function(done) {
    request(address)
      .get('/DMS/feature/list')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) return done(err);
        expect(res.body).to.have.length(3);
        expect(res.body[0]).have.property('feature');
        expect(res.body[0]).have.property('enabled');
        done();
      });
  });
});
