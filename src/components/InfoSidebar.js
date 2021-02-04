import React, { useEffect, useRef } from "react";
import { CenteredPreloader } from '../components/CenteredPreloader'
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { auth } from "../services/firebase";
import { db } from "../services/firebase";

// import { Button, Tabs, Tab, SideNav } from 'react-materialize';

import Chat from "../pages/Chat";


import '../css/board.css';
                 
export function InfoSidebar(props){

    const tabsRef = useRef(null);
    const sidenavRef = useRef(null);

    const [readChats, loadingReadChats] =  useDocumentData(db.collection("readChat").doc(auth().currentUser.uid));

    useEffect(()=>{
        let el = document.getElementById('InfoSidebar');
        if(el){
            if(!tabsRef.current){
                tabsRef.current = window.M.Tabs.init(el.querySelector(".tabs"), null);
            }
            if(!sidenavRef.current){
                sidenavRef.current = window.M.Sidenav.init(el, {  draggable: true, edge: "right"  });   
            }
        }
        return () => {
            if(sidenavRef.current){sidenavRef.current.destroy(); sidenavRef.current = null; }
            if(tabsRef.current){tabsRef.current.destroy(); tabsRef.current = null; }
        };
    });

    if(!props.boardId  ) return "";
    



    return (<>
    <div id="InfoSidebarContainer" style={{transform: "translateX("+(props.isOpen?0:300)+"px)"}}>
        <ul id="InfoSidebar" className="sidenav sidenav-fixed black white-text" >

            <div id="TabsContainer" className="fullheight">
                <ul id="InfoSidebarTabs" className="tabs tabs-fixed-width z-depth-1 black white-text">
                    <li className="tab"><a href="#chatTab">Chat</a></li>
                    <li className="tab"><a href="#commentsTab">Comments</a></li>
                </ul>
                <div id="chatTab" className="col s12">
                    {loadingReadChats?
                       <CenteredPreloader title={"Loading messages"}/> :
                    <Chat collection="chats"
                        group={props.boardId} 
                        containerClass="sidebar-chat"
                        isComment={false}
                        getUser={props.getUser}
                        readChats={readChats}
                    />}
                </div>
                <div id="commentsTab" className="col s12">
                    {props.selected?
                        <Chat collection="comments"
                            group={props.selected.id}
                            containerClass="sidebar-chat"
                            isComment={true}
                            bgColor={props.selected.color}
                            getUser={props.getUser}
                        />
                    :<h6>Select a message on the board and you will see its comments here</h6>
                    }      
                </div>
            </div>
        </ul>
    </div>
    </>);
}