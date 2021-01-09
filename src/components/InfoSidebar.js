import React, {useEffect, useRef } from "react";

import { Button, Tabs, Tab, SideNav } from 'react-materialize';

import Chat from "../pages/Chat";


import '../css/board.css';
                 
export function InfoSidebar(props){

    const tabsRef = useRef(null);
    const sidenavRef = useRef(null);

    useEffect(()=>{
        let el = document.getElementById('InfoSidebar');
        if(el){
            if(!tabsRef.current){
                tabsRef.current = window.M.Tabs.init(el.querySelectorAll(".tabs"), null);
            }


            if(!sidenavRef.current){
                sidenavRef.current = window.M.Sidenav.init(el, {  draggable: true, edge: "right"  });   
                // console.log("init InfoSidebar");
                sidenavRef.current.open();
                sidenavRef.current.isOpen = true;
            }
            
        }
    });

    if(!props.boardId  ) return "";

    return (<>

    <ul id="InfoSidebar" className="sidenav sidenav-fixed black white-text">

    <div id="TabsContainer" className="fullheight">

    <ul id="InfoSidebarTabs" className="tabs tabs-fixed-width z-depth-1 black white-text">
        <li className="tab"><a href="#chatTab">Chat</a></li>
        <li className="tab"><a href="#commentsTab">Comments</a></li>
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
                    getUser={props.getUser}
                />
            :<h6>Select a message on the board and you will see its comments here</h6>
            }      
        </div>
    </div>
    </ul>
    </>);
}