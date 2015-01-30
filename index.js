var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json({ type: 'application/json' }));

var postgres = require('./lib/postgres');

function lookupPhoto(req, res, next) {
  var photoId = req.params.id;
  var sql = 'SELECT * FROM photo WHERE id = $1';
  postgres.client.query(sql, [ photoId ], function(err, results) {
    if (err) {
      console.error(err);
      res.statusCode = 500;
      return res.json({ errors: ['Could not retrieve photo'] });
    }
    if (results.rows.length === 0) {
      res.statusCode = 404;
      return res.json({ errors: ['Photo not found']});
    }

    req.photo = results.rows[0];
    next();
  });
}

var photoRouter = express.Router();
photoRouter.get('/', function(req, res) { });
photoRouter.post('/', function(req, res) {
  var sql = 'INSERT INTO photo (description, filepath, album_id) VALUES ($1,$2,$3) RETURNING id';
  var data = [
    req.body.description,
    req.body.filepath,
    req.body.album_id
  ];
  postgres.client.query(sql, data, function(err, result) {
    if (err) {
      console.error(err);
      res.statusCode = 500;
      return res.json({
        errors: ['Could not create photo']
      });
    }

    var photoId = result.rows[0].id;
    var sql = 'SELECT * FROM photo WHERE id = $1';
    postgres.client.query(sql, [ photoId ], function(err, result) {
      if (err) {
        console.error(err);
        res.statusCode = 500;
        return res.json({ errors: ['Could not retrieve photo after create'] });
      }

      res.statusCode = 201;
      res.json(result.rows[0]);
    });
  });
});
photoRouter.get('/:id', lookupPhoto, function(req, res) {
  res.json(req.photo);
});
photoRouter.patch('/:id', function(req, res) { });
app.use('/photo', photoRouter);

module.exports = app;
