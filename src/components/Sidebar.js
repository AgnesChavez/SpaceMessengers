import React, { Component, useRef, useState } from "react";

import { auth } from "../services/firebase";
import { db } from "../services/firebase";
import firebase from 'firebase/app';
import 'firebase/firestore';

// import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';

import { Collapsible, CollapsibleItem } from 'react-materialize';
import { getUserFromDb, getTeamForUserWorkshop } from "../helpers/userManagement";
import { getQueryData } from "../helpers/db";

import { Link } from 'react-router-dom';

import { Collection, CollectionItem, Button, Row, Col, SideNav, SideNavItem } from 'react-materialize';

import { userTypes } from "../helpers/Types"


function SidebarUser(props)
{
  let usr = getUserFromDb(props.uid);
  if(usr){
    return (<>
      <CollectionItem className="avatar">
        <img
          alt=""
          className="circle"
          src={usr.photoURL}
        />
        <span className="title">
          {usr.displayName}
        </span>
      </CollectionItem>
      </>
      );
  }
  return null;
}

function SidebarBoards(props)
{
  let boardData = getQueryData(db.collection("bords").doc(props.boardId));
  if(!boardData) return null;
  return (
     <CollectionItem href="#">
        {boardData.name}
      </CollectionItem>
    )
}


function SidebarTeam(props){
  return (<>
  <CollapsibleItem
    expanded={false}
    header={props.team.data().name}
    node="div"
  >
  <Collapsible accordion>

   <CollapsibleItem
    expanded={false}
    header="Members"
    node="div"
  >
  <Collection>
    {props.team.data().members.map( i => <SidebarUser uid={i} />)}
    </Collection>
  </CollapsibleItem>

    <SidebarBoardsCollection user={props.user} teamId={props.team.id} />

  </Collapsible>
  </CollapsibleItem>
  </>
  );
}



function SidebarWorkshop(props){
  return (<>
  <CollapsibleItem
    expanded={false}
    header={props.workshop.data().name}
    node="div"
  >
  <Collapsible accordion>

   <CollapsibleItem
    expanded={false}
    header="Instructors"
    node="div"
  >
  <Collection>
    {props.workshop.data().instructors.map( i => <SidebarUser uid={i} />)}
    </Collection>
  </CollapsibleItem>

    <SidebarTeamCollection user={props.user} workshopId={props.workshop.id} />

  </Collapsible>
  </CollapsibleItem>
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

function SidebarBoardsCollection(props){
      const [boards] = useCollectionData(
        db.collection("boards").where("teamId", "==", props.teamId));
        // getTeamsQueryForUser(props.user, )); 

      if(!boards) return null;
    return (
        <>
            <CollapsibleItem
                    expanded={true}
                    header="Boards"
                    node="div"
                >
            <Collapsible accordion>
                
                    {boards.map(board => 
                            <SideNavItem
                             href="#!"
                            waves
                            >
                            {board.data().name}
                            </SideNavItem>
                        )}

            </Collapsible>
            </CollapsibleItem>
        </>
    );
}

function SidebarTeamCollection(props){
    

    const [teams] = useCollectionData(getTeamsQueryForUser(props.user, props.workshopId)); 
    if(!teams)return null;
    return (
        <>
            <CollapsibleItem
                    expanded={true}
                    header="Teams"
                    node="div"
                >
            <Collapsible accordion>
                
                    {teams.map(team => <SidebarTeam team={team} user={props.user}/> )}

            </Collapsible>
            </CollapsibleItem>
        </>
    );
}



function SidebarWorkshopCollection(props){
    const [workshops] = useCollectionData(getWorkshopQueryForUser(props.user)); 
    if(!workshops)return null;
    return (
        <>
            <Collapsible accordion>
                <CollapsibleItem
                    expanded={true}
                    header="Workshops"
                    node="div"
                >
                    {workshops.map(doc => <SidebarWorkshop workshop={doc} user={props.user} /> )}

                </CollapsibleItem>
            </Collapsible>
        </>
    );
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
 <SideNav
    className="black SidebarNav"
    id="SidebarLeft"

    options={{
      draggable: true
    }}
    trigger={<Button node="button">SIDE NAV DEMO</Button>}
  >

<SideNavItem className="black-text"
      user={{
        image:  usr.photoURL ,
        name: (usr.displayName || usr.name)
      }}
      userView
    />
  


  <SidebarWorkshopCollection user={usr} />

</SideNav>

{/* {auth().currentUser */}
{/*             ? <><div> */}
{/*             <Link className="profileButton" to="/profile">Profile</Link> */}
{/*             <div className="loggedInAs"> */}
{/*               Logged in as: <strong className="text-info">{auth().currentUser.email}</strong> */}
{/*             </div> */}
{/*             </div> */}
{/*               <Button  onClick={() => auth().signOut()}>Logout</Button> */}
{/*               </> */}
{/*             : <Button href="/login">Log In</Button>  */}
{/*             } */}
  </>)
}




