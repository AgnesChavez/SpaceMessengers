import React, { useRef } from "react";

import Draggable from 'react-draggable';

// import { formatTime } from '../helpers/Formatting'

import { MessageEditor } from './MessageEditor'

import { userTypes } from '../helpers/Types'

import { Icon, Button } from 'react-materialize';

import { useDocumentData } from 'react-firebase-hooks/firestore';

import { db } from "../services/firebase";

import '../css/board.css';

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
                    {/* <span className="new badge red messageBadge  z-depth-2" data-badge-caption=""  */}
                    {/*     style={{position: "absolute", */}
                    {/*             right: "0px", */}
                    {/*             minWidth:"22px", */}
                    {/*             borderRadius:"11px", */}
                    {/*             transform: "translateY(-11px)" */}
                    {/*             }} */}
                    {/*     >3</span> */}
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