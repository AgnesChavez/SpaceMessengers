import React, {useEffect, useRef } from "react";

import { Button, Tabs, Tab, SideNav } from 'react-materialize';

import Chat from "../pages/Chat";


import '../css/board.css';
                 
export function InfoSidebar(props){

    const tabsRef = useRef(null);
    const sidenavRef = useRef(null);

    useEffect(()=>{
        if(!tabsRef.current){
            tabsRef.current = window.M.Tabs.init(document.querySelectorAll(".tabs"), null);
        }
        if(!sidenavRef.current){
            sidenavRef.current = window.M.Sidenav.init(document.getElementById('InfoSidebar'), {  draggable: true, edge: "right"  });    
        }
        
    });
    if(!props.boardId) return "";
    return (<>

    <ul id="InfoSidebar" className="sidenav sidenav-fixed black white-text">

    <div id="TabsContainer" className="fullheight">

    <ul className="tabs tabs-fixed-width z-depth-1 black white-text">
        <li className="tab"><a href="#chatTab">Chat</a></li>
        <li className="tab"><a className="active" href="#commentsTab">Comments</a></li>
    </ul>
    <div id="chatTab" className="col s12">
        <Chat collection="chats"
            group={props.boardId} 
            containerClass="sidebar-chat"
            isComment={false}
            getUser={props.getUser}
        />
    </div>
    <div id="commentsTab" className="col s12">
        {props.selectedMessage?
            <Chat collection="comments"
                group={props.selectedMessage.id}
                containerClass="sidebar-chat"
                isComment={true}
                bgColor={props.selectedMessage.color}
            />
            :""
        }      
    </div>
    </div>
    </ul>
{/*  */}
{/*             <Tabs className="z-depth-1 tabs-fixed-width black white-text"> */}
{/*                 <Tab */}
{/*                     className="fullheight" */}
{/*                     options={{swipeable: false}} */}
{/*                     title="Chat" */}
{/*                 > */}
{/*                     <Chat collection="chats" */}
{/*                         group={props.boardId}  */}
{/*                         containerClass="sidebar-chat" */}
{/*                         isComment={false} */}
{/*                     /> */}
{/*                 </Tab> */}
{/*                 <Tab */}
{/*                     active */}
{/*                     options={{swipeable: false}} */}
{/*                     title="Comments" */}
{/*                 > */}
{/*                     {props.selectedMessage? */}
{/*                         <Chat collection="comments" */}
{/*                             group={props.selectedMessage.id} */}
{/*                             containerClass="sidebar-chat" */}
{/*                             isComment={true} */}
{/*                             bgColor={props.selectedMessage.color} */}
{/*                         /> */}
{/*                         :"" */}
{/*                     } */}
{/*                 </Tab> */}
{/*             </Tabs> */}
        {/* </SideNav> */}
    </>);
}