// import React, { useRef } from 'react';
// 
// import { Button, Row, Col, TextInput } from 'react-materialize';
// 
// function EmptyUserEmail(){return ({name: "", email:""})}
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
// 	console.log(props);
// 	return (
// 		<>
// 		<Row>
// 			<Col s={12}>
// 				<h6>{props.name}</h6>
// 				<Row>
// 					<Col s={12}>
// 						{ props.data.map( i => <NameEmail data={i} />)}
// 					</Col>
// 				</Row>
// 				<Button node="button" waves="light" onClick={()=>props.data.push(EmptyUserEmail())} >{props.buttonLabel}</Button> 
// 			</Col>
// 		</Row>
// 		</>)
// }
// 
// 
// 
// export function Workshop (props){
// 
//     const formData = useRef(null);
//     
//     function getFormData(){
//     	if(formData.current === null){
//     		formData.current = {
//     			name: "",
//     			institutions: ["", ""],
//             	instructors: [],
//             	students: []
//         	}
//     	}
//     	return formData.current;
//     }
// 
// 	return (<>
//   	<Col s={12}>
//     	<Row className="z-depth-2 black-text" style={{padding: 12+'px'}}>
//     		<Col s={12}>
//      		<h5>Creating new workshop</h5>
//       		<TextInput id="workshop_name" label="Workshop name" s={12} onChange={ evt => {getFormData().name = evt.target.value}}/>
// 			<TextInput id="inst1" label="Institution 1" s={12} m={6} onChange={ evt => {getFormData().institutions[0] = evt.target.value}}/>
// 			<TextInput id="inst2" label="Institution 2" s={12} m={6} onChange={ evt => {getFormData().institutions[1] = evt.target.value}}/>
// 
// 			<AddMembers name="Instructors" data={getFormData()["instructors"]} buttonLabel="Add Instructor"/>
// 			<AddMembers name="Students" data={getFormData()["students"]} buttonLabel="Add Student"/>
// 
// 			<Button className="right" node="button" waves="light" onClick={()=>{console.log(JSON.stringify(getFormData()))}} >Save</Button> 
// 			<Button className="white black-text right" node="button" waves="light" onClick={()=>console.log("cancel clicked")} >Cancel</Button> 
// 			</Col>
// 		</Row>
// 	</Col>
// </>)
// }
// 
