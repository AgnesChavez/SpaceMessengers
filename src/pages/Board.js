import React, { Component, useRef, useState} from "react";

import { auth } from "../services/firebase";
import { db } from "../services/firebase";
import firebase from 'firebase/app';
import 'firebase/firestore';


// import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentData, useCollectionData } from 'react-firebase-hooks/firestore';

import { Icon, Button, Row, Col, Card, CardTitle, CardPanel } from 'react-materialize';

import { formatTime } from '../helpers/Formatting'

import { BoardMessageData } from '../helpers/Types'
import { BoardMessage } from '../components/BoardMessage'

import '../css/board.css';

// 
// async function getBoardUsers(boardId)
// {
// 
//     try{
//         
//         let board = await db.collection("boards").doc(boardId).get();    
//         if(board){
//             let team =  await db.collection("teams").doc(board.teamId).get();    
//             if(team)
//             {
//                 let members = {};
//                 for(let i = 0; i< team.members.length; i++)
//                 {
//                     let user = await db.collection("users").doc(team.members[i]).get();
//                     if(user){
//                         members[team.members[i]] = {
//                             name : user.displayName,
//                             photoURL:user.photoURL
//                         }
//                     }
//                 }
//                 return members;
//             }
//         }    
//     }
//     catch(error){
//         console.log("getBoardUsers error:", error);
//         return null
//     }
//     return null
// }


export default function Board() {

    const myRef = useRef();
    const boardId = "default";

    const messagesRef = db.collection("boardMessages");

    const [users, usrLoading, usrError] = useCollectionData(db.collection("users").where("boards", "array-contains", boardId)); 

    const [messages, msgLoading, msgError] = useCollectionData(messagesRef.where("boardId", "==", boardId));

    const [selected, setSelected ] = useState(null);

    const [usersMap, setUsersMap] = useState(null);

    const addMessage = async (e) => {
        e.preventDefault();
        console.log("addMessage");
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

    
    const getUser = (uid) =>{
        if(users && !usrLoading)
        {
            if(usersMap === null ){
                console.log("getUser: " + users.length);
                let newUsersMap = {};
                for(let i = 0; i < users.length; i++){
                    newUsersMap[users[i].id] = {name: users[i].displayName, photoURL:users[i].photoURL };
                }
                setUsersMap(newUsersMap);
            }
            if( usersMap !=null && usersMap.hasOwnProperty(uid))
            {
                return usersMap[uid];  
            }
        }
        return ({name: "users[i].displayName", photoURL:"" });
    }

    return ( <>
        <Row>
                
            <div ref={myRef} id="board" 
                className="col s12 z-depth-2 grey darken-4 "
                onClick={onClick}
                >
                
                <Button
                    className="red right"
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
      
            </div>
        </Row> 
    </>)
}
