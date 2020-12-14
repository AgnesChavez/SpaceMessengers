import { auth } from "../services/firebase";
import { db } from "../services/firebase";


export const userTypes = {
    student :"student",
    instructor: "instructor",
    admin: "admin"
}


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



export function createUserInDb(uid) {

    db.collection("users").doc(uid).set({
        id : uid,
        type : userTypes.student,
        location : "",
        bio : "",
        workshops : [],
        groups : [],
        photoURL: null
    })
    .then(function() {
        console.log("User successfully written!");
    })
    .catch(function(error) {
        console.error("Error creating user: ", error);
    });
}

export async function getUserFromDb(uid) {
    try{

    let user = await db.collection("users").doc(uid).get();
    if(user.exists)
        return user.data();
    }
    catch(error) {
        console.error("Error retrieving user: ", uid, "  error: ", error);
        return null;
    }
    return null;
} 

