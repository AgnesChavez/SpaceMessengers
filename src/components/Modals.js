import React from "react";
import { TextInput, Row, Modal, Button } from 'react-materialize';

import { CenteredPreloader } from '../components/CenteredPreloader'

import { Workshop } from "../helpers/WorkshopsWithHooks";

import { createBoard, createTeam, addUserToTeam } from '../helpers/factory'

import { SelectUser, SelectSchool, SelectUserTypeButtons } from './Selectors'

import { useState, useRef } from "react";

import { userTypes } from "../helpers/Types"

import { createUserInDb, removeUser } from "../helpers/userManagement"


function openModal(id, onOpenStart=null){
    var elems = document.querySelector('#' + id);
    let modal = window.M.Modal.init(elems, {
    	onOpenStart: onOpenStart,
        onCloseEnd: ()=>window.M.Modal.getInstance(document.getElementById(id)).destroy()
    });

    modal.open();
}

function closeModal(id){
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

export function ModalCreateWorkshop(){
	return (<>
        <div id="modalCreateWorkshop" className="modal">
            <div className="modal-content black-text">
				<Workshop onCreateDone={()=> closeModal("modalCreateWorkshop")}/>
	        </div>
	        <div className="modal-footer">
                <button className="modal-close waves-effect waves-red btn-flat">Cancel</button>
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
		Create Workshop
	</button>
	);

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

			{ selectedUsers.map(u => <SelectUser  selectorId = {i++} key={i} value={u}  onChange={onChange} usersArray={props.currentWorkshop.students.concat(props.currentWorkshop.instructors)} />)}
			
			
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
		await createUserInDb(null, {name: name.current, email: email.current}, type.current, school.current, props.currentWorkshop.id) ;
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
		setRemoving(true);		
		let success = await removeUser(selectedUser.current);
		let toastMsg = (success?"Successfully removed user":"Failed to remove user")
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
    			<Button className="teal"  node="button" waves="light" onClick={remove} >Remove</Button>,
      			<Button flat modal="close" node="button" waves="red">Cancel</Button>
    		]}
    		className="black-text"
    		header="Remove user"
    		id="ModalRemoveUser"
    		root={document.getElementById('modalRoot')}
  		>			
  			{removing?
  				<CenteredPreloader title="Creating user"/>:
  				<>
				<p>Select user to remove:</p>
				<SelectUser selectorId = {"ModalRemoveUserSelector"} value={""} onChange={onChange} usersArray={props.currentWorkshop.students.concat(props.currentWorkshop.instructors)} />
				</>
			}
        </Modal>
        </>)
}




