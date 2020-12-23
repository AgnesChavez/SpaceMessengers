import React, { useState, useRef, useEffect} from "react";

import {Textarea, Icon, Button, Row, Col,} from 'react-materialize';


import '../css/board.css';


export function MessageEditor(props) 
{
    const { content, id, uid, timestamp } = props.message;

    const msgRef = useRef(null);
        
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