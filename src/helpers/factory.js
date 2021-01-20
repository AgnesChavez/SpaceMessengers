


import { db } from "../services/firebase";

import { addDataToDb, addToArray } from './db'

import firebase from 'firebase/app';

import {
		userTypes,
		// Color,
		// randomColorHSL,
		// WorkshopData,
		TeamData,
		// UserData,
		BoardData,
		InstitutionData,
		// BoardMessageData
	}

 from "../helpers/Types"

export async function createTeam(teamName, workshopId){

	const newTeam = await addDataToDb("teams", TeamData(teamName, workshopId), true, "id");
	await createBoard("Your board", newTeam.id);
	return newTeam.id;
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

export function addBoardToUser(boardId, userId){
	db.collection('users').doc(userId).update({
                        boards: firebase.firestore.FieldValue.arrayUnion(boardId)
                    });
}

export function removeBoardFromUser(boardId, userId){
	db.collection('users').doc(userId).update({
                        boards: firebase.firestore.FieldValue.arrayRemove(boardId)
                    });
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





export async function createInstitution(name, workshopId, students, instructors){



    let doc = await addDataToDb("institution", InstitutionData(name) , true, "id");
    if(!doc) return null;

    students.map(u => addUserToWorkshop(u, workshopId,userTypes().student));
    instructors.map(u => addUserToWorkshop(u, workshopId,userTypes().instructor));

    return ({
        id: doc.id,
        name, 
        students
    });
     // return doc.id;
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






