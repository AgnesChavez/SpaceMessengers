import React, { useState, useRef, useEffect} from "react";

import { useCollectionData } from 'react-firebase-hooks/firestore';

import { Icon, Button } from 'react-materialize';

import { db } from "../services/firebase";

import '../css/board.css';

import  Chat from '../pages/Chat'



export function Comments(props) 
{
    // const { content, id, uid } = props.messageId;
    // const commentsRef = db.collection("comments").where("messageId", "==", props.messageId);
    // const [comments, loading, error] = useCollectionData(commentsRef);

    // const [showing, setShowing] = useState(false);

    const myRef = useRef(null);

    function showComments(e){
        console.log("showComments");
        myRef.current.classList.toggle("scale-out");

    }

    return ( 
    <>
    
<a className="waves-effect waves-light btn-small"
    style={{width:100+'%'}}
     onClick={showComments} 
    >
<Icon tiny left>comments</Icon>
    comments
</a>
    <div ref={myRef} className="scale-transition">
    <Chat collection="comments" group={props.messageId} containerClass="comments-container" isComment={true}></Chat>
    
    </div>
        {/* small */}
        {/* waves="light" */}
        {/* onClick={showComments} */}
        {/* node="a" */}
        {/* className="transparent" */}
        {/* style={{width:100+'%'}} */}
        
        {/* > */}
      
      {/* <div> */}
      {/*     comments */}
      {/* </div> */}
      {/*    */}
      {/* </Button> */}
    </>)
}