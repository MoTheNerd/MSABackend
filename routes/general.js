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
  res.send(await getJummahTimes());
});

/* SET Jummah Timing Listing */
router.post('/', upload.array(), async function (req, res, next) {
  res.send(await setJummahTimes(req.body))
});

let getJummahTimes = async () => {
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
  return res.promise;
};

let setJummahTimes = async (data = {}) => {
  var res = Q.defer();
  db.dropCollection("general", (delGenErr, delGenRes) => {
    db.createCollection("general", (creGenErr, creGenRes) => {
      if (creGenRes) {
        db.collection("general").insert(data, (err, result) => {
          if (err) console.log(err);
          else res.resolve({ success: true, data: data });
        })
      }
    })
  })
  return await res.promise;
};

module.exports = router;
