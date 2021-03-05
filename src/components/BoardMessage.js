import React, { useRef, useState, useEffect } from "react";

import Draggable from 'react-draggable';


import { MessageEditor } from './MessageEditor'

import { userTypes } from '../helpers/Types'

import { Icon, Button } from 'react-materialize';

import { useDocumentData } from 'react-firebase-hooks/firestore';

import { db } from "../services/firebase";

import '../css/board.css';


export function BoardMessage(props) 
{

    const [message, loadingMessage] = useDocumentData(db.collection("boardMessages").doc(props.messageId));

    const myRef = useRef(null);
    const headerRef = useRef(null);
    
    // const positionRef = useRef(null);
    const [position, setPosition] = useState(null);
    // const [animPos, setAnimPos] = useState({x:0, y:0});
    // const animPos = useRef({x:0, y:0});
    const wasAnimating = useRef(false);


    // useEffect(()=>{
    //     if(!props.isAnimating){
    //         removeTransitionListeners();
    //     }
    //     // console.log("useEffect " + props.messageId + "  " + ((props.isAnimating === true)?"true":"false"));
    // });

    const onStop = (e, pos) => {
        // console.log("onStop: ", position );
        // positionRef.current = {x: position.x, y: position.y}
        setPosition({x: pos.x, y: pos.y});
        props.onStopHandler(props.messageId, pos);
        e.preventDefault();
        e.stopPropagation();
    };
    function isActive(){
        if(props.isAnimating === true ) return false;
        if(props.selected === null )return false;
        if(props.selected.id === props.messageId) return true;
        return false;
    }
    
    function canEdit(){
        return ( isActive() && (props.currentUser.type !== userTypes().student || (!loadingMessage && message && message.uid === props.currentUser.id)));
    }

    const onDrag = (e, pos) => {
        const {x, y} = pos;
        setPosition({x, y});
    };


    

    function removeTransitionListeners(){
        let elem = myRef.current;
        if(elem){
            // elem.removeEventListener("webkitTransitionEnd", transitionEnd, false);  // Code for Safari 3.1 to 6.0
            elem.removeEventListener("transitionend", transitionEnd, false );        // Standard syntax        
            // elem.removeEventListener("webkitTransitionEnd", resetTransitionEnd, false);  // Code for Safari 3.1 to 6.0
            elem.removeEventListener("transitionend", resetTransitionEnd, false );        // Standard syntax
            elem.style.transition="";
        }
    }


    function setTransition(easing){
        if(isActive() === true ){return;}



        console.log("setTransition " + easing + "  " + props.messageId + "  ", props.isAnimating);
        console.log("isActive() " + ((isActive() === true)?"true":"false"));
        
        console.log(props);
        let elem = myRef.current;
        if(elem){
            elem.style.transition="transform 2s";
            elem.style.transitionTimingFunction= easing;
            let coma = elem.style.transform.indexOf(",");
                    
            let transform = elem.style.transform.substring(0, coma+1) + " -"+ elem.clientHeight + "px)";

            // elem.addEventListener("webkitTransitionEnd", transitionEnd, false);  // Code for Safari 3.1 to 6.0
            elem.addEventListener("transitionend", transitionEnd, false );        // Standard syntax

            elem.style.transform = transform;
        }
    }

    function resetTransitionEnd(evt){
        console.log("resetTransitionEnd", evt);
        evt.preventDefault();
        evt.stopPropagation();
        let elem = myRef.current;
        if(elem){
            elem.style.opacity = 1.0;
            // elem.removeEventListener("webkitTransitionEnd", resetTransitionEnd, false);  // Code for Safari 3.1 to 6.0
            elem.removeEventListener("transitionend", resetTransitionEnd, false );        // Standard syntax
            setTransition("linear");
        }
    }

    function transitionEnd(evt){
        removeTransitionListeners();
        evt.preventDefault();
        evt.stopPropagation();
        let elem = myRef.current;
        let board = document.getElementById("board");
        if(elem && board){
            elem.style.transition= "transform 0.1s";
            elem.style.opacity = 0.0;
            
            // elem.addEventListener("webkitTransitionEnd", resetTransitionEnd, false);  // Code for Safari 3.1 to 6.0
            elem.addEventListener("transitionend", resetTransitionEnd, false );        // Standard syntax
// 
            elem.style.transform = "translate("+ position.x +"px, "+ board.clientHeight+"px)";

            // setTransition("linear" );
            // elem.style.animation= "messagesAnimation 5s linear 0s infinite ";
            // elem.style.transform = "translateX(" +message.position.x+"px)";

        }
    }

    if(!loadingMessage && message){
        let user = props.getUser(message.uid);
        if(position === null) {
            setPosition({x: message.position.x, y: message.position.y});
            return null;
        }

        if(wasAnimating.current !== props.isAnimating){
            wasAnimating.current = props.isAnimating;
            let elem = myRef.current;
            if(elem){
                if(props.isAnimating === true){

                    setTransition("ease-in");
                // setAnimPos(position);
                // if(elem){
//                     elem.style.transition="transform 2s";
//                     elem.style.transitionTimingFunction= "ease-in";
//                     let coma = elem.style.transform.indexOf(",");
// 
//                     // let px = elem.style.transform.lastIndexOf("px");
// 
//                     // console.log(elem.style.transform + " _ " + elem.style.transform.substring(0, coma+1));
//                     
//                     let transform = elem.style.transform.substring(0, coma+1) + " -" + elem.clientHeight + "px)";
// 
//                     elem.addEventListener("webkitTransitionEnd", transitionEnd, false);  // Code for Safari 3.1 to 6.0
//                     elem.addEventListener("transitionend", transitionEnd, false );        // Standard syntax
// 
//                     elem.style.transform = transform;

                    // console.log(elem.style.transform + " __ " + transform );
                    // elem.style.transform.substring(coma+1, px)

                
                }else{
                // if(elem){
                    removeTransitionListeners();
                    
                    
                    elem.style.transform = "translate("+message.position.x + "px, " + message.position.y+"px)";

                }
            }
        }else{
         

            // if(props.isAnimating === true) {
            //     let elem = myRef.current;
            //     let board = document.getElementById("board");
            //     let pos = animPos.current;
            //     
            //     if(elem && board){
            //         if(animPos.current.y < - elem.clientHeight){
            //             pos.y = board.clientHeight;
            //         }
            //     }
            //     setAnimPos(pos);
            // }
        }
    return ( 
        <>
            <Draggable
                className=""
                id={"draggable-"+props.messageId}
                handle=".messageCard-header"
                position={position}
                bounds="parent" 
                onStop={onStop}
                onDrag={onDrag}
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