import React, { useRef, useState,useEffect } from "react";

import { auth } from "../services/firebase";
import { db } from "../services/firebase";
import firebase from 'firebase/app';
import 'firebase/firestore';


import { useCollectionData } from 'react-firebase-hooks/firestore';

import { Icon } from 'react-materialize';

import '../css/chat.css';


const weekInMillis = 1000 * 60 * 60 * 24 * 7;

export default function Chat(props) {
    const dummy = useRef();
    const messagesRef = db.collection(props.collection);
    // const isQuerySet = useRef(false);    
    // const {group, setGroup] = useState(props.group);
    // let query = null; 
    let query =messagesRef;

    // if(!isQuerySet.current){
        // if(!props.isComment ){
        //     let aWeekAgo = firebase.firestore.Timestamp.fromDate(new Date(Date.now() - weekInMillis));
        //     //console.log(aWeekAgo.toDate().toISOString(), firebase.firestore.Timestamp.now().toDate().toISOString());
        //     console.log("a");
        //     
        //     query = query.where('created', '>', aWeekAgo);
        // }
    if(!props.isComment ){

        let aWeekAgo = Date.now() - weekInMillis;

        let toCheckDate = firebase.firestore.Timestamp.fromDate(new Date(aWeekAgo));


        if(props.readChats && (props.group in props.readChats)){
            if( props.readChats[props.group].toMillis() > aWeekAgo){
                toCheckDate = props.readChats[props.group];
            }
        }
        query = query.where('created', '>', toCheckDate);
        // console.log("a");
    }
        query = query.where("group", "==", props.group).limit(15);

        // isQuerySet.current = true;
    // }

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
        return props.getUser(uid);
    }

    function setTimeStampForCurrentUser(){
        db.collection("readChat").doc(auth().currentUser.uid).set({
            [props.group]:  firebase.firestore.Timestamp.now()
        }, { merge: true });
    }



// 
//     if(messages && !loadingMessages){
//         messages.forEach(msg=> console.log(msg.created.toDate().toISOString())) ;       
//     }

    return (<>
        <div className="chatContainer"
            style={props.isComment?({backgroundColor: props.bgColor}):{}}
        >
            <div className={props.containerClass}>
                <ul>
                    {!loadingMessages && props.getUser && messages && messages.slice(0).reverse().map(msg => 
                        <RenderMessage key={msg.id} user={getUser(msg.uid)} isComment={props.isComment} message={msg} />)}
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
            { !props.isComment && <button
            className="btn btn-flat tiny"
            onClick={setTimeStampForCurrentUser}
            >Clear Chat
            </button> }
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

    const messageClass = (!props.isComment && props.message.uid === auth().currentUser.uid)?"ownChatMessage":"";

return (<>

    <li id={"chatmessage-"+props.message.id}
                className= {"z-depth-0  " + (props.isComment? "messageComment":"card chatMessage ") + messageClass}
                style={style}
            >
            
            <div className="messageCard-header valign-wrapper" 
                >
                <img src={props.user?props.user.photoURL:""} alt="" className="circle messageHeaderImg "/> 
                <span className="black-text">{props.user?props.user.displayName:""}</span> 
            </div>
            <div className="messageCard-content white-text">
                {props.message.content}
            </div>
    </li>    
  </>);
}

