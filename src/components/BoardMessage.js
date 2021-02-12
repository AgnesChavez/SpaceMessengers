import React, { useRef } from "react";

import Draggable from 'react-draggable';

// import { formatTime } from '../helpers/Formatting'

import { MessageEditor } from './MessageEditor'

import { userTypes } from '../helpers/Types'

import { Icon, Button } from 'react-materialize';

import { useDocumentData } from 'react-firebase-hooks/firestore';

import { db } from "../services/firebase";

import '../css/board.css';

// 
// 
// 
// function MessageImage(props){
// 
//     const boxed = useRef(null);
//     
// 
//     useEffect(() => {
// 
//     });
// 
// 
//     return  <img
//             id={"image"+props.message.id}
//             alt={props.message.content}
//             src={props.message.imgURL}
//             data-caption={props.message.content}
//             className="materialboxed messageImage"
//             
//         />
// }

// onClickCapture={(e)=>{
//                 e.preventDefault();
//                 e.stopPropagation();
//                 let img = document.getElementById("image"+props.message.id);
//                 if(img !== null){
//                      window.M.Materialbox.getInstance(img).open();
//                 }
//             }}

// props:
// messageId
// onStopHandler
// selected
// onMessageClick
// getUser
// currentUser
// deleteMessage

export function BoardMessage(props) 
{

    const [message, loadingMessage] = useDocumentData(db.collection("boardMessages").doc(props.messageId));

    const myRef = useRef(null);
    const headerRef = useRef(null);
    const onStop = (e, position) => {
        props.onStopHandler(props.messageId, position);
        e.preventDefault();
        e.stopPropagation();
    };
    function isActive(){
        if(props.selected === null )return false;
        if(props.selected.id === props.messageId) return true;
        return false;
    }
    
    function canEdit(){
        return (isActive() && (props.currentUser.type !== userTypes().student || (!loadingMessage && message && message.uid === props.currentUser.id)));
    }


    if(!loadingMessage && message)
        {
            let user = props.getUser(message.uid);
    return ( 
    <>
        <Draggable
            className=""
            id={"draggable-"+props.messageId}
            handle=".messageCard-header"
            defaultPosition={{x: message.position.x, y: message.position.y }}
            bounds="parent" 
            onStop={onStop}
            onMouseDown={(e)=>props.onMessageClick(e, message)}
        >
            <div ref={myRef}
                id={"msg-"+props.messageId}
                className={ "card messageCard z-depth-0 " + ((!isActive())?"transparent":"") }
                style={{backgroundColor: message.color, 
                    zIndex: (isActive()?1:0)
                    }}
            >
            
            <div className="messageCard-header messageCard-handle valign-wrapper" ref={headerRef}>
                <img src={user.photoURL} alt="" className="circle messageHeaderImg "/> 
                <span style={{color: ('color' in user)?user.color:"white"}}>{user.displayName}</span>
            </div>
                <div className="messageCard-content white-text">
              
                    <MessageEditor id={props.messageId}  message={message} active={canEdit()}/>

                    {canEdit()?
                    <Button
                        className="red small halfway-fab"
                        floating
                        small
                        icon={<Icon>delete</Icon>}
                        onClick={(e)=>props.deleteMessage(props.messageId)}
                        node="button"
                        tooltip="Delete this message"
                        waves="light"
                    />:""}
                     
                </div>
                <div className="messageCard-footer">
                </div>                    
            </div>
        </Draggable> 
    </>)
    }
    return null;
}