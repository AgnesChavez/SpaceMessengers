import React, { useRef, useState,useEffect } from "react";

import { db } from "../services/firebase";
import firebase from 'firebase/app';
import 'firebase/firestore';


import { useCollectionData } from 'react-firebase-hooks/firestore';

import { Icon } from 'react-materialize';

import '../css/realtimechat.css';

import { randomColorHSL } from "../helpers/Types.js"


export default function RealtimeChat(props) {
    const dummy = useRef();



    let query = db.collection("realtime")
    .where('isShown', '==', false)
    .orderBy('timestamp');//.limit(15);
   
    const [messages, loadingMessages] = useCollectionData(query);

    const [formValue, setFormValue] = useState('');
    const [usernameValue, setUsernameValue] = useState('');
    
    const [waitingMessage, setWaitingMessage] = useState(null);


    useEffect (() => {
        dummy.current.scrollIntoView({ behavior: 'smooth' });
    },[messages],);

    const sendMessage = async (e) => {
        
        e.preventDefault();
        // const { uid } = auth().currentUser;
        
        let docRef = await db.collection("realtime").add({
            Body: formValue,
            ProfileName: usernameValue,
            timestamp: firebase.firestore.Timestamp.now(),
            isShown: false,
        });

        await db.collection("realtime").doc(docRef.id).update({
                id: docRef.id
        });

        setWaitingMessage({
            body:formValue,
            name: usernameValue,
            color: randomColorHSL()
        });

        setFormValue('');
        setUsernameValue('');
        dummy.current.scrollIntoView({ behavior: 'smooth' });
    }

    return (<>
        <div className="realtimeContainer">
            <div >
                {loadingMessages && <div>loading...</div>}
                <ul>
                    {/* {!loadingMessages && messages && messages.slice(0).reverse().map(msg =>  */}
                    {/*     <RenderMessage key={msg.id} message={msg} />)} */}
                    {!loadingMessages && messages && messages.map(msg => 
                        <RenderMessage key={msg.id} message={msg} />)}
                </ul>
                <span ref={dummy}></span>
            </div>

            {waitingMessage &&
                <RenderWaitingMessage waitingMessage={waitingMessage}/>
            }

            <form className="valign-wrapper realtimeInputContainer" >
                <div className="realtimeInputs">
                        <input id="realtimeInputName" className="realtimeInput"
                            value={usernameValue}
                            onChange={(e) => setUsernameValue(e.target.value)} 
                            placeholder="Your Name"
                        />
                        <input id="realtimeInputText"  className="realtimeInput"
                            value={formValue}
                            onChange={(e) => setFormValue(e.target.value)} 
                            placeholder="Messsage"
                        />
                </div>
                <button className="realtimeSend"
                    type="submit"
                    onClick={(e) => sendMessage(e)}
                    disabled={!formValue || !usernameValue || waitingMessage}>
                    <Icon>send</Icon>
                </button>
            </form>
        </div>
    </>)
}


function RenderWaitingMessage( props){
return (<>
            <div id="waitingMessage" className= "z-depth-0  card "
                style={{backgroundColor: props.waitingMessage.color }}
            >
                <div className="realtimeCard-header valign-wrapper" >
                    <span className="black-text">{props.waitingMessage.name}</span> 
                </div>
                <div className="realtimeCard-content white-text">
                    {props.waitingMessage.body}
                </div>
            </div>
    </>);
}



function RenderMessage( props){
    let style = {};
    // if(!props.isComment && props.uid === auth().currentUser.uid) style.float = "right";
  
    // if(props.user){
    //     let color = (('color' in props.user)?props.user.color:"grey");
    //     if(props.isComment){
    //         style.color = color;
    //     }else{
    //         style.backgroundColor = color;
    //     }
    // }

    const messageClass = "";// (props.message.uid === auth().currentUser.uid)?"ownChatMessage":"";

return (<>

    <li id={"realtimemessage-"+props.message.id}
                className= {"z-depth-0  card realtimeMessage " + messageClass}
                style={style}
            >
            
            <div className="realtimeCard-header valign-wrapper" >
                {/* <img src={props.user?props.user.photoURL:""} alt="" className="circle messageHeaderImg "/>  */}
                <span className="white-text">{props.message.ProfileName}</span> 
            </div>
            <div className="realtimeCard-content white-text">
                {props.message.Body}
            </div>
    </li>    
  </>);
}

