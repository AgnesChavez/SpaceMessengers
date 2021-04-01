import { auth } from "../services/firebase";
import { db } from "../services/firebase";

import firebase from "firebase";

import { UserData, userTypes } from "./Types"

import { getQueryData, setDataInDb, addDataToDb, removeFromArray } from "./db"

import { createTeam, addUserToTeam, addUserToWorkshop,removeUserFromWorkshop } from './factory'

// export function createNewUser(_email, _name, _type=userTypes().student) {
export async function sendLogInEmail(email){
    var actionCodeSettings = {
        // URL you want to redirect back to. The domain (www.example.com) for this
        // URL must be in the authorized domains list in the Firebase Console.
        url: 'https://space-messengers.web.app/completeRegistration',
        // This must be true.
        handleCodeInApp: true,
    };

    

    auth().sendSignInLinkToEmail(email, actionCodeSettings)
        .then(function() {
            // console.log("Succesfully added user");
        })
        .catch(function(error) {
            console.log("Failed sending authentiaction: error: ", error );
            // Some error occurred, you can inspect the code: error.code
        });
}


// export async function createNewUser(_email, _name, _type, _institutionId, _workshopId) {
// 
//     var actionCodeSettings = {
//         // URL you want to redirect back to. The domain (www.example.com) for this
//         // URL must be in the authorized domains list in the Firebase Console.
//         url: 'https://space-messengers.web.app/completeRegistration',
//         // This must be true.
//         handleCodeInApp: true,
//     };
// 
//     
// 
//     auth().sendSignInLinkToEmail(_email, actionCodeSettings)
//         .then(function() {
//             setDataInDb("unauthenticatedUsers", _email, {name:_name, type:_type, institutionId: _institutionId, workshopId:_workshopId});
// 
//             console.log("Succesfully added user");
//         })
//         .catch(function(error) {
//             console.log("Failed adding user: error: ", error );
//             // Some error occurred, you can inspect the code: error.code
//         });
// }

async function addOrCreateTeam(teamName, uid, workshopId){
    try{    
    // console.log("addOrCreateTeam", teamName, uid, workshopId);

    let team = await db.collection("teams").where("name", '==', teamName).where('workshopId','==', workshopId).get();
    let teamId;
    // console.log(team);
    if(team.empty){
        teamId = await createTeam(teamName, workshopId);
    }else{
        teamId = team.docs[0].id;
    }
    await addUserToTeam(uid, teamId);
    }catch(error){
        console.log("addOrCreateTeam error", error);
    }
}

export async function createUserInDb(uid, userData, type, institutionId, workshopId) {
    // console.log("createUserInDb", uid, userData, type, institutionId, workshopId);
    let _type = type;
    if(type === null) _type = userTypes().student;

    let userId = null;
    if(uid){
        await setDataInDb("users", uid, UserData(uid, userData, _type, institutionId, workshopId));
        userId = uid;
    }else{
        let user= await addDataToDb("users", UserData("", userData, _type, institutionId, workshopId), true, 'id');
        if(user) userId = user.id;
    }
    
    if(userId){
        if( 'team' in userData){
            await addOrCreateTeam(userData.team, userId, workshopId);
        }
        if(institutionId !== null && institutionId !== ""){
            await db.collection("institution").doc(institutionId).update({
                members: firebase.firestore.FieldValue.arrayUnion(userId)
            });
        }
        addUserToWorkshop(userId, workshopId, type);
    }else{
        console.log("invalid user id when atempting to create user in database");
    }


    return userId;
}

export async function removeUser(userId) {
    let user = await getUserFromDb(userId);
    if(user){
        if(user.type !== userTypes().admin){
            let workshops = await db.collection("workshops")
                .where((user.type === userTypes().instructor)?"instructors":"students", "array-contains", userId).get();
            workshops.forEach(ws=> removeUserFromWorkshop(userId, ws.id, user.type));
        
            let teams = await db.collection("teams").where("members", "array-contains", userId).get();
            teams.forEach(team=> removeFromArray("teams", team.id, "members", userId));
        
            let schools = await db.collection("institution").where("members", "array-contains", userId).get();
            schools.forEach(school=> removeFromArray("institution", school.id, "members", userId));
        }
        try{
            await db.collection("users").doc("userId").delete();
            return true;
        }catch(error) {
            console.error("Error removing user: ", error);
            return false;
        }
    }
    return false;
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


export async function getWorkshopStudents(workshopId) {
    console.log("getWorkshopStudents", workshopId);
    if(!workshopId)return null;

    let workshop = await db.collection("workshops").doc(workshopId).get();

    if(!workshop || !workshop.exists )return null;

    let users = [];

    workshop.data().students.forEach(async (s) =>  {

        let usr = await getUserFromDb(s);
        if(usr){
            users.push({id: s, displayName: usr.displayName, photoURL: usr.photoURL });
        }
    })

    return users;
}
