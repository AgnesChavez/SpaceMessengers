import React, { useRef } from "react";

import Draggable from 'react-draggable';

// import { formatTime } from '../helpers/Formatting'

import { MessageEditor } from './MessageEditor'

import { userTypes } from '../helpers/Types'

import { Icon, Button } from 'react-materialize';

import '../css/board.css';


export function BoardMessage(props) 
{
    const { id } = props.message;

    const myRef = useRef(null);
    const headerRef = useRef(null);
    const onStop = (e, position) => {
        props.onStopHandler(id, position);
        e.preventDefault();
        e.stopPropagation();
    };
    function isActive(){
        // if(props.currentUser.type === userTypes().student && props.message.uid !== props.currentUser.id)return false;
        if(props.selected === null )return false;
        if(props.selected.id === id) return true;
        // if(props.selected === headerRef.current) return true;
        // if(myRef.current.contains(props.selected))return true;
        return false;
    }
    
    function canEdit(){
        return (isActive() && (props.currentUser.type !== userTypes().student || props.message.uid === props.currentUser.id));
    }

    return ( 
    <>
        <Draggable
            className=""
            id={"draggable-"+id}
            handle=".messageCard-header"
            defaultPosition={{x: props.message.position.x, y: props.message.position.y }}
            bounds="parent" 
            onStop={onStop}
            onMouseDown={(e)=>props.onMessageClick(e, props.message)}
        >
            <div ref={myRef}
                id={"msg-"+id}
                className={ "card messageCard z-depth-0 " + ((!isActive())?"transparent":"") }
                style={{backgroundColor: props.message.color, 
                    zIndex: (isActive()?1:0)
                    }}
            >
            
            <div className="messageCard-header messageCard-handle valign-wrapper" ref={headerRef}>
                <img src={props.user.photoURL} alt="" className="circle messageHeaderImg "/> 
                <span style={{color: ('color' in props.user)?props.user.color:"white"}}>{props.user.displayName}</span>
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
                    <MessageEditor id={id}  onMessageChange={props.onMessageChange} message={props.message} active={canEdit()}/>
                    {canEdit()?
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
                </div>                    
            </div>
        </Draggable> 
    </>)
}