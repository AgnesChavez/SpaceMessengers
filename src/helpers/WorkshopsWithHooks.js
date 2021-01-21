import React, { useState, useRef, useEffect } from 'react';

import { Button, Row, Col, TextInput, Preloader } from 'react-materialize';

import { userTypes, InstitutionData, WorkshopData } from "../helpers/Types";

import { getQueryData, addDataToDb, addToArray } from "../helpers/db";

import { db } from "../services/firebase";

import {createSchool} from '../helpers/factory'


function EmptyUserEmail(useTeam){
	let u = {name: "", email:""};
	if(useTeam)u.team ="";
	return u;
}



function handleChange(event, data){
	data[event.target.name] = event.target.value;
}


function NameEmail(props){

	return (
			<>
			<TextInput label="Name" name="name" onChange={ evt => handleChange(evt, props.data)}   s={12} m={5} />
			<TextInput label="Email" name="email" onChange={ evt => handleChange(evt, props.data)}  s={12} m={5}  email />
			{props.useTeam && <TextInput label="Team name" name="team" onChange={ evt => handleChange(evt, props.data)}  s={12} m={2} /> }
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
						 { props.data.map(i=> <NameEmail key={j++} data={i} useTeam={props.useTeam}/>)}
						 
					</Col>
				</Row>
				<Button node="button" waves="light" onClick={()=>props.setData([...props.data, EmptyUserEmail(props.useTeam)])} >{props.buttonLabel}</Button> 
			</Col>
		</Row>
	</>)
}



async function makeSchool(wsId, institution, location, instructors, students, setSending){

	// console.log("makeSchool", students);
	setSending(true);
	createSchool(institution, location, wsId, instructors, students);
	setSending(false);


	}


function School(props){

		

    return (<>
		<TextInput id={"inst"+props.id} label= {"School name"} s={12} m={6} onChange={ evt => {props.setInstitution(evt.target.value) }}/>
		<TextInput id={"instLoc"+props.id} label= {"School Location"} s={12} m={6} onChange={ evt => {props.setLocation(evt.target.value) }}/>
		<AddMembers name="Instructors" data={props.instructors} setData={props.setInstructors} buttonLabel="Add Instructor" />
		<AddMembers name="Students" data={props.students} setData={props.setStudents} buttonLabel="Add Student" useTeam/>
	</>);

}

export function Workshop (props){

    		
    	const [name, setName ] = useState("");
    	// const [institution, setInstitution ] = useState( "" );
     //    const [instructors, setInstructors ] = useState( []);
     //    const [students, setStudents ] = useState( []);
        const [sending, setSending] = useState(false);


        const [school1Sending, setSchool1Sending] = useState(false);
        const [school2Sending, setSchool2Sending] = useState(false);

        const [institution1, setInstitution1 ] = useState( "" );
        const [instructors1, setInstructors1 ] = useState( []);
        const [students1, setStudents1 ] = useState( []);
	
        const [institution2, setInstitution2 ] = useState( "" );
        const [instructors2, setInstructors2 ] = useState( []);
        const [students2, setStudents2 ] = useState( []);
		
		const [location1, setLocation1 ] = useState('');
        const [location2, setLocation2 ] = useState( '');
        
    	const tabsRef = useRef(null);


async function create(onCreateDone){

	setSending(true);
	let wsRef = await addDataToDb("workshops", WorkshopData(name), true, 'id');

	if(wsRef === null)
	{
		console.log("Failed creating workshop");
		setSending(false);
		return ;	
	}

	await makeSchool(wsRef.id, institution1, location1, instructors1, students1, setSchool1Sending);
	await makeSchool(wsRef.id, institution2, location2, instructors2, students2, setSchool2Sending);

	setSending(false);
	window.M.toast({html: 'Successfully created workshop!'})
	
	if(onCreateDone) onCreateDone();

}




    useEffect(()=>{
        let el = document.getElementById('CreateWorkshop');
        if(el){
            if(!tabsRef.current){
                tabsRef.current = window.M.Tabs.init(el.querySelector(".tabs"), null);
            }
        }
          return () => {
            if(tabsRef.current){tabsRef.current.destroy(); tabsRef.current = null; }
        };
    });

    function selectTab(tabId){
    	let i = window.M.Tabs.getInstance(document.getElementById("CreateWorkshopTabs"));
    	i.select(tabId);
    	i.updateTabIndicator();
    }

    function next(){
    	selectTab('schoolsTab2');
    }
    



	if(sending || school1Sending || school2Sending ){
		return (<>
	<Col s={12}>
    	<Row className="z-depth-2 black-text" style={{padding: 12+'px'}}>	
				<Col s={12}>
		<h5>Creating new workshop</h5>
		</Col>
  		<Col s={2} offset="s5">
    	<Preloader
      		active
      		color="blue"
      		flashing={false}
      		size="big"
    		/>
  		</Col>

		</Row>
		</Col>
		</>)
	}else{

	return (<>
  	<Col s={12}>
    	<Row id='CreateWorkshop' className="z-depth-2 black-text" style={{padding: 12+'px'}}>
    		<Col s={12}>
     		<h5>Creating new workshop</h5>
     		
      		<TextInput id="workshop_name" label="Workshop name" s={12} onChange={ evt => {setName(evt.target.value)}}/>


            <ul id="CreateWorkshopTabs" className="tabs tabs-fixed-width white black-text depth-1">
                <li className="tab"><a className="active" href="#schoolsTab1">School 1</a></li>
                <li className="tab"><a href="#schoolsTab2">School 2</a></li>
            </ul>
            
            <div id="schoolsTab1" className="col s12"> 
            	<School id={1}
            		
            		setInstitution={setInstitution1}
					instructors={instructors1}
					setInstructors={setInstructors1}
					students={students1}
					setStudents={setStudents1}
					setLocation={setLocation1}
				/>
				<Button className="right" node="button" waves="light"  onClick={()=>next()}>Next</Button> 
			</div>
			<div id="schoolsTab2" className="col s12">
				<School id={2} 
					
					setInstitution={setInstitution2}
					instructors={instructors2}
					setInstructors={setInstructors2}
					students={students2}
					setStudents={setStudents2}
					setLocation={setLocation2}
 				/>
 				<Button className="right" node="button" waves="light"  onClick={()=>create(props.onCreateDone)}>Create</Button> 
 			</div>


			
			</Col>
		</Row>
	</Col>
</>)
	}
}

