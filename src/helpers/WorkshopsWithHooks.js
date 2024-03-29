import React, { useState, useRef, useEffect } from 'react';

import { Link } from 'react-router-dom';

import { Button, Row, Col, TextInput, Preloader } from 'react-materialize';

import { WorkshopData, userTypes } from "../helpers/Types";

import { addDataToDb } from "../helpers/db";

import { createSchool, setGooglePhotosLinkForWorkshop } from '../helpers/factory'


import PapaParse from 'papaparse';

function EmptyUserEmail(useTeam){
	let u = {name: "", email:""};
	if(useTeam)u.team ="";
	return u;
}



function handleChange(event, data, key, setData){
	console.log("handleChange: ", data, key, event.target.name, event.target.value );
	let newData = data;
	newData[key][event.target.name] = event.target.value;
	setData(newData);
}


function NameEmail(props){
	return (
			<>
			<TextInput label="Name" name="name" defaultValue={props.data[props.index].name} onChange={ evt => handleChange(evt, props.data, props.index, props.setData)}   s={12} m={5} />
			<TextInput label="Email" name="email" defaultValue={props.data[props.index].email} onChange={ evt => handleChange(evt, props.data, props.index, props.setData)}  s={12} m={5}  email />
			{props.useTeam && <TextInput label="Team name" name="team" defaultValue={props.data[props.index].team} onChange={ evt => handleChange(evt, props.data, props.index, props.setData)}  s={12} m={2} /> }
			</>
		)
}

function AddMembers(props){
	// console.log(props);
	// let j=0;
	return (
		<>
		<Row>
			<Col s={12}>
				<h6>{props.name}</h6>
				<Row>
					<Col s={12}>
						 { props.data.map((i,index)=> <NameEmail key={index} index={index} user={i} data={props.data} setData={props.setData} useTeam={props.useTeam}/>)}
						 
					</Col>
				</Row>
				<Button 
					node="button" 
					waves="light" 
					onClick={()=>props.setData([...props.data, EmptyUserEmail(props.useTeam)])} >{props.buttonLabel}</Button> 
			</Col>
		</Row>
	</>)
}



async function makeSchool(wsId, institution, location, instructors, students, setSending){

	setSending(true);
	createSchool(institution, location, wsId, instructors, students);
	setSending(false);


	}


function School(props){

	const [dummy, setDummy] = useState(false);

	// useEffect(()=>{
	// 	console.log("school "+props.id);
	// })

	function parseCSV(file){
		PapaParse.parse(file, {
			header: true,
			complete: function(results) {
			// console.log(results);
			if(results.errors.length === 0){
				let students = props.students;
				let instructors = props.instructors;
				results.data.forEach(d=>{
					if(d.type === userTypes().student){
						students.push(d);
					}else if(d.type === userTypes().instructor){
						instructors.push(d);
					}else{
						console.log("invalid type", d);
					}
				});
				props.setStudents(students);	
				props.setInstructors(instructors);
				setDummy(true);
			}else{
				console.log("CSV parse failed", results.errors);
			}
		}
		});
	}


    return (<>
		<Row>
			<TextInput id={"inst"+props.id} label= {"School name"} s={12} m={6} onChange={ evt => {props.setInstitution(evt.target.value) }}/>
			<TextInput id={"instLoc"+props.id} label= {"School Location"} s={12} m={6} onChange={ evt => {props.setLocation(evt.target.value) }}/>
			<AddMembers name="Instructors" data={props.instructors} setData={props.setInstructors} buttonLabel="Add Instructor" />
			<AddMembers name="Students" data={props.students} setData={props.setStudents} buttonLabel="Add Student" useTeam/>
		</Row>

		<Row className="SelectCSV">
			<h6>Import from CSV file</h6>
			
			<div className="CSVInstructions">Import a CSV file with the names, emails and user types.<br/>
			<Link to={"https://docs.google.com/spreadsheets/d/1_XLRJP8KGdE8KsZuoDnyFGyENwyxKK2Vj2JQP05cFJI/edit?usp=sharing"}> CSV Template </Link>
			<span><br/>Copy the template and modify.<br/>Once ready choose </span><span style={{fontFamily: "monospace"}}>File > Download > Coma Separated Values (.csv, current page)</span>
			<br/>Instructors don't need to be assigned to a team.
			<br/>Upload a different CSV file for each school.
			</div>
			<TextInput
				label='Select CSV file'
                icon=<i className="material-icons">file_upload</i>
                type="file"                
                onChange={(evt)=>{
                    evt.stopPropagation();
                    evt.preventDefault();
                    if (evt.target.files && evt.target.files.length) {
                      parseCSV(evt.target.files[0]);
                    }
	        	}}
    		></TextInput>
    	</Row>		
	</>);
}

function WorkshopButtons(props){

	return 	<div className="WorkshopButtons">
 				<Button
 					className="white black-text"
 					node="button"
 					waves="light"
 					onClick={props.onCancel}
				>Cancel
				</Button> 
 				<Button 
 					className=""
 					node="button"
 					waves="light" 
 					onClick={props.okCallback}
				>{props.label}
				</Button> 
			</div>
}

export function Workshop (props){

    
    	// const currentWorkshopData = getCurrentWorkshopData(props.currentWorkshop);

    	const [name, setName ] = useState("");
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
		
		const [gphotosLink, setGphotosLink ] = useState('');

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

		if(gphotosLink && gphotosLink !== ''){
			await setGooglePhotosLinkForWorkshop(wsRef.id, gphotosLink);
		}

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
      			<TextInput id="gphotos_link" label="Google photos URL" s={12} onChange={ evt => {setGphotosLink(evt.target.value)}}/>

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
					<WorkshopButtons 
 						label={"Next"}
 						onCancel={props.onCancel}
						okCallback={()=>next()}
					/>
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
 					<WorkshopButtons 
 						label={"Create"}
 						onCancel={props.onCancel}
						okCallback={()=>create(props.onCreateDone)}
					/>

 				</div>			
			</Col>
		</Row>
	</Col>
</>)
	}
}

