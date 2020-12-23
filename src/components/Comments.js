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

    function showComments(e){

    }

    return ( 
    <>
    
<a className="waves-effect waves-light btn-small"
    style={{width:100+'%'}}
    >
<Icon tiny left>comments</Icon>
    comments
</a>
    <Chat collection="comments" group={props.messageId}>
        
    </Chat>
    

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