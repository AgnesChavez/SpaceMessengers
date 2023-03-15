import React, { useRef, useState } from "react";
import { db } from "../services/firebase";
import firebase from 'firebase/app';
import 'firebase/firestore';


import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';

import { Icon, Button } from 'react-materialize';

import '../css/realtimechat.css';

import { randomColorHSL } from "../helpers/Types.js"

function getMyMessages(){
    let myMessages = sessionStorage.getItem("myMessages")
    if(myMessages){
        // console.log("myMessages string", myMessages);
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

function compareMsgs(a, b) {
    if (a.startShowing && b.startShowing) {
        if(a.startShowing.seconds === b.startShowing.seconds){
            return a.startShowing.nanoseconds - b.startShowing.nanoseconds;
        }else{
            return a.startShowing.seconds - b.startShowing.seconds
        }
        // return a.startShowing.compareTo(b.startShowing);
    // if (a.startShowing && b.startShowing) {
    //     return -1;
    // }
    // if (a es mayor que b según criterio de ordenamiento) {
    //     return 1;
    // }
  // a debe ser igual b
    // return 0;
    }else{
        if(a.startShowing){
            return -1;
        }else if(b.startShowing){
            return 1;
        }
    }
    return 0;
}


export default function RealtimeChat(props) {    
    
    const dummy = useRef();

    const color = useRef(randomColorHSL());

    let query = db.collection("realtime")
        .where('wasShown', '==', false)
        .where('isShowing', '==', true)
        .orderBy('timestamp');
   

    let waitingQuery = db.collection("realtime")
    .where('wasShown', '==', false)
    .where('isShowing', '==', false);

    const [realtimeMessages, loadingRealtimeMessages] = useCollectionData(query);

    const [waiting, loadingWaiting] = useCollectionData(waitingQuery);  

    let boardMessagesQuery = db.collection("boardMessages").where('isShowing', '==', true);

    const [boardMessages, loadingBoardMessages] = useCollectionData(boardMessagesQuery);

    let paramsQuery = db.collection("params").doc('realtime');
    const [params, loadingParams] =  useDocumentData(paramsQuery);

    const [formValue, setFormValue] = useState('');
    const [usernameValue, setUsernameValue] = useState('');
    
    const [waitingMessage, setWaitingMessage] = useState(null);

    const [replyingTo, setReplyingTo] = useState(null);

    var messages = [];

    const replyCallback = (msg)=>{
        setReplyingTo(msg);
    }



    // useEffect (() => {
    //     dummy.current.scrollIntoView({ behavior: 'smooth' });
    // },[messages],);



    const sendMessage = async (e) => {
        
        e.preventDefault();
        // const { uid } = auth().currentUser;
        
        let docRef = await db.collection("realtime").add({
            Body: formValue,
            ProfileName: usernameValue,
            timestamp: firebase.firestore.Timestamp.now(),
            wasShown: false,
            isShowing:false,
            isDeleted: false,
            isRealTime: true,
            replyingTo: (replyingTo?replyingTo.id:"")
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
        setReplyingTo(null);
        dummy.current.scrollIntoView({ behavior: 'smooth' });
    }

    let myMessages = getMyMessages();
    

    if(waitingMessage && !loadingRealtimeMessages){
        // console.log(waitingMessage.id); 
        for (var i = 0; i < realtimeMessages.length; i++) {
            if(realtimeMessages[i].id === waitingMessage.id){
                setWaitingMessage(null);
                break;
            }
        }
    }

    if(!loadingRealtimeMessages && !loadingBoardMessages){
        // messages = realtimeMessages;
        messages = realtimeMessages.concat(boardMessages);
        messages.sort(compareMsgs);
        // console.log(messages);


    }else{
        if(!loadingRealtimeMessages){
            messages = realtimeMessages;
        }else if(!loadingBoardMessages){
            messages = boardMessages;
        }
    }

    return (<>
        <div className="realtimeContainer">
            <div className="realtimeMessagesContainer">
                {(loadingRealtimeMessages || loadingBoardMessages) && <div>loading...</div>}
                <ul>
                    {/* {!loadingMessages && messages && messages.slice(0).reverse().map(msg =>  */}
                    {/*     <RenderMessage key={msg.id} message={msg} />)} */}
                    {messages && messages.map(msg => 
                         (msg && msg.id)?  <RenderMessage key={msg.id} 
                                        message={msg}
                                        myMessages={myMessages}
                                        replyCallback={replyCallback}
                                        />:<></>)}
                </ul>
                <span ref={dummy}></span>
            </div>

            <div className="realtimeInputContainer" style={{backgroundColor: color.current }} >
            {replyingTo && <RenderMessageReply message={replyingTo} replyCallback={replyCallback}/>}
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


function RenderMessageReply( props){

return (<>
    {props.message &&
    <li id={"realtimemessagereply-"+props.message.id}
                className= "z-depth-0  card realtimeMessage "
            >  

            <div className="realtimeReplyCard-header valign-wrapper" >
              {"Reply to: " + props.message.ProfileName}
              </div>
              <Button
                    className="btn-floating  grey right replyMessageButton"
                    node="button"
                    small
                    tooltip="Cancel reply"
                    waves="light"
                    floating
                    icon={<Icon>cancel</Icon>}
                    onClick={()=>props.replyCallback(null)}
            />
              
            
            <div className="realtimeReplyCard-content white-text">
                {props.message.Body}
            </div>
    </li> }    
  </>);
}



function RenderRealtimeMessage( props){ 
    let messageClass = "z-depth-0  card realtimeMessage " ;
    if(Array.isArray(props.myMessages) && props.myMessages.includes(props.message.id)){
     messageClass += "ownChatMessage";
    }
return (<>

    <li id={"realtimemessage-"+props.message.id}
                className= {messageClass}
            >  
            <div className="realtimeCard-header valign-wrapper" >
              {props.message.ProfileName} 
              </div>
              <Button
                    className="btn-floating  grey right replyMessageButton"
                    node="button"
                    small
                    tooltip="Reply this message"
                    waves="light"
                    floating
                    icon={<Icon>reply</Icon>}
                    onClick={()=>props.replyCallback(props.message)}
            />
              
            
            <div className="realtimeCard-content white-text">
                {props.message.Body}
            </div>
    </li>    
  </>);
}

function RenderBoardMessage( props){
return (<>

    <li id={"realtimeBoardMessage-"+props.message.id}
                className= "z-depth-0  card realtimeMessage realtimeBoardMessage"
            >  
            <div className="realtimeCard-header valign-wrapper" >
                {props.message.displayName} 
            </div>
            <div className="realtimeCard-content white-text">
                {props.message.content}
            </div>
    </li>    
  </>);
}



function  RenderMessage( props){ 

return props.message.isRealTime? <RenderRealtimeMessage {...props}/> : <RenderBoardMessage {...props} /> ;


    // return (<>
    //     {props.message.isRealTime && <RenderRealtimeMessage {...props}/> }
    //     {!props.message.isRealTime && <RenderBoardMessage {...props} /> }
    //     </>);
}





