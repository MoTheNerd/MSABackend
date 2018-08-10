var express = require('express');
var multer = require('multer');
var router = express.Router();
var upload = multer();
var bodyParser = require('body-parser');

import Q from 'q'
import 'babel-polyfill';
import { db } from '../app';

router.use(bodyParser.json()); // for parsing application/json
router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

/* GET Jummah Timing Listing. */
router.get('/', async function (req, res, next) {
  console.log("GET / @general")
  res.send(await callDB());
});

let callDB = async () => {
  var res = Q.defer();
  const response = await db.collection("general").find().toArray((error, results) => {
    if (error) res.reject(error);

    if (results) {
      res.resolve(results)
    } else {
      //not found
      res.resolve();
    }
  })

  console.log(await res.promise)

  return res.promise;
};

//remember, post is non-destructive
//curl -XPOST -H "Content-type: application/json" -d '{"key": "content"}' 'http://localhost:3001/path'
router.post('/', upload.array(), function (req, res, next) {
  res.json(req.body)
});

module.exports = router;
