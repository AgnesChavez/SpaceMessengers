import React, {  useRef, useEffect, useState} from "react";

import { auth } from "../services/firebase";
import { db } from "../services/firebase";
import 'firebase/firestore';
import firebase from "firebase";

import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';

import { Icon, Button, Row, Col, Preloader } from 'react-materialize';

import { BoardMessageData } from '../helpers/Types'

import { BoardMessage } from '../components/BoardMessage'

// import { SidebarNav } from '../components/SidebarNav'

import { Sidebar } from '../components/Sidebar'

import { userTypes } from '../helpers/Types'

import { InfoSidebar } from '../components/InfoSidebar'

import '../css/board.css';

function getInfoSidebar(){
    return window.M.Sidenav.getInstance(document.getElementById("InfoSidebar"));
}

export default function Board() {

    const boardRef = useRef(null);

    const usersMap = useRef(null);

    // const [boardId, setBoardId ] = useState(null);

    let boardId = "default";

    function setBoardId(i) {}

    // setBoardId("default");

    const messagesRef = db.collection("boardMessages");
    
    const [selected, setSelected ] = useState(null);

    const [selectedMessage, setSelectedMessage] = useState(null);

    // const [teams, teamsLoading] = useCollectionData(db.collection("teams").where("members", "array-contains", auth().currentUser.uid)); 
    
    const [users, usersLoading] = useCollectionData(db.collection("users").where("boards", "array-contains", boardId)); 

    const [messages, messagesLoading] = useCollectionData(messagesRef.where("boardId", "==", boardId));

    const [currentUser, currentUserLoading] = useDocumentData(db.collection('users').doc(auth().currentUser.uid));



    useEffect(() => window.M.Tooltip.init(document.getElementById('SidebarLeftTrigger'), null));
    


    

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
        // console.log("boardSelectHandle " + boardId);
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


    function onMessageClick(evt, element, message)
    {
        setSelected(element);
        setSelectedMessage(message);
        let sidebar = getInfoSidebar();
        if(!sidebar.isOpen)sidebar.open();
        // evt.stopPropagation();
        // console.log("onMessageClick " + message, evt );
    }

    const onClick = (evt) =>
    {
            
        if( evt.target === boardRef.current)
        {
            
            evt.stopPropagation();
            evt.preventDefault();
            let sidebar = getInfoSidebar();
         
            if(sidebar.isOpen){
                sidebar.close();
                sidebar.isOpen = false;
                // console.log("onClick. sidebar.isOpen: ", sidebar.isOpen);
                setSelected(null);
                setSelectedMessage(null);
        

            }
            
        // }else
        // {
        //     setSelected(evt.target);
        }
    }

    const onMessageChange = async (msgId, msg) => {
        messagesRef.doc(msgId).update({ content: msg });
    }

    function getUser(uid){
        if(users && !usersLoading)
        {
            if(usersMap.current === null ){
                usersMap.current = {};
                for(let i = 0; i < users.length; i++){
                    usersMap.current[users[i].id] = users[i];
                }
            }
            if( usersMap.current !=null)
            {
                if(usersMap.current.hasOwnProperty(uid)){
                    return usersMap.current[uid];      
                }else{
                    console.log("add board "+ boardId + " to user " +uid  );
                     db.collection('users').doc(uid).update({
                        boards: firebase.firestore.FieldValue.arrayUnion(boardId)
                    });
                }
            }
        }
        return ({name: "", photoURL:"" });
    }

   
    if(boardId === null)
    {
        if(currentUser && !currentUserLoading && currentUser.currentBoard !== null){
            setBoardId(currentUser.currentBoard);
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

                
                <a className="red left btn-floating boardButtonLeft waves-effect waves-light btn sidenav-trigger tooltipped" 
                    href="!#" 
                    data-target="SidebarLeft"
                    data-position="right" 
                    data-tooltip="Menu"
                    id="SidebarLeftTrigger"
                    >
                    <Icon>menu</Icon>
                </a>


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
