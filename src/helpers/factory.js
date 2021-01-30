
import { db } from "../services/firebase";

import {  getQueryData, addDataToDb, addToArray, setDataInDb, removeFromArray } from './db'

import firebase from 'firebase/app';

import {
		userTypes,
		// Color,
		randomColorHSL,
		// WorkshopData,
		TeamData,
		// UserData,
		BoardData,
		InstitutionData,
		// BoardMessageData
	}

 from "../helpers/Types"

import { createNewUser, createUserInDb } from "../helpers/userManagement";


export async function deleteUser(userId){
        if(!userId) return;
        try{
        	await db.collection('users').doc(userId).delete();
        }catch(error){
            console.error("Error removing document: ", error);
        }
        
 }


export async function createTeam(teamName, workshopId){

	const newTeam = await addDataToDb("teams", TeamData(teamName, workshopId), true, "id");
	await createBoard("Your board", newTeam.id);
	return newTeam.id;
}


export function makeDefaultBoard(){
	setDataInDb('boards', 'default',{
        id: "default",
    messages: [],
    teamId:null,
    name: "",
    color: randomColorHSL(),
    created: firebase.firestore.FieldValue.serverTimestamp(),
        });
}

export async function createBoard(boardName, teamId){
	const newBoard = await addDataToDb("boards", BoardData(teamId, boardName), true, "id");
	if(newBoard){
		const team = await db.collection("teams").doc(teamId).get();
		// console.log(team);
		if(team.exists){
			team.data().members.forEach(m => addBoardToUser(newBoard.id, m) );	
		} 

	}
}

export async function removeBoard(boardId){
	const users = await db.collection("users").where("boards", "array-contains", boardId).get();

	users.forEach(user => removeBoardFromUser(boardId, user.id));


	db.collection('boards').doc(boardId).delete().then(function() {
            console.log("Document successfully deleted!");
        }).catch(function(error) {
            console.error("Error removing document: ", error);
        });
}

function doIfUserExists(userId, func){
	
	let userRef = db.collection('users').doc(userId);

	userRef.get().then(function(doc) {
    if (doc.exists) {
    	func(userRef, doc);
        // console.log("Document data:", doc.data());
    } else {
        // doc.data() will be undefined in this case
        // console.log("No such document!");
    }
	}).catch(function(error) {
    	console.log("Error getting user:", error);
	});

}


export function addBoardToUser(boardId, userId){

	doIfUserExists(userId, (userRef, userData) =>{
		userRef.update({boards: firebase.firestore.FieldValue.arrayUnion(boardId)});}
		);
	
}

export function removeBoardFromUser(boardId, userId){
	doIfUserExists(userId, (userRef, userData)=>{
		userRef.update({boards: firebase.firestore.FieldValue.arrayRemove(boardId)});}
		);
}

export async function addUserToTeam(userId, teamId){
	db.collection('teams').doc(teamId).update({
                        members: firebase.firestore.FieldValue.arrayUnion(userId)
                    });	
	let boards = await db.collection('boards').where('teamId', '==', teamId).get();
	boards.forEach( b => addBoardToUser(b.id, userId));

}

export async function removeUserFromTeam(userId, teamId){
	db.collection('teams').doc(teamId).update({
                        members: firebase.firestore.FieldValue.arrayRemove(userId)
                    });
	let boards = await db.collection('boards').where('teamId', '==', teamId).get();
	boards.forEach( b => removeBoardFromUser(b.id, userId));
}


export async function removeTeam(teamId){
	let team = await getQueryData(db.collection("teams").doc(teamId));
	if(team){
		let success = removeDoc("teams", teamId);
		if(success){
			let boards = await db.collection('boards').where('teamId', '==', teamId).get();
			boards.forEach( b => removeBoard(b.id));

			return true;
		}
	}
	return false;
}


const MAKE_DUMMY_USERS = true;

export async  function createUser( userData, type, institutionId, workshopId)
	{
		if(MAKE_DUMMY_USERS){
			let uid = await createUserInDb(null, userData, type, institutionId, workshopId);
			return uid;
		}else{
			await createNewUser(userData, type, institutionId, workshopId);
		}
		return null;
	}




export async function createSchool(name, location, workshopId, instructors, students){

	let instRef = await getQueryData(db.collection("institution").where("name", "==", name));

	let instId = "";
	if(instRef){
		instId = instRef.id;
	}else{
		let inst = await addDataToDb("institution",InstitutionData(name, location), true, 'id');
		if(inst){
			instId = inst.id;	
		} else{
			console.log("Failed creating school");
			return;
		}
	}

	addToArray('workshops', workshopId, "institutions", instId);

	for(let i = 0; i < instructors.length; i++){
		await createUser(instructors[i], userTypes().instructor , instId, workshopId );
	}


	for(let i = 0; i < students.length; i++){
		await createUser(students[i], userTypes().student , instId, workshopId );
	}
}




export function addUserToWorkshop(userId, workshopId, userType){
    if(!userId || !workshopId) return;


    if(userType === userTypes().instructor){
        addToArray("workshops", workshopId, "instructors", userId);    
    }

    if(userType === userTypes().student){
        addToArray("workshops", workshopId, "students", userId);    
    }
}

export function removeUserFromWorkshop(userId, workshopId, userType){

    if(userType === userTypes().instructor){
        removeFromArray("workshops", workshopId, "instructors", userId);    
    }

    if(userType === userTypes().student){
        removeFromArray("workshops", workshopId, "students", userId);    
    }
}    

export async function removeDoc(collectionId, docId){
	try{
		await db.collection(collectionId).doc(docId).delete();		
		return true;
	}catch(error){
		console.log("Unable to remove Document " + collectionId +"."+ docId );
		return false;
	}
}





