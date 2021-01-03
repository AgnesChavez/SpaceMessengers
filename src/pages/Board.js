import React, {  useRef, useEffect, useState} from "react";

import { auth } from "../services/firebase";
import { db } from "../services/firebase";
import 'firebase/firestore';

import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';

import { Icon, Button, Row, Col, Preloader } from 'react-materialize';

import { BoardMessageData } from '../helpers/Types'

import { BoardMessage } from '../components/BoardMessage'

// import { SidebarNav } from '../components/SidebarNav'

import { Sidebar } from '../components/Sidebar'
// import { Sidebar } from '../components/SidebarNoReactMaterialize'

// import Chat from "./Chat";

import '../css/board.css';


export default function Board() {


    const myRef = useRef();

    const boardId = "default";

    // const [boardId, setBoardId ] = useState(null);
    function setBoardId(bid){}

    const [users, usersLoading] = useCollectionData(db.collection("users").where("boards", "array-contains", boardId)); 

    const usersMap = useRef(null);

    const messagesRef = db.collection("boardMessages");

    let [ usr, usrLoading] = useDocumentData(db.collection('users').doc(auth().currentUser.uid));

    const [messages, messagesLoading] = useCollectionData(messagesRef.where("boardId", "==", boardId));

    const [selected, setSelected ] = useState(null);

    useEffect(() => window.M.Tooltip.init(document.getElementById('SidebarLeftTrigger'), null));


    const addMessage = async (e) => {
        e.preventDefault();
        // console.log("addMessage");
        const { uid } = auth().currentUser;

        let msgRef = await messagesRef.add(BoardMessageData(uid, boardId));

        await messagesRef.doc(msgRef.id).update({
            id: msgRef.id
        });
        // let usr = await db.collection('users').doc(uid).get();
        // console.log(usr);
        // if(!usr.boards.includes(boardId)){
        //     usr.boards.push(boardId);
        // }
    }

    
    const onStopHandler = (msgId, position) => {
        console.log("onStopHandler " + msgId + ", x: " +  position.x + ", y: " +  position.y);
        messagesRef.doc(msgId).update({
            position: {
                x: position.x,
                y: position.y
            }
        });
    }


    // const getUser = (uid) =>{
    //     console.log("getUser: " + uid, users);
    //     if(users && !usersLoading)
    //     {
    //      return users[uid];
    //     }
    //     return ({name: "", photoURL:"" });
    // }

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
                // }else{
                //      usersMap.current[uid] = await db.collection('users').doc(uid).get();
                //      return usersMap.current[uid];
                }
                    
            }
        }
        return ({name: "", photoURL:"" });
    }


    const onClick = (evt) =>
    {
        // console.log("onClick ", evt.target);
        if( evt.target === myRef.current)
        {
            setSelected(null);
        }else
        {
            setSelected(evt.target);
        }
    }

   
    const onMessageChange = (msgId, msg) => {
        messagesRef.doc(msgId).update({ content: msg });
    }

    if(messagesLoading){
        console.log("messagesLoading");
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

    
    // if(boardId === null)
    // {
    //     if(usr.currentBoard === null){
    //         // setBoardId(usr.currentBoard);
    //            setBoardId("default");
    //     }
    // }


    function RenderBoard(){
        return (
            <>
                <Button
                    className="red right boardButtonRight"
                    floating
                    icon={<Icon>add</Icon>}
                    node="button"
                    waves="light"
                    onClick={addMessage}
                    tooltip="Click to add a new message"
                />  

                { users && messages && messages.map(msg => <BoardMessage
                                                    key={msg.id} 
                                                    message={msg}
                                                    onStopHandler={onStopHandler}
                                                    selected={selected}
                                                    user={getUser(msg.uid)}
                                                    onMessageChange={onMessageChange}
                                                     />)}
            
            </>);
    }


    return ( <>
        <Row>
        
        <Col s={12} className="boardContainer">  
            

            {usr && !usrLoading && <Sidebar usr={usr} boardSelectHandle={(bid)=>setBoardId(bid)}  ></Sidebar> }

            <div ref={myRef} id="board" 
                className="col s12 z-depth-2 "
                onClick={onClick}
                >
                
                <a className="red left btn-floating boardButtonLeft waves-effect waves-light btn sidenav-trigger tooltipped" 
                    href="!#" 
                    data-target="SidebarLeft"
                    data-position="right" 
                    data-tooltip="Menu"
                    id="SidebarLeftTrigger"
                    >
                    <Icon>menu</Icon>
                </a>
    
                 <RenderBoard/>}
                {/* {(boardId === null)?(<h4 className="center-align"> You don't have any board yet! <br/> Create one on the left side menu </h4>): */}
                {/*  <RenderBoard/>}  */}
            </div>
            </Col>
            {/* <Col s={2} className="grey darken-4 rightSideChat">   */}
            {/*     <h5>Chat</h5> */}
            {/*     <Chat collection="chats" group="default" containerClass="" isComment={true}></Chat> */}
            {/* </Col> */}
        </Row> 
    </>)
}
