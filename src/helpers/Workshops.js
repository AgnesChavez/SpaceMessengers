import React, { Component } from 'react';
// import { Link } from 'react-router-dom';
// import { auth } from "../services/firebase";
// import { db } from "../services/firebase";
// import { storageRef } from "../services/firebase";
// import { getUserFromDb } from "../helpers/auth";
// import { createNewUser } from "../helpers/userManagement";
// import { userTypes } from "../helpers/Types";
// import EmailField  from "../components/EmailField";
// import {Toast}  from "../components/Toast";

// import { addDataToDb } from "../helpers/db";

import {Icon, CollapsibleItem, Collapsible, Button, Row, Col, TextInput } from 'react-materialize';


function EmptyUserEmail(){return ({name: "", email:""})}



export class Workshop extends Component {

    constructor(props) {
        super(props);
        this.state = {
            instructors: [],
            students: [],
        };

        this.addInstructor = this.addInstructor.bind(this);
        this.addStudent = this.addStudent.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.NameEmail= this.NameEmail.bind(this);
    }

 handleChange(event, stateName, name, idx)
    {
    	console.log("handleChange(event)", event.target.value,  name );
            let obj = this.state[stateName];

            obj[idx][name] = event.target.value;
            
        this.setState({
            [stateName]: obj,
        });



    }

NameEmail(props, userType, idx){

	return (
			<>
			<TextInput label="Name" onChange={ evt => this.handleChange(evt, userType,"name", idx)}  value={props.name} s={12} m={6} />
			<TextInput label="Email" onChange={evt => this.handleChange(evt, userType, "email", idx)} value={props.email} s={12} m={6}  email validate />
			</>
		)
}



addInstructor(){
	let i = this.state.instructors;
	i.push(EmptyUserEmail());
	this.setState({instructors: i});
}

addStudent(){
	let i = this.state.students;
	i.push(EmptyUserEmail());
	this.setState({students: i});
}

render(){

	let idx = 0;
	let idx2 = 0;

	return (<>
<Row>
  <Col s={12}>
     <Row className="z-depth-2" style={{padding: 12+'px'}}>
     	<h5 className="black-text">Creating new workshop</h5>
      	<TextInput id="workshop_name" label="Workshop name" s={12} />
		<TextInput id="inst1" label="Institution 1" s={12} m={6} />
		<TextInput id="inst2" label="Institution 2" s={12} m={6} />

		<Collapsible className="z-depth-0" accordion>

   		<CollapsibleItem className="black-text" expanded={true} header=<h6>{"Instructors"}</h6> node="div" >
		
		{ this.state.instructors.map( i => this.NameEmail(i, "instructors", idx++))}
		<Button node="button" waves="light" onClick={this.addInstructor} >Add Instructor</Button> 
		
		</CollapsibleItem>

		<CollapsibleItem className="black-text" expanded={false} header=<h6>{"Students"}</h6> node="div">

		{ this.state.students.map( i => this.NameEmail(i, "students", idx2++))}
		<Button node="button" waves="light" onClick={this.addStudent} >Add Student</Button> 
		</CollapsibleItem>
		</Collapsible>

		<Button className="right" node="button" waves="light" onClick={this.save} >Save</Button> 
		<Button className="white black-text right" node="button" waves="light" onClick={this.cancel} >Cancel</Button> 
	</Row>
	</Col>
	</Row>
</>)
}
}

