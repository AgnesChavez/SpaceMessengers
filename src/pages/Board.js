import React, {  useRef, useState} from "react";

import { auth } from "../services/firebase";
import { db } from "../services/firebase";
import 'firebase/firestore';

import { useCollectionData } from 'react-firebase-hooks/firestore';

import { Icon, Button, Row } from 'react-materialize';

import { BoardMessageData } from '../helpers/Types'

import { BoardMessage } from '../components/BoardMessage'

import '../css/board.css';


export default function Board() {

    const myRef = useRef();
    const boardId = "default";

    const messagesRef = db.collection("boardMessages");

    const [users, usrLoading] = useCollectionData(db.collection("users").where("boards", "array-contains", boardId)); 

    const [messages] = useCollectionData(messagesRef.where("boardId", "==", boardId));

    const [selected, setSelected ] = useState(null);

    // const [usersMap, setUsersMap] = useState(null);
    const usersMap = useRef(null);

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
            if(usersMap.current === null ){
                console.log("getUser: " + users.length);
                usersMap.current = {};
                for(let i = 0; i < users.length; i++){
                    usersMap.current[users[i].id] = {name: users[i].displayName, photoURL:users[i].photoURL };
                }
                // setUsersMap(newUsersMap);
            }
            if( usersMap.current !=null && usersMap.current.hasOwnProperty(uid))
            {
                return usersMap.current[uid];  
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
