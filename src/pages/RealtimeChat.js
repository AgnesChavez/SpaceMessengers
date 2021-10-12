import React, { useRef, useState,useEffect } from "react";

import { db } from "../services/firebase";
import firebase from 'firebase/app';
import 'firebase/firestore';


import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';

import { Icon } from 'react-materialize';

import '../css/realtimechat.css';

import { randomColorHSL } from "../helpers/Types.js"

function getMyMessages(){
    let myMessages = sessionStorage.getItem("myMessages")
    if(myMessages){
        console.log("myMessages string", myMessages);
        return JSON.parse(myMessages);
    }else{
        return [];
    }
}

function addToMyMessages(toAdd){

    let myMessages = getMyMessages();

    myMessages.push(toAdd);

    // console.log("addToMyMessages", );

    sessionStorage.setItem("myMessages", JSON.stringify(myMessages));

}

function removeFromMyMessages(toRemove){
    let myMessages = getMyMessages();

    myMessages = myMessages.filter(function(ele){ 
            return ele !== toRemove; 
    });

    if(myMessages.length === 0){
        sessionStorage.removeItem("myMessages");    
    }else{
        sessionStorage.setItem("myMessages", myMessages);
    }
    
}
// 
// async function numWaitingMessages(){
//     let query = await db.collection("realtime")
//     .where('wasShown', '==', false)
//     .where('isShowing', '==', false).get();
//     
//     return query.size;
// 
// }



export default function RealtimeChat(props) {
    const dummy = useRef();

    const color = useRef(randomColorHSL());

    let query = db.collection("realtime")
    .where('wasShown', '==', false)
    .where('isShowing', '==', true)
    .orderBy('timestamp');//.limit(15);
   

    let waitingQuery = db.collection("realtime")
    .where('wasShown', '==', false)
    .where('isShowing', '==', false);

    const [messages, loadingMessages] = useCollectionData(query);

    const [waiting, loadingWaiting] = useCollectionData(waitingQuery);    

    let paramsQuery = db.collection("params").doc('realtime');
    const [params, loadingParams] =  useDocumentData(paramsQuery);

    const [formValue, setFormValue] = useState('');
    const [usernameValue, setUsernameValue] = useState('');
    
    const [waitingMessage, setWaitingMessage] = useState(null);

    
    // query.get().then(querySnapshot=>{
    //     querySnapshot.forEach(doc=> {console.log(doc.id, doc.data())});
    // });


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
            wasShown: false,
            isShowing:false
        });

        await db.collection("realtime").doc(docRef.id).update({
                id: docRef.id
        });

        addToMyMessages(docRef.id);

        setWaitingMessage({
            id: docRef.id,
            body:formValue,
            name: usernameValue,
            // color: randomColorHSL()
            
        });

        setFormValue('');
        setUsernameValue('');
        dummy.current.scrollIntoView({ behavior: 'smooth' });
    }

    let myMessages = getMyMessages();
    

    if(waitingMessage && !loadingMessages){
        console.log(waitingMessage.id); 
        for (var i = 0; i < messages.length; i++) {
            if(messages[i].id === waitingMessage.id){
                // console.log("waiting message end");
                // console.log(messages[i].id);
                setWaitingMessage(null);
                break;
            }
        }
    }

    return (<>
        <div className="realtimeContainer">
            <div className="realtimeMessagesContainer">
                {loadingMessages && <div>loading...</div>}
                <ul>
                    {/* {!loadingMessages && messages && messages.slice(0).reverse().map(msg =>  */}
                    {/*     <RenderMessage key={msg.id} message={msg} />)} */}
                    {!loadingMessages && messages && messages.map(msg => 
                        <RenderMessage key={msg.id} message={msg} myMessages={myMessages} />)}
                </ul>
                <span ref={dummy}></span>
            </div>

            <div className="realtimeInputContainer" style={{backgroundColor: color.current }} >
             {waitingMessage &&
                <RenderWaitingMessage waitingMessage={waitingMessage} 
                                      params = {params}
                                      loadingParams={loadingParams}
                                      waiting = {waiting}
                                      loadingWaiting = {loadingWaiting}
                                      
                                      />
            } 

            <form className="realtimeInputForm" >
             
           
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
        </div>
    </>)
}


function RenderWaitingMessage( props){

return (<>
                {(!props.loadingParams && !props.loadingWaiting && props.params) &&
                <div className="realtimeCard-waitTime white-text" >
                    {"Your message will be shown in "+ (props.params.interval * props.waiting.length) + " secs."}
                </div>}
    </>);
}



function RenderMessage( props){
    let style = {};
    let messageClass = "z-depth-0  card realtimeMessage " ;
    if(Array.isArray(props.myMessages) && props.myMessages.includes(props.message.id)){
     messageClass += "ownChatMessage";
    }
    // (props.message.uid === auth().currentUser.uid)?"ownChatMessage":"";

return (<>

    <li id={"realtimemessage-"+props.message.id}
                className= {messageClass}
                style={style}
            >
            
            <div className="realtimeCard-header valign-wrapper" >
                {/* <img src={props.user?props.user.photoURL:""} alt="" className="circle messageHeaderImg "/>  */}
                {props.message.ProfileName}
            </div>
            <div className="realtimeCard-content white-text">
                {props.message.Body}
            </div>
    </li>    
  </>);
}

