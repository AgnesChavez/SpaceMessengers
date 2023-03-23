import React from "react";
import { TextInput, Row, Modal, Button } from 'react-materialize';

import { CenteredPreloader } from '../components/CenteredPreloader'

import { downloadMessages } from '../components/downloadMessages'

import { Workshop } from "../helpers/WorkshopsWithHooks";

import { createBoard, createTeam, removeTeam, addUserToTeam, removeWorkshop, renameWorkshop, setGooglePhotosLinkForWorkshop } from '../helpers/factory'

import { SelectUser, SelectSchool, SelectUserTypeButtons, SelectTeam } from './Selectors'

import { useState, useRef } from "react";

import { userTypes } from "../helpers/Types"

import { createUserInDb, removeUser } from "../helpers/userManagement"

import UserProfile from "./UserProfileHooks";

import PapaParse from 'papaparse';

function removeDuplicates(arry) {
	const uniqueElements = new Set(arry);
	arry.forEach(item => {
        if (!uniqueElements.has(item)) {
			uniqueElements.push(item);
        }
    });

    return [...new Set(uniqueElements)];
    
}


export function openModal(id, onOpenStart=null, onCloseEnd=null){
    // var elems = document.querySelector('#' + id);
    var elem = document.getElementById(id)
    if(elem){
    	let modal = window.M.Modal.getInstance(elem) 
    	if(modal && modal.isOpen) return;
    	window.M.Modal.init(elem, {
    		onOpenStart: onOpenStart,
    	    onCloseEnd: ()=>{
    	    	window.M.Modal.getInstance(document.getElementById(id)).destroy();
    	    	if(onCloseEnd) onCloseEnd();
    	    },
    	    startingTop:'2%',
    	    endingTop:'2%',
    	}).open();
    	
	}
}

export function closeModal(id){
	let el = document.getElementById(id);
	if(el){
		let m = window.M.Modal.getInstance(el);
		if(m) m.close();
	}
}

export function openAddBoardModal(teamId){

	openModal('modalAddBoard');

    localStorage.setItem("addBoardToTeam", teamId);
}

function AddNewBoard(){
    let name = document.getElementById("NewBoardName").value;
    if(!name) name = "New Board";
    
    let teamId = localStorage.getItem("addBoardToTeam");
    localStorage.removeItem("addBoardToTeam");

    createBoard(name, teamId);

}



export function ModalAddBoard(){
    return (<>
        <div id="modalAddBoard" className="modal">
            <div className="modal-content black-text">
                <h5>Add a new board </h5>
                <p>This board will be shared with all the members of team</p>
                <TextInput
                    id="NewBoardName"
                    label="Name your new board"
                />
            </div>
            <div className="modal-footer">
                <button className="modal-close waves-effect waves-light btn red white-text" onClick={AddNewBoard}>Add</button>
                <button className="modal-close waves-effect waves-red btn-flat">Cancel</button>
            </div>
        </div>
    </>);
}

// export function ModalCreateWorkshop(props){
export function ModalCreateWorkshop(){
	return (<>
        <div id="modalCreateWorkshop" className="modal">
            <div className="modal-content black-text">
				<Workshop 
					onCreateDone={()=> closeModal("modalCreateWorkshop")}
					onCancel={()=> closeModal("modalCreateWorkshop")}
					// currentWorkshop={props.currentWorkshop}
				/>
	        </div>
        </div>
    </>);

}



export function CreateWorkshopModalButton(props){
	return (
	<button id="CreateWorkshopModalButton" 
			className="sidebarButton waves-effect waves-light btn teal white-text" 
			onClick={ (e) => openModal('modalCreateWorkshop', 
				()=>{	let i = window.M.Tabs.getInstance(document.getElementById("CreateWorkshopTabs"));
						i.select('schoolsTab1');
						i.updateTabIndicator();
					})
			}
			>
		{props.buttonLabel}
	</button>
	
	);
}

export function  ModalUserProfile(props){
 return <Modal
 	actions={[]}
    header="User Profile"
    id="profileModal"
  >
    <UserProfile   
    	onCreateDone={()=> closeModal("profileModal")}
		onCancel={()=> closeModal("profileModal")}
    />
  </Modal>
}


async function createTeamFromModal(selectedUsers, workshopId){
	let modalEl = document.getElementById('CreateTeamModal');

	let name = modalEl.querySelector('#NewTeamTextInput').value;

	// console.log(selectedUsers);
	if(name){
		let teamId =await createTeam(name, workshopId);

		selectedUsers.forEach( async (uid) => await addUserToTeam(uid, teamId));

	}
	

}

export function ModalCreateTeam(props){
	const [selectedUsers, setSelectedUsers ] = useState([]);
	
	function onChange(e, selectorId){
		if(!e.target.value)return;
		if(selectedUsers.length <= selectorId){
			setSelectedUsers(selectedUsers.concat( [e.target.value]));
		}else{
			let tmp = selectedUsers;
			tmp[selectorId] = e.target.value;
			setSelectedUsers(tmp);
		}
		e.target.value = "";
	}
	
	let i = 0;


	// console.log(workshopStudents.value);

    
	return <Modal
    		actions={[    	
      			<Button modal="close" className="teal"  node="button" waves="light" onClick={(e)=>createTeamFromModal(selectedUsers, props.currentWorkshop.id)} >Create</Button>,
      			<Button flat modal="close" node="button" waves="red">Cancel</Button>
    		]}
    		className="black-text"
    		header="Create a new team"
    		id="CreateTeamModal"
    		root={document.getElementById('modalRoot')}
    		options={{
    			onOpenStart: ()=>{
    				setSelectedUsers([]);
    				document.getElementById('NewTeamTextInput').value = '';
    			}
  			}}
  		>
			<Row>
				<TextInput
					id="NewTeamTextInput"
					label="Team Name"
				/>
			</Row>

			{ selectedUsers.map(u => <SelectUser  selectorId = {i++} key={i} value={u}  onChange={onChange} usersArray={removeDuplicates(props.currentWorkshop.students.concat(props.currentWorkshop.instructors))} />)}
			
			
			<SelectUser selectorId = {selectedUsers.length} value={""} onChange={onChange} usersArray={props.currentWorkshop.students} />

        </Modal>
}




export function CreateTeamModalButton(props){
	return (

	<Button
		waves="light"
    className="modal-trigger sidebarButton"
    href="#CreateTeamModal"
    node="button"
  >
     Create Team
  </Button>

	);	
}

export function ModalAddUserToTeam(props){
	
	
	function onChange(e, selectorId){
		if(!e.target.value)return;


   	    let teamId = localStorage.getItem("addUserToTeam");
   	    localStorage.removeItem("addUserToTeam");

		addUserToTeam(e.target.value, teamId);

		let modal = window.M.Modal.getInstance(document.getElementById('AddUserToTeamModal'));
		if(modal)modal.close();

		e.target.value="";
	}
	
	return <Modal
    		actions={[    	
      			<Button flat modal="close" node="button" waves="red">Cancel</Button>
    		]}
    		className="black-text"
    		header="Add user to team"
    		id="AddUserToTeamModal"
    		root={document.getElementById('modalRoot')}
  		>			
			<SelectUser selectorId = {0} value={""} onChange={onChange} usersArray={props.currentWorkshop.students} />

        </Modal>
}


export function ModalCreateUser(props){

	const school = useRef(null);
	const type = useRef(userTypes().student);
	const name = useRef("");
	const email = useRef("");

	const [creating, setCreating ] = useState(false);

	function onSchoolChange(e) {
		school.current = e.target.value;
		console.log(e.target.value);
	}
	function onUserTypeChange(e) {
		type.current = e.target.value;
		console.log(e.target.value);
	}

	async function create(){
		setCreating(true);		
		await createUserInDb({name: name.current, email: email.current}, type.current, school.current, props.currentWorkshop.id) ;
		window.M.toast({html: "Successfully created user", displayLength: 2500});
		closeModal("ModalCreateUser");
	}

	return (<>

		<Button
			waves="light"
  		  	className="modal-trigger sidebarButton"
  		  	href="#ModalCreateUser"
  		  	node="button"
  		>
     	Create User
  		</Button>
		<Modal
    		actions={[    
    			<Button className="teal"  node="button" waves="light" onClick={create} >Create</Button>,
      			<Button flat modal="close" node="button" waves="red">Cancel</Button>
    		]}
    		className="black-text"
    		header="Create a new user"
    		id="ModalCreateUser"
    		root={document.getElementById('modalRoot')}
  		>	
  			
  			{creating?
  				<CenteredPreloader title="Creating user"/>:
  			<form>
  				<TextInput
				  	id="ModalCreateUserName"
				  	label="Name"
				  	validate
				  	placeholder="Name"
				  	onChange={(e)=> name.current = e.target.value}
				/>
  				<TextInput
				  	email
				  	id="ModalCreateUserEmail"
				  	label="Email"
				  	validate
				  	placeholder="Email"
				  	onChange={(e)=> email.current = e.target.value}
				/>
  				<p>Select the user's school</p>
				<SelectSchool currentWorkshop={props.currentWorkshop} selectorId={"ModalCreateUserSelectSchool"} onChange={onSchoolChange}/>
				<p>Select the user's type</p>
				<SelectUserTypeButtons selectorId={"ModalCreateUserSelectUserType"} onChange={onUserTypeChange}/>
			</form>
		}
        </Modal>
        </>)
}



export function ModalRemoveUser(props){

	const selectedUser = useRef(null);
	const [removing, setRemoving] = useState(false);
	function onChange(e, selectorId){
		if(!e.target.value)return;
		selectedUser.current = e.target.value;
		console.log("selectedUser.current: ", selectedUser.current);
	}

	async function remove(){
		let toastMsg = "";
		if(selectedUser.current){
			setRemoving(true);		
			let success = await removeUser(selectedUser.current);
			 toastMsg = (success?"Successfully removed user":"Failed to remove user")
		}else{
			toastMsg = "No user was removed."
		}
		window.M.toast({html: toastMsg, displayLength: 2500});
		closeModal("ModalRemoveUser");
	}

	return (<>
		<Button
			waves="light"
  		  	className="modal-trigger sidebarButton"
  		  	href="#ModalRemoveUser"
  		  	node="button"
  		>
     	Remove User
  		</Button>
		<Modal
    		actions={[    	
    			<Button className="red"  node="button" waves="light" onClick={remove} >Remove</Button>,
      			<Button flat modal="close" node="button" waves="red">Cancel</Button>
    		]}
    		className="black-text"
    		header="Remove user"
    		id="ModalRemoveUser"
    		root={document.getElementById('modalRoot')}
  		>			
  			{(props.currentWorkshop && props.currentWorkshop.students && removing)?
  				<CenteredPreloader title="Remove user"/>:
  				<>
				<p>Select user to remove:</p>
				<SelectUser selectorId = {"ModalRemoveUserSelector"} value={""} onChange={onChange} usersArray={removeDuplicates(props.currentWorkshop.students.concat(props.currentWorkshop.instructors))} />
				</>
			}
        </Modal>
        </>)
}
// export function ModalCreateUsersCSV(props){
// 
// 	const school = useRef(null);
// 
// 	const [creating, setCreating ] = useState(false);
// 
// 	function onSchoolChange(e) {
// 		school.current = e.target.value;
// 		console.log(e.target.value);
// 	}
// 
// 	async function create(){
// 		setCreating(true);		
// 		// await createUserInDb({name: name.current, email: email.current}, type.current, school.current, props.currentWorkshop.id) ;
// 		window.M.toast({html: "Successfully created user", displayLength: 2500});
// 		closeModal("ModalCreateUser");
// 	}
// 
// 	function parseCSV(file){
// 		PapaParse.parse(file, {
// 			header: true,
// 			complete: function(results) {
// 			// console.log(results);
// 			if(results.errors.length === 0){
// 				let students = [];
// 				let instructors = [];
// 				results.data.forEach(d=>{
// 					if(d.type === userTypes().student){
// 						students.push(d);
// 					}else if(d.type === userTypes().instructor){
// 						instructors.push(d);
// 					}else{
// 						console.log("invalid type", d);
// 					}
// 				});
// 				
// 			// 	props.setStudents(students);	
// 			// 	props.setInstructors(instructors);
// 			// 	setDummy(true);
// 			}else{
// 				console.log("CSV parse failed", results.errors);
// 			}
// 		}
// 		});
// 	}
// 
// 
// 
// 	return (<>
// 
// 		<Button
// 			waves="light"
//   		  	className="modal-trigger sidebarButton"
//   		  	href="#ModalCreateUsersCSV"
//   		  	node="button"
//   		>
//      	Create Users with CSV
//   		</Button>
// 		<Modal
//     		actions={[    
//     			<Button className="teal"  node="button" waves="light" onClick={create} >Create</Button>,
//       			<Button flat modal="close" node="button" waves="red">Cancel</Button>
//     		]}
//     		className="black-text"
//     		header="Create users from CSV"
//     		id="ModalCreateUsersCSV"
//     		root={document.getElementById('modalRoot')}
//   		>	
//   			
//   			{creating?
//   				<CenteredPreloader title="Creating users"/>:
//   			<form>
//   				<p>Select the users school</p>
// 				<SelectSchool currentWorkshop={props.currentWorkshop} selectorId={"ModalCreateUserSelectSchool"} onChange={onSchoolChange}/>
// 			</form>
// 			<Row className="SelectCSV">
// 			<h6>Import from CSV file</h6>
// 			
// 			<div className="CSVInstructions">Import a CSV file with the names, emails and user types.<br/>
// 			<Link to={"https://docs.google.com/spreadsheets/d/1_XLRJP8KGdE8KsZuoDnyFGyENwyxKK2Vj2JQP05cFJI/edit?usp=sharing"}> CSV Template </Link>
// 			<span><br/>Copy the template and modify.<br/>Once ready choose </span><span style={{fontFamily: "monospace"}}>File > Download > Coma Separated Values (.csv, current page)</span>
// 			<br/>Instructors don't need to be assigned to a team.
// 			<br/>Upload a different CSV file for each school.
// 			</div>
// 			<TextInput
// 				label='Select CSV file'
//                 icon=<i className="material-icons">file_upload</i>
//                 type="file"                
//                 onChange={(evt)=>{
//                     evt.stopPropagation();
//                     evt.preventDefault();
//                     if (evt.target.files && evt.target.files.length) {
//                       parseCSV(evt.target.files[0]);
//                     }
// 	        	}}
//     		></TextInput>
//     	</Row>		
// 		}
//         </Modal>
//         </>)
// }



export function ModalRemoveTeamButton(props){
		
	return <Button
			waves="light"
  		  	className="modal-trigger sidebarButton"
  		  	href="#ModalRemoveTeam"
  		  	node="button"
  		>
     	Remove Team
  		</Button>
}

export function ModalRemoveTeam(props){

	const selectedTeam = useRef(null);
	const [removing, setRemoving] = useState(false);
	function onChange(e, selectorId){
		if(!e.target.value)return;
		selectedTeam.current = e.target.value;
		console.log("selectedTeam.current: ", selectedTeam.current);
	}

	async function remove(){
		let toastMsg = "";
		if(selectedTeam.current){
			setRemoving(true);
			let success = await removeTeam(selectedTeam.current);
			toastMsg = (success?"Successfully removed team":"Failed to remove team")
		}else{
			toastMsg = "No team was removed";
		}
		window.M.toast({html: toastMsg, displayLength: 2500});
		closeModal("ModalRemoveTeam");
	}

	return (<>
		<Modal
    		actions={[    	
    			<Button className="red"  node="button" waves="light" onClick={remove} >Remove</Button>,
      			<Button flat modal="close" node="button" waves="red">Cancel</Button>
    		]}
    		className="black-text"
    		header="Remove team"
    		id="ModalRemoveTeam"
    		root={document.getElementById('modalRoot')}
  		>			
  			{removing?
  				<CenteredPreloader title="Creating user"/>:
  				<>
				<p>Select team to remove:</p>
				<SelectTeam selectorId = {"ModalRemoveTeamSelector"} value={""} onChange={onChange} currentWorkshop={props.currentWorkshop} />
				</>
			}
        </Modal>
        </>)
}


export function ModalRemoveWorkshopButton(props){
		
	return <Button
			waves="light"
  		  	className="modal-trigger sidebarButton"
  		  	href="#ModalRemoveWorkshop"
  		  	node="button"
  		>
     	Remove Workshop
  		</Button>
}

export function ModalRemoveWorkshop(props){

	const selectedWorkshop = useRef(null);
	const [removing, setRemoving] = useState(false);
	
	function onChange(e, selectorId){
		if(!e.target.value)return;
		selectedWorkshop.current = e.target.value;
		console.log("selectedWorkshop.current: ", selectedWorkshop.current);
	}

	async function remove(){
		let toastMsg = "";
		if(selectedWorkshop.current){
			setRemoving(true);
			let success = await removeWorkshop(selectedWorkshop.current);
			toastMsg = (success?"Successfully removed workshop":"Failed to remove workshop")
		}else{
			toastMsg = "No workshop was removed";
		}
		window.M.toast({html: toastMsg, displayLength: 2500});
		closeModal("ModalRemoveWorkshop");
	}

	return (<>
		<Modal
    		actions={[    	
    			<Button className="red"  node="button" waves="light" onClick={remove} >Remove</Button>,
      			<Button flat modal="close" node="button" waves="red">Cancel</Button>
    		]}
    		className="black-text"
    		header="Remove Workshop.Be careful, this can not be undone"
    		id="ModalRemoveWorkshop"
    		root={document.getElementById('modalRoot')}
  		>			
  			{removing?
  				<CenteredPreloader title="Removing workshop"/>:
  				<>
				<p>Select workshop to remove. Be careful, this can not be undone:</p>
				<div>
        <form>
            <label>Select Workshop</label>
            <select className="browser-default"  onChange={onChange}>
                {props.workshops && props.workshops.map(ws => <option key={ws.id} value={ws.id} > {ws.name} </option> )}
            </select>
        </form>
        </div>
				</>
			}
        </Modal>
        </>)
}


export function ModalRenameWorkshopButton(props){
		
	return <Button
			waves="light"
  		  	className="modal-trigger sidebarButton"
  		  	href="#ModalRenameWorkshop"
  		  	node="button"
  		>
     	Rename Workshop
  		</Button>
}

export function ModalRenameWorkshop(props){

	const newName = useRef(null);
	const [renaming, setRenaming] = useState(false);
	
	async function rename(){
		let toastMsg = "";
		if(newName.current){
			setRenaming(true);
			let success = await renameWorkshop(props.currentWorkshopId, newName.current);
			toastMsg = (success?"Successfully renamed workshop":"Failed to rename workshop")
			window.M.toast({html: toastMsg, displayLength: 2500});
			newName.current = null;
			setRenaming(false);
		// }else{
			// toastMsg = "No workshop was removed";
		}
		
		closeModal("ModalRenameWorkshop");
	}

	return (<>
		<Modal
    		actions={[    	
    			<Button className="red"  node="button" waves="light" onClick={rename} >Rename</Button>,
      			<Button flat modal="close" node="button" waves="red">Cancel</Button>
    		]}
    		className="black-text"
    		header="Rename Workshop"
    		id="ModalRenameWorkshop"
    		root={document.getElementById('modalRoot')}
  		>			
  			{renaming?
  				<CenteredPreloader title="Renaming workshop."/>:
  				<>
				<div>
        		<form>
            	<label>Rename Workshop {props.currentWorkshopName}</label>
            	<TextInput
				  	id="ModalRenameWorkshopTextInput"
				  	label="New name:"
				  	placeholder={props.currentWorkshopName}
				  	onChange={(e)=> newName.current = e.target.value}
				/>
        		</form>
        		</div>
				</>
			}
        </Modal>
        </>)
}


export function ModalWoekshopsGooglePhotosLinkButton(props){
		
	return <Button
			waves="light"
  		  	className="modal-trigger sidebarButton"
  		  	href="#ModalWorkshopGooglePhotos"
  		  	node="button"
  		>
     	Set Google Photos album
  		</Button>
}


export function ModalWorkshopGooglePhotos(props){

	const [renaming, setRenaming] = useState(false);
	
	const newUrl = useRef(null);

	async function setGooglePhotosLink(){
		let toastMsg = "";
		if(newUrl.current){
			setRenaming(true);
			let success = await setGooglePhotosLinkForWorkshop(props.currentWorkshop.id, newUrl.current);

			toastMsg = (success?"Google Photos link Successfully set":"Failed to set Google Photos link")
			window.M.toast({html: toastMsg, displayLength: 2500});
			newUrl.current = null;
			setRenaming(false);
		// }else{
			// toastMsg = "No workshop was removed";
		}
		
		closeModal("ModalWorkshopGooglePhotos");
	}

	return (<>
		<Modal
    		actions={[    	
    			<Button className="red"  node="button" waves="light" onClick={setGooglePhotosLink} >OK</Button>,
      			<Button flat modal="close" node="button" waves="red">Cancel</Button>
    		]}
    		className="black-text"
    		header="Set Google Photos album for this workshop"
    		id="ModalWorkshopGooglePhotos"
    		root={document.getElementById('modalRoot')}
  		>			
  			{renaming?
  				<CenteredPreloader title="Renaming workshop."/>:
  				<>
				<div>
        		<form>
            	<label>Google Photos album  for {props.currentWorkshop.name}</label>
            	<TextInput
				  	id="ModalSetGooglePhotosTextInput"
				  	label="Google Photos URL:"
				  	placeholder={props.currentWorkshop.googlePhotosLink?props.currentWorkshop.googlePhotosLink:""}
				  	
				  	onChange={(e)=> newUrl.current = e.target.value}
				/>
        		</form>
        		</div>
				</>
			}
        </Modal>
        </>)
}




export function DownloadMessagesButton(props){
return (<>

		<Button
			waves="light"
  		  	className="modal-trigger sidebarButton"
  		  	href="#ModalDownloadMessages"
  		  	node="button"
  		  	onClick={()=>downloadMessages(props.currentWorkshopId, ()=>closeModal("ModalDownloadMessages"))}
  		>
     	Download Messages
  		</Button>
		<Modal
			actions={[  ]}
			options={{dismissible: false}}
    		className="black-text"
    		header="Downloading messages"
    		id="ModalDownloadMessages"
    		root={document.getElementById('modalRoot')}
  		>	
  			<CenteredPreloader title="Gathering data..."/>
        </Modal>
        </>)
}



