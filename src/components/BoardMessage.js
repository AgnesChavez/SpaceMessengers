import React, { useState, useRef} from "react";

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
    // const [activeTxt, setActiveTxt ] = useState(false);
    // const [activeCard, setActiveCard ] = useState(false);

    const myRef = useRef(null);

    const onStop = (e, position) => {
        props.onStopHandler(id, position);
        e.preventDefault();
        e.stopPropagation();
    };
    function isActive(){
        if(props.selected === null)return false;
        if(props.selected === myRef.current) return true;
        if(myRef.current.contains(props.selected))return true;
        return false;
    }

    function textAreaCss()
    {
        let a = isActive();
      return ({
        borderBottomWidth: (a? 1:0 )+'px',
        backgroundColor: (a?"transparent": "teal")
        })
    }
  


    return ( 
    <>
        <Draggable  cancel="textarea" disabled={!isActive()}
         defaultPosition={{x: props.message.position.x, y: props.message.position.y }} bounds="parent" onStop={onStop}>
            <div ref={myRef}
              // onMouseEnter={setOver(true)}
              // onMouseLeave={setOver(false)}
              // header={<CardTitle image={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />}

              
                // onFocus={()=>setActiveCard(true)}
                // onBlur={()=>setActiveCard(false)}
                // onClick={()=>setActiveCard(true)}
                // onClick={(e)=>console.log(e.target.id)}
                id={"msg-"+id}
                className={"card-panel messageCard "+ (isActive()?"teal z-depth-2":" transparent z-depth-0")}
                // className={"card-panel messageCard teal"}
            >
          
          <textarea id={"textarea-"+id} defaultValue={content}
            // onFocus={()=>setActiveTxt(true)}
            // onBlur={()=>setActiveTxt(false)}
            // onChange={evt => console.log(evt.target.value) } 
            // onClick={(e)=>console.log(e.target.id)}
           className={"materialize-textarea"}
           style={textAreaCss()}
           ></textarea>
          
        
      {/* </div> */}
                {/* <p className="black-text"></p> */}
                {isActive()?
                <p className="boardMessageTime ">{formatTime(timestamp)}</p>:""
                }
            </div>
        </Draggable> 
    </>)
}