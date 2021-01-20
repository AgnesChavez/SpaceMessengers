'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const app = express();
// const path = require('path');

// const cors = require('cors')({origin: true});
// var request = require('request');
// var fs = require('fs');
// 
// import { AvatarGenerator } from 'random-avatar-generator';
//  
// const generator = new AvatarGenerator();
//  
// Simply get a random avatar
// generator.generateRandomAvatar();
 
// Optionally specify a seed for the avatar. e.g. for always getting the same avatar for a user id.
// With seed 'avatar', always returns https://avataaars.io/?accessoriesType=Kurt&avatarStyle=Circle&clotheColor=Blue01&clotheType=Hoodie&eyeType=EyeRoll&eyebrowType=RaisedExcitedNatural&facialHairColor=Blonde&facialHairType=BeardMagestic&hairColor=Black&hatColor=White&mouthType=Sad&skinColor=Yellow&topType=ShortHairShortWaved
// generator.generateRandomAvatar('avatar'); 

const Types = require('./Types.js');

const Utils = require('./utils.js');



// Express middleware that validates a token passed in the Authorization HTTP header.
// The token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Token>`.
// In this case I am using a single random generated token as there is only a single computer that should be able to access this API, which already has this token.

// const authenticate = async (req, res, next) => {
//     if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
//         res.status(403).send('Unauthorized');
//         return;
//     }
//     const idToken = req.headers.authorization.split('Bearer ')[1];
//     if (idToken == bearer) {
//         next();
//         return;
//     } else {
//         res.status(403).send('Unauthorized');
//         return;
//     }
// };

// app.use("/api", authenticate);

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






async function addDataToDb(dataBaseName, data, autoAddId = true, idFieldName="docId") {
    
    try{
        let docRef = await db.collection(dataBaseName).add(data);   

        if(autoAddId)
        {
            await docRef.update({[idFieldName]: docRef.id});
        }

        return docRef;
    }
    catch(error)
    {
        console.error("Error adding document to " + dataBaseName, error);
    }
    return null;
}

function setDataInDb(dataBaseName, docName, data, _merge = false) {

    let docRef = db.collection(dataBaseName).doc(docName);

    if(!Array.isArray(data)){


    // }else{
        docRef.set(data, { merge: _merge })
        .then(()=> {
            functions.logger.log(docName +  " successfully written to " + dataBaseName);
            return null; 
        })
        .catch((error) => {
            console.error("Error creating document " + docName +  " in " + dataBaseName + " error: ", error);
        });
    }
}

async function getQueryData(query) {
    try{

    let res = await query.get();
    if(res.exists)
        return res.data();
    }
    catch(error) {
        console.error("Error retrieving query data:  error: ", error);
        return null;
    }
    return null;
} 



async function createNewUser(_email, _name, _type, _institutionId, _workshopId) {

    if(_email === null || _email === "" || typeof(_email) !== 'string')
        return false;
    var actionCodeSettings = {
        // URL you want to redirect back to. The domain (www.example.com) for this
        // URL must be in the authorized domains list in the Firebase Console.
        url: 'https://space-messengers.web.app/completeRegistration',
        // This must be true.
        handleCodeInApp: true,
    };

    
    
    try{
    admin.auth().sendSignInLinkToEmail(_email, actionCodeSettings)
        
        setDataInDb("unauthenticatedUsers", _email, {name:_name, type:_type, institutionId: _institutionId, workshopId:_workshopId});
        // The link was successfully sent. Inform the user.
        // Save the email locally so you don't need to ask the user for it again
        // if they open the link on the same device.
        // window.localStorage.setItem('emailForSignIn', _email);
        functions.logger.log("Succesfully added user");

    }
    catch(error){
        functions.logger.log("Failed adding user: error: ", error );
        // return false;
        // Some error occurred, you can inspect the code: error.code
    }

    return true;

}


function setDefault(param, defaultVal){
    return (param?param:defaultVal);
}



async function addToArray(collectionId, docId, arrayId, data)
{
    await db.collection(collectionId).doc(docId).update({
        [arrayId] : FieldValue.arrayUnion(data)
    });
}


async function createUserInDb(uid, name, type, institutionId) {



    let _type = type;
    if(type === null) _type = Types.student;

    let userId = null;
    if(uid){
        await setDataInDb("users", uid, Types.UserData(uid, name, _type, institutionId));
        userId = uid;
    }else{
        let user= await addDataToDb("users", Types.UserData("", name, _type, institutionId), true, 'id');
        if(user) userId = user.id;
    }

    return userId;
}




app.get('/api/test', async (req, res) => {
 
    // let success = await createNewUser("macdonald.roy@protonmail.com", "Roy Macdonald", Types.student, "", "");

    await createUserInDb("e5ohIfDKFsMuuSVGi2Xa3bpkHH53", 'Roy Macdonald', Types.admin, null);
    await createUserInDb("G86Q9rf4KvfDdF61ciDLZ78xbWG2", 'Agnes Chavez', Types.admin, null);

    return res.status(200).json({success: true});

// 
//     let users = await db.collection('users').get();
// 
//     users.forEach(doc => {
//         db.collection('users').doc(doc.id).set({currentBoard: null}, {merge:true});
//         
//       // console.log(doc.id, '=>', doc.data());
//     });

    // return res.status(200).json({id: r.id});

// 
//     let users = await db.collection('boards').get();
// 
//     users.forEach(doc => {
//         db.collection('boards').doc(doc.id).set({color: Types.randomColorHSL()}, {merge:true});
//         
//       // console.log(doc.id, '=>', doc.data());
//     });

//     let collectionId = 'boardMessages';
//     const messages = await db.collection(collectionId).get();
// 
//     messages.forEach(doc => {
//         db.collection(collectionId).doc(doc.id).set({color: Types.randomColorHSL()}, {merge:true});
//     });


        // createNewUser("rjmacdon@puc.cl", "roy", Types.student, null,   null);


    // generateDummyUsers();
//     let t = null;
//     let s = '';
//     let c = 'zxcvb';
// 
//     functions.logger.log("isNull " + ((!t)?"true":"false"));
//     functions.logger.log("isEmpty " + ((!s)?"true":"false"));
//     functions.logger.log("isEmpty " + ((!c)?"true":"false"));
    // return res.status(200).json({ok:true});
});


 
// app.post('/api/createUserInDb', async (req, res) => {
// 
//     // let validUser = await checkPostUserId(req, res, Types.admin);
//     // if (!validUser) return;
// 
//     let uid = setDefault(req.body.uid,"");
//     let name = setDefault(req.body.name,"");
//     let type = setDefault(req.body.type,"student");
//     let institutionId = setDefault(req.body.institutionId,"");
//     let workshopId = setDefault(req.body.workshopId,"");
// 
// 
//     let validUid = await createUserInDb(uid, name, type, institutionId, workshopId);
// 
//     return res.status(200).json({success: (validUid?true:false), id: validUid });
// 
// });


app.post('/api/createNewUser', async (req, res) => {

    let validUser = await checkPostUserId(req, res, Types.admin);
    if (!validUser) return;

    let email = setDefault(req.body.email,"");
    let name = setDefault(req.body.name,"");
    let type = setDefault(req.body.type,"student");
    let institutionId = setDefault(req.body.institutionId,"");
    let workshopId = setDefault(req.body.workshopId,"");


    let success = await createNewUser(email, name, type, institutionId, workshopId);

    res.status(200).json({success: success });


});

// 
// async function generateDummyUsers(){
//     let workshopId = await createWorkshop("Dummy Workshop");
// 
//     
//     let institution_1 = await createInstitution("A", workshopId);
// 
//     
//     let institution_2 = await createInstitution("B", workshopId);
// 
//     functions.logger.log("students_1", institution_1.students);
//     functions.logger.log("students_2", institution_2.students);
// 
//     for(let i = 0; i < 10; i+=2){
//         let members = [];
//         members.push(institution_1.students[i]);
//         members.push(institution_1.students[i+1]);
//         members.push(institution_2.students[i]);
//         members.push(institution_2.students[i+1]);
//         let doc = await addDataToDb("teams", Types.TeamData(workshopId, members) , true, "id");
//         if(doc) {
//             addDataToDb("boards", Types.BoardData(doc.id, "Board!"), true, "id");
//         }    
//     }
// 
// }



async function createWorkshop(name){
    let doc = await addDataToDb("workshops", Types.WorkshopData(name) , true, "id");
    if(doc) return doc.id;
    return null;
}


async function generateUsers(type, institutionId, num)
{

    // let users = [];
    // for(let i =0; i < num; i++){
    //     users.push( await createUserInDb(null, "Student 1", type, institutionId));
    // }
    // return users;

}

async function createInstitution(name, workshopId){



    let doc = await addDataToDb("institution", Types.InstitutionData(name) , true, "id");
    if(!doc) return null;

    let students = await generateUsers(Types.student, doc.id, 10);
    let instructors = await generateUsers(Types.instructor, doc.id, 2);

    students.map(u => addUserToWorkshop(u, workshopId,Types.student));
    instructors.map(u => addUserToWorkshop(u, workshopId,Types.instructor));

    return ({
        id: doc.id,
        name, 
        students
    });

     // return doc.id;
    
}


function addUserToWorkshop(userId, workshopId, userType){
    if(!userId || !workshopId) return;


    if(userType === Types.instructor){
        addToArray("workshops", workshopId, "instructors", userId);    
    }

    if(userType === Types.student){
        addToArray("workshops", workshopId, "students", userId);    
    }
}




function addUserToTeam(userId, teamId){
    if(!userId || !teamId) return;

    addToArray("teams",  teamId, "members", userId );

}




// GET /api/get/:userId
// Get a users data
// app.get('/api/get/:userId', async (req, res) => {
// 
//     try {
//         const userRef = db.collection('users').doc(req.params.userId);
//         const doc = await userRef.get();
//         if (!doc.exists) {
//             functions.logger.log('No user with id: ', req.params.userId);
//             return res.status(404).json({ empty: true });
//         } else {
//             res.status(200).json(doc.data());
//         }
// 
//     } catch (error) {
//         functions.logger.log('Error getting user ', req.params.userId, " errormessage", error.message);
//         return res.sendStatus(500);
//     }
// });


// GET /api/getNext
// Get next available image to be processed
// app.get('/api/getNext', async (req, res) => {
// 
//     try {
//         const usersRef = db.collection('users');
// 
//         const unprocessed = await usersRef.where('downloaded', '==', false).where('availableForDownload', '==', true).orderBy('created', 'asc').limit(1).get();
// 
//         // functions.logger.log("Api/GetNext: ", req);
//         
//         removeBgFromNext();
//         
//         if (unprocessed.empty) {
//             return res.status(200).json({ empty: true });
//         } else {
//             return res.status(200).json({ id: unprocessed.docs[0].id, data: unprocessed.docs[0].data() });
//         }
//     } catch (error) {
//         functions.logger.log('Error getting next message', error.message);
//         return res.sendStatus(500);
//     }
// });


// GET /api/getStats
// Get statistics. (used for populating the websites footer)
// app.get('/public_api/getStats', async (req, res) => {
// 
//     try {
//         const usersRef = db.collection('users');
// 
// 
//         const queue = await usersRef.where('processed', '==', false).get();
//         var statsQueue = (queue.empty) ? 0 : queue.docs.length;
// 
//         const processed = await usersRef.where('processed', '==', true).get();
//         var statsProcessed = (processed.empty) ? 0 : processed.docs.length;
// 
// 
//         // const current = await usersRef.where('isPrinting', '==', true).orderBy('printBegin', 'desc').limit(1).get();
//         // var statsCurrent = (current.empty) ? "" : current.docs[0].data();
// 
//         var jsonObj = { queue: statsQueue, processed: statsProcessed };
// 
//         if(req.query.getNext && req.query.getNext == 1)
//         {
//             let unprocessed = await usersRef.where('downloaded', '==', false).where('processed', '==', false).where('availableForDownload', '==', true).orderBy('created', 'asc').limit(3).get();
// 
//             if(unprocessed.empty){                
//                 jsonObj.next = "";
//             }else{
//                 
//                 let next = "";
//                 for(let i = 0; i < unprocessed.docs.length; i++){
//                     if(i > 0)
//                     {
//                         next += ", ";    
//                     }
//                     next += unprocessed.docs[i].data().completename;
//                 }
// 
//                 jsonObj.next = next;
//             }
//         }
// 
//         return res.status(200).json(jsonObj);
//     } catch (error) {
//         functions.logger.log('Error getting next message', error.message);
//         return res.sendStatus(500);
//     }
// });



// helper function that updates a user's value
// async function updateValue(res, userId, value) {
//     try {
//         // functions.logger.log('updateValue : ', req);
//         const userRef = db.collection('users').doc(userId);
//         const doc = await userRef.get();
//         if (!doc.exists) {
//             functions.logger.log('No user with id: ', userId);
//             return res.status(404).json({ empty: true });
//         } else {
//             const updateRes = await userRef.update(value);
//             return res.status(200).json(updateRes);
//         }
//     } catch (error) {
//         functions.logger.log('Error updating value', error.message);
//         return res.sendStatus(500);
//     }
// }
// 
// function removeUser(userId){
//         db.collection('users').doc(userId).delete().then(() => {
//         functions.logger.log('Document successfully deleted.');
// 
//         let imgs = ['original_img.png', 'processed.png', 'removedBG.png', 'thumb_original_img.jpg', 'thumb_processed.jpg'];
// 
// 
//         var bucket = admin.storage().bucket();
//         let filePath = "images/" + userId + "/";
// 
// 
//         imgs.forEach(i => {
// 
//             const file = bucket.file(filePath + i);
//             file.delete(function(err, apiResponse) {
//                 if (err) {
//                     // functions.logger.log("error deleting file: " + filePath + i);//, " err: ", err, " response: ", apiResponse);
//                 }
//             });
//         });
//     });
// }

// app.get('/api/removeUser', (req, res) => {
//     removeUser(req.query.userId);
//     return res.status(200).json({ status: "ok" });

// });

// Confirm that a users image was downloaded to be processed. 
// Calling this function is what enables the waiting queue to move
// The userId comes in as URL param /api/confirmDownload?userId=xxxxxxxxxxxxxxxxx
// app.get('/api/confirmDownload', (req, res) => {
//     return updateValue(res, req.query.userId, { downloaded: true });
// });


async function checkUserExists(userId, type) {
    const userRef = db.collection('users').doc(userId);
    const doc = await userRef.get();
    return (doc.exists && doc.data().type === type );
}


async function validateUserId(userId, type) {
    if (userId !== null && userId !== "") {
        if (await checkUserExists(userId, type)) {
            return userId;
        }
    }
    return null;
}


// async function getPublicUrl(file) {
//     file.makePublic(function(err, apiResponse) {
// 
//     });
// 
//     const fileMetadata = await file.getMetadata();
//     // functions.logger.log("getPublicUrl: ", fileMetadata);
//     return fileMetadata[0].mediaLink;
// }

async function checkPostUserId(req, res, type) {
    var userId = await validateUserId(req.body.userId, type);

    if (userId === null) {
        res.status(404).json({ success: false, userId: req.body.userId, error: "UserId is invalid. It does not match any in the database or has wrong type" });
        return false;
    }
    return true;
}


/// endpoint for marking the begining of a print
// fields:
// userId: the user's id
// app.post('/api/setPrintBegin', async (req, res) => {
// 
//     let validUser = await checkPostUserId(req, res);
//     if (!validUser) return;
// 
//     var userId = req.body.userId;
//     const userRef = db.collection('users').doc(userId);
// 
//     let response = await userRef.set({ printBegin: FieldValue.serverTimestamp(), isPrinting: true }, { merge: true });
//     await setCurrentlyPrinting(userId);
//     removeBgFromNext();
// 
// 
// 
//     const doc = await userRef.get();
//     if (doc.exists) {
//         const queue = await db.collection('users').where('created', '>=', doc.data().created).orderBy('created', 'desc').limit(2).get();
// 
//         // queue.forEach(d =>  {
//         for(let i = 0; i < queue.size; i++ ) {
//             if(queue.docs[i].data().sentPreEmail == false){
//                 sendNotificationMail(queue.docs[i].id, "", queue.docs[i].data().email, queue.docs[i].data().lang, 'pre');
//                 await db.collection('users').doc(queue.docs[i].id).set({ sentPreEmail: true }, { merge: true });
//             }
//         }
//     }
//             
// 
//     functions.logger.log("/api/setPrintBegin ", response);
// 
//     res.status(200).json({ success: true, userId });
//     return;
// });


// 
// endpoint for uploading a processed image
// multi-part POST request.
// fields:
// userId: the user's id
// image: the actual image file (as a file buffer)
// app.post('/api/makeThumb', async (req, res) => {
// 
//     var userId = req.body.userId;
// 
//     try {
//         let validUser = await checkPostUserId(req, res);
//         if (!validUser) return;
// 
// 
//         let bucket = admin.storage().bucket();
//         let file = bucket.file("images/" + userId + "/processed.png"); "/removedBG.png");
// 
//         let e = await file.exists();
//         if (!e[0]) {
//             functions.logger.log('No file for making thumb: ', userId);
//             return res.status(404).json({ empty: true });
//         } else {
//             makeThumb(file, bucket);
//             res.status(200).json({ makingThumb: true });
//         }
// 
//     } catch (error) {
//         functions.logger.log('Error getting user ', userId, " errormessage", error.message);
//         return res.sendStatus(500);
//     }
// });


// app.get('/api/getNotRemovedBgList', async (req, res) => {
// 
//         
// 
//         const usersRef = db.collection('users');
//         const unprocessed = await usersRef.where('downloaded', '==', false).where('availableForDownload', '==', false).where('removedBg', '==', false).orderBy('created', 'asc').get();
// 
//         if (unprocessed.empty) {
//             functions.logger.log('removeBgFromNext. Nothing to be processed');
//             return res.status(200).json({ success: "removeBgFromNext. Nothing to be processed" });
//             // return;
//         } else {
//             let data = new Array();
//             
//             unprocessed.docs.forEach(doc =>{
//                 if(doc.data().originalImage != ""){
//                     data.push({id: doc.id, created: doc.data().created.toDate(), originalImage: doc.data().originalImage, removeBgImage: doc.data().removeBgImage, waitingForRemoveBg:doc.data().waitingForRemoveBg });    
//                 }
//                 
//             });
//             return res.status(200).json(data); 
//         }         // let userId = unprocessed.docs[0].id;
// 
//             
//             // return res.status(200).json({unprocessed: unprocessed.docs});
//         // }       
// });



// async function setRemovedBgData(userId, pictureURL) {
// 
//     const userRef = db.collection('users').doc(userId);
//     await db.runTransaction(async (t) => {
//         const doc = await t.get(userRef);
//         if (doc.exists) {
//             t.update(userRef, { removeBgImage: pictureURL });
//             t.update(userRef, { removedBg: true });
//             t.update(userRef, { availableForDownload: true });
//             t.update(userRef, { waitingForRemoveBg: false});
//             t.set(userRef, { removedBgDate: FieldValue.serverTimestamp() }, { merge: true });
//         }
//     });
// }



// async function makeThumb(file, bucket) {
// 
// 
//     // const contentType = file.metadata.contentType; // File content type.
//     // if (!contentType.startsWith('image/')) {
//     //     return functions.logger.log('This is not an image.', file.metadata);
//     // }
// 
// 
// 
//     // Get the file name.
//     const filePath = file.name; // File path in the bucket.
//     const fileName = path.basename(filePath);
//     const fileDir = path.dirname(filePath);
//     const extension = path.extname(fileName).toLowerCase();
//     const userId = path.basename(fileDir);
//     const baseFileName = path.basename(fileName, extension);
//     functions.logger.log('Attempt to make thumbnail for : ', filePath);
//     // functions.logger.log("Make Thumb. fileName: "+ fileName + " filePath: " + filePath + " fileDir: " + fileDir);
//     // Exit if the image is already a thumbnail.
//     if (fileName.startsWith('thumb_')) {
//         return;
//         // return functions.logger.log('Already a Thumbnail.');
//     }
// 
//     const thumbFileName = "thumb_" + baseFileName + ".jpg";
// 
//     const thumbFilePath = path.join(fileDir, thumbFileName);
// 
// 
//     // let d = await bucket.file(thumbFilePath).exists();
//     // if (d[0] == true) {
//     // functions.logger.log("There is already a thumb");
//     // return;
//     // }
// 
//     const tempFilePath = path.join(os.tmpdir(), userId + fileName);
//     // FORCING THUMB TO BE JPEG
//     const tempFilePathJPEG = path.join(os.tmpdir(), userId + baseFileName + ".jpg");
// 
//     try {
//         await bucket.file(filePath).download({ destination: tempFilePath });
//         functions.logger.log('Image downloaded locally to', tempFilePath);
//         // Generate a thumbnail using ImageMagick.
//         let convertResult = await spawn('convert', [tempFilePath, '-resize', '300x', tempFilePathJPEG], { capture: ['stdout', 'stderr'] });
//         functions.logger.log('convert stdout', convertResult.stdout.toString());
// 
//         functions.logger.log('Thumbnail created at', tempFilePathJPEG);
//         // Uploading the thumbnail.
//         // const uploadedFile = await bucket.upload(tempLocalThumbFile, {destination: thumbFilePath, metadata: metadata});
//         const metadata = {
//             contentType: "image/jpeg",
//         };
// 
//         bucket.upload(tempFilePathJPEG, {
//             destination: thumbFilePath,
//             metadata: metadata,
//             resumable: false,
//             public: true
//         }, async function(err, newFile) {
//             if (err) {
//                 functions.logger.log("uploading thumbnail ", userId, " failed. error: ", err);
//             } else {
// 
//                 let pictureURL = await getPublicUrl(newFile);
// 
//                 const userRef = db.collection('users').doc(userId);
//                 const doc = await userRef.get();
//                 if (doc.exists) {
//                     let pic = {};
//                     pic["thumb_" + baseFileName] = pictureURL;
//                     const updateRes = await userRef.update(pic);
//                 }
// 
//                 functions.logger.log("generateThumbnail.ThumbURL: ", pictureURL);
//             }
//         });
// 
// 
//     } catch (error) {
//         functions.logger.log('generateThumbnail: Error ', error.message);
//         if ('stderr' in error) {
//             functions.logger.log('generateThumbnail: stderr ', error.stderr);
//         }
//         return;
//     }
// 
//     fs.unlinkSync(tempFilePathJPEG);
//     return fs.unlinkSync(tempFilePath);
// 
// 
// }



// Expose the app as a function
exports.app = functions.https.onRequest(app);