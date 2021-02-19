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

async function getPublicUrl(file) {
    
    file.makePublic((err, apiResponse) =>{
    	if(err){console.log("getPublicUrl failed", err);}

    });

    const fileMetadata = await file.getMetadata();
    // functions.logger.log("getPublicUrl: ", fileMetadata);
    return fileMetadata[0].mediaLink;
}



async function makeThumb(imgPath, imageId) {
	if(!imgPath || imgPath === "") return false;

	console.log("makeThumb(" + imgPath+", "+imageId+")");
	let bucket = admin.storage().bucket();
	let file = bucket.file(imgPath); 

	try{
	let e = await file.exists();
    if (!e[0]) {
		console.log('No file for making thumb: ');
		return false;
	}
	}catch(error){
		console.log('error checking file exists.  errormessage: ', error.message);
		return false;
	}

    // Get the file name.
    const filePath = file.name; // File path in the bucket.
    const fileName = path.basename(filePath);
    const fileDir = path.dirname(filePath);
    const extension = path.extname(fileName).toLowerCase();
    
    // const baseFileName = path.basename(fileName, extension);
    console.log('Attempt to make thumbnail for : ', filePath);
    // functions.logger.log("Make Thumb. fileName: "+ fileName + " filePath: " + filePath + " fileDir: " + fileDir);
    // Exit if the image is already a thumbnail.
    if (fileName.startsWith('thumb_')) {
    	console.log('Already a Thumbnail.');
        return false;
       // return false functions.logger.log('Already a Thumbnail.');
    }

    const thumbFileName = "thumb_" + fileName;

    const thumbFilePath = path.join(fileDir, thumbFileName);

    console.log("thumbFilePath: " + thumbFilePath);

    let d = await bucket.file(thumbFilePath).exists();
    if (d[0] === true) {
    console.log("There is already a thumb ", thumbFilePath);
    return false;
    }

    const tempFilePath = path.join(os.tmpdir(), fileName.replace(/ /g, "_"));

    // FORCING THUMB TO BE JPEG
    // const tempFilePathJPEG = path.join(os.tmpdir(), "thumb_" + baseFileName.replace(/ /g, "_") + ".jpg");

    try {
        await bucket.file(filePath).download({ destination: tempFilePath });
        console.log('Image downloaded locally to', tempFilePath);
        // Generate a thumbnail using ImageMagick.
        let convertResult = await spawn('convert', [tempFilePath, '-resize', 'x300>', tempFilePath], { capture: ['stdout', 'stderr'] });
        console.log('convert stdout', JSON.stringify(convertResult));

        console.log('Thumbnail created at', tempFilePath);
        // Uploading the thumbnail.
        // const uploadedFile = await bucket.upload(tempLocalThumbFile, {destination: thumbFilePath, metadata: metadata});
        // const metadata = {
        //     contentType: "image/jpeg",
        // };

        let contentType = (await file.getMetadata())[0].contentType;

		const metadata = {
            contentType: contentType,
        };


        bucket.upload(tempFilePath, {
            destination: thumbFilePath,
            metadata: metadata,
            resumable: false,
            public: true
        }, async (err, newFile) =>{
            if (err) {
                console.log("uploading thumbnail ", imageId, " failed. error: ", err);
                return false;
            } else {

                let pictureURL = await getPublicUrl(newFile);

                const userRef = db.collection('images').doc(imageId);
                const doc = await userRef.get();
                if (doc.exists) {
                    let pic = {};
                    const updateRes = await userRef.update({thumbURL: pictureURL});
                }

                console.log("generateThumbnail.ThumbURL: ", pictureURL);
                return true;
            }
        });


    } catch (error) {
        console.log('generateThumbnail: Error ', error.message);
        if ('stderr' in error) {
            console.log('generateThumbnail: stderr ', error.stderr);
        }
        return false;
    }
// 
//     fs.unlinkSync(tempFilePathJPEG);
//     fs.unlinkSync(tempFilePath);
    return true;
}

// exports.makeThumb = functions.firestore
//     .document('images/{imageId}')
//     .onCreate((snap, context) => {
// 		makeThumb(snap.data().imagePath, snap.id);
// });



// Expose the app as a function
exports.app = functions.https.onRequest(app);