import React, {  useRef, useState} from "react";

import { auth } from "../services/firebase";
import { db } from "../services/firebase";
import 'firebase/firestore';

import { useCollectionData } from 'react-firebase-hooks/firestore';

import { Icon, Button, Row, Collapsible, CollapsibleItem, Collection, CollectionItem } from 'react-materialize';

import { BoardMessage } from '../components/BoardMessage'

import '../css/board.css';


function SidebarCollectionElement(props)
{
  return (
   <CollectionItem className="avatar  black-text">
        <img
          alt=""
          className="circle"
          src={props.photoURL}
        />
        
        <p>
          {props.name}
        </p>
    </CollectionItem>
    )
}


export function SidebarNav(props){


//     const myRef = useRef();
//     const boardId = "default";
// 
//     const messagesRef = db.collection("boardMessages");
// 
//     const [users, usrLoading] = useCollectionData(db.collection("users").where("boards", "array-contains", boardId)); 
// 
//     const [messages] = useCollectionData(messagesRef.where("boardId", "==", boardId));


    // const [usersMap, setUsersMap] = useState(null);



return(<>
<Collapsible accordion>
  <CollapsibleItem
    expanded={false}
    header="Team"
    node="div"
  >
    <Collection>
      <SidebarCollectionElement
        name="User 1"
        photoURL="https://lh3.googleusercontent.com/a-/AOh14Gg7reG4ktvbjCXsw0V97eBF2buri_hAn3us5R61_w=s96-c "
        />
        <SidebarCollectionElement
        name="User 2"
        photoURL="https://lh3.googleusercontent.com/a-/AOh14Gg7reG4ktvbjCXsw0V97eBF2buri_hAn3us5R61_w=s96-c "
        />
        <SidebarCollectionElement
        name="User 3"
        photoURL="https://lh3.googleusercontent.com/a-/AOh14Gg7reG4ktvbjCXsw0V97eBF2buri_hAn3us5R61_w=s96-c "
        />
    </Collection>
  </CollapsibleItem>
  <CollapsibleItem
    expanded={true}
    header="Boards"
    node="div"
  >
  <Collection className="black-text">
     <CollectionItem>
      Board 1
      </CollectionItem>
      <CollectionItem>
      Board 2
      </CollectionItem>
      <CollectionItem>
      Board 3
      </CollectionItem>
      <CollectionItem>
      Board 4
      </CollectionItem>
  </Collection>
    
  </CollapsibleItem>
</Collapsible>
</>)
}