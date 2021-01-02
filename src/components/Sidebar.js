import React, {useEffect} from "react";

import { auth } from "../services/firebase";
import { db } from "../services/firebase";

import 'firebase/firestore';

// import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';


import { getUserFromDb } from "../helpers/userManagement";

import { userTypes } from "../helpers/Types"

import { Link } from 'react-router-dom';

import { Icon, Collection, CollectionItem, Button, Row, Col, SideNav, Modal } from 'react-materialize';

import UserProfile from "./UserProfile";

import '../css/board.css';


function SidebarUser(props)
{
  let [usr, usrLoading] = useDocumentData(db.collection('users').doc(props.uid));

  // let usr = getUserFromDb(props.uid);
  if(usr && ! usrLoading){

    if ('color' in usr){
      return (<li key={usr.id} style={{color: usr.color}}>{usr.displayName}</li>);  
    }else{
      return (<li key={usr.id} >{usr.displayName } </li>);  
    }
    
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
                    <SidebarBoardsCollection user={props.user} teamId={props.team.id} />
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
                    <SidebarTeamCollection user={props.user} workshopId={props.workshop.id} />
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
                        <li key={board.id}>
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
                        { !teamsLoading && teams && teams.map(team => <SidebarTeam key={team.id} team={team} user={props.user}/> )}
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
    // useEffect(() => {
    //     var elems = document.getElementById("SidebarLeft").querySelectorAll('.collapsible');
    //     var instances = window.M.Collapsible.init(elems, null);
    // });
    useEffect(() => initCollapsibles(".SidebarWorkshopCollection"));

    if(!workshops)return null;
    return (
        <>
            <div>
                <p>Workshops</p>
                <ul  className="collapsible SidebarWorkshopCollection">
                    {workshops && workshops.map(doc => <SidebarWorkshop key={doc.id} workshop={doc} user={props.user} /> )}
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
        <img className="circle" src={props.user.image}/>
        <div id="SidebarCurrentUserBlock">
        <p className="name"> {props.user.name} </p>
            
            <Button flat className="modal-trigger" href="#profileModal" node="button">Profile</Button>
            <Button flat onClick={() => auth().signOut()}>Logout</Button>
        </div>

    </div>
    </>);
}

function openProfile()
{

}

export  function Sidebar() {
    // useEffect(() => {
    //     var elems = document.getElementById("SidebarLeft").querySelectorAll('.collapsible');
    //     var instances = window.M.Collapsible.init(elems, null);
    // });


    let [ usr, usrLoading] = useDocumentData(db.collection('users').doc(auth().currentUser.uid));


    let user = {};

    if(usr && !usrLoading){
        user.image=  (usr.photoURL  || auth().currentUser.photoURL);
        user.name= (usr.displayName || auth().currentUser.displayName);
    }
    return (<>
        <SideNav 
            id="SidebarLeft"
            className="black white-text" 
            options={{  draggable: true  }} 
            trigger={<Button
                        className="red left"
                        floating
                        icon={<Icon>menu</Icon>}
                        node="button"
                        waves="light"
                        tooltip="Menu"
                    />}           
        >

            
    
            {usr && !usrLoading && <SidebarCurrentUser className="white-text"  user={user} /> }
            {usr && !usrLoading && <SidebarWorkshopCollection user={usr} /> }
            
            
        </SideNav>


  
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




