import React, { useEffect, useRef } from "react";

// import { Button, Tabs, Tab, SideNav } from 'react-materialize';

import Chat from "../pages/Chat";


import '../css/board.css';
                 
export function InfoSidebar(props){

    const tabsRef = useRef(null);
    const sidenavRef = useRef(null);

    // const [translate, setTranslate] = useState(0);
    // let translateMax  = 300;

    useEffect(()=>{
        let el = document.getElementById('InfoSidebar');
        if(el){
            if(!tabsRef.current){
                tabsRef.current = window.M.Tabs.init(el.querySelector(".tabs"), null);
            }
            if(!sidenavRef.current){
                sidenavRef.current = window.M.Sidenav.init(el, {  draggable: true, edge: "right"  });   
                // console.log("init InfoSidebar");
                // 
                // if(props.isOpen){
                //     sidenavRef.current.open();
                // }else{
                //     sidenavRef.current.close();
                // }
                // sidenavRef.current.isOpen = props.isOpen;
                // console.log("isOpen", props.isOpen);
                // console.log(el.style);
                // el.style.transform = "translateX("+ ((props.isOpen)?0:translateMax) +"px)";
                // console.log(el.style);
                //style={{transform: "translateX("+ (translateMax) +"px)"}}
            }
        }
        return () => {
            if(sidenavRef.current){sidenavRef.current.destroy(); sidenavRef.current = null; }
            if(tabsRef.current){tabsRef.current.destroy(); tabsRef.current = null; }
        };
    });


    
// 
//     if(props.isOpen && translate !== 0){
//         setTranslate(0);
//     }else if(!props.isOpen && translate !== translateMax){
//         setTranslate(translateMax);
//     }

    if(!props.boardId  ) return "";

    

    // "translateX("+ (props.isOpen?300:0) +")";
    // console.log(translate);
    
    // console.log("translate", translate);
    


    return (<>
        <div id="InfoSidebarContainer" style={{transform: "translateX("+(props.isOpen?0:300)+"px)"}}>
        <ul id="InfoSidebar" className="sidenav sidenav-fixed black white-text" >}

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