import React, { Component, useRef, useState } from "react";

import { auth } from "../services/firebase";
import { db } from "../services/firebase";
import firebase from 'firebase/app';
import 'firebase/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import { Collapsible, CollapsibleItem } from 'react-materialize';
import { getQueryData, getUserFromDb, getTeamForUserWorkshop } from "../helpers/userManagement";


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



async function SidebarWorkshop(props){
  const query = db.collection("workshops").doc(props.id);
  const ws = await query.get();

  const teamData = getTeamForUserWorkshop(props.usr.uid, props.id);
  return (<>
  <CollapsibleItem
    expanded={false}
    header={ws.data().name}
    node="div"
  >
  <Collapsible accordion>

   <CollapsibleItem
    expanded={false}
    header="Instructors",
    node="div"
  >
  <Collection>
    {ws.data().instructors.map( i => <SidebarUser uid={i} />)}
    </Collection>
  </CollapsibleItem>

  <CollapsibleItem
    expanded={false}
    header="Your Team",
    node="div"
  >

    <Collection>
    {teamData.members.map( i => <SidebarUser uid={i} />)}
    </Collection>
  </CollapsibleItem>

  <CollapsibleItem
    expanded={true}
    header="Boards",
    node="div"
  >

    <Collection>
    {teamData.boards.map( i => <SidebarBoards boardId={i} />)}
    </Collection>
  </CollapsibleItem>



  </Collapsible>
  </CollapsibleItem>
  </>
  );
}


export default function Sidebar() {

  let usr = getUserFromDb(auth().currentUser.uid);

  return (<>
<Collapsible accordion>
  <CollapsibleItem
    expanded={true}
    header="Workshops"
    node="div"
  >
  
  {usr.workshops.map( ws => <SidebarWorkshop id={ws.id} usr />)}

  </CollapsibleItem>
</Collapsible>

{auth().currentUser
            ? <><div>
            <Link className="profileButton" to="/profile">Profile</Link>
            <div className="loggedInAs">
              Logged in as: <strong className="text-info">{auth().currentUser.email}</strong>
            </div>
            </div>
              <Button  onClick={() => auth().signOut()}>Logout</Button>
              </>
            : <Button href="/login">Log In</Button> 
            }
  </>)
}




