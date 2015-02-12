var assert = require('assert');
var request = require('supertest');

var app = require('../index');
var pg = require('../lib/postgres');

var DATABASE_URL = 'postgres://username:password@localhost/test';

describe('Tutorial REST API', function() {
  before(function(done) {
    pg.initialize(DATABASE_URL, done);
  });
  describe('Create photo', function() {
    it('returns the created resource on success', function(done) {

      var validPhotoResource = {
        description: 'Photo created on ' + Date.now(),
        album_id: 1
      };

      request(app)
        .post('/photo')
        .field('description', validPhotoResource.description)
        .field('album_id', validPhotoResource.album_id)
        .attach('photo', __dirname + '/abe.jpg')
        .expect(201)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          assert.ok(res.body.id);
          assert.equal(res.body.description, validPhotoResource.description);
          assert.equal(res.body.album_id, validPhotoResource.album_id);
          done();
        });
    });
    it('returns 400, with error message on bad request', function(done) {

      var badPhotoResource = {
        // Missing two properties
        album_id: 1
      };

      request(app)
        .post('/photo')
        .attach('photo', __dirname + '/abe.jpg')
        .field('album_id', badPhotoResource.album_id)
        .expect(400)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          assert.equal(res.body.errors[0], 'Invalid description');
          done();
        });
    });
  });
});
