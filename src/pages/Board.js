import React, {  useRef, useState } from "react";

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

import {  addBoardToUser } from '../helpers/factory'

// import { getQueryData } from '../helpers/db'

// import {  makeDefaultBoard } from '../helpers/factory' 
// import {  createSchool } from '../helpers/factory'
// import {  createUser } from '../helpers/factory'
// import { createUserInDb } from '../helpers/userManagement'


import { UploadImgButton } from '../helpers/imgStorage'

import { addToArray, removeFromArray } from '../helpers/db'


import '../css/board.css';

function getInfoSidebarTabs(){
    let element = document.getElementById("InfoSidebarTabs");
    if(!element)return null;
    return window.M.Tabs.getInstance(element);
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



function LoadingData(props){
    return (<>
            <Button
                    id="SidebarLeftTrigger"
                    className="grey right"
                    floating
                    icon={<Icon>exit_to_app</Icon>}
                    node="button"
                    waves="light"
                    onClick={() => auth().signOut()}
                    tooltip="Log out"
                    tooltipOptions={{position:'left'}}
                /> 
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

export default function Board() {

    const boardRef = useRef(null);

    const usersMap = useRef(null);

    const prevUsers = useRef(null);    

    const [isAnimating, setIsAnimating] = useState(false);

    const preAnimateState = useRef(null);        

    const [ boardId, setBoardIdState ] = useState("default");

    const [ sidebarOpenLeft, setSidebarOpenLeft] = useState(true);
    const [ sidebarOpenRight, setSidebarOpenRight] = useState(true);

    const messagesRef = db.collection("boardMessages");
    
    const [ selected, setSelected] = useState(null);
    
    const [users, usersLoading] = useCollectionData(db.collection("users").where("boards", "array-contains", boardId)); 

    const [boardData, loadingBoardData] = useDocumentData(db.collection("boards").doc(boardId));

    // console.log("boardId ", boardId);
    // console.log("auth().currentUser.uid ", auth().currentUser.uid);

    const currentUserRef = db.collection('users').doc(auth().currentUser.uid);

    const [currentUser, currentUserLoading] = useDocumentData(currentUserRef);


    async function createMessage(){
        const { uid } = auth().currentUser;

        let center = document.getElementById('center');

        let x = center.scrollLeft + (center.clientWidth - 210)/2;
        let y = center.scrollTop + (center.clientHeight - 88)/2;

        let newMessage = BoardMessageData(uid, boardId, x, y);

        // if(isImage === true && imgData !== null){
        //     newMessage.isImage=true;
        //     newMessage.imgURL=imgData.downloadURL;
        //     newMessage.content=imgData.caption;
        //     newMessage.uploadPath = imgData.uploadPath;
        // }

        let msgRef = await messagesRef.add(newMessage);

        newMessage.id = msgRef.id;

        setSelected(newMessage);

        await messagesRef.doc(msgRef.id).update({
            id: msgRef.id
        });
        addToArray('boards', boardId, 'messages',msgRef.id);
    }
    
    const addMessage = (e) => {
        e.preventDefault();

        createMessage();
    }

    const deleteMessage = async (messageId) => {
        if(!messageId) return;

        

        // let msgData = await getQueryData(messagesRef.doc(messageId));
        // if(msgData !== null && msgData.isImage === true && msgData.uploadPath ){
        //     deleteImg(msgData.uploadPath);
        // }
        


        messagesRef.doc(messageId).delete().then(function() {
            if(messageId === selected.id){
                setSelected(null);
            }

            removeFromArray('boards', boardId, 'messages',messageId);
            
        }).catch(function(error) {
            console.error("Error removing document: ", error);
        });
    }


    const boardSelectHandle = (bid) =>{
        setBoardId(bid);
    }
    
    const onStopHandler = (msgId, position) => {
        if(msgId){
            // console.log("onStopHandler " + msgId + "  pos: ", position);
            messagesRef.doc(msgId).update({
                position: {
                    x: position.x,
                    y: position.y
                }
            });
        }else{
            console.log("onStopHandler, messageId invalid");
        }
    }

    function menuButtonClicked(evt){
        toggleLeftSideNav(!sidebarOpenLeft);
    }

    function onMessageClick(evt, message)
    {

        setSelected(message);

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
            disableAnimation();
        }
    }

    function toggleRightSideNav(open){
        return toggleSideNav( open, 'right');
    }
    function toggleLeftSideNav(open){
        return toggleSideNav( open, 'left');
    }
    
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
            if( usersMap.current !== null)
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
                // console.log("setBoardId");
                currentUserRef.update({currentBoard: bid});
            }
        }
    }
   

    
    function updateCurrentUser(collection, arrayName, propName, orderBy){
        let ref = db.collection(collection);
        if(arrayName){
            ref.where(arrayName, "array-contains", currentUser.id);
        }
        if(orderBy){
            ref.orderBy(orderBy, "desc")
        }
        ref.limit(1).get()
        .then(function(querySnapshot) {
            if(querySnapshot.docs.length){
                // console.log("currentUser.instructors");
                currentUserRef.update({[propName]: querySnapshot.docs[0].id});
            }
        })
        .catch(function(error) {
            console.log("Error getting documents: ", error);
        });
    }

    if(currentUser && !currentUserLoading){
        if(boardId === null || boardId === 'default'){
            if(currentUser.currentBoard !== null && currentUser.currentBoard !== 'default'){
                setBoardId(currentUser.currentBoard);
            }else{
                if(currentUser.boards.length > 0 && currentUser.currentBoard !== 'default')
                {
                    setBoardId(currentUser.boards[0]);
                }else{                    

                }
            }
        }
        if(currentUser.currentTeam === null && currentUser.type === userTypes().student){
              updateCurrentUser("teams", 'members', "currentTeam", null);
        }
        if(currentUser.currentWorkshop === null){
            if(currentUser.type === userTypes().admin){
                updateCurrentUser("workshops", null, "currentWorkshop","created");
            }else if(currentUser.type === userTypes().instructor){
                updateCurrentUser("workshops", 'instructors', "currentWorkshop","created");
            }else if(currentUser.type === userTypes().student){
                updateCurrentUser("workshops", 'students', "currentWorkshop","created");
            }
        }
    }

    function disableAnimation(){
        if(isAnimating === true){
            toggleLeftSideNav(preAnimateState.current.sidebarOpenLeft);
            toggleRightSideNav(preAnimateState.current.sidebarOpenRight);
            setSelected(preAnimateState.current.selected);
            setIsAnimating(false);
        }
    }

    function animateButtonClicked(evt){
        if(isAnimating === false){
            preAnimateState.current={
                sidebarOpenLeft,
                sidebarOpenRight,
                selected
            }

            toggleLeftSideNav(false);
            toggleRightSideNav(false);
            setSelected(null);
            setIsAnimating(true);
        }else{
            disableAnimation();
        }
    }



    return ( <>
        <div id="boardContainer">   
            { currentUser &&  !currentUserLoading && currentUser.currentWorkshop && <Sidebar isOpen={sidebarOpenLeft} usr={currentUser} boardSelectHandle={boardSelectHandle}  ></Sidebar>}
            <InfoSidebar isOpen={sidebarOpenRight} boardId={boardId} selected={selected}  getUser={getUser} />

            <div id="left"></div>
            <div id="center">
                <ul className="right rightButtonsContainer">
                    <li>
                        { boardId !== null &&
                        currentUser && !currentUserLoading &&
                        boardData && !loadingBoardData && boardData.teamId &&
                          <AddMessageButton currentUser={currentUser} boardData={boardData} addMessage={addMessage}/>
                        }
                    </li>
                    <li>
                        <Button
                            id="AnimateButton"
                            className="green boardButtonRight"
                            floating
                            icon={(isAnimating === true)?<Icon>stop</Icon>:<Icon>play_arrow</Icon>}
                            node="button"
                            waves="light"
                            onClick={animateButtonClicked}
                            tooltip="Animate messages"
                            tooltipOptions={{position:'left'}}
                        /> 
                    </li>
                    <li>{currentUser && !currentUserLoading &&
                        <ToggleBackgroundButton currentUser={currentUser}/>
                        }
                    </li>
                </ul>
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
                        {currentUser && currentUser.currentWorkshop && <UploadImgButton workshopId={currentUser.currentWorkshop}/> }
                    </li>
                </ul>
            
              
                <div ref={boardRef} id="board" 
                    className="col s12 z-depth-2 "
                    onMouseDown={onClick}
                    >
                    { boardId !== null && (!boardData || loadingBoardData || !currentUser ||  currentUserLoading ) && <LoadingData/>}
                    {(boardId === null)?
                    (<h4 className="center-align"> No board selected! <br/> Chose or create one on the left side menu under the team tab </h4>)
                    :
                    ( users && !loadingBoardData && boardData && boardData.messages 
                        && boardData.messages.map(msg => <BoardMessage
                                                        key={msg} 
                                                        messageId={msg}
                                                        onStopHandler={onStopHandler}
                                                        selected={selected}
                                                        onMessageClick={onMessageClick}
                                                        getUser={getUser}
                                                        currentUser={currentUser} 
                                                        deleteMessage={deleteMessage}
                                                        isAnimating={isAnimating}
                                                        />))}
                    {( users && !loadingBoardData && boardData && boardData.name)? (<h6 className="center-align"> {boardData.name}</h6>):""
                    }
                </div>
                
            </div>
            <div id="right"></div>
        </div>
    </>)
}

function AddMessageButton(props){
    let isStudent = props.currentUser.type === userTypes().student;
    // console.log("AddMessageButton: ", props.boardData);

    const [teamData, loadingTeamData] = useDocumentData(db.collection("teams").doc(props.boardData.teamId));
    
    if(!isStudent || (isStudent && teamData && !loadingTeamData && teamData.members.includes(props.currentUser.id))){
    return <Button
        className="red boardButtonRight"
        floating
        icon={<Icon>add</Icon>}
        node="button"
        waves="light"
        onClick={props.addMessage}
        tooltip="Click to add a new message"
        tooltipOptions={{position:'left'}}
    />
}else{
    return "";
}
}
function ToggleBackgroundButton(props){
    const [bgActive, setBgActive] = useState(document.body.classList.contains("bodyImgBackground"));
    
    if( props.currentUser.type === userTypes().admin ){
    return <Button
        className="blue boardButtonRight"
        floating
        icon={bgActive?<Icon>layers_clear</Icon>:<Icon>layers</Icon>}
        node="button"
        waves="light"
        onClick={()=>{
            console.log();
            if(bgActive){
                document.body.classList.remove("bodyImgBackground");
                document.body.classList.add("bodyNoImgBackground");
                setBgActive(false);
            }else{
                document.body.classList.remove("bodyNoImgBackground");
                document.body.classList.add("bodyImgBackground");
                setBgActive(true);
            }
            }}
        tooltip={(bgActive?"Disable":"Enable") + " background image."}
        tooltipOptions={{position:'left'}}
    />
    }
    return "";
}