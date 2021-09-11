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

    // let authors = await Promise.all(authors_promises);
    // if(comments.length === authors.length){
        // for(let i = 0; i < authors.length; i++ )    {
        //     // if(comments[i].uid === authors[i].id){
        //         comments[i].authorId = comments[i].uid;
        //     }else{
        //         console.log("Comment: " + comments[i].id + " author wrong index");
        //     }
        //     
        // }
    // }else{
    //     console.log("getComments(messageID): comments and authors lengths differ" );
    // }
    

    return comments;
    // return query.docs.map( (d) => {return d.data()});

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
    


        // workshop = workshop.data;
        
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


//         for(let i = 0; i < workshop.data.data.students.length; i++){
//             usersPromises.push(getUser(workshop.data.data.students[i]));
//         }
// 
//         for(let i = 0; i < workshop.data.data.instructors.length; i++){
//             usersPromises.push(getUser(workshop.data.data.instructors[i]));
//         }
//         

        workshop.data.data.users = await Promise.all(usersPromises);



        return res.status(200).json(workshop.data);
}catch(error){
    console.log("/private_api/getWorkshop failed: " + error);
    return res.status(500);
}
});


// app.get('/private_api/getBoard', async (req, res) => {
// 
//         
//         let board = await getDocData( "boards", req.query.boardID);
//         
//         if(board.status === 500) return res.sendStatus(500);
//         if(board.status === 404) res.status(board.status).json(board.data);
// 
//         let messages = [];
//         for(let i = 0; i < board.data.data.messages.length; i++){
// 
//             messages.push(getMessage(board.data.data.messages[i]));
//             // console.log(m);
//         }
// 
//         board.data.data.messages = await Promise.all(messages);
// 
//         
// 
//         // console.log("Messages: ", board.data.data.messages);
// 
// 
//         return res.status(board.status).json(board.data);
// 
//         
// });

app.get('/api/getUser/:userId', async (req, res) => {
        return getDoc( "users", req.params.userId, req, res);
});

app.get('/api/getMessage', async (req, res) => {
        return getDoc( "boardMessages", req.query.messageID, req, res);
});





// app.get('/api/getUser', async (req, res) => {
//         return getDoc( "users", req.query.userID, req, res);
// });



// app.get('/api/listImages', async (req, res) => {
// 
//     let querySnapshot = await db.collection("images").get();
//     let docs = [];
// 
//     querySnapshot.forEach(d=>{docs.push(d.data())})
// 
//     return res.status(200).json(docs);
// });
// 


// app.get('/api/makeAllThumbs', async (req, res) => {
// 
//     let querySnapshot = await db.collection("images").get();
//     
// 
//     
//     const results = [];
//     for(let i = 0; i < querySnapshot.docs.length; i++){
//     	let d = querySnapshot.docs[i];
// 
// 		results.push(makeThumb(d.data().imagePath, d.id));
// 
//     	// paths.push({success, imagePath: d.data().imagePath, id: d.id});
//     }
// 
//     let paths = await Promise.all(results);
// 
//     return res.status(200).json(paths);
// });

// app.get('/api/numImages', async (req, res) => {
// 	let querySnapshot = await db.collection("images").get();
// 	return res.status(200).json({numImages: querySnapshot.docs.length});
// });

// app.get('/api/noThumbs', async (req, res) => {
// 
//     let querySnapshot = await db.collection("images").get();
//     
// 
//     let noThumbs = [];
//     for(let i = 0; i < querySnapshot.docs.length; i++){
//     	if(!querySnapshot.docs[i].data().thumbURL){
//     		noThumbs.push(querySnapshot.docs[i].id);
//     	}
//     }
//     return res.status(200).json(noThumbs);
//     
// });

// app.get('/api/makeThumb', async (req, res) => {
// 
//     let querySnapshot = await db.collection("images").get();
//     let success = false;
//     let index = req.query.index;
//     if(index < querySnapshot.docs.length){
//     	
//     	let d = querySnapshot.docs[index];
// 		success = await makeThumb(d.data().imagePath, d.id);
// 		return res.status(200).json({success, imagePath: d.data().imagePath, id: d.id});
//     }
//     return res.status(200).json({fail: true});
//     
// });

// app.get('/api/makeThumbById', async (req, res) => {
// 
//     let d = await db.collection("images").doc(req.query.id).get();
//     if(d){
// 		let success = await makeThumb(d.data().imagePath, d.id);
// 		return res.status(200).json({success, imagePath: d.data().imagePath, id: d.id});
// 	}
//     return res.status(200).json({fail: true});
// });

// async function getPublicUrl(file) {
//     
//     file.makePublic((err, apiResponse) =>{
//     	if(err){console.log("getPublicUrl failed", err);}
// 
//     });
// 
//     const fileMetadata = await file.getMetadata();
//     // functions.logger.log("getPublicUrl: ", fileMetadata);
//     return fileMetadata[0].mediaLink;
// }



// async function makeThumb(imgPath, imageId) {
// 	if(!imgPath || imgPath === "") return false;
// 
// 	console.log("makeThumb(" + imgPath+", "+imageId+")");
// 	let bucket = admin.storage().bucket();
// 	let file = bucket.file(imgPath); 
// 
// 	try{
// 	let e = await file.exists();
//     if (!e[0]) {
// 		console.log('No file for making thumb: ');
// 		return false;
// 	}
// 	}catch(error){
// 		console.log('error checking file exists.  errormessage: ', error.message);
// 		return false;
// 	}
// 
//     // Get the file name.
//     const filePath = file.name; // File path in the bucket.
//     const fileName = path.basename(filePath);
//     const fileDir = path.dirname(filePath);
//     const extension = path.extname(fileName).toLowerCase();
//     
//     // const baseFileName = path.basename(fileName, extension);
//     console.log('Attempt to make thumbnail for : ', filePath);
//     // functions.logger.log("Make Thumb. fileName: "+ fileName + " filePath: " + filePath + " fileDir: " + fileDir);
//     // Exit if the image is already a thumbnail.
//     if (fileName.startsWith('thumb_')) {
//     	console.log('Already a Thumbnail.');
//         return false;
//        // return false functions.logger.log('Already a Thumbnail.');
//     }
// 
//     const thumbFileName = "thumb_" + fileName;
// 
//     const thumbFilePath = path.join(fileDir, thumbFileName);
// 
//     console.log("thumbFilePath: " + thumbFilePath);
// 
//     let d = await bucket.file(thumbFilePath).exists();
//     if (d[0] === true) {
//     console.log("There is already a thumb ", thumbFilePath);
//     return false;
//     }
// 
//     const tempFilePath = path.join(os.tmpdir(), fileName.replace(/ /g, "_"));
// 
//     // FORCING THUMB TO BE JPEG
//     // const tempFilePathJPEG = path.join(os.tmpdir(), "thumb_" + baseFileName.replace(/ /g, "_") + ".jpg");
// 
//     try {
//         await bucket.file(filePath).download({ destination: tempFilePath });
//         console.log('Image downloaded locally to', tempFilePath);
//         // Generate a thumbnail using ImageMagick.
//         let convertResult = await spawn('convert', [tempFilePath, '-resize', 'x300>', tempFilePath], { capture: ['stdout', 'stderr'] });
//         console.log('convert stdout', JSON.stringify(convertResult));
// 
//         console.log('Thumbnail created at', tempFilePath);
//         // Uploading the thumbnail.
//         // const uploadedFile = await bucket.upload(tempLocalThumbFile, {destination: thumbFilePath, metadata: metadata});
//         // const metadata = {
//         //     contentType: "image/jpeg",
//         // };
// 
//         let contentType = (await file.getMetadata())[0].contentType;
// 
// 		const metadata = {
//             contentType: contentType,
//         };
// 
// 
//         bucket.upload(tempFilePath, {
//             destination: thumbFilePath,
//             metadata: metadata,
//             resumable: false,
//             public: true
//         }, async (err, newFile) =>{
//             if (err) {
//                 console.log("uploading thumbnail ", imageId, " failed. error: ", err);
//                 return false;
//             } else {
// 
//                 let pictureURL = await getPublicUrl(newFile);
// 
//                 const userRef = db.collection('images').doc(imageId);
//                 const doc = await userRef.get();
//                 if (doc.exists) {
//                     let pic = {};
//                     const updateRes = await userRef.update({thumbURL: pictureURL});
//                 }
// 
//                 console.log("generateThumbnail.ThumbURL: ", pictureURL);
//                 return true;
//             }
//         });
// 
// 
//     } catch (error) {
//         console.log('generateThumbnail: Error ', error.message);
//         if ('stderr' in error) {
//             console.log('generateThumbnail: stderr ', error.stderr);
//         }
//         return false;
//     }
// // 
// //     fs.unlinkSync(tempFilePathJPEG);
// //     fs.unlinkSync(tempFilePath);
//     return true;
// }

// exports.makeThumb = functions.firestore
//     .document('images/{imageId}')
//     .onCreate((snap, context) => {
// 		makeThumb(snap.data().imagePath, snap.id);
// });



// Expose the app as a function
exports.app = functions.https.onRequest(app);