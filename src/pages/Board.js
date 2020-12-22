import React, { Component, useRef, useState, useEffect } from "react";

import { auth } from "../services/firebase";
import { db } from "../services/firebase";
import firebase from 'firebase/app';
import 'firebase/firestore';

import Draggable from 'react-draggable';
// import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentData, useCollectionData } from 'react-firebase-hooks/firestore';

import { Icon, Button, Row, Col, Card, CardTitle, CardPanel } from 'react-materialize';


import { BoardMessageData } from '../helpers/Types'
import '../css/board.css';

function formatTime(timestamp) {
    const d = timestamp.toDate();
    const time = `${d.getDate()}/${(d.getMonth()+1)}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`;
    return time;
}



export default function Board() {
  const dummy = useRef();
  const boardId = "default";
  // const docRef = db.collection("boards").doc(boardId);
  
  // const [group, setGroup] = useState('default');

  // const query = boardRef.where("teamId", "==", group).orderBy('created', 'desc').limit(15);

  // const [board, boardReady, error] = useDocumentData(docRef);

  const messagesRef = db.collection("boardMessages");
  
  const [messages, msgReady, msgError] = useCollectionData(messagesRef.where("boardId", "==", boardId));



  const addMessage = async (e) => {
    e.preventDefault();
    console.log("addMessage");
    const { uid } = auth().currentUser;

    let msgRef = await messagesRef.add(BoardMessageData(uid, boardId));
    // let msgRef = await messagesRef.add({
    //     content: "",
    //     created: firebase.firestore.FieldValue.serverTimestamp(),
    //     timestamp: firebase.firestore.Timestamp.now(),
    //     uid,
    //     id: null,
    //     boardId,
    //     position: {x:0, y:0}
    // });


    await messagesRef.doc(msgRef.id).update({
        id: msgRef.id
    });

    // setFormValue('');
  }

  const onStopHandler = (msgId, position)=>{
    // console.log(msgId + ", " ,position);
    messagesRef.doc(msgId).update({position:{x: position.x, y: position.y}});
  }


return (<>
<Row>
  <Col s={12} style={{height: 600+'px', padding: 15+'px'}} className="z-depth-2 grey darken-4  ">
     <Button
  className="red right"
  floating
  icon={<Icon>add</Icon>}
  node="button"
  waves="light"
  onClick={addMessage}
  tooltip="Click to add a new message"
/>

      { messages && messages.map(msg => <BoardMessage key={msg.id} bounds={dummy} message={msg} onStopHandler={onStopHandler} />)}
      
  </Col>
  </Row>
</>)
}



//     <>
//     <main>
//         <div className="container">
//       {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
// 
//       <span ref={dummy}></span>
//     </div>
//     </main>
// 
//     <form onSubmit={sendMessage}>
// 
//       <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />
// 
//       <button type="submit" disabled={!formValue}>🕊️</button>
// 
//     </form>
//   </>)

function BoardMessage(props) {
  const { content, id, uid, timestamp } = props.message;
  
  
  const onStop = (e, position) => {
    props.onStopHandler(id, position);
     e.preventDefault();
    e.stopPropagation();
  };


  return (<>
    <Draggable defaultPosition={{x: props.message.position.x, y: props.message.position.y }} bounds={props.bounds} onStop={onStop}>

            <Card 
              // onMouseEnter={setOver(true)}
              // onMouseLeave={setOver(false)}
              // header={<CardTitle image={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />}
              style={{maxWidth:400 + 'px', display: "inlineBlock"}}
              
              id={"msg_"+id}
              className="teal"
            >
                <p className="black-text">{content}</p>
                <p className="chat-time right">{formatTime(timestamp)}</p>
            </Card>
          </Draggable>
  </>)
}
