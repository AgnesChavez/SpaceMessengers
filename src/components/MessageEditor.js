import React, { useRef, useEffect} from "react";

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

    return ( 
    <>
        <div className="textEditor">
        <textarea ref={msgRef}
            id={"textarea-"+id}
            defaultValue={content}
            className={"materialize-textarea " + (props.active?"activeTextArea":"inactiveTextArea")}
            onChange={(e)=>props.onMessageChange(id, e.target.value)}
        ></textarea>
        </div>
    </>)
}