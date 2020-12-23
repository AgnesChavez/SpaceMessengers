import React, { useState, useRef, useEffect} from "react";

import Draggable from 'react-draggable';

import {Textarea, Icon, Button, Row, Col, Card, CardTitle, CardPanel } from 'react-materialize';

import { formatTime } from '../helpers/Formatting'


import '../css/board.css';


function booToString(b, name){
  return name + ": " + (b?"true":"false")
}

export function BoardMessage(props) 
{
    const { content, id, uid, timestamp } = props.message;

    const myRef = useRef(null);
    const msgRef = useRef(null);
    const onStop = (e, position) => {
        props.onStopHandler(id, position);
        e.preventDefault();
        e.stopPropagation();
    };
    function isActive(){
        if(props.selected === null || myRef.current === null)return false;
        if(props.selected === myRef.current) return true;
        if(myRef.current.contains(props.selected))return true;
        return false;
    }

    function textAreaCss()
    {
        let a = isActive();
      return ({
        borderBottomWidth: (a? 1:0 )+'px',
        })
    }
  
    useEffect(() => {
            window.M.textareaAutoResize(msgRef.current);
        },
        [props.message.content],
    );

    

    return ( 
    <>
        <Draggable
            // cancel="textarea"
            handle=".messageCard-header"
            disabled={!isActive()}
            defaultPosition={{x: props.message.position.x, y: props.message.position.y }}
            bounds="parent" 
            onStop={onStop}
        >
            <div ref={myRef}
                id={"msg-"+id}
                className="card messageCard teal"
            >
                <div className={"messageCard-header " + (isActive()?"messageCard-handle":"")}>{props.user.name}</div>
                <div className="messageCard-content white-text">
                    <textarea ref={msgRef} id={"textarea-"+id} defaultValue={content}
                        className={"materialize-textarea"}
                        style={textAreaCss()}
                        onChange={(e)=>props.onMessageChange(id, e.target.value)}
                    ></textarea>
                    {isActive()?
                    <p className="boardMessageTime ">{formatTime(timestamp)}</p>:""
                    }
                </div>
                <div className="card-action">

                </div>                    
            </div>
        </Draggable> 
    </>)
}