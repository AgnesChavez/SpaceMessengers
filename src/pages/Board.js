import React, {  useRef, useState} from "react";

import { Link } from 'react-router-dom';
import { auth } from "../services/firebase";
import { db } from "../services/firebase";
import 'firebase/firestore';

import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';

import { Icon, Button, Row, Col, Preloader } from 'react-materialize';

import { BoardMessageData } from '../helpers/Types'

import { BoardMessage } from '../components/BoardMessage'

import { Sidebar } from '../components/Sidebar'

import { userTypes } from '../helpers/Types'

import { InfoSidebar } from '../components/InfoSidebar'

import { addBoardToUser } from '../helpers/factory'

import { UploadImgButton } from '../helpers/imgStorage'

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

function isLeftSidebarOpen(){
    let sidebar = getLeftSidebar();
    return (sidebar && sidebar.isOpen);
}
function toggleRightSideNav(open){
    let sidebar = getInfoSidebar()
    return toggleSideNav(sidebar, open, 'right');
}
function toggleLeftSideNav(open){
    let sidebar = getLeftSidebar();
    return toggleSideNav(sidebar, open, 'left');
}

function toggleSideNav(sidebar, open, side){
    let toggled = false;
    if(sidebar){
        if(!sidebar.isOpen && open){
            sidebar.open();
            toggled=true;
        }else if(sidebar.isOpen && !open){
            sidebar.close();
            toggled=true;
        }
    }
    toggleSideElement(side, open);
    return toggled;
}

function toggleSideElement(side, open){
    let sideElement = document.getElementById(side);
    if(sideElement){
        if(!open){
            sideElement.style.width="0px";
        }else{
            sideElement.style.width="300px";
        }
    }else{
        console.log('side element with id "'+ side + '" does not exist');
    }
}

export default function Board() {

    const boardRef = useRef(null);

    const usersMap = useRef(null);

    const prevUsers = useRef(null);    

    const [ boardId, setBoardIdState ] = useState("default");


    const messagesRef = db.collection("boardMessages");
    
    const [selected, setSelected ] = useState(null);

    const [selectedMessage, setSelectedMessage] = useState(null);
    
    const [users, usersLoading] = useCollectionData(db.collection("users").where("boards", "array-contains", boardId)); 

    const [messages, messagesLoading] = useCollectionData(messagesRef.where("boardId", "==", boardId));

    const currentUserRef = db.collection('users').doc(auth().currentUser.uid);

    const [currentUser, currentUserLoading] = useDocumentData(currentUserRef);


    

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

    function menuButtonClicked(evt){
        toggleLeftSideNav(!isLeftSidebarOpen());
    }

    function onMessageClick(evt, element, message)
    {

        // TODO: al llamar estos setters de estado se renderea todo el boaard de nuevo y es lo que hace que se vean los dos sidebars
        setSelected(element);
        setSelectedMessage(message);

        toggleRightSideNav(true);

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
            
            if(toggleRightSideNav(false)){
                setSelected(null);
                setSelectedMessage(null);
            }
            toggleLeftSideNav(false);
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
        <div id="boardContainer">
        
        
            {currentUser && !currentUserLoading && <Sidebar usr={currentUser} boardSelectHandle={boardSelectHandle}  ></Sidebar> }
            <InfoSidebar boardId={boardId} selectedMessage={selectedMessage}  getUser={getUser}/>

            <div id="left"></div>
            <div id="center">
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
            <ul className="left leftButtonsContainer">
            <li><Button
                    id="SidebarLeftTrigger"
                    className="red boardButtonLeft"
                    floating
                    icon={<Icon>menu</Icon>}
                    node="button"
                    waves="light"
                    onClick={menuButtonClicked}
                    tooltip="Menu"
                /> </li>
            <li>
                <Link
                    to={"/gallery"} >
            <Button
                id="GalleryButton"
                className="cyan galleryButton"
                floating
                icon={<Icon>photo_library</Icon>}
                node='button'
                waves="light"
                tooltip="Go to your image gallery"
                />
                </Link>
                </li>
                <li>
                    <UploadImgButton/>
                </li>
            </ul>
            
              
            <div ref={boardRef} id="board" 
                className="col s12 z-depth-2 "
                onClick={onClick}
                >
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
            </div>
            <div id="right"></div>
            
            </div>


    </>)
}
