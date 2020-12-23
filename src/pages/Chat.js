import React, { Component, useRef, useState } from "react";

import { auth } from "../services/firebase";
import { db } from "../services/firebase";
import firebase from 'firebase/app';
import 'firebase/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import { Icon, Row, Col, Card, CardTitle, CardPanel } from 'react-materialize';

import { formatTime } from '../helpers/Formatting' 


export default function Chat(props) {
  const dummy = useRef();
  const messagesRef = db.collection(props.collection);
  
  // const {group, setGroup] = useState(props.group);

  const query = messagesRef.where("group", "==", props.group).orderBy('created', 'desc').limit(15);

  const [messages] = useCollectionData(query);

  const [formValue, setFormValue] = useState('');
  
  

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth().currentUser;
    // console.log("sendMessage: " , photoURL);
    let docRef = await messagesRef.add({
        content: formValue,
        timestamp: firebase.firestore.Timestamp.now(),
        created: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        id: null,
        group: props.group,
        photoURL
    });

    await messagesRef.doc(docRef.id).update({
        id: docRef.id
    });

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }


  return (<>
    <main>
        <div className="container">
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>
    </div>
    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />

      <button type="submit" disabled={!formValue}><Icon>send</Icon></button>

    </form>
  </>)
}


function ChatMessage(props) {
  const { content, uid, photoURL, timestamp } = props.message;

  const messageClass = uid === auth().currentUser.uid ? 'current-user' :'';

  return (<>
    <Row>
        <Col m={6} s={12}>
            <Card
              header={<CardTitle image={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />}
              horizontal
              className="teal"
            >
                <p>{content}</p>
                <p className="chat-time right">{formatTime(timestamp)}</p>
            </Card>
        </Col>
    </Row>
  </>)
}
