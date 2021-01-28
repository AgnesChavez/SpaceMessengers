'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const app = express();

var serviceAccount = require("./serviceAccountKey.json");


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "space-messengers.appspot.com"

});


if (process.env.NODE_ENV === 'development') {
  firebase.functions().useFunctionsEmulator('http://localhost:5001');
}

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;


app.get('/api/checkEmail', async (req, res) => {

    let querySnapshot = await db.collection("users").where("email", "==", req.query.email).get();
    return res.status(200).json({valid: (querySnapshot.size > 0)});
});

// app.get('/api/test', async (req, res) => {
// 
//     await activateUserFromDb("Kua9YD81BVPkwSCNcah6");
// 
//     return res.status(200).json({ok:true});
// 
// });






// Expose the app as a function
exports.app = functions.https.onRequest(app);