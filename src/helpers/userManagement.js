import { auth } from "../services/firebase";
import { db } from "../services/firebase";

import { User, userTypes } from "./Types"

import { getQueryData, setDataInDb } from "./db"

export async function createNewUser(_email) {

    var actionCodeSettings = {
        // URL you want to redirect back to. The domain (www.example.com) for this
        // URL must be in the authorized domains list in the Firebase Console.
        url: 'https://space-messengers.web.app/completeRegistration',
        // This must be true.
        handleCodeInApp: true,
    };


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



export function createUserInDb(uid, type = null) {

    let _type = type;
    if(type === null) _type = userTypes().student;
    setDataInDb("users", uid, User(uid, _type));
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
 
export function createDummyUsers() {

    createUserInDb(uid, userTypes().student);


}


