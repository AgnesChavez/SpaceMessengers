import React from "react";
import { TextInput, Row, Col, Modal, Button  } from 'react-materialize';

import { Workshop } from "../helpers/WorkshopsWithHooks";

import { createBoard, createTeam, addUserToTeam } from '../helpers/factory'

import { SelectUser } from './SelectUser'

import { useState } from "react";

import { getWorkshopStudents } from "../helpers/userManagement";

// import {useAsync} from 'react-use';



function openModal(id){
    var elems = document.querySelector('#' + id);
    let modal = window.M.Modal.init(elems, {
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
			onClick={ (e) => openModal('modalCreateWorkshop')}
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
  		>
			<Row>
				<TextInput
					id="NewTeamTextInput"
					label="Team Name"
				/>
			</Row>


		
			{/* {/* <div style={{display: "flex"}}> */}
			{ selectedUsers.map(u => <SelectUser  selectorId = {i++} key={i} value={u}  onChange={onChange} usersArray={props.currentWorkshop.students} />)}
			
			
			<SelectUser selectorId = {selectedUsers.length} value={""} onChange={onChange} usersArray={props.currentWorkshop.students} />

			{/* Modal content */}
{/*  */}
{/* 			<ul> */}
{/* 				{props.users.map(usr=> <li key={usr}>{usr}</li>)} */}
{/* 			</ul> */}


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






