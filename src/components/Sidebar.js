import React, {useEffect } from "react";

import { auth } from "../services/firebase";
import { db } from "../services/firebase";

import 'firebase/firestore';

// import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';


// import { getUserFromDb } from "../helpers/userManagement";

import { userTypes } from "../helpers/Types"

// import { Link } from 'react-router-dom';

import { Button,  Modal } from 'react-materialize';

import UserProfile from "./UserProfile";

import '../css/board.css';


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
function SidebarTeam(props){
    useEffect(() => initCollapsibles(".SidebarTeam"));
    return (<>
        <li>
            <p className="collapsible-header">{props.team.name}</p>
            <div className="collapsible-body">
                <ul className="collapsible SidebarTeam">
                    <RenderUsers name="Members" users={props.team.members} ></RenderUsers>
                    <SidebarBoardsCollection user={props.user} teamId={props.team.id} boardSelectHandle={props.boardSelectHandle}/>
                </ul>
            </div>
        </li>
    </>
    );
}

function SidebarWorkshop(props){
    useEffect(() => initCollapsibles(".SidebarWorkshop"));
    return (<>
        <li>
            <p className="collapsible-header">{props.workshop.name}</p>
            <div className="collapsible-body">
                <ul className="collapsible SidebarWorkshop">
                    <RenderUsers name="Instructors" users={props.workshop.instructors} ></RenderUsers>
                    <SidebarTeamCollection user={props.user} workshopId={props.workshop.id} boardSelectHandle={props.boardSelectHandle}/>
                </ul>
            </div>
        </li>
    </>);
}


function SidebarBoardsCollection(props){
    const [boards, boardsLoading] = useCollectionData(
        db.collection("boards").where("teamId", "==", props.teamId));
    return (
        <>
            <li>
                <p className="collapsible-header">Boards</p>
                <ul className="collapsible-body">
                    {!boardsLoading && boards && boards.map(board => 
                        <li className="SidebarBoard" key={board.id} style={{color: board.color}} onClick={()=> props.boardSelectHandle(board.id)}>
                            {board.name}</li>
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
                        { !teamsLoading && teams && teams.map(team => <SidebarTeam key={team.id} team={team} user={props.user} boardSelectHandle={props.boardSelectHandle}/> )}
                    </ul>
                </div>
            </li>
        </>
    );
}

function initCollapsibles(elementSelector)
{
    var elems = document.querySelectorAll(elementSelector);
    window.M.Collapsible.init(elems, null);
}


function SidebarWorkshopCollection(props){
    const [workshops] = useCollectionData(getWorkshopQueryForUser(props.user)); 
    
    useEffect(() => initCollapsibles(".SidebarWorkshopCollection"));


    if(!workshops)return null;
    return (
        <>
            <div>
                {(workshops.length > 1)?<p>Workshops</p>:""}
                <ul  className="collapsible SidebarWorkshopCollection">
                    {workshops && workshops.map(doc => <SidebarWorkshop key={doc.id} workshop={doc} user={props.user} boardSelectHandle={props.boardSelectHandle} numWorkshops={workshops.length} /> )}
                </ul>
            </div>
        </>
    );
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



    useEffect(() => (window.M.Sidenav.init(document.getElementById('SidebarLeft'), {  draggable: true  })));


    let user = {
        image:  (props.usr.photoURL  || auth().currentUser.photoURL),
        name: (props.usr.displayName || auth().currentUser.displayName)
    };
    return (<>


        <ul id="SidebarLeft" className="sidenav black white-text">
    
        <SidebarCurrentUser className="white-text"  user={user} />
        <SidebarWorkshopCollection user={props.usr} boardSelectHandle={props.boardSelectHandle}/>
            
        </ul>


  
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




