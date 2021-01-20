import React, { useRef, useState,useEffect } from "react";

import { auth } from "../services/firebase";
import { db } from "../services/firebase";
import firebase from 'firebase/app';
import 'firebase/firestore';


import { useCollectionData } from 'react-firebase-hooks/firestore';

import { Icon } from 'react-materialize';

import '../css/chat.css';


export default function Chat(props) {
    const dummy = useRef();
    const messagesRef = db.collection(props.collection);
    
    // const {group, setGroup] = useState(props.group);

    const query = messagesRef.where("group", "==", props.group).orderBy('created', 'desc').limit(15);

    const [messages, loadingMessages] = useCollectionData(query);

    const [formValue, setFormValue] = useState('');
    
    useEffect (() => {
        dummy.current.scrollIntoView({ behavior: 'smooth' });
    },[messages],);

    const sendMessage = async (e) => {
        
        e.preventDefault();
        const { uid } = auth().currentUser;
        
        let docRef = await messagesRef.add({
            content: formValue,
            timestamp: firebase.firestore.Timestamp.now(),
            created: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            id: null,
            group: props.group
        });

        await messagesRef.doc(docRef.id).update({
                id: docRef.id
        });

        setFormValue('');
        dummy.current.scrollIntoView({ behavior: 'smooth' });
    }


    const getUser = (uid) =>{
        // console.log("getUser " + uid, props.getUser);
        return props.getUser(uid);
    }

    // console.log("messages  isComment: " + props.isComment, messages, "props.getUser", props.getUser);
    // console.log("loadingMessages ", loadingMessages ,
    // "props.getUser ", props.getUser ,
    // "messages ", messages
    return (<>
        <div className="chatContainer"
            style={props.isComment?({backgroundColor: props.bgColor}):{}}
        >
        <div className={props.containerClass}>
        <ul>
            {!loadingMessages && props.getUser && messages && messages.slice(0).reverse().map(msg => <ChatMessage key={msg.id} message={msg} user={getUser(msg.uid)} isComment={props.isComment} />)}
        </ul>
        <span ref={dummy}></span>
        </div>
            <form className="valign-wrapper chatInputContainer" >
                <input  className="chatInput"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)} 
                    // onKeyDown={(e) => {if(e.keyCode === 13)sendMessage(e);}}
                />
                <button className="chatSend"
                    type="submit"
                    onClick={(e) => sendMessage(e)}
                    disabled={!formValue}>
                    <Icon>send</Icon>
                </button>
            </form>
        </div>
    </>)
}


function RenderMessage( props){
    let style = {};
    // if(!props.isComment && props.uid === auth().currentUser.uid) style.float = "right";
  
    if(props.user){
        let color = (('color' in props.user)?props.user.color:"grey");
        if(props.isComment){
            style.color = color;
        }else{
            style.backgroundColor = color;
        }
    }

    const messageClass = (!props.isComment && props.uid === auth().currentUser.uid)?"ownChatMessage":"";

return (<>

    <li id={"chatmessage-"+props.id}
                className= {"z-depth-0  " + (props.isComment? "messageComment":"card chatMessage ") + messageClass}
                style={style}
            >
            
            <div className="messageCard-header valign-wrapper" 
                >
                <img src={props.user?props.user.photoURL:""} alt="" className="circle messageHeaderImg "/> 
                <span className="black-text">{props.user?props.user.displayName:""}</span> 
            </div>
            <div className="messageCard-content white-text">
                {props.content}
            </div>
    </li>    
  </>);
}

function ChatMessage(props) {
    // console.log("ChatMessage: ", props );
    return <RenderMessage user={props.user} isComment={props.isComment} {...props.message} /> ;
    // return (props.isComment?<RenderComment user={props.user} {...props.message} />:
    //                         <RenderMessage user={props.user} {...props.message} />);
}
