import React, {  useRef, useEffect, useState} from "react";

import { auth } from "../services/firebase";
import { db } from "../services/firebase";
import 'firebase/firestore';

import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';

import { Icon, Button, Row, Col } from 'react-materialize';

import { BoardMessageData } from '../helpers/Types'

import { BoardMessage } from '../components/BoardMessage'

// import { SidebarNav } from '../components/SidebarNav'

import { Sidebar } from '../components/Sidebar'

// import Chat from "./Chat";

import '../css/board.css';


export default function Board() {

    const myRef = useRef();
    const boardId = "default";

    const messagesRef = db.collection("boardMessages");

    const [users, usersLoading] = useCollectionData(db.collection("users").where("boards", "array-contains", boardId)); 

    const [messages] = useCollectionData(messagesRef.where("boardId", "==", boardId));

    const [selected, setSelected ] = useState(null);

    useEffect(() => window.M.Tooltip.init(document.getElementById('SidebarLeftTrigger'), null));
    const usersMap = useRef(null);

    const [currentUser, currentUserLoading] = useDocumentData(db.collection('users').doc(auth().currentUser.uid));
    

    const addMessage = async (e) => {
        e.preventDefault();

        const { uid } = auth().currentUser;

        let msgRef = await messagesRef.add(BoardMessageData(uid, boardId));

        await messagesRef.doc(msgRef.id).update({
            id: msgRef.id
        });
    }

    
    const onStopHandler = (msgId, position) => {
        messagesRef.doc(msgId).update({
            position: {
                x: position.x,
                y: position.y
            }
        });
    }

    const onClick = (evt) =>
    {
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
                }
            }
        }
        return ({name: "", photoURL:"" });
    }

    function setBoardId(bid){
        
    }

    return ( <>
        <Row>
        
        <Col s={12} className="boardContainer">  
            

            {currentUser && !currentUserLoading && <Sidebar usr={currentUser} boardSelectHandle={(bid)=>setBoardId(bid)}  ></Sidebar> }

            <div ref={myRef} id="board" 
                className="col s12 z-depth-2 "
                onClick={onClick}
                >
                
                <Button
                    className="red right boardButtonRight"
                    floating
                    icon={<Icon>add</Icon>}
                    node="button"
                    waves="light"
                    onClick={addMessage}
                    tooltip="Click to add a new message"
                />  

                <a className="red left btn-floating boardButtonLeft waves-effect waves-light btn sidenav-trigger tooltipped" 
                    href="!#" 
                    data-target="SidebarLeft"
                    data-position="right" 
                    data-tooltip="Menu"
                    id="SidebarLeftTrigger"
                    >
                    <Icon>menu</Icon>
                </a>


                { users && messages && messages.map(msg => <BoardMessage
                                                    key={msg.id} 
                                                    message={msg}
                                                    onStopHandler={onStopHandler}
                                                    selected={selected}
                                                    user={getUser(msg.uid)}
                                                    onMessageChange={onMessageChange}
                                                     />)}

            </div>
            </Col>
            {/* <Col s={2} className="grey darken-4 rightSideChat">   */}
            {/*     <h5>Chat</h5> */}
            {/*     <Chat collection="chats" group="default" containerClass="" isComment={true}></Chat> */}
            {/* </Col> */}
        </Row> 
    </>)
}
