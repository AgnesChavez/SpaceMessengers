import React, {  useRef, useEffect, useState} from "react";

import { auth } from "../services/firebase";
import { db } from "../services/firebase";
import 'firebase/firestore';
import firebase from "firebase";

import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';

import { Modal, TextInput, Icon, Button, Row, Col, Preloader } from 'react-materialize';

import { BoardMessageData } from '../helpers/Types'

import { BoardMessage } from '../components/BoardMessage'

// import { SidebarNav } from '../components/SidebarNav'

import { Sidebar } from '../components/Sidebar'

import { userTypes } from '../helpers/Types'

import { InfoSidebar } from '../components/InfoSidebar'

import { addBoardToUser } from '../helpers/factory'

import '../css/board.css';

function getInfoSidebar(){
    let element = document.getElementById("InfoSidebar");
    if(!element)return null;
    return window.M.Sidenav.getInstance(element);
}
function getInfoSidebarTabs(){
    let element = document.getElementById("InfoSidebarTabs");
    if(!element)return null;
    return window.M.Tabs.getInstance(element);
}

function getLeftSidebar(){
    let element = document.getElementById("SidebarLeft");
    if(!element)return null;
    return window.M.Sidenav.getInstance(element);
}

export default function Board() {

    const boardRef = useRef(null);

    const usersMap = useRef(null);

    const prevUsers = useRef(null);    

    const [ boardId, setBoardIdState ] = useState(null);


    const messagesRef = db.collection("boardMessages");
    
    const [selected, setSelected ] = useState(null);

    const [selectedMessage, setSelectedMessage] = useState(null);
    
    const [users, usersLoading] = useCollectionData(db.collection("users").where("boards", "array-contains", boardId)); 

    const [messages, messagesLoading] = useCollectionData(messagesRef.where("boardId", "==", boardId));

    const currentUserRef = db.collection('users').doc(auth().currentUser.uid);

    const [currentUser, currentUserLoading] = useDocumentData(currentUserRef);

    // const testTextInputModalRef = useRef(null);

// 
//     useEffect(()=>{        
//         if(buttonRef.current){
//             if(!tooltipRef.current){
//                 tooltipRef.current = window.M.Tooltip.init(buttonRef.current, null);
//             }
//         }
//         return () => {
//             
//             if(tooltipRef.current){tooltipRef.current.destroy(); tooltipRef.current = null; }
//         };
//     });
    // useEffect(() => window.M.Tooltip.init(document.getElementById('SidebarLeftTrigger'), null));
        
        // if(!selectedMessage){
        //     console.log("selectedMessage is  null");
        //     let sidebar = getInfoSidebar();
        //     if(sidebar){
        // //         console.log("sidebar");
        //         sidebar.open();
        //         sidebar.isOpen = true;
        //     }
        // }
    // });


    

    const addMessage = async (e) => {
        e.preventDefault();

        const { uid } = auth().currentUser;

        let msgRef = await messagesRef.add(BoardMessageData(uid, boardId));

        await messagesRef.doc(msgRef.id).update({
            id: msgRef.id
        });
    }


     const deleteMessage = (messageId) => {
        if(!messageId) return;

        messagesRef.doc(messageId).delete().then(function() {
            console.log("Document successfully deleted!");
        }).catch(function(error) {
            console.error("Error removing document: ", error);
        });
    }


    const boardSelectHandle = (bid) =>{
        setBoardId(bid);
    }
    
    const onStopHandler = (msgId, position) => {
        messagesRef.doc(msgId).update({
            position: {
                x: position.x,
                y: position.y
            }
        });
    }

    function openMenu(evt){
        let sidebar = getLeftSidebar();
        if(sidebar && !sidebar.isOpen)sidebar.open();
    }

    function onMessageClick(evt, element, message)
    {
        setSelected(element);
        setSelectedMessage(message);
        
        let sidebar = getInfoSidebar();
        if(sidebar && !sidebar.isOpen)sidebar.open();

        let tabs = getInfoSidebarTabs();
        if(tabs){
            tabs.select('commentsTab');  
        }

    }

    const onClick = (evt) =>
    {
        if( evt.target === boardRef.current)
        {
            
            evt.stopPropagation();
            evt.preventDefault();
            let sidebar = getInfoSidebar();
         
            if(sidebar && sidebar.isOpen){
                sidebar.close();
                sidebar.isOpen = false;
                setSelected(null);
                setSelectedMessage(null);
            }

            let leftSidebar = getLeftSidebar();   
            if(leftSidebar && leftSidebar.isOpen){
                leftSidebar.close();
                leftSidebar.isOpen = false;
            }
        }
    }

    const onMessageChange = async (msgId, msg) => {
        messagesRef.doc(msgId).update({ content: msg });
    }

    function getUser(uid){
        if(users && !usersLoading)
        {
            if(usersMap.current === null || prevUsers.current !== users ){
                usersMap.current = {};
                for(let i = 0; i < users.length; i++){
                    usersMap.current[users[i].id] = users[i];
                }
                prevUsers.current = users;
            }
            if( usersMap.current !=null)
            {
                if(usersMap.current.hasOwnProperty(uid)){
                    return usersMap.current[uid];      
                }else{
                    // console.log("add board "+ boardId + " to user " +uid  );
                    //  db.collection('users').doc(uid).update({
                    //     boards: firebase.firestore.FieldValue.arrayUnion(boardId)
                    // });
                    addBoardToUser(boardId, uid);
                }
            }
        }
        return ({name: "", photoURL:"" });
    }

    function setBoardId(bid) {
        setBoardIdState(bid);
        if(bid &&currentUser && !currentUserLoading){
            if(currentUser.currentBoard !== bid){
                currentUserRef.update({currentBoard: bid});
            }
        }
    }
   

    if(boardId === null)
    {
        if(currentUser && !currentUserLoading){
            if(currentUser.currentBoard !== null){
                setBoardId(currentUser.currentBoard);
            }else{
                if(currentUser.boards.length > 0)
                {
                    setBoardId(currentUser.boards[0]);
                }
            }
        }
    }
    

    if(!messages && messagesLoading){
    // if(true){
        return (<>
            <Row>
                <h6 className="center-align">Loading board data</h6>
            </Row>
            <Row style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
            <Col s={2} offset="s5" style={{width: "unset", margin: "auto"}}>
                <Preloader 
                    active
                    color="blue"
                    flashing
                />
            </Col>
            </Row>
        </>);
    }

    return ( <>
        <Row id="boardContainerRow">
        
        <Col id="boardContainerCol" s={12} className="boardContainer">  
            





            {currentUser && !currentUserLoading && <Sidebar usr={currentUser} boardSelectHandle={boardSelectHandle}  ></Sidebar> }

            <div ref={boardRef} id="board" 
                className="col s12 z-depth-2 "
                onClick={onClick}
                >
                {(boardId !== null && (currentUser.type !== userTypes().student || usersMap.hasOwnProperty(currentUser.id)))?
                <Button
                    className="red right boardButtonRight"
                    floating
                    icon={<Icon>add</Icon>}
                    node="button"
                    waves="light"
                    onClick={addMessage}
                    tooltip="Click to add a new message"
                />  :""}


                <Button
                    id="SidebarLeftTrigger"
                    className="red left boardButtonLeft"
                    floating
                    icon={<Icon>menu</Icon>}
                    node="button"
                    waves="light"
                    onClick={openMenu}
                    tooltip="Menu"
                /> 
                

                {(boardId === null)?
                (<h4 className="center-align"> You don't have any board yet! <br/> Create one on the left side menu </h4>)
                :( users && messages && messages.map(msg => <BoardMessage
                                                    key={msg.id} 
                                                    message={msg}
                                                    onStopHandler={onStopHandler}
                                                    selected={selected}
                                                    onMessageClick={onMessageClick}
                                                    user={getUser(msg.uid)}
                                                    onMessageChange={onMessageChange}
                                                    currentUser={currentUser} 
                                                    deleteMessage={deleteMessage}
                                                    />))}

            </div>
            <InfoSidebar boardId={boardId} selectedMessage={selectedMessage}  getUser={getUser}/>
            </Col>
        </Row> 



    </>)
}
