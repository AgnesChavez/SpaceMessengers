import React, { useRef, useEffect} from "react";

// import { Icon, Button, Row, Col,} from 'react-materialize';


import '../css/board.css';


export function MessageEditor(props) 
{
    const { content, id } = props.message;

    const msgRef = useRef(null);
        
    function textAreaCss()
    {
        let ret = {borderBottomWidth: (props.active? 1:0 )+'px',
                    padding: 5+'px'
                    };
        if(props.active){
                ret["backgroundColor"] = "rgba(255, 255, 255, 0.46)";
                
        }
        return ret;
    }
  
    useEffect(() => {
            window.M.textareaAutoResize(msgRef.current);
        },
        [props.message.content],
    );

    

    return ( 
    <>
        <div className="textEditor">
        <textarea ref={msgRef} id={"textarea-"+id} defaultValue={content}
            className={"materialize-textarea "}
            style={textAreaCss()}
            onChange={(e)=>props.onMessageChange(id, e.target.value)}
        ></textarea>
        </div>
    </>)
}