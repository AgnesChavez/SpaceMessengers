import React, { useRef, useEffect} from "react";

import { db } from "../services/firebase";

import '../css/board.css';


export function MessageEditor(props) 
{
    const { content, id } = props.message;

    const msgRef = useRef(null);
     
    useEffect(() => {
            window.M.textareaAutoResize(msgRef.current);
        },
        [props.message.content],
    );



    const onMessageChange = async (msgId, msg) => {
        const messagesRef = db.collection("boardMessages");
        messagesRef.doc(msgId).update({ content: msg });
    }

    return ( 
    <>
        <div className="textEditor">
        <textarea ref={msgRef}
            id={"textarea-"+id}
            defaultValue={content}
            className={"materialize-textarea " + (props.active?"activeTextArea":"inactiveTextArea")}
            style={{margin: "0px", boxShadow: "unset", minHeight: "unset", height: "unset"}}
            maxLength="200"
            onChange={(e)=>onMessageChange(id, e.target.value)}
        ></textarea>
        </div>
    </>)
}