import React, { useState, useRef, useEffect } from 'react';

import { Button, Row, Col, TextInput, Preloader } from 'react-materialize';

import { WorkshopData } from "../helpers/Types";

import { addDataToDb } from "../helpers/db";

import { createSchool, deleteUser } from '../helpers/factory'


function EmptyUserEmail(useTeam){
	let u = {name: "", email:""};
	if(useTeam)u.team ="";
	return u;
}



function handleChange(event, data){
	data[event.target.name] = event.target.value;
}


function NameEmail(props){
	// return (
	// 		<>
	// 		<TextInput label="Name" name="name" value={props.data.name} onChange={ evt => handleChange(evt, props.data)}   s={12} m={5} />
	// 		<TextInput label="Email" name="email" value={props.data.email} onChange={ evt => handleChange(evt, props.data)}  s={12} m={5}  email />
	// 		{props.useTeam && <TextInput label="Team name" name="team" value={props.data.team} onChange={ evt => handleChange(evt, props.data)}  s={12} m={2} /> }
	// 		</>
		// )

	return (
			<>
			<TextInput label="Name" name="name" value={props.data.name} onChange={ evt => handleChange(evt, props.data)}   s={12} m={5} />
			<TextInput label="Email" name="email" value={props.data.email} onChange={ evt => handleChange(evt, props.data)}  s={12} m={5}  email />
			{props.useTeam && <TextInput label="Team name" name="team" value={props.data.team} onChange={ evt => handleChange(evt, props.data)}  s={12} m={2} /> }
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
    
// function NewStudent(name, email, team){
// 	return {name, email, team}
// }
// 
// 
// async function prefillData(){
// 
// 
// 
// 
// await deleteUser("19v4YUArtSbef8qxwozJ");
// await deleteUser("1DL91LxgwlXHJTqHn76k");
// await deleteUser("1QXlX8F7FOiZOXg4tXwc");
// await deleteUser("4M1P7OAfUIcaYUqHjazt");
// await deleteUser("7AukVbcU2ZQLrQcvHpMI");
// await deleteUser("7v3uYZ3hRxFWKfBa5TH0");
// await deleteUser("Bd8D7WS1uFUqIPZor6sz");
// await deleteUser("BuOeicg84vvpnaWVHrbB");
// await deleteUser("E3ndmB4X0GGlxcr1zg0J");
// await deleteUser("EMEm9QjqR4QmjgydY538");
// await deleteUser("IcIspSPxA3qaItkmCnEf");
// await deleteUser("JVfCXmP7y69emrtuxGf8");
// await deleteUser("L7HT0FuoTfCfjwVHO2Lt");
// await deleteUser("Pp6Gqy3klnFEgws1IAPS");
// await deleteUser("Qcj7WTbGipRu274Oswgu");
// await deleteUser("SgYzeYnk4z7gJVGJsMVz");
// await deleteUser("W4Dv4I0h5AUAPRgekzDj");
// await deleteUser("WuFBzYk6OhTtb7uwBZAy");
// await deleteUser("bqaN3ceZ0STUPTTge5Bw");
// await deleteUser("qoWmGkv2J1hI5mA7eZ13");
// await deleteUser("sWkJee6QpaQlsDqwTdW2");
// await deleteUser("tmbeNXAoGs94HCVzGzGr");
// await deleteUser("uNZNWF9IpoBcpgFE03CJ");
// await deleteUser("xBMLZQCQuKaShjslH23z");
// await deleteUser("xxUGidHuDmhrqnohrjYL");
// 
// 
// 	setStudents1(
// [NewStudent("Josephine Dicks" ,"jdicks@tisataos.org", "A"),
// 
// NewStudent("Sol Valadez-Little" ,"sol@tisataos.org", "B"),
// NewStudent("Tori Thomas" ,"torit@tisataos.org", "B"),
// NewStudent("Hayden Greywolf" ,"milagro@tisataos.org", "B"),
// 
// NewStudent("Oliver LaMure" ,"olamure@tisataos.org", "C"),
// NewStudent("Elsie Clayton" ,"elsie@tisataos.org", "C"),
// NewStudent("Avery Bel" ,"abell@tisataos.org", "C"),
// 
// NewStudent("Amelia Martinez" ,"amelia@tisataos.org", "D"),
// NewStudent("Joaquin Robles" ,"jrobles@tisataos.org", "D"),
// 
// NewStudent("Brytin Ryan" ,"brytin@tisataos.org", "E"),
// NewStudent("Mikhalo Romero" ,"mikhalor@tisataos.org", "E"),
// NewStudent("Brooklyn Maestas" ,"brooklynm@tisataos.org", "E"),
// 
// NewStudent("Hudson Jones-Carroll" ,"hudson@tisataos.org", "F"),
// NewStudent("Jazelle Chavira" ,"jazelle@tisataos.org", "F"),
// NewStudent("Miko Cox" ,"miko@tisataos.org", "A", "F"),
// 
// NewStudent("Santiago Archuleta" ,"santiago@tisataos.org", "G"),
// NewStudent("Julian Alvardo" ,"julianalvardo@tisataos.org", "G"),
// 
// NewStudent("Rosetta Ryan" ,"rosetta@tisataos.org", "H"),
// 
// NewStudent("Noah Joseph" ,"noah@tisataos.org", "I"),
// NewStudent("Nevaeh Valerio" ,"nevaeh@tisataos.org", "I"),
// NewStudent("Mateo Love" ,"mateo@tisataos.org", "I"),
// 
// NewStudent("Estevan Martinez" ,"estevan@tisataos.org", "J"),
// 
// NewStudent("Christy Alvarado" ,"christy@tisataos.org", "K"),
// 
// NewStudent("Madeleine Sooy" ,"msooy@tisataos.org", "L"),
// NewStudent("Youssef Weinman" ,"youssefweinman@tisataos.org", "L")]);
// }


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

		{/* <Button className="right red" node="button" waves="light"  onClick={()=>prefillData()}>Prefill Data</Button>  */}




			
			</Col>
		</Row>
	</Col>
</>)
	}
}

