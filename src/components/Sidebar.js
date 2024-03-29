import React, { useState, useEffect, useRef } from "react";

import { ModalOtherUserProfile } from "../components/OthersProfile"

import { auth } from "../services/firebase";
import { db } from "../services/firebase";

import 'firebase/firestore';

// import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';


// import { getUserFromDb } from "../helpers/userManagement";

import { openModal } from "../components/Modals";


import { userTypes } from "../helpers/Types"

// import { Link } from 'react-router-dom';

import { Button, Modal } from 'react-materialize';

// import UserProfile from "./UserProfileHooks";

import '../css/board.css';


import {ModalCreateWorkshop,
        ModalAddBoard,
        ModalUserProfile
         } from './Modals'

      
import { SidebarTeamCollection, SidebarAllBoards  } from "./SidebarTeams"
import { SidebarWorkshopCollection } from "./SidebarWorkshop"



function SidebarCurrentUser(props){

return (<>
    <div id="SidebarCurrentUser">
        <div id="SidebarCurrentUserBlock">
            <img className="circle" alt={props.user.name} src={props.user.image}/>
            <p className="name"> {props.user.name} </p>
        </div>    
        <div id="SidebarCurrentUserButtons">
            <Button flat className=" white-text modal-trigger" href="#profileModal" node="button">Profile</Button>
            <Button flat className=" white-text" onClick={() => auth().signOut()}>Logout</Button>
        </div>

    </div>
    </>);
}

export function Sidebar(props) {


    const tabsRef = useRef(null);
    const sidenavRef = useRef(null);

    let isNotStudent = (props.usr.type !==  userTypes().student);

    const [otherUserId, setOtherUserId] = useState(null);

    let teamsQuery = db.collection("teams").where("workshopId", "==", props.usr.currentWorkshop);

    const [teams, teamsLoading] = useCollectionData(teamsQuery);

    const [myTeams, myTeamsLoading] = useCollectionData(teamsQuery.where("members", "array-contains", props.usr.id));


    useEffect(()=>{
        if(otherUserId) openModal("ModalOtherUserProfile", null, ()=>setOtherUserId(null));

        let el = document.getElementById('SidebarLeft');
        if(el){
            if(!tabsRef.current){
                tabsRef.current = window.M.Tabs.init(el.querySelector(".tabs"), null);
            }
            if(!sidenavRef.current){
                sidenavRef.current = window.M.Sidenav.init(el, {  draggable: true, edge: "left", preventScrolling: true  });
            }
        }
          return () => {
            if(sidenavRef.current){sidenavRef.current.destroy(); sidenavRef.current = null; }
            if(tabsRef.current){tabsRef.current.destroy(); tabsRef.current = null; }
        };
    });

    
    let user = {
        image:  (props.usr.photoURL  || auth().currentUser.photoURL),
        name: (props.usr.displayName || auth().currentUser.displayName)
    };
    
    function handleSetOtherUserId(userId){
        setOtherUserId(userId);
    }

    return (<>
    <div id="SidebarLeftContainer" style={{transform: "translateX("+(props.isOpen?0:-300)+"px)"}}>

        <ul id="SidebarLeft" className="sidenav sidenav-fixed black white-text" >
    
            <SidebarCurrentUser className="white-text"  user={user} userType={props.usr.type}/>
            <div className="row">
                <div className="col s12">
                    <ul className="tabs tabs-fixed-width black white-text depth-1">
                        <li className="tab"><a href="#boardsTab">Boards</a></li>
                        <li className="tab"><a className="active" href="#teamTab">Teams</a></li>
                        <li className="tab"><a href="#schoolsTab">Schools</a></li>
                    </ul>
            
                    
                    <div id="boardsTab" className="col s12">
                        {teams && !teamsLoading &&
                         myTeams && !myTeamsLoading &&
                        <SidebarAllBoards
                            user={props.usr} 
                            
                            boardSelectHandle={props.boardSelectHandle}
                            teams={teams}
                            myTeams={myTeams}
                        />}          
                    </div>
                    <div id="teamTab" className="col s12">
                        {teams && !teamsLoading &&
                         myTeams && !myTeamsLoading &&
                        <SidebarTeamCollection 
                            user={props.usr} 
                            boardSelectHandle={props.boardSelectHandle}
                            setOtherUserId={handleSetOtherUserId}
                            teams={teams}
                            myTeams={myTeams}
                        />}                        
                    </div>
                    <div id="schoolsTab" className="col s12">
                        <SidebarWorkshopCollection 
                            user={props.usr}  
                            setOtherUserId={setOtherUserId}
                        />
                    </div>
                </div>
            </div>        
        </ul>
    </div> 
        

    <ModalAddBoard/>
    
    
    { isNotStudent && <ModalCreateWorkshop/> }

    <ModalUserProfile/>
 
  {otherUserId && <ModalOtherUserProfile userId = {otherUserId}/> }

    </>)
}




