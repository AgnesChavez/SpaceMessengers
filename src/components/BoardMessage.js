import React, { useRef } from "react";

import Draggable from 'react-draggable';

import { formatTime } from '../helpers/Formatting'

import { MessageEditor } from './MessageEditor'

import { userTypes } from '../helpers/Types'

import { Icon, Button } from 'react-materialize';

import '../css/board.css';


export function BoardMessage(props) 
{
    const { id, timestamp } = props.message;

    const myRef = useRef(null);
    const headerRef = useRef(null);
    const onStop = (e, position) => {
        props.onStopHandler(id, position);
        e.preventDefault();
        e.stopPropagation();
    };
    function isActive(){
        if(props.currentUser.type === userTypes().student && props.message.uid !== props.currentUser.id)return false;
        if(props.selected === null || myRef.current === null)return false;
        if(props.selected === myRef.current) return true;
        if(props.selected === headerRef.current) return false;
        if(myRef.current.contains(props.selected))return true;
        return false;
    }
    
    function canDelete(){
        return (isActive() && (props.currentUser.type !== userTypes().student || props.message.uid === props.currentUser.id));
    }

    return ( 
    <>
        <Draggable
            className=""
            handle=".messageCard-header"
            defaultPosition={{x: props.message.position.x, y: props.message.position.y }}
            bounds="parent" 
            onStop={onStop}
            onMouseDown={(e)=>props.onMessageClick(e, props.message)}
        >
            <div ref={myRef}
                id={"msg-"+id}
                className={ "card messageCard " + ((!isActive())?"transparent":"") }
                style={{backgroundColor: props.message.color}}
            >
            
            <div className="messageCard-header messageCard-handle valign-wrapper" ref={headerRef}>
                <img src={props.user.photoURL} alt="" className="circle messageHeaderImg "/> 
                <span style={{color: ('color' in props.user)?props.user.color:"white"}}>{props.user.displayName}</span>
            </div>
                <div className="messageCard-content white-text">
                    <MessageEditor id={id}  onMessageChange={props.onMessageChange} message={props.message} active={isActive()}/>
                    {/* {isActive()? */}
                    {/* <p className="boardMessageTime ">{formatTime(timestamp)}</p>:"" */}
                    {/* } */}
                    {canDelete()?
                    <Button
                        className="red halfway-fab"
                        floating
                        small
                        icon={<Icon>delete</Icon>}
                        onClick={(e)=>props.deleteMessage(id)}
                        node="button"
                        tooltip="Delete this message"
                        waves="light"
                    />:""}
                     
                </div>
                <div className="messageCard-footer">
                    {/* <Comments  */}
                    {/*     messageId={id} */}
                    {/*     ></Comments> */}
                </div>                    
            </div>
        </Draggable> 
    </>)
}