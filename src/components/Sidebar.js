import React, {useEffect, useRef } from "react";

import { auth } from "../services/firebase";
import { db } from "../services/firebase";

import 'firebase/firestore';

// import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';


// import { getUserFromDb } from "../helpers/userManagement";

import { userTypes } from "../helpers/Types"

// import { Link } from 'react-router-dom';

import { Button, TextInput,  Modal } from 'react-materialize';

import UserProfile from "./UserProfile";

import '../css/board.css';

import { createBoard } from '../helpers/factory'

import Renameable from './Renameable'

function SidebarUser(props)
{
  let [usr, usrLoading] = useDocumentData(db.collection('users').doc(props.uid));

  // let usr = getUserFromDb(props.uid);
  if(usr && ! usrLoading){
      return (
        <>
            <li key={usr.id} className="SidebarUser">
                <img className="circle"  alt={usr.displayName} src={usr.photoURL || ("https://i.pravatar.cc/24?u=" + usr.id)}/>
                <span className='name' style={('color' in usr)?{color: usr.color}:{}}>
                    {usr.displayName}
                </span>
            </li> 
        </>);  
  }
  return null;
}
function RenderUsers(props)     
{
    return (<>
        <li>
            <div className="sidebarName collapsible-header"> {props.name}</div>
            <div className="collapsible-body">
            <ul>
                {props.users.map( i => <SidebarUser key={i} uid={i} />)}
            </ul>
            </div>
        </li>
    </>);
}
function SidebarTeamLi(props){
    useEffect(() => initCollapsibles(".SidebarTeam"));
    return (<>
        <li>
            <p className="collapsible-header">{props.team.name}</p>
            <div className="collapsible-body">
                <SidebarTeam user={props.user} team={props.team} boardSelectHandle={props.boardSelectHandle}/>
            </div>
        </li>
    </>
    );
}
function SidebarTeam(props){
    useEffect(() => initCollapsibles(".SidebarTeam"));
    return (<>
            <ul className="collapsible SidebarTeam">
                <RenderUsers name="Members" users={props.team.members} ></RenderUsers>
                <SidebarBoardsCollection user={props.user} team={props.team} boardSelectHandle={props.boardSelectHandle}/>
            </ul>
    </>
    );
}

function SidebarCurrentTeam(props){

    const [team, loading] = useDocumentData(db.collection("teams").doc(props.user.currentTeam));
    // console.log("SidebarCurrentTeam ", props.user.currentTeam);
    

    // if(!props.user.currentTeam) return <h6>Yo have not been assigned to any team.</h6>

    if(team && !loading){
        // console.log(team);
        <p>{team.name}</p>
        return  <SidebarTeam team={team} user={props.user} boardSelectHandle={props.boardSelectHandle}/> ;
    }
    return "";
}

function SidebarWorkshop(props){
    // console.log(props.workshop);
    useEffect(() => initCollapsibles(".SidebarWorkshop"));
    return (<>
            <p className="collapsible-header">{props.workshop.name}</p>
            <ul className="collapsible expandable SidebarWorkshop">
                <RenderUsers name="Instructors" users={props.workshop.instructors} ></RenderUsers>
                <RenderUsers name="Students" users={props.workshop.students} ></RenderUsers>
                {/* <SidebarTeamCollection user={props.user} workshopId={props.workshop.id} boardSelectHandle={props.boardSelectHandle}/> */}
            </ul>
    </>);
}

function openAddBoardModal(teamId){
    var elems = document.querySelectorAll('#modalAddBoard');
    window.M.Modal.init(elems, {
        onCloseEnd: ()=>window.M.Modal.getInstance(document.getElementById('modalAddBoard')).destroy()
    });


    localStorage.setItem("addBoardToTeam", teamId);

}

function AddNewBoard(){
    let name = document.getElementById("NewBoardName").value;
    if(!name) name = "New Board";
    
    let teamId = localStorage.getItem("addBoardToTeam");
    localStorage.removeItem("addBoardToTeam");

    createBoard(name, teamId);

}

function ModalAddBoard(){
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

function SidebarBoardsCollection(props){
    const [boards, boardsLoading] = useCollectionData(
        db.collection("boards").where("teamId", "==", props.team.id));
    useEffect(() => {
        var elems = document.querySelectorAll('#AddBoardButton');
        window.M.Tooltip.init(elems, null);
    });
    

    return (
        <>
            <li>
                <div className="collapsible-header">
                <span>Boards</span>
                <button id="AddBoardButton" 
                    className="InlineTinyButton btn waves-effect waves-light tooltipped modal-trigger"
                    data-target="modalAddBoard" 
                    data-position="right" 
                    data-tooltip="Add a new board"
                    onClick={()=>openAddBoardModal(props.team.id)}
                    >
                    <i className=" tiny material-icons">add_circle_outline</i>
                </button>
                </div>
                <ul className="collapsible-body">
                    {!boardsLoading && boards && boards.map(board => 
                        <Renameable 
                            key={board.id} 
                            text={board.name} 
                            hoverColor= {board.color}
                            onTextClick={()=> props.boardSelectHandle(board.id)}
                            onRename={(newName)=> db.collection('boards').doc(board.id).update({name:newName})}
                            />
                        // <li className="SidebarBoard" key={board.id} style={{color: board.color}} onClick={()=> props.boardSelectHandle(board.id)}>
                        //     {board.name}</li>
                        )}
                </ul>
            </li>
        </>
    );
}

function SidebarTeamCollection(props){
    const [teams, teamsLoading] = useCollectionData(getTeamsQueryForUser(props.user, props.workshopId)); 
    useEffect(() => initCollapsibles(".SidebarTeamCollection"));
    return (
        <>
            <li>
                <p className="collapsible-header">Teams</p>
                <div className="collapsible-body">
                    <ul className="collapsible SidebarTeamCollection">
                        { !teamsLoading && teams && teams.map(team => <SidebarTeamLi key={team.id} team={team} user={props.user} boardSelectHandle={props.boardSelectHandle}/> )}
                    </ul>
                </div>
            </li>
        </>
    );
}

function openAllCollapsibles(instance){
    let numChildren = 10;
    for(let i = 0; i < numChildren; i++){
        instance.open(i);
    }
}

function initCollapsibles(elementSelector, numChildren)
{
    var elems = document.querySelectorAll(elementSelector);
    let instances = window.M.Collapsible.init(elems, {accordion:false});
    instances.forEach(i => openAllCollapsibles(i));
}
function SelectWorkshop(props){
    if(props.workshops.length <= 1) return null;
    return (<>
        <form>
            <label>Select Workshop</label>
            <select className="browser-default"  onChange={(evt)=> setCurrentWorkshop(props.userId, evt.target.value)}>
                {/* <option value="" disabled >Choose a workshop</option> */}
                {props.workshops && props.workshops.map(ws => <option key={ws.id} value={ws.id} > {ws.name} </option> )}
                {/* <option value="A">A</option> */}
                {/* <option value="B">B</option> */}
            </select>
        </form>
    </>)
}

function setCurrentWorkshop(userId, currentWorkshopId){
    db.collection('users').doc(userId).set({currentWorkshop: currentWorkshopId }, {merge: true});
}

function SidebarWorkshopCollection(props){
    const [workshops] = useCollectionData(getWorkshopQueryForUser(props.user)); 
    
    // useEffect(() => initCollapsibles(".SidebarWorkshopCollection"));

    if(!workshops)return null;
    if(workshops.length === 0) return (<h6>You are not part of any workshop!</h6> );
    
    let currentWorkshop = null; 

    if(props.user.currentWorkshop){
        for(let i = 0; i < workshops.length; i++){
            if(props.user.currentWorkshop === workshops[i].id ){
                currentWorkshop = workshops[i];
            }
        }
    }
    if(! currentWorkshop){
        currentWorkshop = workshops[0];
        console.log("settings users current workshop to ", currentWorkshop);
        setCurrentWorkshop(props.user.id, currentWorkshop.id);
        // db.collection('users').doc(props.user.id).set({currentWorkshop: currentWorkshop.id}, {merge: true});
    }

    return (
        <>
            {currentWorkshop && <SidebarWorkshop workshop={currentWorkshop} user={props.user} /> }

            {workshops && <SelectWorkshop workshops={workshops} userId={props.user.id}/>}            
        </>)
}

function getTeamsQueryForUser(usr, workshopId){
    let teams = db.collection("teams").where("workshopId", "==", workshopId);

    if(usr.type === userTypes().student){
        return teams.where("members", "array-contains", usr.id);
    }
    return teams;
}


function getWorkshopQueryForUser(usr)
{
  let ws = db.collection("workshops");

  if(usr.type === userTypes().student){
    return ws.where("members", "array-contains", usr.id);
  }
  if(usr.type === userTypes().instructor){
    return ws.where("instructors", "array-contains", usr.id);
  }
  ws.orderBy("created", "desc");
  return ws;
}

function SidebarCurrentUser(props){
return (<>
    <div id="SidebarCurrentUser">
        <img className="circle" alt={props.user.name} src={props.user.image}/>
        <div id="SidebarCurrentUserBlock">
        <p className="name"> {props.user.name} </p>
            
            <Button flat className="modal-trigger" href="#profileModal" node="button">Profile</Button>
            <Button flat onClick={() => auth().signOut()}>Logout</Button>
        </div>

    </div>
    </>);
}

export  function Sidebar(props) {


    const tabsRef = useRef(null);
    const sidenavRef = useRef(null);

    useEffect(()=>{
        let el = document.getElementById('SidebarLeft');
        if(el){
            if(!tabsRef.current){
                tabsRef.current = window.M.Tabs.init(el.querySelector(".tabs"), null);
            }
            if(!sidenavRef.current){
                sidenavRef.current = window.M.Sidenav.init(el, {  draggable: true, edge: "left"  });
                sidenavRef.current.open();
                sidenavRef.current.isOpen = true;
            }
        }
          return () => {
            if(sidenavRef.current){sidenavRef.current.destroy(); sidenavRef.current = null; }
            if(tabsRef.current){tabsRef.current.destroy(); tabsRef.current = null; }
        };
    });


    
    // const [team, loading] = useDocumentData(db.collection("teams").doc('d8puz5F0Q9fZQViDRX2t'));
    
    let user = {
        image:  (props.usr.photoURL  || auth().currentUser.photoURL),
        name: (props.usr.displayName || auth().currentUser.displayName)
    };
//     const [workshops, workshopsLoading] = useCollectionData(getWorkshopQueryForUser(props.user)); 
// 
//     if(!workshops)return null;

    return (<>


        <ul id="SidebarLeft" className="sidenav sidenav-fixed black white-text">
    
            <SidebarCurrentUser className="white-text"  user={user} />
            <div className="row">
                <div className="col s12">
                    <ul className="tabs tabs-fixed-width black white-text depth-1">
                        <li className="tab"><a className="active" href="#teamTab">Team</a></li>
                        <li className="tab"><a href="#schoolsTab">Schools</a></li>
                    </ul>
            
                    <div id="teamTab" className="col s12">
                        {/* {<SidebarTeamCollection user={props.usr} workshopId={props.workshop.id} boardSelectHandle={props.boardSelectHandle}/>} */}
                        {<SidebarCurrentTeam user={props.usr} boardSelectHandle={props.boardSelectHandle} /> }
                    </div>
                    <div id="schoolsTab" className="col s12">
                        <SidebarWorkshopCollection user={props.usr} />
                    </div>
                </div>
            </div>

            
        </ul>
 
    <ModalAddBoard/>
  
  <Modal
    actions={[
      <Button flat modal="close" node="button" waves="green">Close</Button>
    ]}
    header="User Profile"
    id="profileModal"
  >
    <UserProfile  ></UserProfile>
  </Modal>

    </>)
}




