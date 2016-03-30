var config = require('nconf');
config.file({file: './test/lib/config.json'});

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
chai.should();
var expect = chai.expect;
var request = require('supertest');

var address = config.get("address");

describe("ADCM-2938 mobile API", function() {
  this.timeout(30000);

  it("should be available by the URL /IPA/user/login", function(done) {
    request(address)
      .get('/IPA/user/login')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) return done(err);
        expect(res.body).to.have.property('meta');
        done();
      });
  });
});
