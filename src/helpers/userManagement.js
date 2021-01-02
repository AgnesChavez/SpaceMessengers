import { auth } from "../services/firebase";
import { db } from "../services/firebase";

import firebase from "firebase";

import { UserData, userTypes } from "./Types"

import { getQueryData, setDataInDb, addDataToDb } from "./db"

// export function createNewUser(_email, _name, _type=userTypes().student) {
export async function createNewUser(_email, _name, _type, _institutionId, _workshopId) {

    var actionCodeSettings = {
        // URL you want to redirect back to. The domain (www.example.com) for this
        // URL must be in the authorized domains list in the Firebase Console.
        url: 'https://space-messengers.web.app/completeRegistration',
        // This must be true.
        handleCodeInApp: true,
    };

    
    setDataInDb("unauthenticatedUsers", _email, {name:_name, type:_type, institutionId: _institutionId, workshopId:_workshopId});

    auth().sendSignInLinkToEmail(_email, actionCodeSettings)
        .then(function() {
            // The link was successfully sent. Inform the user.
            // Save the email locally so you don't need to ask the user for it again
            // if they open the link on the same device.
            // window.localStorage.setItem('emailForSignIn', _email);
            console.log("Succesfully added user");
        })
        .catch(function(error) {
            console.log("Failed adding user: error: ", error );
            // Some error occurred, you can inspect the code: error.code
        });
}



export async function createUserInDb(uid, name, type, institutionId, workshopId) {

    let _type = type;
    if(type === null) _type = userTypes().student;

    let retVal = null;
    if(uid){
        await setDataInDb("users", uid, UserData(uid, name, _type, institutionId, workshopId));
        retVal = uid;
    }else{
        let user= await addDataToDb("users", UserData("", name, _type, institutionId, workshopId), true, 'id');
        if(user) retVal = user.id;
    }
    if(institutionId !== null && institutionId !== ""){
        await db.collection("institution").doc(institutionId).update({
            members: firebase.firestore.FieldValue.arrayUnion(uid)
        });
    }
    return retVal;
}





export async function getUserFromDb(uid) {
    let usr = await getQueryData(db.collection("users").doc(uid));
    if(!usr) return null;
    // console.log("User", usr);
    let currentUser = auth().currentUser;
    if(currentUser.uid === uid)
    {
        if(!usr.photoURL){
            usr.photoURL = currentUser.photoURL;
        }
        if(!usr.displayName){
            usr.displayName = currentUser.displayName;
        }
    }

    return usr;


} 
export  function getTeamForUserWorkshop(userId, workshopId) {
    return getQueryData(db.collection("teams").where("workshop", "==", workshopId).where("members", "array-contains",  userId));
}
 
export async function checkCurrentUserDbData(){

    let query = db.collection("users").doc(auth().currentUser.uid);
    let usr = await getQueryData(query);
    if(!usr) return ;

    let dataToUpdate = {};
    let needsUpdate = false;
    if(!usr.displayName){needsUpdate = true; dataToUpdate.displayName = auth().currentUser.displayName; }
    if(!usr.photoURL) {needsUpdate = true; dataToUpdate.photoURL = auth().currentUser.photoURL; }

    if(needsUpdate){
        query.update(dataToUpdate);
    }



}

