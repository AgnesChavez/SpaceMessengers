import React, { useRef, useState,useEffect } from "react";
import { db, auth } from "../services/firebase";
import firebase from 'firebase/app';
import 'firebase/firestore';


import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';

import { Icon, Button, Badge } from 'react-materialize';

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

// function removeFromMyMessages(toRemove){
//     let myMessages = getMyMessages();
// 
//     myMessages = myMessages.filter(function(ele){ 
//             return ele !== toRemove; 
//     });
// 
//     if(myMessages.length === 0){
//         sessionStorage.removeItem("myMessages");    
//     }else{
//         sessionStorage.setItem("myMessages", myMessages);
//     }
//     
// }

export default function RealtimeChatAdmin(props) {
    // console.log("auth().currentUser ", auth().currentUser);

    
    
    const [isAdmin, setIsAdmin] = useState(false);
    const [isShowingAll, setIsShowingAll] = useState(false);
    const [isDeleteEnabled, setIsDeleteEnabled] = useState(false);
    const [isShowingDeleted, setIsShowingDeleted] = useState(false);

    useEffect (() => {
    if(auth().currentUser && !auth().currentUser.isAnonymous){
        db.collection('users').doc(auth().currentUser.uid).get().then(user=>{
            if (user.exists) {
                // console.log("user.data().type", user.data().type);
                if(user.data().type === "admin"){
                    setIsAdmin(true);
                    // console.log("setIsAdmin(true);");
                }
            }
        }).catch((error) => {
            console.log("Error getting currentUser:", error);
        });
    }
     },[]);

    const dummy = useRef();

    const color = useRef(randomColorHSL());

    let query = db.collection("realtime");
    if(!isShowingAll){
        query = query.where('wasShown', '==', false)
        .where('isShowing', '==', true);
    }
    if(isShowingAll && !isShowingDeleted){
        query = query.where('isDeleted', '==', false);
    }
    query = query.orderBy('timestamp');//.limit(15);
   

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

    const showAllMessagesCallback = ()=>{
        if(isAdmin === true){
            setIsShowingAll(!isShowingAll);
        }
    }

    const enableDeleteCallback = ()=>{
        if(isAdmin === true){
            setIsDeleteEnabled(!isDeleteEnabled);
        }
    }



    const sendMessage = async (e) => {
        
        e.preventDefault();
        // const { uid } = auth().currentUser;
        
        let docRef = await db.collection("realtime").add({
            Body: formValue,
            ProfileName: usernameValue,
            timestamp: firebase.firestore.Timestamp.now(),
            wasShown: false,
            isShowing:false,
            isDeleted: false
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
            {isAdmin && <RenderAdminBar 
                        showAllMessagesCallback={showAllMessagesCallback} 
                        isShowingAll={isShowingAll}  
                        isDeleteEnabled={isDeleteEnabled} 
                        enableDeleteCallback={enableDeleteCallback}
                        isShowingDeleted={isShowingDeleted}
                        setIsShowingDeleted={setIsShowingDeleted}
                        />}
            <div className="realtimeMessagesContainer">
                {loadingMessages && <div>loading...</div>}
                <ul>
                    {/* {!loadingMessages && messages && messages.slice(0).reverse().map(msg =>  */}
                    {/*     <RenderMessage key={msg.id} message={msg} />)} */}
                    {!loadingMessages && messages && messages.map(msg => 
                        <RenderMessage key={msg.id} 
                                        message={msg}
                                        myMessages={myMessages}
                                        isAdmin={isAdmin}
                                        isShowingAll={isShowingAll} 
                                        isDeleteEnabled={isDeleteEnabled}
                                        isShowingDeleted={isShowingDeleted}
                                        />)}
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


function deleteCallback(id){
    // console.log("deleteCallback ", id);

// db.collection("realtime").doc(id).delete().then(() => {
//     console.log("Message successfully deleted!");
// }).catch((error) => {
//     console.error("Error removing message: ", error);
// });
    db.collection("realtime").doc(id).update({
        isDeleted: true
    }).then(() => {
        console.log("Document deleted!", id);
    }).catch((error) => {
        console.error("Error updating document: ", error);
    });

}

function RenderAdminBar(props){
    return (<>
        <div className="realtimeAdminTopBar">
            
            
            { props.isDeleteEnabled && <Button
                    className="yellow black-text right adminShowAllMessagesButton"
                    node="button"
                    small
                    tooltip={props.isShowingDeleted?"Hide deleted messages":"Show deleted messages"}
                    waves="light"
                    onClick={()=>props.setIsShowingDeleted(!props.isShowingDeleted)}
            >{props.isShowingDeleted?"Hide deleted":"Show deleted"}</Button> }

            <Button
                    className="red right adminShowAllMessagesButton"
                    node="button"
                    small
                    tooltip={props.isDeleteEnabled?"Disable delete":"Enable delete"}
                    waves="light"
                    onClick={()=>props.enableDeleteCallback()}
            >{props.isDeleteEnabled?"Disable delete":"Enable delete"}</Button>
            <Button
                    className="teal right adminShowAllMessagesButton"
                    node="button"
                    small
                    tooltip="Show all messages"
                    waves="light"
                    onClick={()=>props.showAllMessagesCallback()}
            >{props.isShowingAll?"Only show realtime messages":"Show all Messages"}</Button>
        </div>
    </>);
}






function RenderMessage( props){
    let style = {};
    let messageClass = "z-depth-0  card realtimeMessage " ;
    if(Array.isArray(props.myMessages) && props.myMessages.includes(props.message.id)){
     messageClass += "ownChatMessage";
    }

    let badgeClass = "realtimeMessageBadge " + (props.message.wasShown?"blue white-text":"yellow black-text");

return (<>

    <li id={"realtimemessage-"+props.message.id}
                className= {messageClass}
                style={style}
            >  
            <div className="realtimeCard-header valign-wrapper" >

            { props.isAdmin && props.isDeleteEnabled && !props.message.isDeleted &&
                <Button
                    className="red right removeImageButton"
                    node="button"
                    small
                    tooltip="Delete this message"
                    waves="light"
                    floating
                    icon={<Icon>delete</Icon>}
                    onClick={()=>deleteCallback(props.message.id)}
            />}
            { props.isAdmin && props.isShowingAll &&
                <div>
                    {!props.message.isDeleted && <Badge className={badgeClass}>{"was shown " + (props.message.wasShown?"YES": "NO")  } </Badge>}
                    {props.message.isShowing && !props.message.isDeleted && <Badge className="green white-text realtimeMessageBadge">{"is showing now"} </Badge>}
                    {props.message.isDeleted && <Badge className="red white-text realtimeMessageBadge">{"DELETED"} </Badge>}
                </div>
            }
                {/* <img src={props.user?props.user.photoURL:""} alt="" className="circle messageHeaderImg "/>  */}
                {props.message.ProfileName} 
            </div>
            <div className="realtimeCard-content white-text">
                {props.message.Body}
            </div>
    </li>    
  </>);
}

function RenderBoardMessage( props){
return (<>

    <li id={"realtimeBoardMessage-"+props.message.id}
                className= "z-depth-0  card realtimeMessage "
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






