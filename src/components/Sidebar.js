import React from "react";

import { auth } from "../services/firebase";
import { db } from "../services/firebase";

import 'firebase/firestore';

// import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';


import { getUserFromDb } from "../helpers/userManagement";

import { userTypes } from "../helpers/Types"


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
      <div>
      <p className="sidebarName"> {props.name}</p>
    <ul style={{"paddingLeft": 20+'px'}}>
            {props.users.map( i => <SidebarUser key={i} uid={i} />)}
    </ul>
  </div>
    </>
    );
}
function SidebarTeam(props){
  return (<>
  
  <p>{props.team.name}</p>

    <RenderUsers name="Members" users={props.team.members} ></RenderUsers>
    <SidebarBoardsCollection user={props.user} teamId={props.team.id} />  
  </>
  );
}



function SidebarWorkshop(props){
  return (<>
    <div style={{"paddingLeft": 20+'px'}}>
    <p>{props.workshop.name}</p>
    <RenderUsers name="Instructors" users={props.workshop.instructors} ></RenderUsers>

    <SidebarTeamCollection user={props.user} workshopId={props.workshop.id} />
    </div>
  </>
  );
}


function SidebarBoardsCollection(props){
      const [boards, boardsLoading] = useCollectionData(
        db.collection("boards").where("teamId", "==", props.teamId));
      // if(!boards) return null;
    return (
        <>
            <p>Boards</p>
            <ul style={{"paddingLeft": 20+'px'}}>
                {!boardsLoading && boards && boards.map(board => 
                    <li key={board.id}>
                        {board.name}</li>
                    )}
            </ul>
        </>
    );
}

function SidebarTeamCollection(props){
    

    const [teams, teamsLoading] = useCollectionData(getTeamsQueryForUser(props.user, props.workshopId)); 
    return (
        <>
            <div>
            <p>Teams</p>
            
            <ul style={{"paddingLeft": 20+'px'}}>
                { !teamsLoading && teams && teams.map(team => <SidebarTeam key={team.id} team={team} user={props.user}/> )}
            </ul>
            </div>
        </>
    );
}


function SidebarWorkshopCollection(props){
    const [workshops] = useCollectionData(getWorkshopQueryForUser(props.user)); 
    if(!workshops)return null;
    return (
        <>
            <div>
              <p>Workshops</p>
              <ul style={{"paddingLeft": 20+'px'}}>
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


export  function Sidebar() {

  let usr = getUserFromDb(auth().currentUser.uid);
  if(!usr) return "";


return (<>
  <SidebarWorkshopCollection user={usr} />
  </>)
}




