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

/* GET users listing. */
router.get('/', async function (req, res, next) {
  console.log("GET / @users")
  res.send(await getUsers());
});

let getUsers = async () => {
  var res = Q.defer();
  await db.collection("Users").find().toArray((error, results) => {
    if (error) res.reject(error);

    if (results) {
      res.resolve(results)
    } else {
      //not found
      res.resolve();
    }
  })
  let formattedUsers = formatUsers(await res.promise)
  return formattedUsers;
};

function formatUsers(users) {
  var updatedUsers = [];
  users.forEach(user => {
    updatedUsers.push({
      name: user.name,
      email: user.email,
      dob: user.dob,
      role: user.role,
      image: user.image,
      description: user.description,
      discipline: {
        faculty: user.discipline.faculty,
        year: user.discipline.year,
        specialization: user.discipline.specialization ? user.discipline.specialization : "N/A"
      }
    })
  })
  return (updatedUsers)
}

//remember, post is non-destructive
//curl -XPOST -H "Content-type: application/json" -d '{"key": "content"}' 'http://localhost:3001/path'
router.post('/', upload.array(), function (req, res, next) {
  var user = req.body
  db.collection("users").insertOne(user, (error, result)=>{
    console.log("error:\n", error)
    console.log("\n\n\n\n\n\nresult:\n", result)
  })
  res.json(req.body)
});

module.exports = router;
