import { auth } from "../services/firebase";
import { db } from "../services/firebase";

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

    if(uid){
        await setDataInDb("users", uid, UserData(uid, name, _type, institutionId, workshopId));
        return uid;
    }else{
        let user= await addDataToDb("users", UserData("", name, _type, institutionId, workshopId), true, 'id');
        if(user) return user.id;
    }
    return null;

    // db.collection("users").doc(uid).set(User(uid, _type))
    // .then(function() {
    //     console.log("User successfully written!");
    // })
    // .catch(function(error) {
    //     console.error("Error creating user: ", error);
    // });
}





export function getUserFromDb(uid) {
    return getQueryData(db.collection("users").doc(uid));

} 
export  function getTeamForUserWorkshop(userId, workshopId) {
    return getQueryData(db.collection("teams").where("workshop", "==", workshopId).where("members", "array-contains",  userId));
}
 
