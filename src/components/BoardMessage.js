import React, { useRef } from "react";

import Draggable from 'react-draggable';

import { formatTime } from '../helpers/Formatting'

import { MessageEditor } from './MessageEditor'

import { Comments } from './Comments'



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
        if(props.selected === null || myRef.current === null)return false;
        if(props.selected === myRef.current) return true;
        if(props.selected === headerRef.current) return false;
        if(myRef.current.contains(props.selected))return true;
        return false;
    }
    

    return ( 
    <>
        <Draggable
            handle=".messageCard-header"
            defaultPosition={{x: props.message.position.x, y: props.message.position.y }}
            bounds="parent" 
            onStop={onStop}
        >
            <div ref={myRef}
                id={"msg-"+id}
                className="card messageCard teal"
            >
                <div ref={headerRef} className="messageCard-header messageCard-handle">{props.user.name}</div>
                <div className="messageCard-content white-text">
                    <MessageEditor id={id}  onMessageChange={props.onMessageChange} message={props.message} active={isActive()}/>
                    {isActive()?
                    <p className="boardMessageTime ">{formatTime(timestamp)}</p>:""
                    }
                </div>
                <div className="messageCard-footer">
                    <Comments 
                        messageId={id}
                        ></Comments>
                </div>                    
            </div>
        </Draggable> 
    </>)
}