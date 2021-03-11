import React, { useRef, useState, useEffect } from "react";

import Draggable from 'react-draggable';


import { MessageEditor } from './MessageEditor'

import { userTypes } from '../helpers/Types'

import { Icon, Button } from 'react-materialize';

import { useDocumentData } from 'react-firebase-hooks/firestore';

import { db } from "../services/firebase";

import '../css/board.css';

var count = 0;

const mode_transitionReset =  "mode_transitionReset";
const mode_transition = "mode_transition";
// const mode_normal = "mode_normal";

const fullSwipeDuration = 12;

function RenderMessageHeader(props){
    return <div className="messageCard-header messageCard-handle valign-wrapper" >
                        <img src={props.user.photoURL} alt="" className="circle messageHeaderImg "/> 
                        <span style={{color: ('color' in props.user)?props.user.color:"white"}}>{props.user.displayName}</span>
                    </div>
}
function RenderBoardMessageContent(props){

    return  <div className="messageCard-content white-text">
                <MessageEditor id={props.messageId}  message={props.message} active={props.canEdit}/>
                {props.canEdit?
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
    }



function AnimatedBoardMessage(props){

    // const myRef = useRef(null);
    // const firstRender = useRef(true);
    const [mode, setMode] = useState(null);
    const [style, setStyle] = useState({opacity:1.0,
            transitionProperty: "",
            transform:"translate("+props.message.position.x + "px, " + props.message.position.y+"px)",
            transitionTimingFunction: ""});
    
    const wasAnimating = useRef(false);
    // const numRenders = useRef(0);
    const id = useRef(null);
    
    useEffect(()=>{
        if(id.current === null){
            id.current = count;
            count++;
        }
        // console.log("userEffect " + count);

        addTransitionListeners();
        

        if(wasAnimating.current === false ){
            wasAnimating.current = true;
            setTransition("ease-in");
        }

        return ()=>{
            removeTransitionListeners();
            // console.log("AnimatedBoardMessage destructor");
        };
    });


    function addTransitionListeners(){
        let elem = document.getElementById("msg-anim-"+props.messageId);
        if(elem){
            // elem.addEventListener("webkitTransitionEnd", transitionEnd, false);  // Code for Safari 3.1 to 6.0
            elem.addEventListener("transitionend", transitionEnd, false );        // Standard syntax
        }
    }    

    function removeTransitionListeners(){
        let elem = document.getElementById("msg-anim-"+props.messageId);
        if(elem){
            // elem.removeEventListener("webkitTransitionEnd", transitionEnd, false);  // Code for Safari 3.1 to 6.0
            elem.removeEventListener("transitionend", transitionEnd, false );        // Standard syntax        
        }
    }

    function setTransition(_easing){
        let elem = document.getElementById("msg-anim-"+props.messageId);
        let board = document.getElementById("board");
        // console.log("setTransition ");
        if(elem && board){

            let duration = fullSwipeDuration;
            if(_easing === "ease-in"){
                duration =(props.message.position.y / (board.clientHeight + elem.clientHeight)) * fullSwipeDuration;
            }
            setMode(mode_transition);
            setStyle({
                    opacity: 1.0,
                    transitionProperty: "transform",
                    transitionDuration: duration+"s",
                    transitionTimingFunction: _easing,
                    transform:"translate("+ props.message.position.x +"px, -"+  elem.clientHeight+"px)",
                    
                });
            // console.log("setTransition ");

        }
    }

    function transitionEnd(evt){
        
        let board = document.getElementById("board");
        
        if(board){
            // console.log("transitionEnd " + mode);
            if(mode === mode_transition){
                setMode(mode_transitionReset);

                setStyle({
                    opacity:0.0,
                    transitionProperty: "transform",
                    transitionDuration: "0.1s",
                    transitionTimingFunction: "linear",
                    transform:"translate("+ props.message.position.x +"px, "+ board.clientHeight+"px)",
                    
                });
            }else if(mode === mode_transitionReset){
                
                setTransition("linear");
            }
        }
    }

    // function stopTransitions(){
    //     
    //     setStyle({
    //         opacity:1.0,
    //         transitionProperty: "",
    //         transform:"translate("+props.message.position.x + "px, " + props.message.position.y+"px)",
    //         transitionTimingFunction: ""
    //     });
    //     setMode(mode_normal);
    // }

    // console.log();
        // if(firstRender.current === true){
        //     firstRender.current = false;
        //     setMode(mode_normal);
        //     console.log("first render");
        // }else{
        //     if(wasAnimating.current === false ){
        //         wasAnimating.current = true;
        //         setTransition("ease-in");
        //     }
        // }
        // console.log("numRenders " + id.current, numRenders.current);
        // numRenders.current ++;

        return   <div 
                    id={"msg-anim-"+props.messageId}
                    className={ "card messageCard z-depth-0 transparent" }
                    style={style}
                >
    
                <RenderMessageHeader user={props.user}/>             
                <RenderBoardMessageContent
                    messageId={props.messageId}
                    deleteMessage={props.deleteMessage}
                    canEdit={props.canEdit}
                    message={props.message}
                />
            
                <div className="messageCard-footer">
                </div>        
            </div>
    }


function DraggableBoardMessage(props) {
    const [position, setPosition] = useState(null);

    const onDrag = (e, pos) => {
        const {x, y} = pos;
        setPosition({x, y});
    };


    const onStop = (e, pos) => {
        
        setPosition({x: pos.x, y: pos.y});
        props.onStopHandler(props.messageId, pos);
        e.preventDefault();
        e.stopPropagation();
    };

    if(position === null) {
        setPosition({x: props.message.position.x, y: props.message.position.y});
        return null;
    }
        
    return (
        <>
            <Draggable
                id={"draggable-"+props.messageId}
                handle=".messageCard-header"
                position={position}
                // bounds="parent" 
                onStop={onStop}
                onDrag={onDrag}
                onMouseDown={(e)=>{ props.onMessageClick(e, props.message);}}
            >    
                <div
                    id={"msg-"+props.messageId}
                    className={ "card messageCard z-depth-0 " + (props.isActive === false?"transparent":"") }
                    style={{
                            backgroundColor: props.message.color, 
                            zIndex: (props.isActive?1:0),
                            }}
                >
    
                <RenderMessageHeader user={props.user}/>             
                <RenderBoardMessageContent
                    messageId={props.messageId}
                    deleteMessage={props.deleteMessage}
                    canEdit={props.canEdit}
                    message={props.message}
                />
            
                <div className="messageCard-footer">
                </div>        
            </div>
            </Draggable> 
        </>)
    
}

export function BoardMessage(props) 

{

    const [message, loadingMessage] = useDocumentData(db.collection("boardMessages").doc(props.messageId));
    
    
    function isActive(){
        if(props.isAnimating === true ) return false;
        if(props.selected === null )return false;
        if(props.selected.id === props.messageId) return true;
        return false;
    }
    
    function canEdit(){
        return ( isActive() && (props.currentUser.type !== userTypes().student || (!loadingMessage && message && message.uid === props.currentUser.id)));
    }

    if(!loadingMessage && message){

        
        let user = props.getUser(message.uid);
        if(props.isAnimating === false){
        return <DraggableBoardMessage
            user ={user}
            onStopHandler = {props.onStopHandler}
            messageId = {props.messageId}
            message = {message}
            onMessageClick = {props.onMessageClick}
            isAnimating = {props.isAnimating}
            deleteMessage = {props.deleteMessage}
            canEdit = {canEdit()}
            isActive = {isActive()}
        />}else{
        return <AnimatedBoardMessage 
            user ={user}
            messageId = {props.messageId}
            message = {message}
            isAnimating = {props.isAnimating}
            deleteMessage = {props.deleteMessage}
            canEdit = {canEdit()}
            isActive = {isActive()}
            />
        }
    }
    return null;
}


