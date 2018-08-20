var express = require('express');
var multer = require('multer');
var router = express.Router();
var upload = multer();
var bodyParser = require('body-parser');

import Q from 'q'
import 'babel-polyfill';
import { db } from '../app';
import firebase from 'firebase'
import gen from "uid-generator"

const generator = new gen()

const _fir_options = {
    apiKey: process.env.A,
    authDomain: process.env.B,
    databaseURL: process.env.C,
    projectID: process.env.D,
    storageBucket: process.env.E,
    messagingSenderId: process.env.F,
}

firebase.initializeApp(_fir_options)

const firauth = firebase.auth()

router.use(bodyParser.json()); // for parsing application/json
router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

/* GET login Auth */ // Need to check if Firebase Logs in. If it logs in, check database for userdata (against email) and send the value back.

router.post('/login', upload.array(), async function (req, res, next) {
    res.send(await getUserInfo(req.body));
});

/* SET create Auth */ // Need to check if Firebase Logs in. If it logs in, create userData and upload to database. on success, send value back to firebase.
router.post('/create', upload.array(), async function (req, res, next) {
    res.send(await createUser(req.body))
});

router.post('/update', upload.array(), async function (req, res, next) {
    res.send(await updateUser(req.body))
});

/* SEND password reset */ // to implement
// router.get('/login', async function (req, res, next) {
//     console.log("Areeba")
//     res.send(await getUserInfo(req.body));
// });

async function updateUser(userInfo) {
    let retData = Q.defer()

    let dbInfo = {
        name: userInfo.name,
        description: userInfo.description,
        discipline: {
            year: userInfo.discipline.year,
            faculty: userInfo.discipline.faculty,
            specialization: userInfo.discipline.specialization,
        },
    }
    db.collection("users").replaceOne({ email: userInfo.email }, dbInfo, (err, result) => {
        if (err) retData.reject(err)
        else {
            retData.resolve({ success: true, data: dbInfo });
        }
    })

    return await retData.promise
}

async function getUserInfo(userInfo) {
    console.log(userInfo)
    let firuser = Q.defer()
    let retData = Q.defer()
    firauth.signInWithEmailAndPassword(userInfo.email, userInfo.password)
        .then((user) => {
            firuser.resolve(user)
            db.collection("users").findOne({ email: userInfo.email }, (error, result) => {
                if (error) retData.reject(error)
                else {
                    retData.resolve({ success: true, data: result })
                    firauth.signOut()
                }
            })
        }, (error) => {
            retData.reject({
                success: false,
                error: error,
            })
        })
    return await retData.promise
}

async function createUser(userInfo) {

    let dbInfo = {
        name: userInfo.name,
        email: userInfo.email,
        role: userInfo.role,
        // image: await generator.generate(),
        description: userInfo.description,
        discipline: {
            year: userInfo.discipline.year,
            faculty: userInfo.discipline.faculty,
            specialization: userInfo.discipline.specialization,
        },
    }
    let firuser = Q.defer()
    let retData = Q.defer()
    console.log(userInfo)
    firauth.createUserWithEmailAndPassword(userInfo.email, userInfo.password)
        .then((user) => {
            firuser.resolve(user)
            db.collection("users").insert(dbInfo, (err, result) => {
                if (err) retData.reject(err)
                else {
                    retData.resolve({ success: true, data: dbInfo });
                    firauth.signOut()
                }
            })
        }, (error) => {
            retData.reject({
                success: false,
                error: error,
            })
        })
    return await retData.promise
}

module.exports = router;
