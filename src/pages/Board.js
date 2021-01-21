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

import { addToArray, removeFromArray } from '../helpers/db'


import '../css/board.css';
// 
// function getInfoSidebar(){
//     let element = document.getElementById("InfoSidebar");
//     if(!element)return null;
//     return window.M.Sidenav.getInstance(element);
// }
function getInfoSidebarTabs(){
    let element = document.getElementById("InfoSidebarTabs");
    if(!element)return null;
    return window.M.Tabs.getInstance(element);
}

// function getLeftSidebar(){
//     let element = document.getElementById("SidebarLeft");
//     if(!element)return null;
//     return window.M.Sidenav.getInstance(element);
// }


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

    const [ sidebarOpenLeft, setSidebarOpenLeft] = useState(true);
    const [ sidebarOpenRight, setSidebarOpenRight] = useState(true);

    const messagesRef = db.collection("boardMessages");
    
    const [ selected, setSelected] = useState(null);
    // const selectedMessage = useRef(null);
    
    const [users, usersLoading] = useCollectionData(db.collection("users").where("boards", "array-contains", boardId)); 

    // const [messages, messagesLoading] = useCollectionData(messagesRef.where("boardId", "==", boardId));

    const [boardData, loadingBoardData] = useDocumentData(db.collection("boards").doc(boardId));

    const currentUserRef = db.collection('users').doc(auth().currentUser.uid);

    const [currentUser, currentUserLoading] = useDocumentData(currentUserRef);

    

    const addMessage = async (e) => {
        e.preventDefault();

        const { uid } = auth().currentUser;


        let center = document.getElementById('center');


        let x = center.scrollLeft + (center.clientWidth - 210)/2;
        let y = center.scrollTop + (center.clientHeight - 88)/2;


        let newMessage = BoardMessageData(uid, boardId, x, y);
        let msgRef = await messagesRef.add(newMessage);

        newMessage.id = msgRef.id;

        setSelected(newMessage);

        await messagesRef.doc(msgRef.id).update({
            id: msgRef.id
        });
        addToArray('boards', boardId, 'messages',msgRef.id);

    }


     const deleteMessage = (messageId) => {
        if(!messageId) return;

        messagesRef.doc(messageId).delete().then(function() {
            if(messageId === selected.id){
                setSelected(null);
            }

            removeFromArray('boards', boardId, 'messages',messageId);
            // console.log("Document successfully deleted!");
        }).catch(function(error) {
            console.error("Error removing document: ", error);
        });
    }


    const boardSelectHandle = (bid) =>{
        setBoardId(bid);
    }
    
    const onStopHandler = (msgId, position) => {
        if(msgId){
            messagesRef.doc(msgId).update({
                position: {
                    x: position.x,
                    y: position.y
                }
            });
        }
    }

    function menuButtonClicked(evt){
        toggleLeftSideNav(!sidebarOpenLeft);
    }

    function onMessageClick(evt, message)
    {

        // TODO: al llamar estos setters de estado se renderea todo el boaard de nuevo y es lo que hace que se vean los dos sidebars
        setSelected(message);
        // setSelectedMessage(message);

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
                // setSelectedMessage(null);
            }
            toggleLeftSideNav(false);
        }
    }

    // function isLeftSidebarOpen(){
    //     let sidebar = getLeftSidebar();
    //     return (sidebar && sidebar.isOpen);
    // }
    function toggleRightSideNav(open){
        // let sidebar = getInfoSidebar()
        return toggleSideNav( open, 'right');
    }
    function toggleLeftSideNav(open){
        // let sidebar = getLeftSidebar();
        return toggleSideNav( open, 'left');
    }
    
    // function setSidebarOpen(side, open){
    //     console.log('setSidebarOpen: '+ side,  open);
    //     let temp = sidebarOpenState;
    //     temp[side] = open;
    //     setSidebarOpenState(temp);    
    //     console.log("sidebarOpenState", sidebarOpenState);
    // }

    

    function toggleSideNav(open, side){
        let toggled = false;
        
            if(side === 'left'){
                if((!sidebarOpenLeft && open) || (sidebarOpenLeft && !open)){
                    setSidebarOpenLeft(open);
                    toggled=true;
                } 
            }else if(side === 'right'){
                if((!sidebarOpenRight && open) || (sidebarOpenRight && !open)){
                    setSidebarOpenRight(open);
                    toggled=true;
                } 
            }
        // if(sidebar){
            // if(!sidebarOpenState[side] && open){
            //     // sidebar.open();
            //     setSidebarOpen(side, open);
            //     toggled=true;
            // }else if(sidebarOpenState[side] && !open){
            //     setSidebarOpen(side, open);
            //     // sidebar.close();
            //     toggled=true;
            // }
        // }
        toggleSideElement(side, open);
        return toggled;
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
   

    if(boardId === null || boardId === 'default')
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
    

    if(!boardData || loadingBoardData || !currentUser ||  currentUserLoading ){
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
        
        
            <Sidebar isOpen={sidebarOpenLeft} usr={currentUser} boardSelectHandle={boardSelectHandle}  ></Sidebar>
            <InfoSidebar isOpen={sidebarOpenRight} boardId={boardId} selected={selected}  getUser={getUser} />

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
                    tooltipOptions={{position:'left'}}
                />  
                :
            ""}

            <ul className="left leftButtonsContainer">
                <li>
                    <Button
                        id="SidebarLeftTrigger"
                        className="red boardButtonLeft"
                        floating
                        icon={<Icon>menu</Icon>}
                        node="button"
                        waves="light"
                        onClick={menuButtonClicked}
                        tooltip="Menu"
                        tooltipOptions={{position:'right'}}
                    /> 
                </li>
                <li>
                    <Link to={"/gallery"} >
                        <Button
                            id="GalleryButton"
                            className="cyan galleryButton"
                            floating
                            icon={<Icon>photo_library</Icon>}
                            node='button'
                            waves="light"
                            tooltip="Go to your image gallery"
                            tooltipOptions={{position:'right'}}
                        />
                    </Link>
                </li>

                <li>
                    <UploadImgButton/>
                </li>

            </ul>
            
              
            <div ref={boardRef} id="board" 
                className="col s12 z-depth-2 "
                onMouseDown={onClick}
                >
                {(boardId === null)?
                (<h4 className="center-align"> You don't have any board yet! <br/> Create one on the left side menu </h4>)
                :( users 
                    && !loadingBoardData 
                    && boardData 
                    && boardData.messages 
                    && boardData.messages.map(msg => <BoardMessage
                                                    key={msg} 
                                                    messageId={msg}
                                                    onStopHandler={onStopHandler}
                                                    selected={selected}
                                                    onMessageClick={onMessageClick}
                                                    getUser={getUser}
                                                    currentUser={currentUser} 
                                                    deleteMessage={deleteMessage}
                                                    />))}

            </div>
            </div>
            <div id="right"></div>
            
            </div>


    </>)
}
