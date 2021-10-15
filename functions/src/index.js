'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const app = express();

const mkdirp = require('mkdirp');
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');

// const cors = require('cors');



var serviceAccount = require("./serviceAccountKey.json");



admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // storageBucket: "space-messengers.appspot.com"

});


if (process.env.NODE_ENV === 'development') {
  firebase.functions().useFunctionsEmulator('http://localhost:5001');
}

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;


// const accountSid =


// process.env.TWILIO_ACCOUNT_SID = functions.config().twilio.account_sid;
// process.env.TWILIO_AUTH_TOKEN = functions.config().twilio.auth_token;


// const twilio = require('twilio');

// const bodyParser = require('body-parser');
// const MessagingResponse = require('twilio').twiml.MessagingResponse;

// app.use("/sms", bodyParser.urlencoded({ extended: false }));



const bearer = "iufYpsD54OUvYnl0N1ZBZmnAHoknNL+/o2pwk6iGFLKCcuUedlR6OFiCY01QIYDZLcrbF/4SnpfrTWBhsBMLM8mT7AWGbA==";

// Express middleware that validates a token passed in the Authorization HTTP header.
// The token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Token>`.
// In this case I am using a single random generated token as there is only a single computer that should be able to access this API, which already has this token.

const authenticate = async (req, res, next) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        res.status(403).send('Unauthorized');
        return;
    }
    const idToken = req.headers.authorization.split('Bearer ')[1];
    if (idToken === bearer) {
        next();
        return;
    } else {
        res.status(403).send('Unauthorized');
        return;
    }


};


app.use("/private_api", authenticate);


// app.use(cors({ origin: true }));






app.get('/api/checkEmail', async (req, res) => {

    let querySnapshot = await db.collection("users").where("email", "==", req.query.email).get();
    return res.status(200).json({valid: (querySnapshot.size > 0)});
});


async function getDocData( collection, docID){
try {
        const doc = await db.collection(collection).doc(docID).get();
        if (!doc.exists) {
            console.log('No element in '+ collection +' with id: ', docID);
            return { status: 404, data: { empty: true } };
        } else {
            return { status: 200, data: {id: doc.id, data: doc.data() }};
        }
    } catch (error) {
        
        console.log('Error getting element ', docID, " error message:", error.message);
        return { status: 500};
    }
}


async function getDoc( collection, queryID, req, res){
try {
        const doc = await db.collection(collection).doc(queryID).get();
        if (!doc.exists) {
            console.log('No element in '+ collection +' with id: ', queryID);
            return res.status(404).json({ empty: true });
        } else {
            return res.status(200).json({ id: doc.id, data: doc.data() });
        }
    } catch (error) {
        console.log('Error getting element ', queryID, " error message:", error.message);
        return res.sendStatus(500);
    }
}


async function getUser(userId){
    let user = await getDocData("users",userId);
    if(user.status === 200) return user.data.data;
    return {};
}

async function getComments(messageID){

    let query = await db.collection("comments").where("group", "==", messageID).get();
    
    let comments = [];
    // let authors_promises = [];
    for(let i = 0; i < query.docs.length; i++){
        comments.push(query.docs[i].data());
        // authors_promises.push(getUser(comments[i].uid));
        // comments[i].author = await 
    } 
    return comments;
}



async function getMessage(messageID){
    let msg = await getDocData( "boardMessages", messageID);
    if(msg.status === 200) {
        // let comments = [];
        // for( let i = 0; i < msg.data.data.comments.length; i++){
        //     comments.push(await getComments(msg.data.data.comments[i]));
        // }
        // msg.data.data.authorId = msg.data.data.uid;
        msg.data.data.comments = await getComments(messageID);
        return msg.data.data;
    }    
    return {};
    
}



async function getBoard(boardId){

try{
        let board = await getDocData( "boards", boardId);
        
        if(board.status === 200){
        // if(board.status === 500) return res.sendStatus(500);
        // if(board.status === 404) res.status(board.status).json(board.data);

        let messages = [];
        for(let i = 0; i < board.data.data.messages.length; i++){

            messages.push(getMessage(board.data.data.messages[i]));
            // console.log(m);
        }

            board.data.data.messages = await Promise.all(messages);

            return board.data;
        }

        
        // console.log("Messages: ", board.data.data.messages);
}catch(error){
    console.log("getBoard : " + boardId + " failed: " + error);
}

return {};
        // return res.status(board.status).json(board.data);

}

async function getTeam(teamId){

try{
        let team = await getDocData("teams", teamId);
        if(team.status !== 200){
            return {};
        }
        team = team.data;

        let boards = await db.collection("boards").where("teamId", "==", teamId).get();

        // console.log("team boards " + boards.docs.length);

        let teamBoardsPromises = [];
        for(let i = 0; i < boards.docs.length; i++){
            teamBoardsPromises.push(getBoard(boards.docs[i].id));
        }
        team.data.boards = await Promise.all(teamBoardsPromises);

        return team;
}catch(error){
    console.log("getTeam : " + teamId + " failed: " + error);
}
return {};
        // console.log("Messages: ", board.data.data.messages);


        // return res.status(board.status).json(board.data);

}

app.get('/private_api/getWorkshop', async (req, res) => {
try{
        console.log("getWorkshop ID: " + req.query.workshopID);
        let workshop = await getDocData("workshops", req.query.workshopID);
        
        if(workshop.status === 500) {
            console.log("getWorkshop server internal error");
            return res.sendStatus(500);
        }
        else if(workshop.status === 404) {
            console.log("getWorkshop not found");
            return res.status(workshop.status).json(workshop.data);
        }
    
       let teams = await db.collection("teams").where("workshopId", "==", req.query.workshopID).get();
        // console.log("teams ", teams.docs.length);
        let teamBoardsPromises = [];
        for(let i = 0; i < teams.docs.length; i++){
            teamBoardsPromises.push(getTeam(teams.docs[i].id));
        }

        workshop.data.data.teams = await Promise.all(teamBoardsPromises);

        let usersPromises = [];

        workshop.data.data.students.forEach( s=> usersPromises.push(getUser(s)));
            // usersPromises.push(getUser(workshop.data.data.students[i]));
        // }
        workshop.data.data.instructors.forEach( s=> usersPromises.push(getUser(s)));


        workshop.data.data.users = await Promise.all(usersPromises);



        return res.status(200).json(workshop.data);
}catch(error){
    console.log("/private_api/getWorkshop failed: " + error);
    return res.status(500);
}
});


app.get('/api/getUser/:userId', async (req, res) => {
        return getDoc( "users", req.params.userId, req, res);
});

app.get('/api/getMessage', async (req, res) => {
        return getDoc( "boardMessages", req.query.messageID, req, res);
});

// const MessagingResponse = require('twilio').twiml.MessagingResponse;

app.get('/api/getParams', async (req, res) => {
    try{
    
    const querySnapshot = await db.collection('params').get();//.doc(req.query.id);
// Update the timestamp field with the value from the server
      if (querySnapshot.empty) {
            return res.status(200).json({empty:true});
        }  

        let params = [];

        querySnapshot.forEach(doc => {
            params.push(doc.data());
            // console.log(doc.id, '=>', doc.data());
        });


        return res.status(200).json(params);
}catch(error){
    console.log("/private_api/setRealtimeWasShown failed: " + error);
    return res.sendStatus(500);
}
        
});

app.get('/private_api/setRealtimeShowing', async (req, res) => {
try{
        
    const docRef = db.collection('realtime').doc(req.query.id);

// Update the timestamp field with the value from the server
    const doc = await docRef.update({
        isShowing: true,
        wasShown: false,
        startShowing: FieldValue.serverTimestamp(),
    });

        return res.sendStatus(200);
}catch(error){
    console.log("/private_api/setRealtimeShowing failed: " + error);
    return res.sendStatus(500);
}
});


app.get('/private_api/setRealtimeWasShown', async (req, res) => {
try{
    
    const docRef = db.collection('realtime').doc(req.query.id);
// Update the timestamp field with the value from the server
    const doc = await docRef.update({
        wasShown: true,
        isShowing: false
    });

        return res.sendStatus(200);
}catch(error){
    console.log("/private_api/setRealtimeWasShown failed: " + error);
    return res.sendStatus(500);
}
});


app.get('/private_api/setRealtimeWasDeleted', async (req, res) => {
try{
    
    const docRef = db.collection('realtime').doc(req.query.id);
// Update the timestamp field with the value from the server
    const doc = await docRef.update({
        wasShown: true,
        isShowing: false
    });

    return res.sendStatus(200);
}catch(error){
    console.log("/private_api/setRealtimeWasShown failed: " + error);
    return res.sendStatus(500);
}
});

app.get('/private_api/getRealtimeDeleteMessages', async (req, res) => {
try{
        // console.log("getRealtimeMessages: " + req.query.seconds + ", " + req.query.nanoseconds);
        
        let query = db.collection("realtime").where("isShowing", "==" , true).where("isDeleted", "==" , true);

        let querySnapshot = await query.get();
        if (querySnapshot.empty) {
            return res.status(200).json({empty:true});
        }  

        let messages = [];

        querySnapshot.forEach(doc => {
            messages.push(doc.id);
        });

        return res.status(200).json({data:messages});
}catch(error){
    console.log("/private_api/getRealtimeDeleteMessages failed: " + error);
    return res.sendStatus(500);
}
});

// app.get('/api/setIsDeleted', async (req, res) => {
// try{
// 
//     let realtime = await db.collection("realtime").get();
// 
// 
//     let realtimePromises = [];
//     for(let i = 0; i < realtime.docs.length; i++){
//         realtimePromises.push(db.collection("realtime").doc(realtime.docs[i].id).set({isDeleted: false}, { merge: true }));
//     }
// 
//     await Promise.all(realtimePromises);
// 
//         return res.status(200).json({ok: true});
// }catch(error){
//     console.log("/private_api/getRealtimeMessages failed: " + error);
//     return res.sendStatus(500);
// }
// });


app.get('/private_api/getRealtimeMessages', async (req, res) => {
try{
        // console.log("getRealtimeMessages: " + req.query.seconds + ", " + req.query.nanoseconds);
        
        let query = db.collection("realtime").where("isDeleted", "==" , false);

        let seconds = parseInt(req.query.seconds);
        let nanoseconds = parseInt(req.query.nanoseconds);

        if(seconds > 0 || nanoseconds > 0){
            let startFrom = new admin.firestore.Timestamp(seconds, nanoseconds);
            query = query.where("timestamp", ">", startFrom);
        }



        let querySnapshot = await query.get();
        if (querySnapshot.empty) {
            return res.status(200).json({empty:true});
        }  

        let messages = [];

        querySnapshot.forEach(doc => {
            messages.push(doc.data());
            // console.log(doc.id, '=>', doc.data());
        });


        return res.status(200).json({data:messages});
}catch(error){
    console.log("/private_api/getRealtimeMessages failed: " + error);
    return res.sendStatus(500);
}
});


app.post('/sms', async (req, res) => {
    try {

        const msg = await db.collection('realtime').add(req.body);

        const docRef = db.collection('realtime').doc(msg.id);

        console.log("sms", req.body);

        if (!req.body.hasOwnProperty('ProfileName')) {
            const doc = await docRef.update({
                ProfileName: "SMS"
            });
        }

        const doc = await docRef.update({
            wasShown: false,
            isShowing: false,
            isDeleted: false,
            timestamp: FieldValue.serverTimestamp(),
            id: msg.id
        });

        // res.writeHead(200, { 'Content-Type': 'text/xml' });        
        return res.status(200).send("<Response></Response>");
    } catch (error) {

        console.log('SMS error ', error.message);
        return res.sendStatus(500);
    }
});



// Expose the app as a function
exports.app = functions.https.onRequest(app);