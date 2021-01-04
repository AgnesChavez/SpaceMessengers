import React, { useRef, useState,useEffect } from "react";

import { auth } from "../services/firebase";
import { db } from "../services/firebase";
import firebase from 'firebase/app';
import 'firebase/firestore';


import { useCollectionData } from 'react-firebase-hooks/firestore';

import { Icon, Row, Col, Card, CardTitle } from 'react-materialize';

import { formatTime } from '../helpers/Formatting' 
import '../css/chat.css';


export default function Chat(props) {
  const dummy = useRef();
  const messagesRef = db.collection(props.collection);
  
  // const {group, setGroup] = useState(props.group);

  const query = messagesRef.where("group", "==", props.group).orderBy('created', 'desc').limit(15);

  const [messages] = useCollectionData(query);

  const [formValue, setFormValue] = useState('');
  
  useEffect (
  () => {
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  },
  [messages],
  );

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
    <div className="chatContainer"
      style={props.isComment?({backgroundColor: props.bgColor}):{}}
      >
    <div className={props.containerClass}>
      {messages && messages.slice(0).reverse().map(msg => <ChatMessage key={msg.id} message={msg} isComment={props.isComment} />)}

      <span ref={dummy}></span>
    </div>
    <div className="valign-wrapper chatInputContainer">
      <input  className="chatInput" value={formValue} onChange={(e) => setFormValue(e.target.value)} />
      <button className="chatSend" type="submit" onClick={sendMessage} disabled={!formValue}><Icon>send</Icon></button>
    </div>
    </div>
  </>)
}

function RenderComment(props)
{
  let classType = ((props.uid === auth().currentUser.uid)?"comment-current-user":"");
  return (<p  className={classType} >{props.content}</p>);
}

function RenderMessage( props){
  const { content, uid, photoURL, timestamp } = props;
  const messageClass = uid === auth().currentUser.uid ? 'current-user' :'';
  
return (<>
    {/* <Row> */}
        <Col m={6} s={12}>
            <Card
              header={<CardTitle image={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />}
              horizontal
              className={"teal "+ messageClass}
            >
                <p>{content}</p>
                <p className="chat-time right">{formatTime(timestamp)}</p>
            </Card>
        </Col>
    {/* </Row> */}
  </>);
}

function ChatMessage(props) {
  // const { content, uid, photoURL, timestamp } = props.message;

  return (props.isComment?<RenderComment {...props.message} />:
                          <RenderMessage {...props.message} />);
}


// export function ChatFullpage(props) {
//   return <Chat collection="chats" group="default" isComment={false} containerClass="container" ></Chat>
// }
