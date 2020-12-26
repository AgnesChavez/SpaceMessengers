// import React, { useState } from 'react';
// 
// import { Button, Row, Col, TextInput } from 'react-materialize';
// 
// import { createNewUser, createUserInDb } from "../helpers/userManagement";
// 
// import { userTypes } from "../helpers/Types";
// 
// import { addDataToDb, setDataInDb } from "../helpers/db";
// 
// import { db } from "../services/firebase";
// 
// 
// function EmptyUserEmail(){return ({name: "", email:""})}
// 
// 
// 
// function handleChange(event, data){
// 	data[event.target.name] = event.target.value;
// }
// 
// 
// function NameEmail(props){
// 
// 	return (
// 			<>
// 			<TextInput label="Name" name="name" onChange={ evt => handleChange(evt, props.data)}   s={12} m={6} />
// 			<TextInput label="Email" name="email" onChange={ evt => handleChange(evt, props.data)}  s={12} m={6}  email />
// 			</>
// 		)
// }
// 
// function AddMembers(props){
// 	// console.log(props);
// 	return (
// 		<>
// 		<Row>
// 			<Col s={12}>
// 				<h6>{props.name}</h6>
// 				<Row>
// 					<Col s={12}>
// 						 {props.data.map(i=> <NameEmail data={i} />)}
// 						 
// 					</Col>
// 				</Row>
// 				<Button node="button" waves="light" onClick={()=>props.setData([...props.data, EmptyUserEmail()])} >{props.buttonLabel}</Button> 
// 			</Col>
// 		</Row>
// 	</>)
// }
// 
// const MAKE_DUMMY_USERS = true;
// 
// function async createUser( email, name, type, institutionId, userIds)
// 	{
// 		if(MAKE_DUMMY_USERS){
// 			let uid = await createUserInDb(null, name, type, institutionId);
// 			if(uid) userIds.push(uid);
// 			return uid;
// 		}else{
// 			await createNewUser(email, name, type, institutionId);
// 		}
// 		return null;
// 	}
// 
// 
// 
// export function Institution (props){
// 
//     		
//     	const [name, setName ] = useState("");
//         const [instructors, setInstructors ] = useState( []);
//         const [students, setStudents ] = useState( []);
// 
// 
// 
// function async create(){
// 
// 	let instRef = await getQueryData(db.collection("institution").where("name", "==", name));
// 
// 	let instId = "";
// 	if(instRef){
// 		instId = instRef.id;
// 	}else{
// 		instId = addDataToDb("institution",InstitutionData(name), true, 'id');
// 		if(instId){
// 			instId = instId.id;	
// 		} else{
// 			console.log("Failed creating workshop");
// 			return;
// 		}
// 	}
// 
// 
// 	let instructorsIds = [];
// 	instructors.map(i => await createUser(i.email, i.name, userTypes().instructor , instId, instructorsIds ));
// 	let studentsIds = [];
// 	students.map(i => await createUser(i.email, i.name, userTypes().student , instId, studentsIds ));
// 
// 	setDataInDb("institution", instId, [...instructorsIds, ...studentsIds]);
// 
// 
// }
// 	
// 
// 	return (<>
//   	<Col s={12}>
//     	<Row className="z-depth-2 black-text" style={{padding: 12+'px'}}>
//     		<Col s={12}>
// 
// 			<TextInput id="inst1" label="Institution Name" s={12} onChange={ evt => {setName(evt.target.value) }}/>
// 			<AddMembers name="Instructors" data={instructors} setData={setInstructors} buttonLabel="Add Instructor"/>
// 			<AddMembers name="Students" data={students} setData={setStudents} buttonLabel="Add Student"/>
// 
// 			</Col>
// 		</Row>
// 	</Col>
// </>)
// }
// 
