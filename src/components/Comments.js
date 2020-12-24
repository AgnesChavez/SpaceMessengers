import React from "react";

import { Icon, CollapsibleItem, Collapsible } from 'react-materialize';

import '../css/board.css';

import  Chat from '../pages/Chat'



export function Comments(props) 
{

    function onOpenStart(){

    }

    return ( 
    <>
    <Collapsible 
        accordion 
        className="z-depth-0"
        options={{onOpenStart:onOpenStart}}
    >
        <CollapsibleItem
            expanded={false}
            header="comments"
            icon={<Icon tiny>comments</Icon>}
            node="div"
        >
            <Chat collection="comments" group={props.messageId} containerClass="comments-container" isComment={true}></Chat>
        </CollapsibleItem>
    </Collapsible>
    </>)
}