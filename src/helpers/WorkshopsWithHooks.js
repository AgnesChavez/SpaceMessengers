import React, { useState } from 'react';

import { Button, Row, Col, TextInput } from 'react-materialize';

import { createNewUser, createUserInDb } from "../helpers/userManagement";

import { userTypes, InstitutionData, WorkshopData } from "../helpers/Types";

import { getQueryData, addDataToDb, setDataInDb } from "../helpers/db";

import { db } from "../services/firebase";


function EmptyUserEmail(){return ({name: "", email:""})}



function handleChange(event, data){
	data[event.target.name] = event.target.value;
}


function NameEmail(props){

	return (
			<>
			<TextInput label="Name" name="name" onChange={ evt => handleChange(evt, props.data)}   s={12} m={6} />
			<TextInput label="Email" name="email" onChange={ evt => handleChange(evt, props.data)}  s={12} m={6}  email />
			</>
		)
}

function AddMembers(props){
	// console.log(props);
	let j=0;
	return (
		<>
		<Row>
			<Col s={12}>
				<h6>{props.name}</h6>
				<Row>
					<Col s={12}>
						 { props.data.map(i=> <NameEmail key={j++} data={i} />)}
						 
					</Col>
				</Row>
				<Button node="button" waves="light" onClick={()=>props.setData([...props.data, EmptyUserEmail()])} >{props.buttonLabel}</Button> 
			</Col>
		</Row>
	</>)
}

const MAKE_DUMMY_USERS = false;

async  function createUser( email, name, type, institutionId, workshopId, userIds)
	{
		if(MAKE_DUMMY_USERS){
			let uid = await createUserInDb(null, name, type, institutionId, workshopId);
			if(uid){
				userIds.push(uid);
			} 
			return uid;
		}else{
			await createNewUser(email, name, type, institutionId, workshopId);
		}
		return null;
	}





async function create(name, institution, instructors, students){


	let wsRef = await addDataToDb("workshops", WorkshopData(name), true, 'id');

	if(wsRef === null)
	{
		console.log("Failed creating workshop");
		return;	
	}
	let wsId = wsRef.id;
 
	
	let instRef = await getQueryData(db.collection("institution").where("name", "==", institution));

	let instId = "";
	if(instRef){
		instId = instRef.id;
	}else{
		let inst = await addDataToDb("institution",InstitutionData(institution), true, 'id');
		if(inst){
			instId = inst.id;	
		} else{
			console.log("Failed creating institution");
			return;
		}
	}

	// console.log("Institution ID: ", instId);

	var membersIds = [];
	for(let i = 0; i < instructors.length; i++){
		await createUser(instructors[i].email, instructors[i].name, userTypes().instructor , instId, wsId, membersIds );
	}


	for(let i = 0; i < students.length; i++){
		await createUser(students[i].email, students[i].name, userTypes().student , instId, wsId, membersIds );
	}

	if(MAKE_DUMMY_USERS){

		await setDataInDb("institution", instId, {members: membersIds}, true);

	}
// 	console.log("Members: " , membersIds );
// 
// 	console.log("membersIds.length  " , membersIds.length);
// 
// 
// 	console.log("Members: " , membersIds );
// 
// 
// 	console.log("Members: " , JSON.stringify(membersIds) );
// 

	// membersIds.map( i => console.log(i));


	// let docRef = db.collection("institution").doc(instId);



	// membersIds.map( i => docRef.update({ members: firebase.firestore.FieldValue.arrayUnion(i)}) ) ;
		
	

	// for(let i = 0; i < membersIds.length; i++)
	// {
	// 	console.log(membersIds[i]);
	// 	await docRef.update({
	// 		members: firebase.firestore.FieldValue.arrayUnion(membersIds[i])
	// 	});
	// 	
	// }

	// db.collection("institution").doc(instId).update({members: membersIds});

	





	// db.collection("institution")
	// Atomically add a new region to the "regions" array field.
// 	let instData = await getQueryData( db.collection("institution").doc(instId));
// 
// 	instData.members = membersIds;
// 
// 	console.log("instData: ", instData);


	// setDataInDb("institution", instId, instData, false) ;
		// members: firebase.firestore.FieldValue.arrayUnion(membersIds)
	// });



}






export function Workshop (props){

    		
    	const [name, setName ] = useState("");
    	const [institution, setInstitution ] = useState( "" );
        const [instructors, setInstructors ] = useState( []);
        const [students, setStudents ] = useState( []);



	

	return (<>
  	<Col s={12}>
    	<Row className="z-depth-2 black-text" style={{padding: 12+'px'}}>
    		<Col s={12}>
     		<h5>Creating new workshop</h5>
     		{/* <p>{name}</p> */}
      		<TextInput id="workshop_name" label="Workshop name" s={12} onChange={ evt => {setName(evt.target.value)}}/>

			<TextInput id="inst1" label="Institution 1" s={12} onChange={ evt => {setInstitution(evt.target.value) }}/>
			<AddMembers name="Instructors" data={instructors} setData={setInstructors} buttonLabel="Add Instructor"/>
			<AddMembers name="Students" data={students} setData={setStudents} buttonLabel="Add Student"/>

			<Button className="right" node="button" waves="light"  onClick={()=>create(name, institution, instructors, students)}>Create</Button> 
			<Button className="white black-text right" node="button" waves="light" onClick={()=>console.log("cancel clicked")} >Cancel</Button> 
			</Col>
		</Row>
	</Col>
</>)
}

